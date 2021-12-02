import { ethers } from 'hardhat';
const { utils } = ethers;

const address = '0xC547ecB3ebcfB999949C4DFfd1ddD950d3531465';

async function main() {
  console.log('deploying');

  const targetFactory = await ethers.getContractFactory('GuessTheNumberChallenge');
  const target = await targetFactory.attach(address);
  await target.deployed();

  console.log('Target deployed to:', target.address);

  console.log('Guessing');

  const tx = await target.guess(42, {
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
