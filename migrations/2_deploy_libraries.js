const SafeMathLibExt = artifacts.require("./SafeMathLibExt.sol");

module.exports = function(deployer){
    deployer.deploy(SafeMathLibExt);
}