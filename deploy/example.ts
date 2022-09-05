import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

import { ethers } from 'hardhat'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  const token = await ethers.getContract('Token')

  await deploy('Example', {
    from: deployer,
    args: [token.address],
    log: true,
  })
}
export default func

func.tags = ['Example']
func.dependencies = ['Token']
