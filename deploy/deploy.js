const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const accountBalance = await deployer.getBalance();

  console.log("Deploying contracts with account: ", deployer.address);
  console.log("Account balance: ", accountBalance.toString());

  const RewardTokenFactory = await hre.ethers.getContractFactory("RewardToken");
  const rewardToken = await RewardTokenFactory.deploy("RewardToken","RWD", 18, ethers.utils.parseEther("1000000"));

  await rewardToken.deployed();

  console.log("rewardToken deployed to:", rewardToken.address);

  const MyStakingFactory = await hre.ethers.getContractFactory("Staking");
  const myStaking = await MyStakingFactory.deploy("0x8bc17512ac769571e574c5333d3e7830adb9e6f0", rewardToken.address );

  await myStaking.deployed();

  console.log("MyStaking deployed to:", myStaking.address);

  let tx1 = await rewardToken.transfer(myStaking.address, ethers.utils.parseEther("1000000"))
  
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
