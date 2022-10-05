import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { ethers, network } from 'hardhat';
import { ShareToken, ShareToken__factory, MockERC20, MockERC20__factory } from '../typechain';

describe('ShareToken', () => {
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

  beforeEach(async () => {
    [owner, other] = await ethers.getSigners();
    assetToken = await new MockERC20__factory(owner).deploy(assetName, assetSymbol, assetDecimals);
    assetToken.mint(owner.address, assetAmount);

    shareToken = await new ShareToken__factory(owner).deploy(
      assetToken.address,
      assetName,
      assetSymbol,
      shareAmount,
      owner.address,
    );
  });

  describe('Deployment', () => {
    it('should deploy correctly', async () => {
      expect(await shareToken.name()).eq(assetName);
      expect(await shareToken.symbol()).eq(assetSymbol);
      expect(await shareToken.decimals()).eq(shareDecimals);
      expect(await shareToken.totalSupply()).eq(shareAmount);
      expect(await shareToken.totalAssets()).eq(0);
    });
  });

  describe('Redeem', () => {
    it('can not redeem without asset', async () => {
      await expect(shareToken.connect(owner).redeem(shareAmount)).revertedWithCustomError(
        shareToken,
        'NO_ASSET',
      );
    });
    it('can redeem correctly', async () => {
      await shareToken.transfer(other.address, shareAmount);
      await assetToken.transfer(shareToken.address, assetAmount);
      await shareToken.connect(other).redeem(shareAmount);
      expect(await assetToken.balanceOf(other.address)).eq(assetAmount);
      expect(await shareToken.totalSupply()).eq(0);
      expect(await shareToken.totalAssets()).eq(0);
    });
  });
});
