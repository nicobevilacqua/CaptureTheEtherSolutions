import { ethers } from 'hardhat';

const { Wallet, utils, provider } = ethers;

const address = '0xb3135ab6dFD56132d4d9aCA5257A105DD2E1736b';

const wallet = new Wallet(
  '0xa186be056b9b4eedcdb2fd471ca942e85a5acd7baca4738f145f6a520fc4b10f',
  provider
);

async function main() {
  const [owner] = await ethers.getSigners();

  let tx;

  console.log('1 - Sending ether to wallet');

  tx = await owner.sendTransaction({
    to: wallet.address,
    value: utils.parseEther('0.1'),
  });
  await tx.wait();

  console.log('2 - Deploying attacker');

  const attackerFactory = await ethers.getContractFactory('FuzzyIdentityChallengeAttacker');
  const attacker = await attackerFactory.connect(wallet).deploy(address);
  await attacker.deployed();

  console.log('Attacker deployed to:', attacker.address);

  console.log('3 - Attacking');

  tx = await attacker.attack();
  await tx.wait();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
