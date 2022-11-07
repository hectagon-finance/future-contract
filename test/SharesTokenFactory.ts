import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';
import {
  SharesTokenFactory,
  SharesTokenFactory__factory,
  MockERC20,
  MockERC20__factory,
} from '../typechain';

describe('SharesTokenFactory', () => {
  let owner: SignerWithAddress;
  let tokenFactory: SharesTokenFactory;

  beforeEach(async () => {
    [owner] = await ethers.getSigners();
    tokenFactory = await new SharesTokenFactory__factory(owner).deploy();
  });

  describe('Create Shares token', () => {
    it('should deploy new shares token correctly', async () => {
      const totalSupply = BigNumber.from('10').pow('18');
      const tx = await tokenFactory.create('share', 'SHARE', totalSupply);
      const receipt = await tx.wait();
      const event = receipt?.events?.find((e) => e.event === 'Created');
      const sharesAddress: string = event?.args?.sharesToken;

      const sharesToken = (await ethers.getContractFactory('SharesToken')).attach(sharesAddress);
      expect(await sharesToken.name()).equal('share');
      expect(await sharesToken.symbol()).equal('SHARE');
      expect(await sharesToken.totalSupply()).equal(totalSupply);
    });
  });
});
