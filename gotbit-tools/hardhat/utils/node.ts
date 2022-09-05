import { config } from '../../../secrets.config'
import { ChainTag, chainIds } from './misc'

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
  type: Types
}

export type Types = 'mainnet' | 'testnet' | 'fork' | 'localhost'

export const types: Record<ChainTag, Types> = {
  localhost: 'testnet',

  eth_mainnet: 'mainnet',
  bsc_mainnet: 'mainnet',
  polygon_mainnet: 'mainnet',
  avax_mainnet: 'mainnet',
  ftm_mainnet: 'mainnet',
  arbitrum_mainnet: 'mainnet',

  rinkeby: 'testnet',
  ropsten: 'testnet',
  goerli: 'testnet',
  bsc_testnet: 'testnet',
  polygon_testnet: 'testnet',
  avax_testnet: 'testnet',
  ftm_testnet: 'testnet',
  arbitrum_testnet: 'testnet',

  tenderly: 'fork',
}

export const names: Record<ChainTag, string> = {
  localhost: 'Localhost',

  eth_mainnet: 'Ethereum',
  bsc_mainnet: 'Binance Smart Chain',
  polygon_mainnet: 'Polygon Mainnet',
  avax_mainnet: 'Avalanche Mainnet',
  ftm_mainnet: 'Fantom Mainnet',
  arbitrum_mainnet: 'Arbitrum Mainnet',

  rinkeby: 'Rinkeby',
  ropsten: 'Ropsten',
  goerli: 'Goerli',
  bsc_testnet: 'Binance Smart Chain Testnet',
  polygon_testnet: 'Polygon Mumbai Testnet',
  avax_testnet: 'Avalanche Fuji Testnet',
  ftm_testnet: 'Fantom Testnet',
  arbitrum_testnet: 'Arbitrum Testnet',

  tenderly: 'Tenderly',
}

export const symbols: Record<ChainTag, string> = {
  localhost: 'LOC',

  eth_mainnet: 'ETH',
  bsc_mainnet: 'BNB',
  polygon_mainnet: 'MATIC',
  avax_mainnet: 'AVAX',
  ftm_mainnet: 'FTM',
  arbitrum_mainnet: 'ETH',

  rinkeby: 'ETH',
  ropsten: 'ETH',
  goerli: 'ETH',
  bsc_testnet: 'BNB',
  polygon_testnet: 'MATIC',
  avax_testnet: 'AVAX',
  ftm_testnet: 'FTM',
  arbitrum_testnet: 'ETH',

  tenderly: 'BNB',
}

export const rpcs: Record<ChainTag, string> = {
  localhost: 'http://127.0.0.1:8545/',

  eth_mainnet: 'https://rpc.ankr.com/eth',
  bsc_mainnet: 'https://bitter-proud-sunset.bsc.discover.quiknode.pro/0cb77e449a80c582e7cb116ca6d2d6bae5ab2f22/',
  polygon_mainnet: 'https://polygon-rpc.com',
  avax_mainnet: 'https://api.avax.network/ext/bc/C/rpc',
  ftm_mainnet: 'https://rpc.ftm.tools',
  arbitrum_mainnet: 'https://arb1.arbitrum.io/rpc',

  rinkeby: 'https://rinkey.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  ropsten: 'https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  goerli: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  bsc_testnet: 'https://data-seed-prebsc-1-s1.binance.org:8545',
  polygon_testnet: 'https://rpc-mumbai.maticvigil.com',
  avax_testnet: 'https://api.avax-test.network/ext/bc/C/rpc',
  ftm_testnet: 'https://rpc.testnet.fantom.network/',
  arbitrum_testnet: 'https://rinkeby.arbitrum.io/rpc',

  tenderly: config.TENDERLY.RPC,
}

