// SPDX-License-Identifier: MIT
pragma solidity >=0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./FutureToken.sol";
import "./CreditToken.sol";
import "./interfaces/ITokenFactory.sol";

contract TokenFactory is ITokenFactory {
    event CreatedFutureToken(address futureToken);
    event CreatedCreditToken(address creditToken);

    function createFutureToken(
        address _asset,
        string memory _name,
        string memory _symbol,
        uint256 _redeemableAt,
        string memory _description
    ) public returns (address) {
        ERC20 futureToken = new FutureToken(_asset, _name, _symbol, _redeemableAt, _description);
        emit CreatedFutureToken(address(futureToken));
        return address(futureToken);
    }

    function createCreditToken(
        address _asset,
        string memory _name,
        string memory _symbol,
        uint256 _redeemableAt,
        uint256 _totalSupply,
        string memory _description
    ) public returns (address) {
        ERC20 creditToken = new CreditToken(
            _asset,
            _name,
            _symbol,
            _redeemableAt,
            _totalSupply,
            msg.sender,
            _description
        );
        emit CreatedCreditToken(address(creditToken));
        return address(creditToken);
    }
}
