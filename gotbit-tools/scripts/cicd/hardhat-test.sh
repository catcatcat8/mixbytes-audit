echo TENDERLY_CHAIN_ID=56 > .env
yarn
yarn compile
yarn hardhat test --network hardhat
