import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';
import { TokenFactory, TokenFactory__factory, MockERC20, MockERC20__factory } from '../typechain';

dayjs.extend(utc);
describe('TokenFactory', () => {
  const nextYear = dayjs.utc().add(1, 'year').startOf('year');

  let owner: SignerWithAddress;
  let tokenFactory: TokenFactory;
  let assetToken: MockERC20;

  const tokenName = 'Bot';
  const tokenSymbol = 'BOT';
  const decimals = 9;
  const redeemableAt = BigNumber.from(nextYear.unix().toString());

  beforeEach(async () => {
    [owner] = await ethers.getSigners();
    tokenFactory = await new TokenFactory__factory(owner).deploy();
    assetToken = await new MockERC20__factory(owner).deploy(tokenName, tokenSymbol, decimals);
  });

  describe('Create Future token', () => {
    it('should deploy new future token correctly', async () => {
      const tx = await tokenFactory.createFutureToken(
        assetToken.address,
        'fBot',
        'fBOT',
        redeemableAt,
        'fBOT desc'
      );
      const receipt = await tx.wait();
      const event = receipt?.events?.find((e) => e.event === 'CreatedFutureToken');
      const futureAddress: string = event?.args?.futureToken;

      const futureToken = (await ethers.getContractFactory('FutureToken')).attach(futureAddress);
      expect(await futureToken.name()).equal('fBot');
      expect(await futureToken.symbol()).equal('fBOT');
      expect(await futureToken.description()).equal('fBOT desc');
      expect(await futureToken.redeemableAt()).equal(redeemableAt);
    });
  });

  describe('Create Credit token', () => {
    it('should deploy new future token correctly', async () => {
      const totalSupply = BigNumber.from('10').pow('18');
      const tx = await tokenFactory.createCreditToken(
        assetToken.address,
        'fBot',
        'fBOT',
        redeemableAt,
        totalSupply,
        'fBOT desc'
      );
      const receipt = await tx.wait();
      const event = receipt?.events?.find((e) => e.event === 'CreatedCreditToken');
      const creditAddress: string = event?.args?.creditToken;

      const creditToken = (await ethers.getContractFactory('CreditToken')).attach(creditAddress);
      expect(await creditToken.owner()).eq(owner.address);
      expect(await creditToken.name()).equal('fBot');
      expect(await creditToken.symbol()).equal('fBOT');
      expect(await creditToken.redeemableAt()).equal(redeemableAt);
      expect(await creditToken.totalSupply()).equal(totalSupply);
      expect(await creditToken.description()).equal('fBOT desc');
    });
  });
});
