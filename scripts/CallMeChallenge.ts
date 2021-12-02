import { ethers } from 'hardhat';

const address = '0xaA958d9d3115b757eC999319C98e3AeC598F05Cd';

async function main() {
  const targetFactory = await ethers.getContractFactory('CallMeChallenge');
  const target = await targetFactory.attach(address);
  await target.deployed();

  console.log('Target deployed to:', target.address);

  console.log('Calling callme');

  const tx = await target.callme();
  await tx.wait();

  console.log('done');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
