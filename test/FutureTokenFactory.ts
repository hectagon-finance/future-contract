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
  const next2Year = dayjs.utc().add(2, 'year').startOf('year');

  let owner: SignerWithAddress;
  let futureTokenFactory: FutureTokenFactory;
  let erc20Token: MockERC20;

  const tokenName = 'Bot';
  const tokenSymbol = 'BOT';
  const decimals = 9;
  const redeemableAt = BigNumber.from(next2Year.unix().toString());

  beforeEach(async () => {
    [owner] = await ethers.getSigners();
    futureTokenFactory = await new FutureTokenFactory__factory(owner).deploy();
    erc20Token = await new MockERC20__factory(owner).deploy(tokenName, tokenSymbol, decimals);
  });

  describe('Create Future token', () => {
    it('should deploy new future token correctly', async () => {
      const tx = await futureTokenFactory.create(erc20Token.address, redeemableAt);
      const receipt = await tx.wait();
      const event = receipt?.events?.find((e) => e.event === 'Created');
      const futureAddress: string = event?.args?.futureToken;
      expect(await futureTokenFactory.get(erc20Token.address, redeemableAt)).equal(futureAddress);

      const futureToken = (await ethers.getContractFactory('FutureToken')).attach(futureAddress);
      expect(await futureToken.creator()).eq(futureTokenFactory.address);
      expect(await futureToken.name()).equal(`Future ${tokenName} ${next2Year.format('YYYYMMDD')}`);
      expect(await futureToken.symbol()).equal(`f${tokenSymbol}${next2Year.format('YYYYMMDD')}`);
      expect(await futureToken.redeemableAt()).equal(redeemableAt);
    });
  });
});
