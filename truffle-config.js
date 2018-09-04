require('dotenv').config();

const Config = require("./config.js");
const Web3 = require("web3");
const web3 = new Web3();
const WalletProvider = require("truffle-wallet-provider");
const Wallet = require('ethereumjs-wallet');

var rinkebyPrivateKey = new Buffer(Config.constants.PRIVATE_KEY, "hex")
var rinkebyWallet = Wallet.fromPrivateKey(rinkebyPrivateKey);
var rinkebyProvider = new WalletProvider(rinkebyWallet, Config.infura.rinkeby);

module.exports = {
  networks: {    
    rinkeby: {
      provider: rinkebyProvider,
      gas: Config.constants.MAX_GAS,
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