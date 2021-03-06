import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers, network } from 'hardhat';
const { utils, provider } = ethers;

describe('GuessTheNumberChallenge', () => {
  let target: Contract;

  before(async () => {
    const targetFactory = await ethers.getContractFactory('GuessTheNumberChallenge');
    target = await targetFactory.deploy({
      value: utils.parseEther('1'),
    });
    await target.deployed();

    console.log('Target deployed to:', target.address);
  });

  it('Exploit', async () => {
    const tx = await target.guess(42, {
      value: utils.parseEther('1'),
    });
    await tx.wait();
  });

  after(async () => {
    expect(await provider.getBalance(target.address)).to.equal(0);
  });
});
