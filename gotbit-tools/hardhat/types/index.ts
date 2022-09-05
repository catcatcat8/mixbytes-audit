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
  tenderly: config.TENDERLY.CHAIN_ID,
}

export interface Config {
  name: string
  rpc: string
  chainId: number
  symbol: string
  scanner: string
}

export interface Node {
  short: string
  name: string
  scanner: string
  rpc: string
  chainId: number
  type: 'mainnet' | 'testnet'
}

export type ChainTag = keyof typeof chainIds
