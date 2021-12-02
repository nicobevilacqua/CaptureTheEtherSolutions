import { ethers } from 'hardhat';

const address = '0x467918C34aa8D7E14Ab289Cce735516B8cc74724';

async function main() {
  const targetFactory = await ethers.getContractFactory('DeployChallenge');
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
