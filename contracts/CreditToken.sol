// SPDX-License-Identifier: MIT
pragma solidity >=0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/ICreditToken.sol";

error NO_ASSET();
error UNCHANGEABLE();

contract CreditToken is ICreditToken, ERC20, ERC20Burnable, Ownable {
    using SafeERC20 for ERC20;

    event SetAsset(address asset);
    event Redeemed(address indexed to, uint256 amount);

    bool public changeable = true;
    ERC20 public asset;
    uint256 public redeemableAt;

    constructor(
        address _asset,
        string memory _name,
        string memory _symbol,
        uint256 _redeemableAt,
        uint256 _totalSupply,
        address _owner
    ) ERC20(_name, _symbol) {
        asset = ERC20(_asset);
        redeemableAt = _redeemableAt;
        _transferOwnership(_owner);
        _mint(_owner, _totalSupply);
    }

    function _isChangeable() internal view {
        if (!changeable) revert UNCHANGEABLE();
    }

    modifier isChangeable() {
        _isChangeable();
        _;
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

    function _convertToAsset(uint256 _amount) internal view returns (uint256) {
        return (_amount * 10**asset.decimals()) / 10**decimals();
    }

    function redeem(uint256 _amount) public hasAsset {
        require(block.timestamp >= redeemableAt, "Not redeemable yet");
        _burn(msg.sender, _amount);
        asset.safeTransfer(msg.sender, _convertToAsset(_amount));
        emit Redeemed(msg.sender, _amount);
    }

    function totalAssets() public view returns (uint256) {
        if (address(asset) == address(0)) return 0;
        return asset.balanceOf(address(this));
    }

    function totalDebts() public view returns (uint256) {
        if (address(asset) == address(0)) return totalSupply();
        uint256 _totalSupplyAsAsset = _convertToAsset(totalSupply());
        uint256 _totalAssets = totalAssets();
        if (_totalAssets >= _totalSupplyAsAsset) return 0;
        return _totalSupplyAsAsset - _totalAssets;
    }

    function disableChanging() public onlyOwner isChangeable hasAsset {
        changeable = false;
    }

    function setAsset(address _asset) public onlyOwner isChangeable {
        asset = ERC20(_asset);
        emit SetAsset(_asset);
    }
}
