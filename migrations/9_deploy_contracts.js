
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
                    ["0x29ecee763c34b0557c4d2b9472cc79df7f9634a9", "0x29b994a699ced9201c35f63d140e9421354c9ef5", "0x364150eA2DF38679AAFc61171019673fdA1e2107", "0xa16d91f31ac922fd0d8446573eccae932f7bd76c", "0xfac0204c9a1e1c13177d580faa246f618fb5c3c6", "0x35a3f7ba37ba6d8849367b2c4d59ddc466b92278", "0x8f60b7ee6ce30b2d3ad8e1c05feee1de15ed19a7", "0x79839a4e9e67d592203ee71d1505612252163ced", "0x7d733891d061099df8b21f6c28792efa99417cb6", "0xbf51d506eefddc9cb9efe9fbcd9861e00966ecea", "0xdfd197d8c7e01c8f5ee8b5027f3881fd2e268b2f"],
                    [constants.reservedTokens.number, constants.reservedTokens.number, constants.reservedTokens.number, constants.reservedTokens1.number, constants.reservedTokens2.number, constants.reservedTokens3.number, constants.reservedTokens4.number, constants.reservedTokens5.number, constants.reservedTokens6.number, constants.reservedTokens7.number, constants.reservedTokens8.number],
                    [constants.reservedTokens.percentageUnit, constants.reservedTokens.percentageUnit, constants.reservedTokens.percentageUnit, constants.reservedTokens1.percentageUnit, constants.reservedTokens2.percentageUnit, constants.reservedTokens3.percentageUnit, constants.reservedTokens4.percentageUnit, constants.reservedTokens5.percentageUnit, constants.reservedTokens6.percentageUnit, constants.reservedTokens7.percentageUnit, constants.reservedTokens8.percentageUnit],
                    [constants.reservedTokens.percentageDecimals, constants.reservedTokens.percentageDecimals, constants.reservedTokens.percentageDecimals, constants.reservedTokens1.percentageDecimals, constants.reservedTokens2.percentageDecimals, constants.reservedTokens3.percentageDecimals, constants.reservedTokens4.percentageDecimals, constants.reservedTokens5.percentageDecimals, constants.reservedTokens6.percentageDecimals, constants.reservedTokens7.percentageDecimals, constants.reservedTokens8.percentageDecimals],
                    [constants.reservedTokens.IsVested, constants.reservedTokens.IsVested, constants.reservedTokens.IsVested, constants.reservedTokens1.IsVested, constants.reservedTokens2.IsVested, constants.reservedTokens3.IsVested, constants.reservedTokens4.IsVested, constants.reservedTokens5.IsVested, constants.reservedTokens6.IsVested, constants.reservedTokens7.IsVested, constants.reservedTokens8.IsVested]
                ),
                mintedTokenCappedCrowdsaleExt.setEarlyParticipantWhitelistMultiple(
                    ["0xc120cce87a5782162d407c70dca0baabb9448ab5", "0x3ea1bcc506d5c5a6db9f09d9faeb7e00e5a437a8"],
                    [constants.whiteListItem.status, constants.whiteListItem.status],
                    [constants.whiteListItem.minCap, constants.whiteListItem.minCap],
                    [constants.whiteListItem.maxCap, constants.whiteListItem.maxCap]
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