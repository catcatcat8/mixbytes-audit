import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const beacon = await hre.ethers.getContract('VBeacon')
  const ac = await hre.ethers.getContract('VAccessControl')
  const nft = await hre.ethers.getContract('VetoNFT')
  const vt = await hre.ethers.getContract('VotingToken')

  await deploy("VBeaconProxy", {
    from: deployer,
    contract: "VBeaconProxy",
    args: [beacon.address, vt.address, nft.address, ac.address],
    log: true,
  });
};
export default func;
func.tags = ["VBeaconProxy"];
func.dependencies = ["VBeacon", "VAccessControl", "VetoNFT", "VotingToken"]
