// SPDX-License-Identifier: MIT
pragma solidity >=0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./FutureToken.sol";
import "./FutureTokenMintable.sol";
import "./FutureTokenChangeable.sol";
import "./interfaces/IFutureTokenFactory.sol";

error NULL_ADDRESS();

contract FutureTokenFactory is IFutureTokenFactory {
    event Created(address indexed asset, address futureToken, uint256 redeemableAt);

    function _notNullAsset(address _asset) internal pure {
        if (_asset == address(0)) revert NULL_ADDRESS();
    }

    modifier notNullAsset(address _asset) {
        _notNullAsset(_asset);
        _;
    }

    function create(
        address _asset,
        string memory _name,
        string memory _symbol,
        uint256 _redeemableAt
    ) public notNullAsset(_asset) returns (address) {
        ERC20 futureToken = new FutureToken(_asset, _name, _symbol, _redeemableAt);
        emit Created(_asset, address(futureToken), _redeemableAt);
        return address(futureToken);
    }

    function createMintable(
        address _asset,
        string memory _name,
        string memory _symbol,
        uint256 _redeemableAt
    ) public notNullAsset(_asset) returns (address) {
        ERC20 futureToken = new FutureTokenMintable(_asset, _name, _symbol, _redeemableAt, msg.sender);
        emit Created(_asset, address(futureToken), _redeemableAt);
        return address(futureToken);
    }

    function createChangeable(
        string memory _name,
        string memory _symbol,
        uint256 _redeemableAt
    ) public returns (address) {
        ERC20 futureToken = new FutureTokenChangeable(_name, _symbol, _redeemableAt, msg.sender);
        emit Created(address(0), address(futureToken), _redeemableAt);
        return address(futureToken);
    }
}
