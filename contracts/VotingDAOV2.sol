// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "contracts/Uint256Helpers.sol";
import "contracts/Proposal.sol";
import "contracts/Constants.sol";
import "contracts/ProposalQueue.sol";
import "contracts/Errors.sol";
import "interfaces/IMiniMeToken.sol";

import "./VetoNFT.sol";
import "./AccessControlled.sol";
import "./VAccessControl.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract VotingDAOV2 is AccessControlled, Initializable, ProposalQueue {
    using Uint256Helpers for uint256;
    using ProposalLibrary for Proposal;

    event ProposalCreated(uint256 indexed hash);
    event ProposalQuorumReached(uint256 indexed hash, bool support);
    event ProposalExecuted(uint256 indexed hash);

    enum VoteType {
        NONE,
        YEA,
        NAY
    }

    IMiniMeToken public votingToken;
    VetoNFT public vetoes;

    mapping(address => mapping(uint256 => VoteType)) public voted;
    mapping(uint256 => bool) public proposalExisted;

    /**
    @param token   address of MiniMeToken
     */
    function initialize(IMiniMeToken token, VetoNFT vetoes_, AccessControl accessControl_) external initializer {
        require(address(accessControl_) != address(0), "AccessControl address cannot be zero");
        require(address(token) != address(0), "MiniMeToken address cannot be zero");
        require(address(vetoes_) != address(0), "VetoToken address cannot be zero");
        require(token.totalSupply() == Constants.FIXED_SUPPLY, "Unexpected total supply");
        require(token.balanceOf(msg.sender) == Constants.FIXED_SUPPLY, "Unexpected owner balance");
        require(token.decimals() == Constants.DECIMALS, "Unexpected number of decimals");
        votingToken = token;
        vetoes = vetoes_;
        accessControl = accessControl_;
    }

    // allow to send ETH
    receive() external payable {}

    /**
    Create a proposal without payment

    @param hash proposal hash
     */
    function createProposal(uint256 hash) external {
        _createProposal(hash, ProposalLibrary.emptyPayment());
    }

    /**
    Create a proposal to withdraw ETH

    @param hash     proposal hash
    @param to       where to send ETH
    @param amount   ETH amount
     */
    function withdrawETH(
        uint256 hash,
        address to,
        uint256 amount
    ) external {
        _createProposal(hash, Payment({token: address(0), destination: to, amount: amount, sendETH: true}));
    }

    /**
    Create a proposal to withdraw a ERC20-token

    @param hash     proposal hash
    @param token    ERC20-token contract address
    @param to       where to send token
    @param amount   how much token to send
     */
    function withdrawToken(
        uint256 hash,
        address token,
        address to,
        uint256 amount
    ) external {
        _createProposal(hash, Payment({token: token, destination: to, amount: amount, sendETH: false}));
    }

    /**
    Veto the vote

    A user needs a Veto Token to run this method

    @param hash proposal hash
     */
    function veto(uint256 hash) external {
        (bool found, uint8 index) = find(hash);
        require(found, Errors.ERROR_NOT_FOUND);

        Proposal storage proposal = proposals[index];
        require(!proposal.vetoed, Errors.ERROR_VETOED);
        require(!proposal.isExpired(), Errors.ERROR_EXPIRED);
        require(!proposal.isExecuted, Errors.ERROR_ALREADY_EXECUTED);

        require(vetoes.balanceOf(msg.sender) > 0, Errors.NO_VETO_RIGHT);
        proposal.vetoed = true;
    }

    /**
    Cast a vote
    
    @param hash     The hash of the proposal
    @param support  Yea or nay
    
     */
    function vote(uint256 hash, bool support) external {
        (bool found, uint8 index) = find(hash);
        require(found, Errors.ERROR_NOT_FOUND);

        Proposal storage proposal = proposals[index];
        require(!proposal.vetoed, Errors.ERROR_VETOED);
        require(!proposal.isExpired(), Errors.ERROR_EXPIRED);
        require(!proposal.isExecuted, Errors.ERROR_ALREADY_EXECUTED);

        uint32 votingPower = votingToken.balanceOfAt(msg.sender, proposal.createdBlockNumber).toUint32();
        require(votingPower > 0, Errors.ERROR_INSUFFICIENT_BALANCE);

        if (voted[msg.sender][hash] == VoteType.YEA) {
            proposal.yeas -= votingPower;
        }

        if (voted[msg.sender][hash] == VoteType.NAY) {
            proposal.nays -= votingPower;
        }

        proposal.vote(support, votingPower);
        voted[msg.sender][hash] = support ? VoteType.YEA : VoteType.NAY;

        if (proposal.isQuorumReached()) {
            emit ProposalQuorumReached(proposal.hash, proposal.isSupported());
        }
    }

    /**
    Execute a proposal so it could be removed from the queue

    If the proposal's payment amount > 0 then a withdrawment from the treasury is made
    If there are not enough funds in the treasury then the transaction is reverted

     */
    function execute(uint256 hash) external {
        (bool found, uint8 index) = find(hash);
        require(found, Errors.ERROR_NOT_FOUND);

        Proposal storage proposal = proposals[index];
        require(!proposal.vetoed, Errors.ERROR_VETOED);
        require(!proposal.isExpired(), Errors.ERROR_EXPIRED);
        require(!proposal.isExecuted, Errors.ERROR_ALREADY_EXECUTED);
        require(proposal.isQuorumReached(), Errors.ERROR_QUORUM_IS_NOT_REACHED);
        require(proposal.isAccepted(), Errors.ERROR_CANNOT_EXECUTE_REJECTED_PROPOSAL);

        if (proposal.payment.amount > 0 && proposal.isAccepted()) {
            _withdraw(proposal.payment);
        }

        proposal.isExecuted = true;

        emit ProposalExecuted(hash);
    }

    /**
    Create and enqueue a proposal

    Set payment.amount to zero to create a proposal without payment

    Note that you can create a proposal to withdraw funds 
    even if there are not enough funds in the treasury
    in the moment of the proposal's creation
     
    @param hash Hash of the proposal
    @param payment Withdrawment from the treasury:
    - token           Treasury token to withdraw. Can be zero if amount is 0 or sendETH is true
    - destination     Address to withdraw funds to. Can be zero if amount == 0
    - amount          Amount to withdraw. Can be zero if there is no need for payment
    - sendETH         Use ETH to withdraw from treasury
     */
    function _createProposal(uint256 hash, Payment memory payment) internal {
        require(!proposalExisted[hash], Errors.ERROR_COLLISION);
        proposalExisted[hash] = true;

        require(votingToken.balanceOf(msg.sender) > 0, Errors.ERROR_INSUFFICIENT_BALANCE);

        if (payment.amount > 0) {
            require(payment.destination != address(0), Errors.ERROR_ZERO_ADDRESS);
            if (!payment.sendETH) {
                require(payment.token != address(0), Errors.ERROR_ZERO_ADDRESS);
            }
        }

        super.enqueue(
            Proposal({
                hash: hash,
                createdTimestamp: block.timestamp.toUint32(),
                createdBlockNumber: block.number.toUint32(),
                payment: payment,
                updatedBlockNumber: 0,
                yeas: 0,
                nays: 0,
                isExecuted: false,
                vetoed: false
            })
        );

        emit ProposalCreated(hash);
    }

    function _withdraw(Payment storage payment) internal {
        if (payment.sendETH) {
            _withdrawETH(payment.destination, payment.amount);
        } else {
            _withdrawToken(IERC20(payment.token), payment.destination, payment.amount);
        }
    }

    function _withdrawETH(address destination, uint256 amount) internal {
        // mistype check
        require(destination != address(0), Errors.ERROR_ZERO_ADDRESS);

        // ensure there are enough funds
        // leave that requirement for testing purposes
        // to unify revert's error messages
        require(address(this).balance >= amount, Errors.ERROR_TREASURY_INSUFFICIENT_BALANCE);

        // send eth
        destination.call{value: amount}("");
    }

    function _withdrawToken(
        IERC20 token,
        address destination,
        uint256 amount
    ) internal {
        // mistype check
        require(address(destination) != address(0), Errors.ERROR_ZERO_ADDRESS);

        // if there are not enough funds on the token
        // safeTransfer is still may not revert
        require(token.balanceOf(address(this)) >= amount, Errors.ERROR_TREASURY_INSUFFICIENT_BALANCE);

        // send token
        token.transfer(destination, amount);
    }
}
