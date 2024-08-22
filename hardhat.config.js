require('@nomiclabs/hardhat-ethers');

module.exports = {
  solidity: "0.8.24",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      gas: 950000000,
      gasPrice: 80000000000,
      accounts: ['0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e'] // Directly writing the private key
    },
  },
};
