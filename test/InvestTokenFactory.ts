import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';
import {
  ShareTokenFactory,
  ShareTokenFactory__factory,
  MockERC20,
  MockERC20__factory,
} from '../typechain';

dayjs.extend(utc);
describe('ShareTokenFactory', () => {
  const nextYear = dayjs.utc().add(1, 'year').startOf('year');

  let owner: SignerWithAddress;
  let tokenFactory: ShareTokenFactory;
  let assetToken: MockERC20;

  const tokenName = 'Bot';
  const tokenSymbol = 'BOT';
  const decimals = 9;
  const redeemableAt = BigNumber.from(nextYear.unix().toString());

  beforeEach(async () => {
    [owner] = await ethers.getSigners();
    tokenFactory = await new ShareTokenFactory__factory(owner).deploy();
    assetToken = await new MockERC20__factory(owner).deploy(tokenName, tokenSymbol, decimals);
  });

  describe('Create Share token', () => {
    it('should deploy new share token correctly', async () => {
      const totalSupply = BigNumber.from('10').pow('18');
      const tx = await tokenFactory.create(
        assetToken.address,
        'fBot',
        'fBOT',
        redeemableAt,
        totalSupply,
      );
      const receipt = await tx.wait();
      const event = receipt?.events?.find((e) => e.event === 'Created');
      const creditAddress: string = event?.args?.shareToken;

      const shareToken = (await ethers.getContractFactory('ShareToken')).attach(creditAddress);
      expect(await shareToken.name()).equal('fBot');
      expect(await shareToken.symbol()).equal('fBOT');
      expect(await shareToken.redeemableAt()).equal(redeemableAt);
      expect(await shareToken.totalSupply()).equal(totalSupply);
    });
  });
});
