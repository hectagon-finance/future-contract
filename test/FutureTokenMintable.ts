import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';
import {
  FutureTokenMintable,
  FutureTokenMintable__factory,
  MockERC20,
  MockERC20__factory,
} from '../typechain';

dayjs.extend(utc);
describe('FutureTokenMintable', () => {
  const nextYear = dayjs.utc().add(1, 'year').startOf('year');

  let owner: SignerWithAddress;
  let other: SignerWithAddress;
  let futureToken: FutureTokenMintable;
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

    futureToken = await new FutureTokenMintable__factory(owner).deploy(
      erc20Token.address,
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
      expect(await futureToken.decimals()).eq(futureDecimal);
      expect(await futureToken.redeemableAt()).eq(redeemableAt);
      expect(await futureToken.mintable()).eq(true);
      expect(await futureToken.tokenType()).eq(2);
    });
  });

  describe('Minting', () => {
    it('only owner can mint', async () => {
      await expect(futureToken.connect(other).mint(assetAmount)).reverted;
    });
    it('only owner can disable mintable', async () => {
      await expect(futureToken.connect(other).disableMinting()).reverted;
    });
    it("can't disable mintable if has debts", async () => {
      await futureToken.mint(assetAmount);
      await expect(futureToken.connect(owner).disableMinting()).reverted;
    });
    it('change type to 1 after disable minting', async () => {
      await futureToken.connect(owner).disableMinting();
      expect(await futureToken.tokenType()).equal(1);
    });
    it("can't mint after disable mintable", async () => {
      await futureToken.connect(owner).disableMinting();
      await expect(futureToken.connect(other).mint(assetAmount)).reverted;
    });
    it("can't deposit without transfer", async () => {
      await expect(futureToken.connect(other).deposit(assetAmount)).reverted;
    });
    it('owner can mint', async () => {
      await futureToken.mint(futureAmount);
      expect(await futureToken.balanceOf(owner.address)).equal(futureAmount);
      expect(await futureToken.totalDebts()).equal(assetAmount);
    });
  });
});
