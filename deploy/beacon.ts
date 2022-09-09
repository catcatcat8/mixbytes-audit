import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const dao = await hre.ethers.getContract('VotingDAOV2')

  await deploy("VBeacon", {
    from: deployer,
    contract: "VBeacon",
    args: [dao.address],
    log: true,
  });
};
export default func;
func.tags = ["VBeacon"];
func.dependencies = ["VotingDAOV2"]
