const CrowdsaleTokenExt = artifacts.require("./CrowdsaleTokenExt.sol");
const FlatPricingExt = artifacts.require("./FlatPricingExt.sol");
const TokenVesting = artifacts.require("./TokenVesting.sol");
const SafeMathLibExt = artifacts.require("./SafeMathLibExt.sol");
const MintedTokenCappedCrowdsaleExt = artifacts.require("./MintedTokenCappedCrowdsaleExt.sol");

const constants = require("../test/constants");

const crowdsaleParams = [
    constants.crowdsale.start,
    constants.crowdsale.end,
    constants.crowdsale.minimumFundingGoal,
    constants.crowdsale.maximumSellableTokens,
    constants.crowdsale.isUpdatable,
    constants.crowdsale.isWhiteListed
];

module.exports = function (deployer) {
    crowdsaleParams.unshift("0xc120cce87a5782162d407c70dca0baabb9448ab5");
    crowdsaleParams.unshift(FlatPricingExt.address);
    crowdsaleParams.unshift(CrowdsaleTokenExt.address);
    crowdsaleParams.unshift("Utix Crowdsale");
    crowdsaleParams.push(TokenVesting.address);

    deployer.link(SafeMathLibExt, MintedTokenCappedCrowdsaleExt);

    deployer.deploy(MintedTokenCappedCrowdsaleExt, ...crowdsaleParams);
}