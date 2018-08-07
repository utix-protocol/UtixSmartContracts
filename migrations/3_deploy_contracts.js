const CrowdsaleTokenExt = artifacts.require("./CrowdsaleTokenExt.sol");
const SafeMathLibExt = artifacts.require("./SafeMathLibExt.sol");

const constants = require("../test/constants");

const tokenParams = [
    constants.token.name,
    constants.token.ticker,
    parseInt(constants.token.supply, 10),
    parseInt(constants.token.decimals, 10),
    constants.token.isMintable,
    constants.token.globalmincap
];

module.exports = function (deployer) {
    deployer.link(SafeMathLibExt, CrowdsaleTokenExt);
    deployer.deploy(CrowdsaleTokenExt, ...tokenParams);
}