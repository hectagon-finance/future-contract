# Future Token

k2@hectagon.finance

9 July 2022

Abstract

Vesting is a common practice in Crypto investment but it is an inefficient way of using capital. This paper advocates the implementation of a future token (ERC20) representing the right to redeem the original token at a future date, and discusses some of its use-cases.

# Motivation

Crypto projects require capital to bootstrap. Typically, dev teams promise investors a vesting schedule to redeem their investing power with a portion of project tokens. As the industry grows, billions of dollars' worth is unrealized in the form of teams' promises because of investors' inaccessibility to capital when the vesting schedule is undue.

This vesting schedule create a number of critical problems:

- The dev team's holding all the cards: they take money but their obligations are not on-chain thus not crypto-grade-trusted.

- It goes against the tokenization spirit when investment power has been spent but there is no token representing that activity.

# Summary

This is a proposal to mint a token which represents the power to unlock an original token on a predetermined date in the future.

For example: On 12 April 2022, an owner with the possession of 100 token X, can use a factory contract to create a contract naming fX-12042025 then mint a 100 token fX-12042025 which can be burnt to redeem 100 token X at 12 April 2025.

# Implement

To implement this idea, there are 2 contract to build:

- The Factory contract

- The Future Token contract

The factory contract is an utility to build future token contracts, which hold the precursor to the original token contracts and specify the exact future date (at 0:0:0 UTC) that this future token can be burned to redeem the original token.

```solidity
contract FutureToken {
  event Mint(address indexed sender, uint256 amount);
  event Redeem(address indexed sender, uint256 amount);

  ERC20 public asset;
  uint256 public redeemableAt;

  function deposit(uint256 _amount) public;

  function redeem(uint256 _amount) public;

  function totalAssets() public view returns (uint256);
}

contract FutureTokenMinable is FutureToken {
  event Minted(address indexed sender, uint256 amount);

  function mint(uint256 _amount) public;

  function disableMinting() public;

  function totalDebts() public view returns (uint256);
}

contract FutureTokenChangeable is FutureTokenMinable {
  event ChangedAsset(address indexed from, address indexed to);

  function disableChanging() public;

  function changeAsset() public;
}

```

The Future Token contract is an ERC20 token and anyone can easily create a Liquidity Pool on any Exchange to trade this token.

# Discussion

The adaptation of future token will affect crypto industry in few ways:

## Investment activity

With the help of future tokens, tracing early investment in crypto would be easier since every token spent by investors will be rewarded with future tokens. This helps push more transparency and liquidity to the industry.

The difference between Market Cap and Fully Diluted Market Cap will be smaller, meaning tokenomics which allow lavish promise will have a harder time.

## New market

Future tokens provide the opportunity to trade against the future value of a token and represent the right to buy a token at a future date. Billions of dollars locked in the form of vesting tokens and billions of dollars in the future investment market now can participate in trading.

In conclusion, the future token is another form of extracting unrealized value from assets that many crypto had done before. We are expecting the adoption will help expand the Crypto market many more times.
