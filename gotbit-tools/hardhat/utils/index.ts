import { ContractFactory } from 'ethers'
import { DeployOptions } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

import { ChainTag, chainIds } from '../types'
import { node, types, Types } from './node'

import { config } from '../../../secrets.config'
import process from 'process'

const parseConfig = (): {
  chains: Record<ChainTag, { keys?: string[]; api?: string }>
} => {
  return {
    chains: {
      localhost: {},
      eth_mainnet: {
        keys: config.PRIVATE?.MAIN,
        api: config.API?.ETH,
      },
      rinkeby: {
        keys: config.PRIVATE?.TEST,
        api: config.API?.ETH,
      },
      ropsten: {
        keys: config.PRIVATE?.TEST,
        api: config.API?.ETH,
      },
      goerli: {
        keys: config.PRIVATE?.TEST,
        api: config.API?.ETH,
      },
      bsc_mainnet: {
        keys: config.PRIVATE?.MAIN,
        api: config.API?.BSC,
      },
      bsc_testnet: {
        keys: config.PRIVATE?.TEST,
        api: config.API?.BSC,
      },
      polygon_mainnet: {
        keys: config.PRIVATE?.MAIN,
        api: config.API?.POLYGON,
      },
      polygon_testnet: {
        keys: config.PRIVATE?.TEST,
        api: config.API?.POLYGON,
      },
      avax_mainnet: {
        keys: config.PRIVATE?.MAIN,
        api: config.API?.AVAX,
      },
      avax_testnet: {
        keys: config.PRIVATE?.TEST,
        api: config.API?.AVAX,
      },
      ftm_mainnet: {
        keys: config.PRIVATE?.MAIN,
        api: config.API?.FTM,
      },
      ftm_testnet: {
        keys: config.PRIVATE?.TEST,
        api: config.API?.FTM,
      },
      arbitrum_mainnet: {
        keys: config.PRIVATE?.MAIN,
        api: config.API?.ARBITRUM,
      },
      arbitrum_testnet: {
        keys: config.PRIVATE?.TEST,
        api: config.API?.ARBITRUM,
      },
      tenderly: {
        keys: config.PRIVATE?.TEST,
        api: config.API?.BSC,
      },
    },
  }
}

export const genNetworks = () => {
  const networks = {} as { [key: string]: Record<string, unknown> }
  const parsedConfig = parseConfig()

  for (const name of Object.keys(chainIds) as ChainTag[]) {
    if (parsedConfig.chains[name] === undefined) continue
    if (name === 'localhost') continue

    networks[name] = {
      url: node(name).rpc,
      chainId: chainIds[name],
      accounts: parsedConfig.chains[name].keys,
      tags: [types[name]],
      verify: {
        etherscan: {
          apiKey: parsedConfig.chains[name].api,
        },
      },
    }
  }

  return networks
}

export const genCompilers = (vers: string[]) =>
  vers.map((v) => ({
    version: v,
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  }))

export const wrapperHRE = (hre: HardhatRuntimeEnvironment) => {
  const { deployments } = hre
  const deploy = <Factory extends ContractFactory>(
    name: string,
    options: Omit<DeployOptions, 'args'> | { args: Parameters<Factory['deploy']> }
  ) => deployments.deploy(name, options as DeployOptions)
  return { ...hre, deploy }
}

export const exceptTypes = (...tags: Types[]) => {
  return async (hre: HardhatRuntimeEnvironment) => tags.some((tag) => !hre.network.tags[tag])
}

export const setup = async (name: string, exec: () => Promise<void>) => {
  process.stdout.write(`setuping "${name}" ... `)
  await exec()
  console.log(`setuped`)
}
