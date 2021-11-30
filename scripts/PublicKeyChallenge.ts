import { SignatureLike } from '@ethersproject/bytes';
import { Transaction } from 'ethers';
import { ethers } from 'hardhat';
const { utils, provider } = ethers;

const address = '0x6497226Be242859A5eFAe220db9527642996CE05';
const owner = '0x92b28647ae1f3264661f72fb2eb9625a89d88a31';

const txHashes = [
  '0x40dbbce7574550d0c8f4e8bbf055bd2e7bf3901145eda823c27805749ab0cc85',
  '0xabc467bedd1d17462fcc7942d0af7874d6f8bdefee2b299c9168a216d3ff0edb',
  '0xd79fc80e7b787802602f3317b7fe67765c14a7d40c3e0dcb266e63657f881396',
  '0x061bf0b4b5fdb64ac475795e9bc5a3978f985919ce6747ce2cfbbcaccaf51009',
];

async function getPublicKeyFromTrasaction(txHash: string) {
  const tx: Transaction = await provider.getTransaction(txHash);

  const expandedSig: SignatureLike = {
    r: <string>tx.r,
    s: <string>tx.s,
    v: <number>tx.v,
  };

  const signature = ethers.utils.joinSignature(expandedSig);

  const txData = {
    gasPrice: tx.gasPrice,
    gasLimit: tx.gasLimit,
    value: tx.value,
    nonce: tx.nonce,
    data: tx.data,
    chainId: tx.chainId,
    to: tx.to,
  };

  const rsTx = await ethers.utils.resolveProperties(txData);

  const raw = ethers.utils.serializeTransaction(rsTx); // returns RLP encoded tx

  const msgHash = ethers.utils.keccak256(raw); // as specified by ECDSA

  const msgBytes = ethers.utils.arrayify(msgHash); // create binary hash

  const recoveredPubKey = ethers.utils.recoverPublicKey(msgBytes, signature);

  const recoveredAddress = ethers.utils.recoverAddress(msgBytes, signature);

  console.log('---');
  console.log('address:', recoveredAddress);
  console.log('pub key:', recoveredPubKey);
  console.log('computeAddress:', ethers.utils.computeAddress(recoveredPubKey));
  console.log('---');

  return recoveredPubKey;
}

async function main() {
  const targetFactory = await ethers.getContractFactory('PublicKeyChallenge');
  const target = await targetFactory.attach(address);
  await target.deployed();

  console.log('target deployed to:', target.address);

  async function tryPubKey(pubKey: string): Promise<boolean> {
    console.log('trying pub key:', pubKey);
    try {
      const tx = await target.authenticate(pubKey, {
        gasLimit: 100000,
      });
      await tx.wait();
      return await target.isComplete();
    } catch (error) {
      console.log('error');
      return false;
    }
  }

  const pubKeys = await Promise.all(txHashes.map((txHash) => getPublicKeyFromTrasaction(txHash)));

  let pubKeyToTest = pubKeys.find(
    (pubKey) => ethers.utils.computeAddress(pubKey).toLowerCase() === owner
  );

  if (!pubKeyToTest) {
    console.log('error');
    return;
  }

  // remove the EC prefix 0x04
  pubKeyToTest = `0x${pubKeyToTest.slice(4)}`;

  const tx = await target.authenticate(pubKeyToTest, {
    gasLimit: 100000,
  });

  await tx.wait();

  const isComplete = await target.isComplete();

  if (isComplete) {
    console.log('done');
    return;
  }

  console.log('something went wrong');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
