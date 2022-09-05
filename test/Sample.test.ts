import { BigNumber, BigNumberish } from 'ethers'

import { Token, Example } from '../typechain'
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
  await deployments.fixture(['Token', 'Example'])

  const contracts = {
    token20: (await ethers.getContract('Token')) as Token,
    exampleContract: (await ethers.getContract('Example')) as Example,
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
      const { token20, exampleContract, deployer, backend, feeAddress } = await setup()
      expect(await exampleContract.token()).to.be.equal(token20.address)
      expect(feeAddress.address).to.be.equal(HARDHAT_ACCS_PUB_KEYS[2])
    })
  })
})
