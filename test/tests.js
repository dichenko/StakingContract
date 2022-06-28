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
   * @it Should set correct lpToken balance for staking
   * @it Should emit event 'Staked'
   */
  describe("Staking", function () {
    it("Should set correct lpToken balance for staking", async function () {
      let balanceBefore = await lpToken.balanceOf(myStaking.address);
      let tx0 = await myStaking.connect(user1).stake(1000);
      let balanceAfter = await lpToken.balanceOf(myStaking.address);
      expect(balanceAfter - balanceBefore).to.equal(1000);
    });

    it("Should emit event 'Staked'", async function () {
      await expect(myStaking.connect(user1).stake(1000))
        .to.emit(myStaking, "Staked")
        .withArgs(user1.address, 1000);
    });
  });

  /**
   * @dev Unstake
   * @it Should restrict unstaking before lockup time is up
   * @it Should unstake when lockup time is up
   */
  describe("Unstaking", function () {
    it("Should restrict unstaking before lockup time is up", async function () {
      let tx1 = await myStaking.connect(user1).stake(1000);
      tx1.wait();
      await expect(myStaking.connect(user1).unstake()).to.be.revertedWith(
        "Time lock"
      );
    });

    it("Should unstake when lockup time is up", async function () {
      let lockUpTime = await myStaking.timeToFreezLp();
      let tx1 = await myStaking.connect(user1).stake(1000);
      let lpTokenBalanseBefore = await lpToken.balanceOf(user1.address);
      await ethers.provider.send("evm_increaseTime", [Number(lockUpTime) + 1]);
      await ethers.provider.send("evm_mine");
      let tx2 = await myStaking.connect(user1).unstake();
      let lpTokenBalanseAfter = await lpToken.balanceOf(user1.address);
      expect(Number(lpTokenBalanseAfter)).to.equal(
        Number(lpTokenBalanseBefore) + 1000
      );
    });
  });

  /**
   * @dev Claim
   * @it Should restrict claim reward before lockup time is up
   * @it Should claim when lockup time is up
   */
  describe("Claim", function () {
    it("Should restrict claim reward before lockup time is up", async function () {
      let tx1 = await myStaking.connect(user1).stake(1000);
      tx1.wait();
      await expect(myStaking.connect(user1).claim()).to.be.revertedWith(
        "Time lock"
      );
    });

    it("Should claim when lockup time is up", async function () {
      let lockUpTime = await myStaking.timeToReward();
      let percent = await myStaking.percent();
      let tx1 = await myStaking.connect(user1).stake(1000);
      await ethers.provider.send("evm_increaseTime", [Number(lockUpTime) + 1]);
      await ethers.provider.send("evm_mine");
      let tx2 = await myStaking.connect(user1).claim();
      let lpTokenBalanseAfter = await rewardToken.balanceOf(user1.address);
      expect(Number(await rewardToken.balanceOf(user1.address))).to.equal(
        (1000 * Number(percent)) / 100
      );
    });
  });

  /**
   * @dev Utils
   * @it Should set variables only by owner
   * @it Should set variables correctly
   */
  describe("Utils", function () {
    it("Should set variables only by owner", async function () {
      await expect(myStaking.connect(user1).setPercent(1)).to.be.revertedWith(
        "You a not an owner!"
      );
      await expect(
        myStaking.connect(user1).setTimeToReward(1)
      ).to.be.revertedWith("You a not an owner!");
      await expect(
        myStaking.connect(user1).setTimeToFreezLp(1)
      ).to.be.revertedWith("You a not an owner!");
    });

    it("Should set variables correctly", async function () {
      tx1 = await myStaking.setPercent(1);
      tx2 = await myStaking.setTimeToReward(1);
      tx3 = await myStaking.setTimeToFreezLp(1);
      expect(await myStaking.percent()).to.equal(1);
      expect(await myStaking.timeToReward()).to.equal(1);
      expect(await myStaking.timeToFreezLp()).to.equal(1);
    });
  });
});
