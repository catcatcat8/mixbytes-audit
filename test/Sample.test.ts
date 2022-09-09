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
      const { vac, beacon, nft, paymentToken, proxy, daov2, votingToken, deployer, backend, feeAddress } = await setup()
      const proxyContract = VotingDAOV2__factory.connect(proxy.address, await ethers.getSigner(deployer.address))
      console.log(await ethers.provider.getStorageAt(proxyContract.address, 0));
      console.log(vac.address);
      // for (let index = 0; index < 400; index++) {
        console.log("71", ":", await ethers.provider.getStorageAt(proxyContract.address, 71));
        console.log("72", ":", await ethers.provider.getStorageAt(proxyContract.address, 72));
      // }
      // expect(feeAddress.address).to.be.equal(HARDHAT_ACCS_PUB_KEYS[2])
      console.log(await votingToken.address);
      console.log(await nft.address)
    })
  })
})
