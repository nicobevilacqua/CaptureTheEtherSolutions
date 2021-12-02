import { ethers } from 'hardhat';

const address = '';

async function main() {
  const targetFactory = await ethers.getContractFactory('');
  const target = await targetFactory.attach(address);
  await target.deployed();

  console.log('Target deployed to:', target.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
