// SPDX-License-Identifier: MIT
pragma solidity >=0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IFutureToken.sol";

contract FutureToken is IFutureToken, ERC20 {
    using SafeERC20 for ERC20;

    event Deposited(address indexed sender, uint256 amount);
    event Redeemed(address indexed sender, uint256 amount);

    uint256 public tokenType = 1; // type 1: only deposit, 2: mintable, 3: mintable and changeable asset
    address public creator;
    ERC20 public asset;
    uint256 public redeemableAt;

    constructor(
        address _asset,
        string memory _name,
        string memory _symbol,
        uint256 _redeemableAt
    ) ERC20(_name, _symbol) {
        require(_asset != address(0), "Null address asset");
        creator = msg.sender;
        asset = ERC20(_asset);
        redeemableAt = _redeemableAt;
    }

    function decimals() public view virtual override returns (uint8) {
        return asset.decimals();
    }

    function deposit(uint256 _amount) public {
        asset.safeTransferFrom(msg.sender, address(this), _amount);
        _mint(msg.sender, _amount);
        emit Deposited(msg.sender, _amount);
    }

    function redeem(uint256 _amount) public {
        require(block.timestamp >= redeemableAt, "Not redeemable yet");
        _burn(msg.sender, _amount);
        asset.safeTransfer(msg.sender, _amount);
        emit Redeemed(msg.sender, _amount);
    }

    function totalAssets() public view returns (uint256) {
        return asset.balanceOf(address(this));
    }
}
