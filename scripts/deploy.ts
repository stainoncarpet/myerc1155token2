/* eslint-disable node/no-missing-import */
/* eslint-disable prettier/prettier */
import { ethers } from "hardhat";
import { BASE_URI } from "../hardhat.config";

const main = async () => {
  const MMT = await ethers.getContractFactory("MyERC1155Token");
  const mmt = await MMT.deploy(BASE_URI);

  await mmt.deployed();

  console.log("MyERC1155Token deployed to:", mmt.address, "by", await mmt.signer.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});