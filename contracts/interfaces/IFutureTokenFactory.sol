// SPDX-License-Identifier: MIT
pragma solidity >=0.8.10;

interface IFutureTokenFactory {
    function create(address _originAddress, uint256 _redeemableAt) external returns (address);

    function createMintable(address _originAddress, uint256 _redeemableAt) external returns (address);
}
