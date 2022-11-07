import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { ethers, network } from 'hardhat';
import { SharesToken, SharesToken__factory, MockERC20, MockERC20__factory } from '../typechain';

describe('SharesToken', () => {
  let owner: SignerWithAddress;
  let other: SignerWithAddress;
  let sharesToken: SharesToken;
  let assetToken1: MockERC20;
  let assetToken2: MockERC20;

  beforeEach(async () => {
    [owner, other] = await ethers.getSigners();
    assetToken1 = await new MockERC20__factory(owner).deploy('A1', 'A1', 18);
    assetToken1.mint(owner.address, BigNumber.from(10).pow(18));
    assetToken2 = await new MockERC20__factory(owner).deploy('A1', 'A1', 9);
    assetToken2.mint(owner.address, BigNumber.from(10).pow(9));

    sharesToken = await new SharesToken__factory(owner).deploy(
      'Share',
      'SHARE',
      BigNumber.from(10).pow(18),
      owner.address,
    );
  });

  describe('Deployment', () => {
    it('should deploy correctly', async () => {
      expect(await sharesToken.name()).eq('Share');
      expect(await sharesToken.symbol()).eq('SHARE');
      expect(await sharesToken.decimals()).eq(18);
      expect(await sharesToken.totalSupply()).eq(BigNumber.from(10).pow(18));
      expect(await sharesToken.assetsCount()).eq(0);
    });
  });

  describe('Redeem', () => {
    it('can not deposit zero', async () => {
      await expect(sharesToken.deposit(assetToken1.address, 0)).revertedWith('Zero amount');
    });
    it('can not deposit if is not owner', async () => {
      await expect(sharesToken.connect(other).deposit(assetToken1.address, 1)).revertedWith(
        'Ownable: caller is not the owner',
      );
    });
    it('owner can deposit successfully', async () => {
      await assetToken1.approve(sharesToken.address, BigNumber.from(10).pow(10));
      await sharesToken.deposit(assetToken1.address, 1);
      expect(await sharesToken.assetsCount()).equals(1);
      const assets = await sharesToken.getAssets();
      expect(assets.assets_[0]).equals(assetToken1.address);
      expect(assets.amounts_[0]).equals(BigNumber.from(1));
    });
    it('can not deposit without supply', async () => {
      await assetToken1.approve(sharesToken.address, BigNumber.from(10).pow(10));
      await sharesToken.deposit(assetToken1.address, 1);
      await sharesToken.redeem(BigNumber.from(10).pow(18));
      await expect(sharesToken.deposit(assetToken1.address, 1)).revertedWith('No supply');
    });
    it('can not redeem without asset', async () => {
      await expect(sharesToken.redeem(BigNumber.from(10).pow(18))).revertedWith('No asset');
    });

    it('can redeem correctly', async () => {
      await assetToken1.approve(sharesToken.address, BigNumber.from(10).pow(18));
      await assetToken2.approve(sharesToken.address, BigNumber.from(10).pow(9));
      await sharesToken.deposit(assetToken1.address, BigNumber.from(10).pow(18));
      await sharesToken.deposit(assetToken2.address, BigNumber.from(10).pow(9));
      await sharesToken.transfer(other.address, BigNumber.from(10).pow(18));
      await sharesToken.connect(other).redeem(BigNumber.from(10).pow(18));
      expect(await sharesToken.totalSupply()).equals(0);
      expect(await assetToken1.balanceOf(other.address)).equals(BigNumber.from(10).pow(18));
      expect(await assetToken2.balanceOf(other.address)).equals(BigNumber.from(10).pow(9));
    });

    describe('view functions', () => {
      const depositAmount = BigNumber.from('1000');
      beforeEach(async () => {
        await assetToken1.connect(owner).approve(sharesToken.address, BigNumber.from('10000000'));
        await sharesToken.deposit(assetToken1.address, depositAmount);
      });

      it('getAssets', async () => {
        const assets = await sharesToken.getAssets();
        expect(assets.assets_[0]).to.eq(assetToken1.address);
        expect(assets.amounts_[0]).to.eq(depositAmount);
      });

      it('getAsset', async () => {
        const amount = await sharesToken.getAsset(assetToken1.address);
        expect(amount).to.eq(depositAmount);
      });

      it('assetsCount', async () => {
        const assetsCount = await sharesToken.assetsCount();
        expect(assetsCount).to.eq(1);
      });
    });
  });
});
