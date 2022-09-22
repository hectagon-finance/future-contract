import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { BigNumber } from 'ethers';
import { ethers, network } from 'hardhat';
import {
  FutureTokenChangeable,
  FutureTokenChangeable__factory,
  MockERC20,
  MockERC20__factory,
} from '../typechain';

dayjs.extend(utc);
describe('FutureTokenChangeable', () => {
  const nextYear = dayjs.utc().add(1, 'year').startOf('year');

  let owner: SignerWithAddress;
  let other: SignerWithAddress;
  let futureToken: FutureTokenChangeable;
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
    erc20Token.mint(owner.address, assetAmount);

    futureToken = await new FutureTokenChangeable__factory(owner).deploy(
      tokenName,
      tokenSymbol,
      redeemableAt,
      owner.address,
    );
  });

  describe('Deployment', () => {
    it('should deploy correctly', async () => {
      expect(await futureToken.owner()).eq(owner.address);
      expect(await futureToken.name()).eq(tokenName);
      expect(await futureToken.symbol()).eq(tokenSymbol);
      expect(await futureToken.decimals()).eq(18);
      expect(await futureToken.redeemableAt()).eq(redeemableAt);
      expect(await futureToken.mintable()).eq(true);
      expect(await futureToken.tokenType()).eq(3);
    });
  });

  describe('Minting and Changing', () => {
    it('only owner can mint', async () => {
      await expect(futureToken.connect(other).mint(assetAmount)).reverted;
    });
    it('only owner can disable changeable', async () => {
      await expect(futureToken.connect(other).changeAsset(erc20Token.address)).reverted;
    });
    it('only owner can disable changeable', async () => {
      await expect(futureToken.connect(other).disableChanging()).reverted;
    });
    it("can't disable changeable if asset is null", async () => {
      await expect(futureToken.connect(owner).disableChanging()).reverted;
    });
    it('owner can disable changeable if has asset', async () => {
      await futureToken.connect(owner).changeAsset(erc20Token.address);
      await futureToken.connect(owner).disableChanging();
      expect(await futureToken.changeable()).equal(false);
      expect(await futureToken.tokenType()).equal(2);
    });
    it("can't disable mintable if still changeable", async () => {
      await futureToken.connect(owner).changeAsset(erc20Token.address);
      await expect(futureToken.connect(owner).disableMinting()).reverted;
    });
    it('can disable mintable if not changeable', async () => {
      await futureToken.connect(owner).changeAsset(erc20Token.address);
      await futureToken.connect(owner).disableChanging();
      await futureToken.connect(owner).disableMinting();
      expect(await futureToken.mintable()).equal(false);
      expect(await futureToken.tokenType()).equal(1);
    });
    it('deposit correct amount', async () => {
      const futureAmount = BigNumber.from(String(10 ** futureDecimal));
      const erc20Amount = BigNumber.from(String(10 ** decimals));
      await erc20Token.connect(owner).approve(futureToken.address, assetAmount);
      await futureToken.connect(owner).changeAsset(erc20Token.address);
      await futureToken.connect(owner).deposit(erc20Amount);
      expect(await futureToken.balanceOf(owner.address)).equal(futureAmount);
    });
    it('return correct debt', async () => {
      await futureToken.connect(owner).mint(futureAmount);
      expect(await futureToken.totalDebts()).equal(futureAmount);
      await futureToken.connect(owner).changeAsset(erc20Token.address);
      expect(await futureToken.totalDebts()).equal(assetAmount);
    });
  });

  describe('Redeeming', () => {
    it('redeem correct amount', async () => {
      await futureToken.mint(futureAmount);
      await futureToken.transfer(other.address, futureAmount);
      await futureToken.changeAsset(erc20Token.address);
      await erc20Token.transfer(futureToken.address, assetAmount);
      await network.provider.send('evm_setNextBlockTimestamp', [nextYear.unix()]);
      await futureToken.connect(other).redeem(futureAmount);
      expect(await erc20Token.balanceOf(other.address)).equal(assetAmount);
    });
  });
});
