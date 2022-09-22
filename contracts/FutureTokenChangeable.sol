// SPDX-License-Identifier: MIT
pragma solidity >=0.8.10;

import "./FutureTokenMintable.sol";

error CHANGEABLE();
error UNCHANGEABLE();

contract FutureTokenChangeable is FutureTokenMintable {
    event SetAsset(address asset);
    bool public changeable = true;

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _redeemableAt,
        address _owner
    ) FutureTokenMintable(address(0), _name, _symbol, _redeemableAt, _owner) {
        tokenType = 3;
    }

    function _isChangeable() internal view {
        if (!changeable) revert UNCHANGEABLE();
    }

    modifier isChangeable() {
        _isChangeable();
        _;
    }

    function _notChangeable() internal view {
        if (changeable) revert CHANGEABLE();
    }

    modifier notChangeable() {
        _notChangeable();
        _;
    }

    function disableChanging() public onlyOwner isChangeable hasAsset {
        changeable = false;
        tokenType = 2;
    }

    function changeAsset(address _asset) public onlyOwner isChangeable {
        asset = ERC20(_asset);
        emit SetAsset(_asset);
    }

    function disableMinting() public override notChangeable {
        super.disableMinting();
    }
}
