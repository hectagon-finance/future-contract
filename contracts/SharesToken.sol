// SPDX-License-Identifier: MIT
pragma solidity >=0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract SharesToken is ERC20, ERC20Burnable, Ownable {
    using SafeERC20 for ERC20;
    using EnumerableSet for EnumerableSet.AddressSet;

    event Deposited(address indexed asset, uint256 amount);
    event Redeemed(address indexed to, uint256 amount);

    EnumerableSet.AddressSet private assets;

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        address _owner
    ) ERC20(_name, _symbol) {
        _mint(_owner, _totalSupply);
        _transferOwnership(_owner);
    }

    function convertToAssets(uint256 _amount)
        public
        view
        returns (address[] memory assets_, uint256[] memory amounts_)
    {
        if (totalSupply() > 0) {
            uint256 assetLength = assets.length();
            assets_ = new address[](assetLength);
            amounts_ = new uint256[](assetLength);
            for (uint256 i = 0; i < assetLength; i++) {
                address asset = assets.at(i);
                assets_[i] = asset;
                amounts_[i] = (_amount * ERC20(asset).balanceOf(address(this))) / totalSupply();
            }
        }
    }

    function redeem(uint256 _amount) public {
        require(_amount > 0, "Zero amount");
        require(assetsCount() > 0, "No asset");
        (address[] memory assets_, uint256[] memory amounts_) = convertToAssets(_amount);
        _burn(msg.sender, _amount);
        for (uint256 i = 0; i < assets_.length; i++) {
            ERC20(assets_[i]).safeTransfer(msg.sender, amounts_[i]);
        }
        emit Redeemed(msg.sender, _amount);
    }

    function deposit(address _asset, uint256 _amount) public onlyOwner {
        require(totalSupply() > 0, "No supply");
        require(_amount > 0, "Zero amount");
        ERC20(_asset).safeTransferFrom(msg.sender, address(this), _amount);
        assets.add(_asset);
        emit Deposited(_asset, _amount);
    }

    function getAssets() public view returns (address[] memory assets_, uint256[] memory amounts_) {
        uint256 assetLength = assets.length();
        assets_ = new address[](assetLength);
        amounts_ = new uint256[](assetLength);
        for (uint256 i = 0; i < assetLength; i++) {
            address asset = assets.at(i);
            assets_[i] = asset;
            amounts_[i] = ERC20(asset).balanceOf(address(this));
        }
    }

    function getAsset(address _asset) public view returns (uint256) {
        if (!assets.contains(address(_asset))) return 0;
        return ERC20(_asset).balanceOf(address(this));
    }

    function assetsCount() public view returns (uint256) {
        return assets.length();
    }
}
