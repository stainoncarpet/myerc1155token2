/* eslint-disable no-unused-vars */
/* eslint-disable node/no-missing-import */
/* eslint-disable prettier/prettier */

import * as dotenv from "dotenv";
import { runTasks } from "./tasks/index";

import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();
runTasks();

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ETHERSCAN_API_KEY: string;
      ALCHEMY_KEY: string;
      METAMASK_PRIVATE_KEY: string;
      METAMASK_PUBLIC_KEY: string;
      COINMARKETCAP_API_KEY: string;
      RINKEBY_URL: string;
    }
  }
}

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const BASE_URI = "ipfs://QmdhqGD3NEMnTkzgPPvA1PfD4NTdiCo5wdPPrFkzA7nzpc/"

const config: HardhatUserConfig = {
  solidity: "0.8.11",
  networks: {
    rinkeby: {
      url: process.env.RINKEBY_URL,
      accounts: [process.env.METAMASK_PRIVATE_KEY],
      gas: 2100000,
      gasPrice: 8000000000
    },
    hardhat: {
      forking: {
        url: process.env.RINKEBY_URL,
        blockNumber: 10293822,
      }
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
