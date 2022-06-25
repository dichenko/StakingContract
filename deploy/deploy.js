const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const accountBalance = await deployer.getBalance();

  console.log("Deploying contracts with account: ", deployer.address);
  console.log("Account balance: ", accountBalance.toString());

  const MyStakingFactory = await hre.ethers.getContractFactory("Staking");
  const myStaking = await MyStakingFactory.deploy();

  await myStaking.deployed();

  console.log("MyStaking deployed to:", myStaking.address);
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
