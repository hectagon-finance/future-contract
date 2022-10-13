import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';
import {
  ShareTokenFactory,
  ShareTokenFactory__factory,
  MockERC20,
  MockERC20__factory,
} from '../typechain';

describe('ShareTokenFactory', () => {
  let owner: SignerWithAddress;
  let tokenFactory: ShareTokenFactory;
  let assetToken: MockERC20;

  const tokenName = 'Bot';
  const tokenSymbol = 'BOT';
  const decimals = 9;

  beforeEach(async () => {
    [owner] = await ethers.getSigners();
    tokenFactory = await new ShareTokenFactory__factory(owner).deploy();
    assetToken = await new MockERC20__factory(owner).deploy(tokenName, tokenSymbol, decimals);
  });

  describe('Create Share token', () => {
    it('should deploy new share token correctly', async () => {
      const totalSupply = BigNumber.from('10').pow('18');
      const tx = await tokenFactory.create(assetToken.address, 'fBot', 'fBOT', totalSupply);
      const receipt = await tx.wait();
      const event = receipt?.events?.find((e) => e.event === 'Created');
      const creditAddress: string = event?.args?.shareToken;

      const shareToken = (await ethers.getContractFactory('ShareToken')).attach(creditAddress);
      expect(await shareToken.name()).equal('fBot');
      expect(await shareToken.symbol()).equal('fBOT');
      expect(await shareToken.totalSupply()).equal(totalSupply);
    });
  });
});
