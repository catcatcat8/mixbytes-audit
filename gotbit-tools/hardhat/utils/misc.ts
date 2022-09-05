// TODO: get chaindId tenderly from .env or secrets.config
import { config } from '../../../secrets.config'

export const chainIds = {
  localhost: 31337,
  eth_mainnet: 1,
  bsc_mainnet: 56,
  polygon_mainnet: 137,
  avax_mainnet: 43114,
  ftm_mainnet: 250,
  arbitrum_mainnet: 42161,
  rinkeby: 4,
  ropsten: 3,
  goerli: 5,
  bsc_testnet: 97,
  polygon_testnet: 80001,
  avax_testnet: 43113,
  ftm_testnet: 4002,
  arbitrum_testnet: 421611,
  tenderly: 56,
}
export type ChainTag = keyof typeof chainIds

export type RpcFunction = (chainTag: ChainTag) => string

const APIS = ['ETH', 'BSC', 'POLYGON', 'AVAX', 'FTM', 'ARBITRUM'] as const

export type GotBitConfig = {
  rpc: RpcFunction
  API: Partial<Record<typeof APIS[number], string>>
  PRIVATE: {
    TEST: string[]
    MAIN: string[]
    HARDHAT_ACCS_PR_KEYS: string[]
  }
  ETH_RPC: string
  BSC_RPC: string
  TENDERLY: {
    RPC: string
    CHAIN_ID: number
  }
}

export function defineConfig(config: GotBitConfig) {
  return config
}
