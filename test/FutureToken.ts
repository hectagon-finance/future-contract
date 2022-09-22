import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { BigNumber } from 'ethers';
import { ethers, network } from 'hardhat';
import { FutureToken, FutureToken__factory, MockERC20, MockERC20__factory } from '../typechain';

dayjs.extend(utc);
describe('FutureToken', () => {
  const nextYear = dayjs.utc().add(1, 'year').startOf('year');

  let owner: SignerWithAddress;
  let other: SignerWithAddress;
  let futureToken: FutureToken;
  let erc20Token: MockERC20;

  const futureDecimal = 18;
  const futureAmount = BigNumber.from(10).pow(futureDecimal);

  const tokenName = 'Bot';
  const tokenSymbol = 'BOT';
  const decimals = 9;
  const assetAmount = BigNumber.from(10).pow(decimals);
  const redeemableAt = BigNumber.from(String(nextYear.unix()));

  beforeEach(async () => {
    [owner, other] = await ethers.getSigners();
    erc20Token = await new MockERC20__factory(owner).deploy(tokenName, tokenSymbol, decimals);
    erc20Token.mint(other.address, assetAmount);

    futureToken = await new FutureToken__factory(owner).deploy(
      erc20Token.address,
      tokenName,
      tokenSymbol,
      redeemableAt,
    );
  });

  describe('Deployment', () => {
    it('should deploy correctly', async () => {
      expect(await futureToken.name()).eq(tokenName);
      expect(await futureToken.symbol()).eq(tokenSymbol);
      expect(await futureToken.decimals()).eq(futureDecimal);
      expect(await futureToken.redeemableAt()).eq(redeemableAt);
      expect(await futureToken.totalAssets()).eq(0);
      expect(await futureToken.tokenType()).eq(1);
    });
    it("can't deposit without transfer", async () => {
      await expect(futureToken.connect(other).deposit(assetAmount)).reverted;
    });
  });

  describe('Depositing', () => {
    beforeEach(async () => {
      await erc20Token.connect(other).approve(futureToken.address, assetAmount);
      await futureToken.connect(other).deposit(assetAmount);
    });
    it('return balance of asset correctly', async () => {
      expect(await futureToken.totalAssets()).equal(assetAmount);
    });
    it('can deposit after transfer', async () => {
      expect(await erc20Token.balanceOf(other.address)).equal(0);
      expect(await futureToken.balanceOf(other.address)).equal(futureAmount);
    });

    it("can't redeem before redeemableAt", async () => {
      await expect(futureToken.connect(other).redeem(assetAmount)).reverted;
    });

    it('can redeem after redeemableAt', async () => {
      await network.provider.send('evm_setNextBlockTimestamp', [nextYear.unix()]);
      await futureToken.connect(other).redeem(futureAmount);
      expect(await erc20Token.balanceOf(other.address)).equal(assetAmount);
      expect(await futureToken.balanceOf(other.address)).equal(0);
    });
  });
});
