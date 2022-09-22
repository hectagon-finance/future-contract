// SPDX-License-Identifier: MIT
pragma solidity >=0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./FutureToken.sol";

error UNMINTABLE();
error HAS_DEBT();

contract FutureTokenMintable is FutureToken, Ownable {
    event Minted(address indexed sender, uint256 amount);
    bool public mintable = true;

    constructor(
        address _asset,
        string memory _name,
        string memory _symbol,
        uint256 _redeemableAt,
        address _owner
    ) FutureToken(_asset, _name, _symbol, _redeemableAt) {
        _transferOwnership(_owner);
        tokenType = 2;
    }

    function _isMintable() internal view {
        if (!mintable) revert UNMINTABLE();
    }

    modifier isMintable() {
        _isMintable();
        _;
    }

    function _noDebt() internal view {
        if (totalDebts() > 0) revert HAS_DEBT();
    }

    modifier noDebt() {
        _noDebt();
        _;
    }

    function disableMinting() public virtual onlyOwner isMintable noDebt {
        mintable = false;
        tokenType = 1;
        renounceOwnership();
    }

    function mint(uint256 _amount) public onlyOwner isMintable {
        _mint(msg.sender, _amount);
        emit Minted(msg.sender, _amount);
    }

    function totalDebts() public view virtual returns (uint256) {
        if (address(asset) == address(0)) return totalSupply();
        uint256 _totalSupplyAsAsset = _futureToAsset(totalSupply());
        uint256 _totalAssets = totalAssets();
        if (_totalAssets >= _totalSupplyAsAsset) return 0;
        return _totalSupplyAsAsset - _totalAssets;
    }
}
