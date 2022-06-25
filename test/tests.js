const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyStaking", function () {
  let MyStakingFactory;
  let myStaking;
  let decimals = 18;
  let initialSupply = ethers.utils.parseEther("1000000");
  let owner;
  let user1;
  let user2;
  let user3;
  let user4;
  let user5;

  beforeEach(async () => {
    MyStakingFactory = await hre.ethers.getContractFactory("Staking");
    myStaking = await MyStakingFactory.deploy(
      name,
      symbols,
      decimals,
      initialSupply
    );
    [owner, user1, user2, user3, user4, user5] = await ethers.getSigners();
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
