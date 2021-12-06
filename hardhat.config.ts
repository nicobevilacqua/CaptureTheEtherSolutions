import { config } from 'dotenv';
config();

import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-waffle';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import 'hardhat-watcher';
import { task } from 'hardhat/config';
import path from 'path';
import { HardhatNetworkConfig } from 'hardhat/types';

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const accounts = [
  process.env.PRIVATE_KEY,
  process.env.PRIVATE_KEY2,
  process.env.PRIVATE_KEY3,
].filter((a) => !!a);

export default {
  solidity: {
    compilers: [
      {
        version: '0.4.21',
      },
      {
        version: '0.5.0',
      },
      {
        version: '0.8.4',
        settings: {
          optimizer: {
            enabled: !!process.env.OPTIMIZER_ENABLED,
            runs: 1000,
          },
        },
      },
    ],
  },

  networks: {
    localhost: {},

    hardhat: {
      initialBaseFeePerGas: 0, // workaround from https://github.com/sc-forks/solidity-coverage/issues/652#issuecomment-896330136 . Remove when that issue is closed.
      forking: {
        enabled: !!process.env.USE_FORK,
        url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`,
        blockNumber: 13698020,
      },
    },

    rinkeby: {
      url: process.env.RINKEBY_URL || '',
      accounts,
    },

    ropsten: {
      url: process.env.ROPSTEN_URL || '',
      accounts,
    },
  },

  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    gasPrice: process.env.GAS_PRICE,
    coinmarketcap: process.env.CMC_KEY,
    currency: 'USD',
    outputFile: process.env.TO_FILE ? path.resolve(__dirname, 'gasReporterOutput.json') : undefined,
  },

  watcher: {
    compile: {
      tasks: ['compile'],
      files: ['./contracts'],
      verbose: true,
    },

    test: {
      tasks: [{ command: 'test', params: { testFiles: ['{path}'] } }],
      files: ['./test/**/*'],
      verbose: true,
    },
  },

  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
