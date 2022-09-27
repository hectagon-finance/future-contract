import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { BigNumber } from 'ethers';
import { ethers, network } from 'hardhat';
import { CreditToken, CreditToken__factory, MockERC20, MockERC20__factory } from '../typechain';

dayjs.extend(utc);
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
describe('CreditToken', () => {
  const nextYear = dayjs.utc().add(1, 'year').startOf('year');

  let owner: SignerWithAddress;
  let other: SignerWithAddress;
  let creditToken: CreditToken;
  let assetToken: MockERC20;

  const creditDecimals = 18;
  const creditAmount = BigNumber.from(10).pow(creditDecimals);

  const assetName = 'Bot';
  const assetSymbol = 'BOT';
  const assetDecimals = 9;
  const assetAmount = BigNumber.from(10).pow(assetDecimals);
  const redeemableAt = BigNumber.from(String(nextYear.unix()));

  beforeEach(async () => {
    [owner, other] = await ethers.getSigners();
    assetToken = await new MockERC20__factory(owner).deploy(assetName, assetSymbol, assetDecimals);
    assetToken.mint(owner.address, assetAmount);

    creditToken = await new CreditToken__factory(owner).deploy(
      NULL_ADDRESS,
      assetName,
      assetSymbol,
      redeemableAt,
      creditAmount,
      owner.address,
    );
  });

  describe('Deployment', () => {
    it('should deploy correctly', async () => {
      expect(await creditToken.owner()).eq(owner.address);
      expect(await creditToken.name()).eq(assetName);
      expect(await creditToken.symbol()).eq(assetSymbol);
      expect(await creditToken.decimals()).eq(creditDecimals);
      expect(await creditToken.redeemableAt()).eq(redeemableAt);
      expect(await creditToken.totalSupply()).eq(creditAmount);
      expect(await creditToken.totalAssets()).eq(0);
      expect(await creditToken.totalDebts()).eq(creditAmount);
    });
  });

  describe('Set asset', () => {
    it('only owner can set asset', async () => {
      await expect(creditToken.connect(other).setAsset(assetToken.address)).reverted;
    });

    it("can't disable changing if not have asset", async () => {
      await expect(creditToken.connect(owner).disableChanging()).reverted;
    });

    it("can't change asset or disable again after disabled changing", async () => {
      await creditToken.connect(owner).setAsset(assetToken.address);
      await creditToken.connect(owner).disableChanging();
      await expect(creditToken.connect(owner).setAsset(assetToken.address)).reverted;
      await expect(creditToken.connect(owner).disableChanging()).reverted;
    });

    it('return totalDebts and totalAssets correctly', async () => {
      await creditToken.connect(owner).setAsset(assetToken.address);
      expect(await creditToken.totalDebts()).eq(assetAmount);
      await assetToken.transfer(creditToken.address, assetAmount);
      expect(await creditToken.totalDebts()).eq(0);
      expect(await creditToken.totalAssets()).eq(assetAmount);
    });

    it("can't redeem before redeemableAt", async () => {
      await creditToken.connect(owner).transfer(other.address, creditAmount);
      await creditToken.connect(owner).setAsset(assetToken.address);
      await assetToken.transfer(creditToken.address, assetAmount);
      await expect(creditToken.connect(other).redeem(assetAmount)).reverted;
    });

    it('can redeem after redeemableAt', async () => {
      await network.provider.send('evm_setNextBlockTimestamp', [nextYear.unix()]);
      await creditToken.connect(owner).transfer(other.address, creditAmount);
      await creditToken.connect(owner).setAsset(assetToken.address);
      await assetToken.transfer(creditToken.address, assetAmount);
      await creditToken.connect(other).redeem(creditAmount);
      expect(await assetToken.balanceOf(other.address)).equals(assetAmount);
    });
  });
});
