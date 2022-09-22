// SPDX-License-Identifier: MIT
pragma solidity >=0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IFutureToken.sol";

error NO_ASSET();

contract FutureToken is IFutureToken, ERC20 {
    using SafeERC20 for ERC20;

    event Deposited(address indexed sender, uint256 amount);
    event Redeemed(address indexed sender, uint256 amount);

    uint256 public tokenType = 1; // type 1: only deposit, 2: mintable, 3: mintable and changeable asset
    ERC20 public asset;
    uint256 public redeemableAt;

    constructor(
        address _asset,
        string memory _name,
        string memory _symbol,
        uint256 _redeemableAt
    ) ERC20(_name, _symbol) {
        asset = ERC20(_asset);
        redeemableAt = _redeemableAt;
    }

    function _hasAsset() internal view {
        if (address(asset) == address(0)) revert NO_ASSET();
    }

    modifier hasAsset() {
        _hasAsset();
        _;
    }

    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

    function _futureToAsset(uint256 _amount) internal view returns (uint256) {
        return (_amount * 10**asset.decimals()) / 10**decimals();
    }

    function _assetToFuture(uint256 _amount) internal view returns (uint256) {
        return (_amount * 10**decimals()) / 10**asset.decimals();
    }

    function deposit(uint256 _amount) public virtual hasAsset {
        asset.safeTransferFrom(msg.sender, address(this), _amount);
        _mint(msg.sender, _assetToFuture(_amount));
        emit Deposited(msg.sender, _amount);
    }

    function redeem(uint256 _amount) public virtual hasAsset {
        require(block.timestamp >= redeemableAt, "Not redeemable yet");
        _burn(msg.sender, _amount);
        asset.safeTransfer(msg.sender, _futureToAsset(_amount));
        emit Redeemed(msg.sender, _amount);
    }

    function totalAssets() public view returns (uint256) {
        if (address(asset) == address(0)) return 0;
        return asset.balanceOf(address(this));
    }
}
