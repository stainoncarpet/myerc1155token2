/* eslint-disable spaced-comment */
/* eslint-disable no-unused-expressions */
/* eslint-disable node/no-missing-import */
/* eslint-disable node/no-extraneous-import */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { BASE_URI, ZERO_ADDRESS } from "../hardhat.config";

describe("MyERC1155Token", function () {
  let MyERC1155Token: any, myERC1155Token: any, signers: any[], metamaskSigner: any, decimalPart: number;

  beforeEach(async () => {
    MyERC1155Token = await ethers.getContractFactory("MyERC1155Token");
    myERC1155Token = await MyERC1155Token.deploy(BASE_URI);

    await myERC1155Token.deployed();

    signers = await ethers.getSigners();
    metamaskSigner = await ethers.getSigner(process.env.METAMASK_PUBLIC_KEY);
    decimalPart = await myERC1155Token.DECIMAL_PART();

    await network.provider.request({ method: "hardhat_impersonateAccount", params: [process.env.METAMASK_PUBLIC_KEY] });
  });

  afterEach(async () => { });

  it("Deployer should have balances after contract deployment", async () => {
    expect(await myERC1155Token.balanceOf(myERC1155Token.signer.address, 4)).to.be.equal(1);
    expect(await myERC1155Token.balanceOf(myERC1155Token.signer.address, 3)).to.be.equal(10 * decimalPart);
    expect(await myERC1155Token.balanceOf(myERC1155Token.signer.address, 2)).to.be.equal(100 * decimalPart);
    expect(await myERC1155Token.balanceOf(myERC1155Token.signer.address, 1)).to.be.equal(1000 * decimalPart);
    expect(await myERC1155Token.balanceOf(myERC1155Token.signer.address, 0)).to.be.equal(10000 * decimalPart);
  });

  it("Should perform setApprovalForAll & isApprovedForAll & safeTransferFrom", async () => {
    // shuld fail before approval is given
    await expect(
      myERC1155Token
        .connect(signers[1])
        .safeTransferFrom(signers[0].address, signers[2].address, 4, 1, "")
    )
      .to.be.reverted
    ;
    expect(await myERC1155Token.isApprovedForAll(signers[0].address, signers[1].address)).to.be.false;

    // signer0 allows signer1 to transfer all
    await myERC1155Token.setApprovalForAll(signers[1].address, true);
    expect(await myERC1155Token.balanceOf(myERC1155Token.signer.address, 4)).to.be.equal(1);
    expect(await myERC1155Token.isApprovedForAll(signers[0].address, signers[1].address)).to.be.true;

    // signer1 transfers one diamond to signer2
    await expect(myERC1155Token
      .connect(signers[1])
      .safeTransferFrom(signers[0].address, signers[2].address, 4, 1, new Uint8Array())
      )
      .to.emit(myERC1155Token, "TransferSingle")
      .withArgs(signers[1].address, signers[0].address, signers[2].address, 4, 1)
    ;

    // signer0 no longer has diamods, but has other stuff remaining, e.g. bronze
    expect(await myERC1155Token.balanceOf(myERC1155Token.signer.address, 4)).to.be.equal(0);
    expect(await myERC1155Token.balanceOf(myERC1155Token.signer.address, 0)).to.be.equal(10000 * decimalPart);

    // signer2 received diamond
    expect(await myERC1155Token.balanceOf(signers[2].address, 4)).to.be.equal(1);
  });

  it("Should perform setApprovalForAll & isApprovedForAll & safeBatchTransferFrom", async () => {
    // signer0 allows signer1 to transfer all
    expect(await myERC1155Token.isApprovedForAll(signers[0].address, signers[1].address)).to.be.false;
    await expect(
      myERC1155Token.setApprovalForAll(signers[1].address, true)
    )
    .to.emit(myERC1155Token, "ApprovalForAll")
    .withArgs(signers[0].address, signers[1].address, true)
    ;
    expect(await myERC1155Token.isApprovedForAll(signers[0].address, signers[1].address)).to.be.true;

    const bronzeBalance = await myERC1155Token.balanceOf(myERC1155Token.signer.address, 0);
    const silverBalance = await myERC1155Token.balanceOf(myERC1155Token.signer.address, 1);
    const goldBalance = await myERC1155Token.balanceOf(myERC1155Token.signer.address, 2);
    const platinumBalance = await myERC1155Token.balanceOf(myERC1155Token.signer.address, 3);

    // signer1 transfers everything except for diamond to signer2
    expect(await myERC1155Token
      .connect(signers[1])
      .safeBatchTransferFrom(
        signers[0].address,
        signers[2].address,
        [0, 1, 2, 3],
        [bronzeBalance, silverBalance, goldBalance, platinumBalance],
        new Uint8Array()
      )
    )
    .to.emit(myERC1155Token, "TransferBatch")
    .withArgs(
      signers[1].address, 
      signers[0].address, 
      signers[2].address,
      [0, 1, 2, 3],
      [bronzeBalance, silverBalance, goldBalance, platinumBalance]
    )
    ;

    // signer0 only has diamond
    expect(await myERC1155Token.balanceOf(myERC1155Token.signer.address, 0)).to.be.equal(0);
    expect(await myERC1155Token.balanceOf(myERC1155Token.signer.address, 1)).to.be.equal(0);
    expect(await myERC1155Token.balanceOf(myERC1155Token.signer.address, 2)).to.be.equal(0);
    expect(await myERC1155Token.balanceOf(myERC1155Token.signer.address, 3)).to.be.equal(0);
    expect(await myERC1155Token.balanceOf(myERC1155Token.signer.address, 4)).to.be.equal(1);

    // signer2 should have all except for diamond
    expect(await myERC1155Token.balanceOf(signers[2].address, 4)).to.be.equal(0);
    expect(await myERC1155Token.balanceOf(signers[2].address, 3)).to.be.equal(10 * decimalPart);
    expect(await myERC1155Token.balanceOf(signers[2].address, 2)).to.be.equal(100 * decimalPart);
    expect(await myERC1155Token.balanceOf(signers[2].address, 1)).to.be.equal(1000 * decimalPart);
    expect(await myERC1155Token.balanceOf(signers[2].address, 0)).to.be.equal(10000 * decimalPart);
  });

  it("Should perform balanceOfBatch", async () => {
    // mint 2 diamond by minting twice with 0.1 ETH
    await expect(metamaskSigner.sendTransaction({ value: ethers.utils.parseEther("0.1"),  to: myERC1155Token.address }))
      .to.emit(myERC1155Token, "TransferBatch")
      .withArgs(
        metamaskSigner.address, 
        ZERO_ADDRESS, 
        metamaskSigner.address,
        [0, 1, 2, 3],
        [10000 * decimalPart, 1000 * decimalPart, 100 * decimalPart, 10 * decimalPart]
    )
    ;

    expect(metamaskSigner.sendTransaction({ value: ethers.utils.parseEther("0.2"),  to: myERC1155Token.address}))
      .to.be.revertedWith("Only 0.1 ETH is accepted")
    ;

    expect(await metamaskSigner.sendTransaction({ value: ethers.utils.parseEther("0.1"),  to: myERC1155Token.address, data: "0".charCodeAt(0) }))
    .to.emit(myERC1155Token, "TransferBatch")
    .withArgs(
      metamaskSigner.address, 
      ZERO_ADDRESS, 
      metamaskSigner.address,
      [0, 1, 2, 3],
      [10000 * decimalPart, 1000 * decimalPart, 100 * decimalPart, 10 * decimalPart]
    )
    ;

    const balances = await myERC1155Token.balanceOfBatch(
      [signers[0].address, metamaskSigner.address],
      [4, 4],
    );

    expect(ethers.utils.formatUnits(balances[0], 0)).to.be.equal("1");
    expect(ethers.utils.formatUnits(balances[1], 0)).to.be.equal("2");
  });

  it("Should return token uri", async () => {
    expect(await myERC1155Token.uri(0)).to.be.equal(BASE_URI + "0.json");
    expect(myERC1155Token.uri(5)).to.be.revertedWith("Token doesn't exist");
  });

  it("Should return contract uri", async () => {
    expect(await myERC1155Token.contractURI()).to.be.equal(BASE_URI + "contract.json");
  });

  it("Should get destroyed correctly", async () => {
    expect(await myERC1155Token.owner()).to.equal(signers[0].address);
    await expect(myERC1155Token.connect(signers[1]).destroyContract()).to.be.revertedWith("Ownable: caller is not the owner");
    await myERC1155Token.destroyContract();
    await expect(myERC1155Token.owner()).to.be.reverted;
  });
});
