const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyStaking", function () {
  let LpTokenFactory;
  let lpToken;
  let RewardTokenFactory;
  let rewardToken;
  let MyStakingFactory;
  let myStaking;
  let decimals = 18;
  let initialSupply = ethers.utils.parseEther("1000000");
  let owner;
  let user1;
  let user2;

  beforeEach(async () => {
    LpTokenFactory = await hre.ethers.getContractFactory("LpToken");
    lpToken = await LpTokenFactory.deploy(
      "LpToken",
      "LPT",
      decimals,
      initialSupply
    );
    await lpToken.deployed();

    RewardTokenFactory = await hre.ethers.getContractFactory("RewardToken");
    rewardToken = await RewardTokenFactory.deploy(
      "RewardToken",
      "RWD",
      decimals,
      initialSupply
    );
    await rewardToken.deployed();

    MyStakingFactory = await hre.ethers.getContractFactory("Staking");
    myStaking = await MyStakingFactory.deploy(
      lpToken.address,
      rewardToken.address
    );
    await myStaking.deployed();

    [owner, user1, user2] = await ethers.getSigners();

    lpToken.transfer(user1.address, ethers.utils.parseEther("10"));
    lpToken.transfer(user2.address, ethers.utils.parseEther("10"));
    lpToken
      .connect(user1)
      .approve(myStaking.address, ethers.utils.parseEther("10"));
    lpToken
      .connect(user2)
      .approve(myStaking.address, ethers.utils.parseEther("10"));

    rewardToken.transfer(myStaking.address, ethers.utils.parseEther("100"));
  });

  /**
   * @dev Deployment
   * @it Should set the right owner
   */
  describe("Deploy", function () {
    it("Should set the right owner", async function () {
      expect(await myStaking.owner()).to.equal(owner.address);
    });
  });
  /**
   * @dev Stake
   * @it Should set correct stakholder balance
   * @it Should set correct rewards balance
   */
  describe("Staking", function () {
    it("Should set correct lpToken balance for staking", async function () {
      let balanceBefore = await lpToken.balanceOf(myStaking.address);
      await myStaking.connect(user1).stake(1000);
      let balanceAfter = await lpToken.balanceOf(myStaking.address);
      expect(balanceAfter - balanceBefore).to.equal(1000);
    });

    it("Should emit event Staked", async function () {
      await expect(myStaking.connect(user1).stake(1000))
        .to.emit(myStaking, "Staked")
        .withArgs(user1.address, 1000);
    });
  });

  /**
   * @dev Unstake
   * @it Should revert unstake before timelock is up
   * @it Should unstake only unlocked stakes
   * 
   * 
   * await ethers.provider.send("evm_increaseTime", [Number(duration)]);
      await ethers.provider.send("evm_mine");
   */

  describe("Unstaking", function () {
    it("Should restrict unstaking before lockup time is up", async function () {
      let tx1 = await myStaking.connect(user1).stake(1000);
      tx1.wait();
      await expect(myStaking.connect(user1).unstake(500)).to.be.revertedWith("insufficient funds");
    });

    it("Should unstake if lockup time is up", async function () {
      let lockUpTime =  await myStaking.timeToFreezLp;
      console.log(lockUpTime);
      let lpTokenBalanseBefore = lpToken.balanceOf(user1.address);
      let tx1 = await myStaking.connect(user1).stake(1000);
      await ethers.provider.send("evm_increaseTime", [Number(lockUpTime)+60]);
      await ethers.provider.send("evm_mine");
      let tx2 = await myStaking.connect(user1).unstake(1000);
      let lpTokenBalanseAfter = lpToken.balanceOf(user1.address);
      expect(lpTokenBalanseAfter).to.equal(lpTokenBalanseBefore);

    });

  });
});
