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
    lpToken.connect(user1).approve(myStaking.address, ethers.utils.parseEther("10"));
    lpToken.connect(user2).approve(myStaking.address, ethers.utils.parseEther("10"));
  });

  /**
   * @dev Deployment
   * @it Should set the right owner
   * @it Should set correct freeztimes
   * @it Should set correct reward percent
   * @it
   */

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await myStaking.owner()).to.equal(owner.address);
    });

    it("Should be the right value in owner balance", async function () {
      expect(await myStaking.balanceOf(owner.address)).to.equal(initialSupply);
    });
  });

  /**
   * @dev Stake
   * @it Should set correct stakholder balance
   * @it Should set correct rewards balance
   */


    /**
   * @dev Unstake
   * @it Should revert unstake before timelock is up
   * @it Should unstake only unlocked stakes
   */







});
