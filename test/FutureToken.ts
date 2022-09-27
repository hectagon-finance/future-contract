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
  let assetToken: MockERC20;

  const futureDecimals = 18;
  const futureAmount = BigNumber.from(10).pow(futureDecimals);

  const assetName = 'Bot';
  const assetSymbol = 'BOT';
  const assetDecimals = 9;
  const assetAmount = BigNumber.from(10).pow(assetDecimals);
  const redeemableAt = BigNumber.from(String(nextYear.unix()));

  beforeEach(async () => {
    [owner, other] = await ethers.getSigners();
    assetToken = await new MockERC20__factory(owner).deploy(assetName, assetSymbol, assetDecimals);
    assetToken.mint(other.address, assetAmount);

    futureToken = await new FutureToken__factory(owner).deploy(
      assetToken.address,
      assetName,
      assetSymbol,
      redeemableAt,
    );
  });

  describe('Deployment', () => {
    it('should deploy correctly', async () => {
      expect(await futureToken.name()).eq(assetName);
      expect(await futureToken.symbol()).eq(assetSymbol);
      expect(await futureToken.decimals()).eq(futureDecimals);
      expect(await futureToken.redeemableAt()).eq(redeemableAt);
      expect(await futureToken.totalAssets()).eq(0);
    });
    it("can't deposit without transfer", async () => {
      await expect(futureToken.connect(other).deposit(assetAmount)).reverted;
    });
  });

  describe('Depositing', () => {
    beforeEach(async () => {
      await assetToken.connect(other).approve(futureToken.address, assetAmount);
      await futureToken.connect(other).deposit(assetAmount);
    });
    it('return balance of asset correctly', async () => {
      expect(await futureToken.totalAssets()).equal(assetAmount);
    });
    it('can deposit after transfer', async () => {
      expect(await assetToken.balanceOf(other.address)).equal(0);
      expect(await futureToken.balanceOf(other.address)).equal(futureAmount);
    });

    it("can't redeem before redeemableAt", async () => {
      await expect(futureToken.connect(other).redeem(assetAmount)).reverted;
    });

    it('can redeem after redeemableAt', async () => {
      await network.provider.send('evm_setNextBlockTimestamp', [nextYear.unix()]);
      await futureToken.connect(other).redeem(futureAmount);
      expect(await assetToken.balanceOf(other.address)).equal(assetAmount);
      expect(await futureToken.balanceOf(other.address)).equal(0);
    });
  });
});
