import { ethers } from "hardhat";

async function main() {
  const deployer = (await ethers.getSigners())[0]; // no type issues

  console.log("Deploying contract with account:", await deployer.getAddress());

  const AssuranceVolFactory = await ethers.getContractFactory("AssuranceVol");
  const assurance = await AssuranceVolFactory.deploy(2000);

  await assurance.deploymentTransaction()?.wait();

  console.log("AssuranceVol deployed to:", assurance.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
