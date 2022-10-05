// SPDX-License-Identifier: MIT
pragma solidity >=0.8.10;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

error NOT_REDEEMABLE();
error NO_ASSET();
error DEPOSIT_DISABLED();
error MINT_DISABLED();

contract ShareToken is ERC20Burnable, ERC4626 {
    uint256 public redeemableAt;

    constructor(
        ERC20 _asset,
        string memory _name,
        string memory _symbol,
        uint256 _redeemableAt,
        uint256 _totalSupply,
        address _owner
    ) ERC20(_name, _symbol) ERC4626(_asset) {
        require(address(_asset) != address(0), "Null address asset");
        redeemableAt = _redeemableAt;
        _mint(_owner, _totalSupply);
    }

    function _hasAsset() internal view {
        if (totalAssets() == 0) revert NO_ASSET();
    }

    modifier hasAsset() {
        _hasAsset();
        _;
    }

    function _redeemable() internal view {
        if (block.timestamp < redeemableAt) revert NOT_REDEEMABLE();
    }

    modifier redeemable() {
        _redeemable();
        _;
    }

    function deposit(uint256 _assets, address _receiver) public virtual override returns (uint256) {
        revert DEPOSIT_DISABLED();
    }

    function mint(uint256 _shares, address _receiver) public virtual override returns (uint256) {
        revert MINT_DISABLED();
    }

    function withdraw(
        uint256 _assets,
        address _receiver,
        address _owner
    ) public virtual override redeemable hasAsset returns (uint256) {
        return super.withdraw(_assets, _receiver, _owner);
    }

    function redeem(
        uint256 _shares,
        address _receiver,
        address _owner
    ) public virtual override redeemable hasAsset returns (uint256) {
        return super.redeem(_shares, _receiver, _owner);
    }
}
