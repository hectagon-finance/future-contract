// SPDX-License-Identifier: MIT
pragma solidity >=0.8.10;

import "./ShareToken.sol";

contract ShareTokenFactory {
    event Created(address shareToken);

    function create(
        address _asset,
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply
    ) public {
        ERC20 shareToken = new ShareToken(_asset, _name, _symbol, _totalSupply, msg.sender);
        emit Created(address(shareToken));
    }
}
