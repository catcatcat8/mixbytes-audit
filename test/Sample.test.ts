import { BigNumber, BigNumberish } from 'ethers'

import { VAccessControl, VBeacon, VetoNFT, PaymentToken, VBeaconProxy, VotingDAOV2, VotingToken, VotingDAOV2__factory } from '../typechain'
import { HARDHAT_ACCS_PUB_KEYS } from '../hardhat.config'

import { expect } from 'chai'

import { setupUser, setupUsers } from './utils/index'
import {
  ethers,
  deployments,
  getNamedAccounts,
  getUnnamedAccounts,
  time,
  network,
} from 'hardhat'
import { BNToNumstr } from '../gotbit-tools/hardhat/extensions/bignumber'

async function setup() {
  await deployments.fixture(['VAccessControl', 'VBeacon', 'VetoNFT', 'PaymentToken', 'VBeaconProxy', 'VotingDAOV2', 'VotingToken'])

  const contracts = {
    vac: (await ethers.getContract('VAccessControl')) as VAccessControl,
    beacon: (await ethers.getContract('VBeacon')) as VBeacon,
    nft: (await ethers.getContract('VetoNFT')) as VetoNFT,
    paymentToken: (await ethers.getContract('PaymentToken')) as PaymentToken,
    proxy: (await ethers.getContract('VBeaconProxy')) as VBeaconProxy,
    daov2: (await ethers.getContract('VotingDAOV2')) as VotingDAOV2,
    votingToken: (await ethers.getContract('VotingToken')) as VotingToken
  }

  const { deployer, backend, feeAddress } = await getNamedAccounts()
  const users = await setupUsers(await getUnnamedAccounts(), contracts)
  return {
    ...contracts,
    users,
    deployer: await setupUser(deployer, contracts),
    backend: await setupUser(backend, contracts),
    feeAddress: await setupUser(feeAddress, contracts),
  }
}

describe('Example unit test', () => {
  const token = BigNumber.from(10).pow(18)
  describe('Constructor', () => {
    it('Should successfully define passed parameters to fields', async () => {
      const { vac, beacon, nft, paymentToken, proxy, daov2, votingToken, deployer, backend, feeAddress, users } = await setup()
      const proxyContract = VotingDAOV2__factory.connect(proxy.address, await ethers.provider)
      const proposalCreator = users[0]
      const vetoNftHolder = users[1]

      const proxyProposalCreator = VotingDAOV2__factory.connect(proxy.address, await ethers.getSigner(proposalCreator.address))
      console.log("block:", await ethers.provider.getBlock('latest'));
      
      await deployer.votingToken.transfer(proposalCreator.address, 50000001)
      await proxyProposalCreator.withdrawETH(666, proposalCreator.address, BigNumber.from(9).mul(BigNumber.from(10).pow(18)))
      console.log("proposal:", await proxyContract.proposals(0));

      // await proxyProposalCreator.withdrawETH(1, proposalCreator.address, 9)
      // await proxyProposalCreator.withdrawETH(2, proposalCreator.address, 9)
      // await proxyProposalCreator.withdrawETH(6266, proposalCreator.address, 9)
      // await proxyProposalCreator.withdrawETH(6636, proposalCreator.address, 9)
      // await proxyProposalCreator.withdrawETH(6664, proposalCreator.address, 9)
      // await proxyProposalCreator.withdrawETH(6661, proposalCreator.address, 9)
      // await proxyProposalCreator.withdrawETH(66611, proposalCreator.address, 9)
      // await proxyProposalCreator.withdrawETH(66116, proposalCreator.address, 9)
      // await proxyProposalCreator.withdrawETH(6661111, proposalCreator.address, 9)
      // await time.increaseTime(86400 * 3 + 200)
      // await ethers.provider.send('evm_mine', [])
      // console.log("block:", await ethers.provider.getBlock('latest'));
      
      // await proxyProposalCreator.vote(666, true)
      // console.log("proposal:", await proxyContract.proposals(0));
      // console.log("voted", await proxyContract.voted(proxyProposalCreator.address, 666))
      // await proxyProposalCreator.vote(666, true)
      // console.log("proposal:", await proxyContract.proposals(0));
      // console.log("voted", await proxyContract.voted(proxyProposalCreator.address, 666))
      // await proxyProposalCreator.vote(666, false)
      // console.log("proposal:", await proxyContract.proposals(0));
      // console.log("voted",await proxyContract.voted(users[0].address, 666))
      // await proxyProposalCreator.vote(666, true)
      // console.log("proposal:", await proxyContract.proposals(0));

      // await deployer.votingToken.transfer(proposalCreator.address, 50000000)
      await proxyProposalCreator.vote(666, true)
      console.log("proposal:", await proxyContract.proposals(0));
      await proxyProposalCreator.fallback({value:  BigNumber.from(9).mul(BigNumber.from(10).pow(18))})
      // console.log(BNToNumstr(await ethers.provider.getBalance(proxyContract.address), 18 , 18));
      console.log(BNToNumstr(await ethers.provider.getBalance(users[0].address), 18 , 18));
      await proxyProposalCreator.execute(666)
      console.log(BNToNumstr(await ethers.provider.getBalance(users[0].address), 18 , 18));
      await proxyProposalCreator.withdrawETH(66611, proposalCreator.address, 9)
      console.log(BNToNumstr(await ethers.provider.getBalance(users[0].address), 18 , 18));
    })
  })
})
