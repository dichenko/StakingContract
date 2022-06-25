const { task } = require("hardhat/config");
require("@nomiclabs/hardhat-waffle");
require("solidity-coverage");
require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

task("transfer", "Transfer tokens").addParam('addressto', "address to transfer")
  .addParam("amount", "Amount tokens to transfer")
  .setAction(async ({addressto, amount}, { ethers: { getSigners }, runsuper }) => {
    const STAKING = await ethers.getContractFactory("Staking");
    const myStaking = STAKING.attach("!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    const user = await ethers.getSigners();
    const success = await myStaking.transfer(addressto, amount);
    console.log("Transfered", amount, " tokens to ", addressto);
    return success; 
});




module.exports = {
  solidity: "0.8.15",
  networks: {
    rinkeby: {
      url: process.env.STAGING_ALCHEMY_KEY,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan:{
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};