const SafeMathLibExt = artifacts.require("./SafeMathLibExt.sol");
const FlatPricingExt = artifacts.require('./FlatPricingExt.sol');
const ETHUSD = artifacts.require('./ETHUSD.sol');

const pricingStrategyParams = [
      10
];

module.exports = function (deployer) {
      pricingStrategyParams.push(ETHUSD.address);
      deployer.link(SafeMathLibExt, FlatPricingExt);
      deployer.deploy(FlatPricingExt, ...pricingStrategyParams);
};

