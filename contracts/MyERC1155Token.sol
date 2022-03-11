// SPDX-License-Identifier: MIT

pragma solidity >=0.8.11 <0.9.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// https://eips.ethereum.org/EIPS/eip-1155
contract MyERC1155Token is ERC1155, Ownable {
    uint256 public constant BRONZE = 0;
    uint256 public constant SILVER = 1;
    uint256 public constant GOLD = 2;
    uint256 public constant PLATINUM = 3;
    uint256 public constant DIAMOND = 4;
    uint256 public constant DECIMAL_PART = 1000;
    string private TOKEN_BASE_URI;

    // erc1155 uri example: "https://game.example/api/item/{id}.json"
    // but opensea doesn't support this format as shown in their own example project repo
    // https://github.com/ProjectOpenSea/opensea-erc1155/blob/master/contracts/ERC1155Tradable.sol#L58
    constructor(string memory _uri) public ERC1155(_uri) {
        (uint256[] memory _ids, uint256[] memory _values) = getDefaultDynamicBatch();
        mint(_ids, _values);
        TOKEN_BASE_URI = _uri;
    }

    modifier onlyExact() {
        require(msg.value == 10**17, "Only 0.1 ETH is accepted");
        _;
    }

    fallback() external payable onlyExact {
        (uint256[] memory _ids, uint256[] memory _values) = getDefaultDynamicBatch();
        mint(_ids, _values);
    }

    receive() external payable onlyExact {
        (uint256[] memory _ids, uint256[] memory _values) = getDefaultDynamicBatch();
        mint(_ids, _values);
    }

    function mint(uint256[] memory ids, uint256[] memory vals) internal {
        for (uint256 index = 0; index < ids.length; index++) {
            _mint(msg.sender, ids[index], vals[index], "");
        }

        emit TransferBatch(msg.sender, address(0), msg.sender, ids, vals);
    }

    // works around fixed/dynamic array conversion error
    function getDefaultDynamicBatch() internal pure returns (uint256[] memory, uint256[] memory) {
        uint256[] memory _ids = new uint256[](5);
        _ids[0] = BRONZE;
        _ids[1] = SILVER;
        _ids[2] = GOLD;
        _ids[3] = PLATINUM;
        _ids[4] = DIAMOND;

        uint256[] memory _values = new uint256[](5);
        _values[0] = 10000 * DECIMAL_PART;
        _values[1] = 1000 * DECIMAL_PART;
        _values[2] = 100 * DECIMAL_PART;
        _values[3] = 10 * DECIMAL_PART;
        _values[4] = 1;

        return (_ids, _values);
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        require(tokenId == 0 || tokenId == 1 || tokenId == 2 || tokenId == 3 || tokenId == 4, "Token doesn't exist");
        return string(abi.encodePacked(TOKEN_BASE_URI, Strings.toString(tokenId), ".json"));
    }

    // https://docs.opensea.io/docs/contract-level-metadata
    function contractURI() external view returns (string memory) {
        return string(abi.encodePacked(TOKEN_BASE_URI,  "contract.json"));
    }

    function destroyContract() external onlyOwner {
        selfdestruct(payable(owner()));
    }
}
