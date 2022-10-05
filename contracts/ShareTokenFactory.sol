// SPDX-License-Identifier: MIT
pragma solidity >=0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./ShareToken.sol";

contract ShareTokenFactory {
    event Created(address shareToken);

    function create(
        ERC20 _asset,
        string memory _name,
        string memory _symbol,
        uint256 _redeemableAt,
        uint256 _totalSupply
    ) public returns (address) {
        ERC20 shareToken = new ShareToken(_asset, _name, _symbol, _redeemableAt, _totalSupply, msg.sender);
        emit Created(address(shareToken));
        return address(shareToken);
    }
}
