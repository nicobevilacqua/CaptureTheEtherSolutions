import { ethers } from 'hardhat';
const { utils } = ethers;

const captureTheEtherAddress = '0x71c46Ed333C35e4E6c62D32dc7C8F00D125b4fee';
const nicknameChallengeAddress = '0x9502db98c2c92CDAa6Fc40E5e738FDc3AdA9AdA3';

async function main() {
  console.log('deploying');

  const [CaptureTheEtherFactory, NicknameChallengeFactory] = await Promise.all([
    ethers.getContractFactory('CaptureTheEther'),
    ethers.getContractFactory('NicknameChallenge'),
  ]);

  const [captureTheEther, nicknameChallenge] = await Promise.all([
    CaptureTheEtherFactory.attach(captureTheEtherAddress),
    NicknameChallengeFactory.attach(nicknameChallengeAddress),
  ]);

  await Promise.all([captureTheEther.deployed(), nicknameChallenge.deployed()]);

  console.log(`captureTheEther address ${captureTheEther.address}`);
  console.log(`nicknameChallenge address ${captureTheEther.address}`);

  const inBytes = utils.formatBytes32String('PeronPeron');

  console.log('setting nickname');

  const tx = await captureTheEther.setNickname(inBytes);
  await tx.wait();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
