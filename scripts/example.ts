const { ethers } = require('ethers')
import { BigNumber } from 'ethers'
import { Token } from '../typechain'
import { BSC_RPC, ETH_RPC } from '../secrets.config'
import { BNToNumstr } from '../gotbit-tools/hardhat/extensions/bignumber'

import * as dotenv from 'dotenv'
dotenv.config()

const providerBSC = new ethers.providers.JsonRpcProvider(BSC_RPC)
const providerETH = new ethers.providers.JsonRpcProvider(ETH_RPC)
const walletPrivateKey = process.env.PRIVATE_TEST

const token = BigNumber.from(10).pow(18)

async function bsc() {}
async function eth() {}

eth()
// bsc()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
