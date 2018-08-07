require('dotenv').config();
const Web3 = require("web3");
const web3 = new Web3();
const WalletProvider = require("truffle-wallet-provider");
const Wallet = require('ethereumjs-wallet');

var rinkebyPrivateKey = new Buffer("543c60affeef2d32e14c4e30ae9ef0b5e020c4f1d63c1479446f3ba1f4a830d6", "hex")
var rinkebyWallet = Wallet.fromPrivateKey(rinkebyPrivateKey);
var rinkebyProvider = new WalletProvider(rinkebyWallet, "https://rinkeby.infura.io/KTmUZWPFvNmrGwgt9iCs");

module.exports = {
  networks: {    
    rinkeby: {
      provider: rinkebyProvider,
      gas: 6700000,
      gasPrice: web3.toWei("80", "gwei"),
      network_id: "4",
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
};