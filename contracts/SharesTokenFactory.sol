// SPDX-License-Identifier: MIT
pragma solidity >=0.8.10;

import "./SharesToken.sol";

contract SharesTokenFactory {
    event Created(address sharesToken);

    function create(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply
    ) public {
        ERC20 sharesToken = new SharesToken(_name, _symbol, _totalSupply, msg.sender);
        emit Created(address(sharesToken));
    }
}
