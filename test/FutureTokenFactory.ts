import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';
import {
  FutureTokenFactory,
  FutureTokenFactory__factory,
  MockERC20,
  MockERC20__factory,
} from '../typechain';

dayjs.extend(utc);
describe('FutureTokenFactory', () => {
  const nextYear = dayjs.utc().add(1, 'year').startOf('year');

  let owner: SignerWithAddress;
  let futureTokenFactory: FutureTokenFactory;
  let erc20Token: MockERC20;

  const tokenName = 'Bot';
  const tokenSymbol = 'BOT';
  const decimals = 9;
  const redeemableAt = BigNumber.from(nextYear.unix().toString());

  beforeEach(async () => {
    [owner] = await ethers.getSigners();
    futureTokenFactory = await new FutureTokenFactory__factory(owner).deploy();
    erc20Token = await new MockERC20__factory(owner).deploy(tokenName, tokenSymbol, decimals);
  });

  describe('Create Future token', () => {
    it('should deploy new future token correctly', async () => {
      const tx = await futureTokenFactory.create(erc20Token.address, 'fBot', 'fBOT', redeemableAt);
      const receipt = await tx.wait();
      const event = receipt?.events?.find((e) => e.event === 'Created');
      const futureAddress: string = event?.args?.futureToken;

      const futureToken = (await ethers.getContractFactory('FutureToken')).attach(futureAddress);
      expect(await futureToken.creator()).eq(futureTokenFactory.address);
      expect(await futureToken.name()).equal('fBot');
      expect(await futureToken.symbol()).equal('fBOT');
      expect(await futureToken.redeemableAt()).equal(redeemableAt);
      expect(await futureToken.tokenType()).equal(1);
    });
  });

  describe('Create Future token mintable', () => {
    it('should deploy new future token correctly', async () => {
      const tx = await futureTokenFactory.createMintable(
        erc20Token.address,
        'fBot',
        'fBOT',
        redeemableAt,
      );
      const receipt = await tx.wait();
      const event = receipt?.events?.find((e) => e.event === 'Created');
      const futureAddress: string = event?.args?.futureToken;

      const futureToken = (await ethers.getContractFactory('FutureTokenMintable')).attach(
        futureAddress,
      );
      expect(await futureToken.creator()).eq(futureTokenFactory.address);
      expect(await futureToken.owner()).eq(owner.address);
      expect(await futureToken.name()).equal('fBot');
      expect(await futureToken.symbol()).equal('fBOT');
      expect(await futureToken.redeemableAt()).equal(redeemableAt);
      expect(await futureToken.tokenType()).equal(2);
      expect(await futureToken.mintable()).equal(true);
    });
  });
});
