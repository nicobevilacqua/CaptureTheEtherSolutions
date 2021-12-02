import { ethers } from 'hardhat';
const { utils } = ethers;

const address = '0xdF8fF45B47B7E31379e6CEbDB8eaee719AE2Fe89';

const ANSWER_HASH = '0xdb81b4d58595fbbbb592d3661a34cdca14d7ab379441400cbfa1b78bc447c365';
const MAX_NUMBER = 2 ** 8;

async function main() {
  console.log('deploying');

  const targetFactory = await ethers.getContractFactory('GuessTheSecretNumberChallenge');
  const target = await targetFactory.attach(address);
  await target.deployed();

  console.log('Target deployed to:', target.address);

  let answer: any;
  for (answer = 0; answer < MAX_NUMBER; answer++) {
    if (utils.keccak256(answer) === ANSWER_HASH) {
      console.log('answer', answer);
      break;
    }
  }

  console.log('Guessing');

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
