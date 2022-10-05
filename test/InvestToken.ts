import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { BigNumber } from 'ethers';
import { ethers, network } from 'hardhat';
import { ShareToken, ShareToken__factory, MockERC20, MockERC20__factory } from '../typechain';

dayjs.extend(utc);
describe('ShareToken', () => {
  const nextYear = dayjs.utc().add(1, 'year').startOf('year');

  let owner: SignerWithAddress;
  let other: SignerWithAddress;
  let shareToken: ShareToken;
  let assetToken: MockERC20;

  const shareDecimals = 18;
  const shareAmount = BigNumber.from(10).pow(shareDecimals).mul(10);

  const assetName = 'Bot';
  const assetSymbol = 'BOT';
  const assetDecimals = 9;
  const assetAmount = BigNumber.from(10).pow(assetDecimals);
  const redeemableAt = BigNumber.from(String(nextYear.unix()));

  beforeEach(async () => {
    [owner, other] = await ethers.getSigners();
    assetToken = await new MockERC20__factory(owner).deploy(assetName, assetSymbol, assetDecimals);
    assetToken.mint(owner.address, assetAmount);

    shareToken = await new ShareToken__factory(owner).deploy(
      assetToken.address,
      assetName,
      assetSymbol,
      redeemableAt,
      shareAmount,
      owner.address,
    );
  });

  describe('Deployment', () => {
    it('should deploy correctly', async () => {
      expect(await shareToken.name()).eq(assetName);
      expect(await shareToken.symbol()).eq(assetSymbol);
      expect(await shareToken.decimals()).eq(shareDecimals);
      expect(await shareToken.redeemableAt()).eq(redeemableAt);
      expect(await shareToken.totalSupply()).eq(shareAmount);
      expect(await shareToken.totalAssets()).eq(0);
    });
  });

  describe('Deposit and Mint', () => {
    it('can not deposit', async () => {
      await expect(
        shareToken.connect(owner).deposit(assetAmount, other.address),
      ).revertedWithCustomError(shareToken, 'DEPOSIT_DISABLED');
    });
    it('can not mint', async () => {
      await expect(
        shareToken.connect(owner).mint(assetAmount, other.address),
      ).revertedWithCustomError(shareToken, 'MINT_DISABLED');
    });
  });

  describe('Redeem', () => {
    it('can not redeem before redeemableAt', async () => {
      await expect(
        shareToken.connect(owner).redeem(shareAmount, owner.address, owner.address),
      ).revertedWithCustomError(shareToken, 'NOT_REDEEMABLE');
    });
    it('can not redeem without asset', async () => {
      await network.provider.send('evm_setNextBlockTimestamp', [nextYear.unix()]);
      await expect(
        shareToken.connect(owner).redeem(shareAmount, owner.address, owner.address),
      ).revertedWithCustomError(shareToken, 'NO_ASSET');
    });
    it('can redeem and withdraw correctly', async () => {
      await shareToken.transfer(other.address, shareAmount);
      await assetToken.transfer(shareToken.address, assetAmount);
      await shareToken.connect(other).redeem(shareAmount.div(2), other.address, other.address);
      expect(await assetToken.balanceOf(other.address)).eq(assetAmount.div(2));
      await shareToken.connect(other).withdraw(assetAmount.div(2), other.address, other.address);
      expect(await assetToken.balanceOf(other.address)).eq(assetAmount);
    });
  });
});
