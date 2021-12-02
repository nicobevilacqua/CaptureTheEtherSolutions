import { ethers } from 'hardhat';
const { utils } = ethers;

const address = '0x8D783f4c617AC3df402003084948bF9fCa8CB355';

async function main() {
  const [targetFactory, attackerFactory] = await Promise.all([
    ethers.getContractFactory('GuessTheNewNumberChallenge'),
    ethers.getContractFactory('GuessTheNewNumberChallengeAttacker'),
  ]);

  console.log('deploying');

  const [target, attacker] = await Promise.all([
    targetFactory.attach(address),
    attackerFactory.deploy(address),
  ]);

  await Promise.all([target.deployed(), attacker.deployed()]);

  console.log('target deployed on', target.address);
  console.log('attacker deployed on', attacker.address);

  console.log('attacking');

  const tx = await attacker.attack({
    value: utils.parseEther('1'),
  });
  await tx.wait();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
