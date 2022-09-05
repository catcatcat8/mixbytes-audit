import { defineConfig } from './gotbit-tools/hardhat/config'
import { defaultRpc } from './gotbit-tools/hardhat/rpc'

const DEFAULT_ETH_RPC: string = 'https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
const DEFAULT_BSC_RPC: string = 'https://data-seed-prebsc-1-s1.binance.org:8545/'

const DEFAULT_HARDHAT_ACCS_PR_KEYS: string[] = [
  '388e09fbf8750a9c70f941a6f1e4d5d284ca99379424c6abb651f403aa9b262c',
  '09aa1c9a844462702ada80caaa828d6de330caa8b417ac57edb60bf7d10b91fb',
  '6a3edfd2f56dfa687b50259001adc2a8ff0ff0427a1927ebe660910cd59630b2',
  '533b6487b808b52dd4f2185b90b2be3ad4d8c811e6ea9ad687153de69551c1e1',
  '198131415b5c941a2f2c10bb547be0fa9bacc32d80176c029c22e32f4ba32696',
]

const DEFAULT_TENDERLY_RPC = 'https://rpc.tenderly.co/fork/3ebaf9bd-daec-48d3-b96e-d4bd104da686'
const DEFAULT_TENDERLY_CHAIN_ID = 56

export const config = defineConfig({
  rpc: defaultRpc(),
  PRIVATE: {
    TEST: process.env.PRIVATE_TEST ? process.env.PRIVATE_TEST?.split(',') : [],
    MAIN: process.env.PRIVATE_MAIN ? process.env.PRIVATE_MAIN?.split(',') : [],
    HARDHAT_ACCS_PR_KEYS: process.env.HARDHAT_ACCS_PR_KEYS
      ? process.env.HARDHAT_ACCS_PR_KEYS?.split(',')
      : DEFAULT_HARDHAT_ACCS_PR_KEYS,
  },
  API: {
    ETH: process.env.API_ETH,
    BSC: process.env.API_BSC,
    POLYGON: process.env.API_POLYGON,
    AVAX: process.env.API_AVAX,
    FTM: process.env.API_FTM,
    ARBITRUM: process.env.API_ARBITRUM,
  },
  ETH_RPC: process.env.ETH_RPC ? process.env.ETH_RPC : DEFAULT_ETH_RPC,
  BSC_RPC: process.env.BSC_RPC ? process.env.BSC_RPC : DEFAULT_BSC_RPC,
  TENDERLY: {
    RPC: process.env.TENDERLY_RPC ? process.env.TENDERLY_RPC : DEFAULT_TENDERLY_RPC,
    CHAIN_ID: process.env.TENDERLY_CHAIN_ID ? parseInt(process.env.TENDERLY_CHAIN_ID) : DEFAULT_TENDERLY_CHAIN_ID,
  },
})

export const HARDHAT_ACCS_PR_KEYS = config.PRIVATE.HARDHAT_ACCS_PR_KEYS
export const ETH_RPC = config.ETH_RPC
export const BSC_RPC = config.BSC_RPC
