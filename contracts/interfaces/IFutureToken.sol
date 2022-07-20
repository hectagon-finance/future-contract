// SPDX-License-Identifier: MIT
pragma solidity >=0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface IFutureToken is IERC20 {
    function deposit(uint256 _amount) external;

    function redeem(uint256 _amount) external;

    function totalAssets() external returns (uint256);
}
