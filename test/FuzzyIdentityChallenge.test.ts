import { expect } from 'chai';
import { Contract, Wallet } from 'ethers';
import { ethers } from 'hardhat';
import crypto from 'crypto';

const { utils, provider, BigNumber } = ethers;

function getWallet() {
  let wallet: Wallet;
  let contractAddress;
  let counter = 0;
  let privateKey;
  while (1) {
    privateKey = `0x${crypto.randomBytes(32).toString('hex')}`;

    wallet = new ethers.Wallet(privateKey);

    contractAddress = utils.getContractAddress({
      from: wallet.address,
      nonce: BigNumber.from('0'), // First deployed contract with this address
    });

    if (contractAddress.toLowerCase().includes('badc0de')) {
      console.log('found', privateKey);
      return wallet;
    }

    counter++;
    if (counter % 1000 === 0) {
      console.log(`checked ${counter} addresses`);
    }
  }
}

describe('FuzzyIdentityChallenge', () => {
  let target: Contract;
  let wallet: Wallet;

  before(async () => {
    const targetFactory = await ethers.getContractFactory('FuzzyIdentityChallenge');
    target = await targetFactory.deploy();
    await target.deployed();

    console.log('Target deployed to:', target.address);

    // const wallet = getWallet();
    wallet = new Wallet(
      '0xa186be056b9b4eedcdb2fd471ca942e85a5acd7baca4738f145f6a520fc4b10f',
      provider
    );
  });

  it('Exploit', async () => {
    const [owner] = await ethers.getSigners();

    let tx;

    console.log('1 - Sending ether to wallet');

    tx = await owner.sendTransaction({
      to: wallet.address,
      value: utils.parseEther('0.1'),
    });
    await tx.wait();

    console.log('2 - Deploying attacker');

    const attackerFactory = await ethers.getContractFactory('FuzzyIdentityChallengeAttacker');
    const attacker = await attackerFactory.connect(wallet).deploy(target.address);
    await attacker.deployed();

    console.log('Attacker deployed to:', attacker.address);

    console.log('3 - Attacking');

    tx = await attacker.attack();
    await tx.wait();
  });

  after(async () => {
    expect(await target.isComplete()).to.equal(true);
  });
});
