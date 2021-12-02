import { ethers, network } from 'hardhat';

const ownerAddress = '0x6B477781b0e68031109f21887e6B5afEAaEB002b';
const targetAddress = '0xBaC14F163eFE5376CC6e67609AE1fa0C1A8e6494';

// HACK INFO
// https://bitcoin.stackexchange.com/questions/35848/recovering-private-key-when-someone-uses-the-same-k-twice-in-ecdsa-signatures
// https://web.archive.org/web/20160308014317/http://www.nilsschneider.net/2013/01/28/recovering-bitcoin-private-keys.html
// TL;DR; the "k" must be different for every transaction, otherwise the private key could be leaked

async function main() {
  const targetFactory = await ethers.getContractFactory('AccountTakeoverChallenge');
  const target = await targetFactory.attach(targetAddress);
  await target.deployed();

  console.log('Target deployed to:', target.address);

  const provider = new ethers.providers.EtherscanProvider(
    network.name, // ropsten
    process.env.ETHERSCAN_API_KEY
  );

  // GET ALL OWNER TRANSACTIONS USING ETHERSCAN API
  const history = await provider.getHistory(ownerAddress);

  const transaction = await provider.getTransaction(history[0].hash);

  console.log(transaction);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
