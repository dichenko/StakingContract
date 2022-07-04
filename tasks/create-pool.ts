import * as dotenv from "dotenv";
import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
dotenv.config();

task("create-pool", "Create a uniswap-v2-poll ETH-ERC20")
  .addParam("eth_amount", "Amount of ETH")
  .addParam("token_amount", "Amount of ERC20 tokens")
  .setAction(async (taskArgs, hre) => {
    const [owner] = await hre.ethers.getSigners();
    const erc20Address = process.env.DEPLOYED_ERC20_ADDRESS;
    const myERC20 = await hre.ethers.getContractAt(
      "MyERC20",
      erc20Address as string,
      owner
    );
    const result = await myERC20.approve(taskArgs.spender, taskArgs.amount);
    console.log(result);
  });
