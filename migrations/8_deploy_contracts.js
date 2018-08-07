const CrowdsaleTokenExt = artifacts.require("./CrowdsaleTokenExt.sol");
const MintedTokenCappedCrowdsaleExt = artifacts.require("./MintedTokenCappedCrowdsaleExt.sol");
const SafeMathLibExt = artifacts.require("./SafeMathLibExt.sol");
const ReservedTokensFinalizeAgent = artifacts.require("./ReservedTokensFinalizeAgent.sol");

module.exports = function (deployer) {
    let reservedTokensFinalizeAgentParams = [];
    reservedTokensFinalizeAgentParams.push(CrowdsaleTokenExt.address);
    reservedTokensFinalizeAgentParams.push(MintedTokenCappedCrowdsaleExt.address);

    deployer.link(SafeMathLibExt, ReservedTokensFinalizeAgent);

    deployer.deploy(ReservedTokensFinalizeAgent, ...reservedTokensFinalizeAgentParams);    
}