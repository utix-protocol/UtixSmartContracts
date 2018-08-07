const ETHUSD = artifacts.require("./ETHUSD.sol");

const Params = [
      46821
];

module.exports = function (deployer) {      
      deployer.deploy(ETHUSD,...Params, { value: 300000000000000000 });
      //deployer.deploy(ETHUSD);
};

