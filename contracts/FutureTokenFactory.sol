// SPDX-License-Identifier: MIT
pragma solidity >=0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./FutureToken.sol";
import "./interfaces/IFutureTokenFactory.sol";
import "./utils/DateTime.sol";

contract FutureTokenFactory is IFutureTokenFactory {
    using DateTime for uint256;

    event Created(address indexed asset, address futureToken, uint256 redeemableAt);

    mapping(uint256 => address) tokens;

    function create(address _asset, uint256 _redeemableAt) public returns (address) {
        require(get(_asset, _redeemableAt) == address(0), "Future Token existed");
        require(_redeemableAt % 86400 == 0, "RedeemableAt must be start of day");

        string memory tokenSuffix = _redeemableAt.formatYYYYMMDD();

        ERC20 futureToken = new FutureToken(
            _asset,
            string(abi.encodePacked("Future ", ERC20(_asset).name(), " ", tokenSuffix)),
            string(abi.encodePacked("f", ERC20(_asset).symbol(), tokenSuffix)),
            _redeemableAt
        );
        tokens[_hash(_asset, _redeemableAt)] = address(futureToken);
        emit Created(_asset, address(futureToken), _redeemableAt);
        return address(futureToken);
    }

    function get(address _asset, uint256 _redeemableAt) public view returns (address) {
        return tokens[_hash(_asset, _redeemableAt)];
    }

    function _hash(address _asset, uint256 _redeemableAt) private pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(_asset, _redeemableAt)));
    }
}
