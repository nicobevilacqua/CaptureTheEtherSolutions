import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers, network } from 'hardhat';
const { utils, provider, BigNumber } = ethers;

const ANSWER_HASH = '0xdb81b4d58595fbbbb592d3661a34cdca14d7ab379441400cbfa1b78bc447c365';
const MAX_NUMBER = 2 ** 8;

describe('GuessTheSecretNumberChallenge', () => {
  let target: Contract;
  let owner: SignerWithAddress;
  let attacker: SignerWithAddress;

  before(async () => {
    await network.provider.request({
      method: 'hardhat_reset',
      params: [],
    });

    [owner, attacker] = await ethers.getSigners();

    const targetFactory = await ethers.getContractFactory('GuessTheSecretNumberChallenge');
    target = await targetFactory.deploy({
      value: utils.parseEther('1'),
    });
    await target.deployed();

    console.log('deployed on', target.address);
  });

  it('exploit', async () => {
    let answer: any;
    for (answer = 0; answer < MAX_NUMBER; answer++) {
      if (utils.keccak256(answer) === ANSWER_HASH) {
        console.log('answer', answer);
        break;
      }
    }

    const tx = await target.guess(answer, {
      value: utils.parseEther('1'),
    });
    await tx.wait();
  });

  after(async () => {
    expect(await target.isComplete()).to.equal(true);
  });
});