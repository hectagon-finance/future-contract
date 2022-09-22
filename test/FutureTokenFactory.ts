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

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
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
      const tx = await futureTokenFactory.create(
        '0x0000000000000000000000000000000000000001',
        'fBot',
        'fBOT',
        redeemableAt,
      );
      const receipt = await tx.wait();
      const event = receipt?.events?.find((e) => e.event === 'Created');
      const futureAddress: string = event?.args?.futureToken;

      const futureToken = (await ethers.getContractFactory('FutureToken')).attach(futureAddress);
      expect(await futureToken.asset()).equal('0x0000000000000000000000000000000000000001');
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
      expect(await futureToken.asset()).equal(erc20Token.address);
      expect(await futureToken.owner()).eq(owner.address);
      expect(await futureToken.name()).equal('fBot');
      expect(await futureToken.symbol()).equal('fBOT');
      expect(await futureToken.redeemableAt()).equal(redeemableAt);
      expect(await futureToken.tokenType()).equal(2);
      expect(await futureToken.mintable()).equal(true);
    });
  });

  describe('Create Future token changeable', () => {
    it('should deploy new future token correctly', async () => {
      const tx = await futureTokenFactory.createChangeable('fBot', 'fBOT', redeemableAt);
      const receipt = await tx.wait();
      const event = receipt?.events?.find((e) => e.event === 'Created');
      const futureAddress: string = event?.args?.futureToken;

      const futureToken = (await ethers.getContractFactory('FutureTokenChangeable')).attach(
        futureAddress,
      );
      expect(await futureToken.asset()).equal(NULL_ADDRESS);
      expect(await futureToken.owner()).eq(owner.address);
      expect(await futureToken.name()).equal('fBot');
      expect(await futureToken.symbol()).equal('fBOT');
      expect(await futureToken.redeemableAt()).equal(redeemableAt);
      expect(await futureToken.tokenType()).equal(3);
      expect(await futureToken.mintable()).equal(true);
      expect(await futureToken.changeable()).equal(true);
    });
  });
});
