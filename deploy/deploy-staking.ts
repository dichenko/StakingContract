import { ethers } from "hardhat";

async function main() {
  const LPADDRESS = "0x8bc17512ac769571e574c5333d3e7830adb9e6f0";
  const REWATDTOKENADDRESS = "";

  ///deploy staking contract
  const [deployer] = await ethers.getSigners();
  const MyStakingFactory = await ethers.getContractFactory("Staking");
  const myStaking = await MyStakingFactory.deploy(
    LPADDRESS,
    REWATDTOKENADDRESS
  );

  await myStaking.deployed();

  console.log("MyStaking deployed to:", myStaking.address);

  ///transfer Reward Tokens to staking contract
  let rewardToken = await ethers.getContractAt(
    "RewardToken",
    REWATDTOKENADDRESS,
    deployer
  );
  let tx1 = await rewardToken.transfer(myStaking.address, ethers.utils.parseEther("100000"));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
