import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers, network } from 'hardhat';
const { utils, provider } = ethers;

describe('', () => {
  let target: Contract;
  let attacker: Contract;

  before(async () => {
    await network.provider.request({
      method: 'hardhat_reset',
      params: [],
    });

    const [targetFactory, attackerFactory] = await Promise.all([
      ethers.getContractFactory('GuessTheNewNumberChallenge'),
      ethers.getContractFactory('GuessTheNewNumberChallengeAttacker'),
    ]);
    target = await targetFactory.deploy({
      value: utils.parseEther('1'),
    });
    await target.deployed();

    console.log('deployed on', target.address);

    attacker = await attackerFactory.deploy(target.address);

    await attacker.deployed();

    console.log('attacker deployed on', attacker.address);
  });

  it('exploit', async () => {
    const tx = await attacker.attack({
      value: utils.parseEther('1'),
    });
    await tx.wait();
  });

  after(async () => {
    expect(await provider.getBalance(target.address)).to.equal(0);
  });
});
