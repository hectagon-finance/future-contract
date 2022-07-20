// SPDX-License-Identifier: MIT
pragma solidity >=0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./FutureToken.sol";

contract FutureTokenMintable is FutureToken, Ownable {
    event Minted(address indexed sender, uint256 amount);
    bool public mintable = true;

    constructor(
        address _asset,
        string memory _name,
        string memory _symbol,
        uint256 _redeemableAt,
        address _owner
    ) FutureToken(_asset, _name, _symbol, _redeemableAt) {
        _transferOwnership(_owner);
    }

    modifier _isMintable() {
        require(mintable == true, "Not mintable");
        _;
    }

    function disableMinting() public onlyOwner _isMintable {
        mintable = false;
    }

    function mint(uint256 _amount) public onlyOwner _isMintable {
        _mint(msg.sender, _amount);
        emit Minted(msg.sender, _amount);
    }

    function debtOfAsset() public view returns (uint256) {
        if (balanceOfAsset() >= totalSupply()) return 0;
        return totalSupply() - balanceOfAsset();
    }
}
