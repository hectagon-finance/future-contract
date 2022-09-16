// SPDX-License-Identifier: MIT
pragma solidity >=0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./FutureToken.sol";
import "./FutureTokenMintable.sol";
import "./interfaces/IFutureTokenFactory.sol";
import "./utils/DateTime.sol";

error NULL_ADDRESS();
error EXISTED();
error NOT_START_OF_DAY();

contract FutureTokenFactory is IFutureTokenFactory {
    using DateTime for uint256;

    event Created(address indexed asset, address futureToken, uint256 redeemableAt);

    mapping(address => mapping(uint256 => address)) public tokens;

    function _notNullAsset(address _asset) internal pure {
        if (_asset == address(0)) revert NULL_ADDRESS();
    }

    modifier notNullAsset(address _asset) {
        _notNullAsset(_asset);
        _;
    }

    function _notExisted(address _asset, uint256 _redeemableAt) internal view {
        if (tokens[_asset][_redeemableAt] != address(0)) revert EXISTED();
    }

    modifier notExisted(address _asset, uint256 _redeemableAt) {
        _notExisted(_asset, _redeemableAt);
        _;
    }

    function _startOfDay(uint256 _redeemableAt) internal pure {
        if (_redeemableAt % 86400 != 0) revert NOT_START_OF_DAY();
    }

    modifier startOfDay(uint256 _redeemableAt) {
        _startOfDay(_redeemableAt);
        _;
    }

    function create(address _asset, uint256 _redeemableAt)
        public
        notNullAsset(_asset)
        notExisted(_asset, _redeemableAt)
        startOfDay(_redeemableAt)
        returns (address)
    {
        string memory tokenSuffix = _redeemableAt.formatYYYYMMDD();

        ERC20 futureToken = new FutureToken(
            _asset,
            string(abi.encodePacked("Future ", ERC20(_asset).name(), " ", tokenSuffix)),
            string(abi.encodePacked("f", ERC20(_asset).symbol(), tokenSuffix)),
            _redeemableAt
        );
        tokens[_asset][_redeemableAt] = address(futureToken);
        emit Created(_asset, address(futureToken), _redeemableAt);
        return address(futureToken);
    }

    function createMintable(address _asset, uint256 _redeemableAt)
        public
        notNullAsset(_asset)
        notExisted(_asset, _redeemableAt)
        startOfDay(_redeemableAt)
        returns (address)
    {
        string memory tokenSuffix = _redeemableAt.formatYYYYMMDD();
        ERC20 futureToken = new FutureTokenMintable(
            _asset,
            string(abi.encodePacked("Future ", ERC20(_asset).name(), " ", tokenSuffix)),
            string(abi.encodePacked("f", ERC20(_asset).symbol(), tokenSuffix)),
            _redeemableAt,
            msg.sender
        );
        tokens[_asset][_redeemableAt] = address(futureToken);
        emit Created(_asset, address(futureToken), _redeemableAt);
        return address(futureToken);
    }
}
