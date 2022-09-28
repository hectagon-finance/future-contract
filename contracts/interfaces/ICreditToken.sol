// SPDX-License-Identifier: MIT
pragma solidity >=0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ICreditToken is IERC20 {
    function redeem(uint256 _amount) external;

    function totalAssets() external returns (uint256);

    function totalDebts() external returns (uint256);

    function disableChanging() external;

    function setAsset(address _asset) external;
}
