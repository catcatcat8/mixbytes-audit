import { HardhatUserConfig, task } from 'hardhat/config'
import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'
import 'hardhat-gas-reporter'
import 'solidity-coverage'
import 'hardhat-contract-sizer'
import 'hardhat-deploy'

import './gotbit-tools/hardhat/init'
import { genNetworks, genCompilers, node } from './gotbit-tools/hardhat'
import { HARDHAT_ACCS_PR_KEYS } from './secrets.config'
import { chainIds, ChainTag } from './gotbit-tools/hardhat/types'

const ACC_PUBKEY: string = '0x6EF1032E74B0371BAa3cA64878d8984eFd1B7453'

export const HARDHAT_ACCS_PUB_KEYS: string[] = [
  '0xF22a4BF45BBfde23c9EBf64357DFDe96A5aEFad4',
  '0x9988546291D3319DCB18E8469BDAaE81e7183140',
  '0x862C8BfDC733f01bF4D81B410709F590840B5190',
  '0x8a74d952b97B366821f68860b3C033c7F4b85F31',
  '0x23E4C6b9669D49C082662db7863FdB68cbC379BB',
]
const DEFAULT_BALANCE = '10000000000000000000000000000'

task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners()
  for (const account of accounts) {
    console.log(account.address)
  }
})

const CHAIN_ID = Number(process.env.TENDERLY_CHAIN_ID)
const CHAIN_TAG = Object.keys(chainIds).find((tag) => chainIds[tag as ChainTag] === CHAIN_ID) as ChainTag | undefined
if (!CHAIN_TAG) console.error('ERROR: NO "CHAIN_ID" PASSED IN ENVIRONMENT VARIABLES')

export const config: HardhatUserConfig = {
  solidity: {
    compilers: genCompilers(['0.8.4']), // separated by comma
  },
  typechain: {
    outDir: 'typechain',
  },
  namedAccounts: {
    deployer: {
      default: HARDHAT_ACCS_PUB_KEYS[0],
      bsc_testnet: ACC_PUBKEY,
      polygon_testnet: ACC_PUBKEY,
      goerli: ACC_PUBKEY,
      ropsten: ACC_PUBKEY,
      tenderly: ACC_PUBKEY
    },
    backend: {
      default: HARDHAT_ACCS_PUB_KEYS[1],
      bsc_testnet: ACC_PUBKEY,
      ropsten: ACC_PUBKEY,
      tenderly: ACC_PUBKEY
    },
    feeAddress: {
      default: HARDHAT_ACCS_PUB_KEYS[2],
      bsc_testnet: ACC_PUBKEY,
      ropsten: ACC_PUBKEY,
      tenderly: ACC_PUBKEY
    },
  },
  networks: {
    hardhat: {
      tags: ['fork'],
      chainId: 56,
      forking: {
        url: CHAIN_TAG ? node(CHAIN_TAG).rpc : '',
        // blockNumber:
      },
      accounts: [
        // HARDHAT_1
        {
          privateKey: HARDHAT_ACCS_PR_KEYS[0],
          balance: DEFAULT_BALANCE,
        },
        // HARDHAT_2
        {
          privateKey: HARDHAT_ACCS_PR_KEYS[1],
          balance: DEFAULT_BALANCE,
        },
        // HARDHAT_3
        {
          privateKey: HARDHAT_ACCS_PR_KEYS[2],
          balance: DEFAULT_BALANCE,
        },
        // HARDHAT_4
        {
          privateKey: HARDHAT_ACCS_PR_KEYS[3],
          balance: DEFAULT_BALANCE,
        },
        // HARDHAT_5
        {
          privateKey: HARDHAT_ACCS_PR_KEYS[4],
          balance: DEFAULT_BALANCE,
        },
      ],
    },
    ...genNetworks(),
    // place here any network you like (for overiding `networkGenerator`)
  },
  gasReporter: {
    enabled: false,
    currency: 'USD',
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: false,
  },
}

export default config
