// SPDX-License-Identifier: MIT
pragma solidity >=0.8.10;

interface ITokenFactory {
    function createFutureToken(
        address _asset,
        string memory _name,
        string memory _symbol,
        uint256 _redeemableAt,
        string memory _description
    ) external returns (address);

    function createCreditToken(
        address _asset,
        string memory _name,
        string memory _symbol,
        uint256 _redeemableAt,
        uint256 _totalSupply,
        string memory _description
    ) external returns (address);
}
