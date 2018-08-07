
const CrowdsaleTokenExt = artifacts.require("./CrowdsaleTokenExt.sol");
const MintedTokenCappedCrowdsaleExt = artifacts.require("./MintedTokenCappedCrowdsaleExt.sol");
const SafeMathLibExt = artifacts.require("./SafeMathLibExt.sol");
const FlatPricingExt = artifacts.require("./FlatPricingExt.sol");
const ReservedTokensFinalizeAgent = artifacts.require("./ReservedTokensFinalizeAgent.sol");
const TokenVesting = artifacts.require("./TokenVesting.sol");

const constants = require("../test/constants");

module.exports = function (deployer) {
    
    deployer.then(() => {
        Promise.all([CrowdsaleTokenExt.deployed(), 
                     FlatPricingExt.deployed(), 
                     MintedTokenCappedCrowdsaleExt.deployed(),
                     TokenVesting.deployed()
                    ]).then(results => {
            var crowdsaleTokenExt = results[0];
            var flatPricingExt = results[1];
            var mintedTokenCappedCrowdsaleExt = results[2];
            var tokenVesting = results[3];
            
            return Promise.all([
                crowdsaleTokenExt.setReservedTokensListMultiple(
                    ["0xa16d91f31ac922fd0d8446573eccae932f7bd76c"],
                    [constants.reservedTokens.number],
                    [constants.reservedTokens.percentageUnit],
                    [constants.reservedTokens.percentageDecimals]
                ),
                mintedTokenCappedCrowdsaleExt.setEarlyParticipantWhitelistMultiple(
                    ["0xc120cce87a5782162d407c70dca0baabb9448ab5"],
                    [constants.whiteListItem.status],
                    [constants.whiteListItem.minCap],
                    [constants.whiteListItem.maxCap]
                ),                        
                flatPricingExt.setTier(MintedTokenCappedCrowdsaleExt.address),         
                mintedTokenCappedCrowdsaleExt.updateJoinedCrowdsalesMultiple([MintedTokenCappedCrowdsaleExt.address]),        
                crowdsaleTokenExt.setMintAgent(MintedTokenCappedCrowdsaleExt.address, true),
                crowdsaleTokenExt.setMintAgent(ReservedTokensFinalizeAgent.address, true),   
                mintedTokenCappedCrowdsaleExt.setFinalizeAgent(ReservedTokensFinalizeAgent.address),
                crowdsaleTokenExt.setReleaseAgent(ReservedTokensFinalizeAgent.address), 
                mintedTokenCappedCrowdsaleExt.setAllocateAgent(ReservedTokensFinalizeAgent.address, true),
                tokenVesting.setAllocateAgent(mintedTokenCappedCrowdsaleExt.address, true),
                tokenVesting.setAllocateAgent("0xc120cce87a5782162d407c70dca0baabb9448ab5", true),
                crowdsaleTokenExt.setTransferAgent(tokenVesting.address, true)               
            ]);
        }).then(() => console.log('Deploy Successful')).catch(error => console.log('ERROR', error));
    });

}