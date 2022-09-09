import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  const ac = await hre.ethers.getContract('VAccessControl')
  
  await deploy('VetoNFT', {
    from: deployer,
    contract: 'VetoNFT',
    args: [ac.address],
    log: true,
  })
}
export default func
func.tags = ['VetoNFT']
func.dependencies = ['VAccessControl']
