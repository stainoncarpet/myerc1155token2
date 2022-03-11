/* eslint-disable node/no-missing-import */
/* eslint-disable node/no-unpublished-import */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */

import { task } from "hardhat/config";

const NETWORK = "rinkeby";

export const runTasks = async () => {
    task("mint", "Mint one NFT by sending 0.1 ETH")
        .addParam("contract", "Contract address")
        .setAction(async (taskArguments, hre) => {
            const alchemyProvider = new hre.ethers.providers.AlchemyProvider(NETWORK, process.env.ALCHEMY_KEY);
            const walletOwner = new hre.ethers.Wallet(process.env.METAMASK_PRIVATE_KEY, alchemyProvider);

            const mintTx = await walletOwner.sendTransaction({ to: taskArguments.contract, value: hre.ethers.utils.parseEther("0.1")})

            console.log("Receipt: ", mintTx);
        })
    ;
};