export const scanners: Record<ChainTag, string> = {
  localhost: '/',
  eth_mainnet: 'https://etherscan.io/',
  bsc_mainnet: 'https://bscscan.com/',
  polygon_mainnet: 'https://polygonscan.com/',
  avax_mainnet: 'https://snowtrace.io/',
  ftm_mainnet: 'https://ftmscan.com/',
  arbitrum_mainnet: 'https://arbiscan.io/',
  rinkeby: 'https://rinkeby.etherscan.io/',
  ropsten: 'https://ropsten.etherscan.io/',
  goerli: 'https://goerli.etherscan.io/',
  bsc_testnet: 'https://testnet.bscscan.com/',
  polygon_testnet: 'https://mumbai.polygonscan.com/',
  avax_testnet: 'https://testnet.snowtrace.io/',
  ftm_testnet: 'https://testnet.ftmscan.com/',
  arbitrum_testnet: 'https://testnet.arbiscan.io/',

  tenderly: 'https://dashboard.tenderly.co/',
}

export function node(name: ChainTag): Node {
  if (name === 'ftm_testnet') {
    return {
      rpc: 'https://rpc.testnet.fantom.network/',
      chainId: chainIds[name],
      scanner: scanners[name],
      name: names[name],
      short: name,
      type: types[name],
    }
  }
  if (name === 'localhost') {
    return {
      rpc: 'http://127.0.0.1:8545/',
      chainId: chainIds[name],
      scanner: scanners[name],
      name: names[name],
      short: name,
      type: types[name],
    }
  }
  if (name === 'tenderly') {
    return {
      rpc: config.rpc(name),
      chainId: chainIds[name],
      scanner: scanners[name],
      name: names[name],
      short: name,
      type: types[name],
    }
  }
  if (Object.keys(names).includes(name)) {
    return {
      rpc: config.rpc(name),
      chainId: chainIds[name],
      scanner: scanners[name],
      name: names[name],
      short: name,
      type: types[name],
    }
  }

  return {} as Node
}

export function getConfig(name: ChainTag): Config {
  if (Object.keys(names).includes(name)) {
    return {
      name: names[name],
      rpc: rpcs[name],
      chainId: chainIds[name],
      symbol: symbols[name],
      scanner: scanners[name],
    }
  }

  return {} as Config
}

export const extraRpcs: Record<ChainTag, string[]> = {
  localhost: ['http://127.0.0.1:8545/'],

  eth_mainnet: ['https://rpc.ankr.com/eth'],
  bsc_mainnet: [
    'https://bsc-dataseed1.binance.org/',
    'https://bsc-dataseed2.binance.org/',
    'https://bsc-dataseed3.binance.org/',
    'https://bsc-dataseed4.binance.org/',
    'https://bsc-dataseed1.defibit.io/',
    'https://bsc-dataseed2.defibit.io/',
    'https://bsc-dataseed3.defibit.io/',
    'https://bsc-dataseed4.defibit.io/',
    'https://bsc-dataseed1.ninicoin.io/',
    'https://bsc-dataseed2.ninicoin.io/',
    'https://bsc-dataseed3.ninicoin.io/',
    'https://bsc-dataseed4.ninicoin.io/',
    'https://rpc.ankr.com/bsc',
  ],
  polygon_mainnet: ['https://polygon-rpc.com', 'https://rpc.ankr.com/polygon'],
  avax_mainnet: ['https://api.avax.network/ext/bc/C/rpc', 'https://rpc.ankr.com/avalanche'],
  ftm_mainnet: ['https://rpc.ftm.tools', 'https://rpc.ankr.com/fantom'],
  arbitrum_mainnet: ['https://arb1.arbitrum.io/rpc', 'https://rpc.ankr.com/arbitrum'],

  rinkeby: ['https://rinkey.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
  ropsten: ['https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
  goerli: ['https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
  bsc_testnet: [
    'https://data-seed-prebsc-1-s1.binance.org:8545/',
    'https://data-seed-prebsc-2-s1.binance.org:8545/',
    'http://data-seed-prebsc-1-s2.binance.org:8545/',
    'http://data-seed-prebsc-2-s2.binance.org:8545/',
    'https://data-seed-prebsc-1-s3.binance.org:8545/',
    'https://data-seed-prebsc-2-s3.binance.org:8545/',
  ],
  polygon_testnet: ['https://rpc-mumbai.maticvigil.com'],
  avax_testnet: ['https://api.avax-test.network/ext/bc/C/rpc'],
  ftm_testnet: ['https://rpc.testnet.fantom.network/'],
  arbitrum_testnet: ['https://rinkeby.arbitrum.io/rpc'],

  tenderly: [],
}
