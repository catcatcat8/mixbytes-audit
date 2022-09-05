import { ChainTag, RpcFunction } from './utils/misc'
import { rpcs, extraRpcs } from './utils/node'

/** @deprecated */
export const moralisRpc = (moralisId: string): RpcFunction => {
  const moralisPath: Record<ChainTag, string> = {
    localhost: '/',
    eth_mainnet: '/eth/mainnet',
    bsc_mainnet: '/bsc/mainnet',
    polygon_mainnet: '/polygon/mainnet',
    avax_mainnet: '/avalanche/mainnet',
    ftm_mainnet: '/fantom/mainnet',
    arbitrum_mainnet: '/arbitrum/mainnet',
    rinkeby: '/eth/rinkeby',
    ropsten: '/eth/ropsten',
    goerli: '/eth/goerli',
    bsc_testnet: '/bsc/testnet',
    polygon_testnet: '/polygon/mumbai',
    avax_testnet: '/avalanche/testnet',
    ftm_testnet: '/fantom/tesnet',
    arbitrum_testnet: '/arbitrum/testnet',
    tenderly: '',
  }

  return (chainTag: ChainTag) => 'https://speedy-nodes-nyc.moralis.io/' + moralisId + moralisPath[chainTag]
}

export const defaultRpc = (): RpcFunction => {
  return (chainTag: ChainTag) => rpcs[chainTag]
}

export const ankrRpc = (): RpcFunction => {
  const ankrPath: Partial<Record<ChainTag, string>> = {
    avax_mainnet: '/avalanche',
    bsc_mainnet: '/bsc',
    arbitrum_mainnet: '/arbitrum',
    eth_mainnet: '/eth',
    ftm_mainnet: '/fantom',
    polygon_mainnet: '/polygon',

    avax_testnet: '/avalanche_fuji',
    polygon_testnet: '/polygon_mumbai',
    ftm_testnet: '/fantom_testnet',
    rinkeby: '/eth_rinkeby',
    ropsten: '/eth_ropsten',
    goerli: '/eth_goerli',
  }

  return (chainTag: ChainTag) => (ankrPath[chainTag] ? 'https://rpc.ankr.com' + ankrPath[chainTag] : '')
}

const goodRpcProvider = [ankrRpc()]

export const extraRpc = (indexes?: Partial<Record<ChainTag, number>>) => {
  return (chainTag: ChainTag) => {
    let index = 0
    if (indexes) {
      const possibleIndex = indexes[chainTag]
      if (possibleIndex !== undefined) index = possibleIndex
    }

    const rpcList = extraRpcs[chainTag]

    for (const goodRpc of goodRpcProvider) {
      const rpc = goodRpc(chainTag)
      if (rpc) rpcList.push(rpc)
    }

    return index < rpcList.length ? rpcList[index] : ''
  }
}
