const CrowdsaleTokenExt = artifacts.require("./CrowdsaleTokenExt.sol");
const TokenVesting = artifacts.require("./TokenVesting.sol");

module.exports = function (deployer) {
    let tokenVestingParams = [];
    tokenVestingParams.push(CrowdsaleTokenExt.address);
    deployer.deploy(TokenVesting, ...tokenVestingParams);
}