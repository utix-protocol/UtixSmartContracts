const CrowdsaleTokenExt = artifacts.require("./CrowdsaleTokenExt.sol");
const MintedTokenCappedCrowdsaleExt = artifacts.require("./MintedTokenCappedCrowdsaleExt.sol");
const ReservedTokensFinalizeAgent = artifacts.require("./ReservedTokensFinalizeAgent.sol");
const FlatPricingExt = artifacts.require("./FlatPricingExt.sol");
const TokenVesting = artifacts.require("./TokenVesting.sol");
const constants = require("../constants");
const utils = require("../utils");
const ERROR_MSG = 'VM Exception while processing transaction: revert';

const timeout = ms => new Promise(res => setTimeout(res, ms))

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(web3.BigNumber))
  .should();

let weiToSend1
let weiToSend2
let weiToSend3
let weiToSend4
let weiToSend5
contract('MintedTokenCappedCrowdsaleExt 1 tier', function(accounts) {

	it("should get rate", async () => {
		let flatPricingExt = await FlatPricingExt.deployed();
		let crowdsaleTokenExt = await CrowdsaleTokenExt.deployed();
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
		
		let tokensSold = await mintedTokenCappedCrowdsaleExt.tokensSold.call();
		let decimals = await crowdsaleTokenExt.decimals.call();
		let rate = await flatPricingExt.oneTokenInWei(tokensSold, decimals);

		constants.rate = rate;

		let balanceOfMultisigInitial = 0;
		weiToSend1 = parseInt(constants.investments[2]*constants.rate, 10); //weiToSend in 1st success investment;
		weiToSend2 = parseInt(constants.investments[3]*constants.rate, 10); //weiToSend in 2nd success investment;
		weiToSend3 = parseInt(constants.investments[4]*constants.rate, 10); //weiToSend in 3d success investment;
		weiToSend4 = parseInt(constants.investments[6]*constants.rate, 10); //weiToSend in 3d success investment;
		weiToSend5 = parseInt(constants.investments[7]*constants.rate, 10); //weiToSend in 5th success investment;
	});

	it("shouldn't set finalize agent once more", async () => {
    	let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
    	let reservedTokensFinalizeAgent = await ReservedTokensFinalizeAgent.deployed();
    	await mintedTokenCappedCrowdsaleExt.setFinalizeAgent(reservedTokensFinalizeAgent.address).should.be.rejected;
	});

	it("shouldn't set pricing strategy once more", async () => {
    	let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
    	let flatPricingExt = await FlatPricingExt.deployed();
    	await mintedTokenCappedCrowdsaleExt.setPricingStrategy(flatPricingExt.address).should.be.rejected;
	});

	it("shouldn't update rate", async () => {
    	let newRate = 15;
    	let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
    	let flatPricingExt = await FlatPricingExt.deployed();
    	await mintedTokenCappedCrowdsaleExt.updateRate(newRate).should.be.rejected;
	});

	it("shouldn't update max cap", async () => {
    	let newMaxCap = 200000000 * 10**18;
    	let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
    	await mintedTokenCappedCrowdsaleExt.setMaximumSellableTokens(newMaxCap).should.be.rejected;
	});

	it("shouldn't set startsAt", async () => {
		let newStartsAt = parseInt(new Date().getTime()/1000);
    	let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
    	await mintedTokenCappedCrowdsaleExt.setStartsAt(newStartsAt).should.be.rejected;
	});

	it("should get last tier tier for crowdsale contract", async () => {
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
		let lastCrowdsale = await mintedTokenCappedCrowdsaleExt.getLastTier.call();
		mintedTokenCappedCrowdsaleExt.address.should.be.bignumber.equal(lastCrowdsale);
	});

	it("should get name of crowdsale", async () => {
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
		let name = await mintedTokenCappedCrowdsaleExt.name.call();
		name.should.be.equal("Utix Crowdsale");
	});

	it("should get finalize agent", async () => {
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
		let finalizeAgent = await mintedTokenCappedCrowdsaleExt.finalizeAgent.call();
		let reservedTokensFinalizeAgent = await ReservedTokensFinalizeAgent.deployed();
		reservedTokensFinalizeAgent.address.should.be.bignumber.equal(finalizeAgent);
	});

	it("should get pricing strategy", async () => {
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
		let flatPricingExtAddr = await mintedTokenCappedCrowdsaleExt.pricingStrategy.call();
		let flatPricingExt = await FlatPricingExt.deployed();
		flatPricingExt.address.should.be.equal(flatPricingExtAddr);
	});

	it("should get isTierJoined", async () => {
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
		let isTierJoined = await mintedTokenCappedCrowdsaleExt.isTierJoined.call(mintedTokenCappedCrowdsaleExt.address);
		true.should.be.equal(isTierJoined);
	});

	it("should get tier position", async () => {
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
		let isTierJoined = await mintedTokenCappedCrowdsaleExt.getTierPosition.call(mintedTokenCappedCrowdsaleExt.address);
		isTierJoined.should.be.bignumber.equal(0);
	});

	it("should allow adding an address to the whitelist with a minCap and the maxCap", async () => {
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
		const minCap = utils.toFixed(1 * 10**18);
        const maxCap = utils.toFixed(10 * 10**18)
		await mintedTokenCappedCrowdsaleExt.setEarlyParticipantWhitelist(accounts[2], true, minCap, maxCap, { from: accounts[0]}).should.be.fulfilled;

		await mintedTokenCappedCrowdsaleExt.setEarlyParticipantWhitelist(accounts[4], true, minCap, maxCap, { from: accounts[0]}).should.be.fulfilled;
	});	

	it("should get early participant white list", async () => {
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
		let earlyParticipantWhitelistObj = await mintedTokenCappedCrowdsaleExt.earlyParticipantWhitelist.call(accounts[2]);
		true.should.be.equal(earlyParticipantWhitelistObj[0]);
		constants.whiteListItem.minCap.should.be.bignumber.equal(earlyParticipantWhitelistObj[1]);
		constants.whiteListItem.maxCap.should.be.bignumber.equal(earlyParticipantWhitelistObj[2]);
	});

	it("checks, that addresses are whitelisted", async () => {
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
		let isAddress1Whitelisted = await mintedTokenCappedCrowdsaleExt.isAddressWhitelisted.call(accounts[2]);
		true.should.be.equal(isAddress1Whitelisted);
		let isAddress2Whitelisted = await mintedTokenCappedCrowdsaleExt.isAddressWhitelisted.call(accounts[4]);
		true.should.be.equal(isAddress2Whitelisted);
	});

	it("checks, that address is not whitelisted", async () => {
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
		let isAddressWhitelisted = await mintedTokenCappedCrowdsaleExt.isAddressWhitelisted.call(accounts[5]);
		false.should.be.equal(isAddressWhitelisted);
	});

	it("should not add an address to the whitelist that was already added", async () => {
        let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
        let currentWhitelistLength = await mintedTokenCappedCrowdsaleExt.whitelistedParticipantsLength.call();

        const token = constants.token
        const minCap = 1 * 10**token.decimals
        const maxCap = 10 * 10**token.decimals
        await mintedTokenCappedCrowdsaleExt.setEarlyParticipantWhitelist(accounts[2], true, minCap, maxCap, { from: accounts[0] })

        let length = await mintedTokenCappedCrowdsaleExt.whitelistedParticipantsLength.call()

        assert.equal(currentWhitelistLength.toString(), length.toString(), 'The length of the whitelist should not change')
    })

	it("shouldn't accept investment from not whitelisted user", async () => {	
    	await buyRejected(accounts[8], weiToSend5);
    });

	it("shouldn't accept investment from whitelisted user less than minCap", async () => {
		
    	await buyRejected(accounts[2], weiToSend2);
	});

	it("shouldn't accept investment from whitelisted user more than maxCap", async () => {
		let weiToSend = parseInt(constants.investments[1]*constants.rate, 10);
    	await buyRejected(accounts[2], weiToSend);
	});

	balanceOfMultisigInitial = web3.eth.getBalance(accounts[9]);

	it("should accept buy from whitelisted user 1 within cap range", async () => { 		
		await buySuccessfully(accounts[2], weiToSend5) 
	});

	it("should return updated balance of multisig", () => { 
		checkUpdatedBalanceOfMultisig(weiToSend5) 
	});

	it("should return correct token's balance of user", async () => { 
		await checkTokensBalance(accounts[2], weiToSend5/constants.rate) 
	});

	
	it("should accept buy from whitelisted user 2 within cap range", async () => { 
		await buySuccessfully(accounts[4], weiToSend5) 
	});

	it("should return updated balance of multisig", () => { 
		checkUpdatedBalanceOfMultisig(2*weiToSend5) 
	});

	it("should return correct token's balance of user", async () => 
	{ 
		await checkTokensBalance(accounts[4], weiToSend5/constants.rate) 
	});
	
	it("should accept buy less than minCap at second buy", async () => { 
		await buySuccessfully(accounts[2], weiToSend2) 
	});

	it("should return updated balance of multisig", () => { 
		checkUpdatedBalanceOfMultisig(2 * weiToSend5 + weiToSend2) 
	});

	it("should return correct token's balance of user", async () => { 
		await checkTokensBalance(accounts[2], weiToSend5/constants.rate + weiToSend2/constants.rate) 
	});
	
	it("shouldn't accept investment from whitelisted user that exceeds maxCap, when maxCap is not sold yet", async () => {
    	let weiToSend = parseInt(constants.investments[1]*constants.rate, 10);
    	await buyRejected(accounts[2], weiToSend);
	});	

	it("shouldn't accept investment from whitelisted user that exceeds maxCap, when maxCap is already sold", async () => {
    	let weiToSend = parseInt(constants.investments[1]*constants.rate, 10);
    	await buyRejected(accounts[2], weiToSend);
	});

	it("should get the count of whitelisted participants", async () => {
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
		let whitelistedParticipantsLength = await mintedTokenCappedCrowdsaleExt.whitelistedParticipantsLength.call();
		whitelistedParticipantsLength.should.be.bignumber.equal(3);
	});

	it("should get the whitelist participant from the array", async () => {
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
		let whitelistedParticipant = await mintedTokenCappedCrowdsaleExt.whitelistedParticipants.call(0);
		whitelistedParticipant.should.be.equal(accounts[0]);
	});

	it("should not allow adding the 0 address to the whitelist", async () => {
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
		const token = constants.token;
        const minCap = 1 * 10**token.decimals;
        const maxCap = 10 * 10**token.decimals;
        await mintedTokenCappedCrowdsaleExt.setEarlyParticipantWhitelist('0x0', true, minCap, maxCap, { from: accounts[0] }).should.be.rejected;;
	});

	it("should not allow adding an address to the whitelist with a minCap greater than the maxCap", async () => {
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
		const token = constants.token
        const minCap = 10 * 10**token.decimals
        const maxCap = 1 * 10**token.decimals
        await mintedTokenCappedCrowdsaleExt.setEarlyParticipantWhitelist(accounts[5], true, minCap, maxCap, { from: accounts[0] }).should.be.rejected;;
	});

	it("should not allow adding an address to the whitelist with a maxCap of 0", async () => {
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
		const token = constants.token
        const minCap = 0
        const maxCap = 0
        await mintedTokenCappedCrowdsaleExt.setEarlyParticipantWhitelist(accounts[5], true, minCap, maxCap, { from: accounts[0] }).should.be.rejected;;
	});

    it("can distribute reserved tokens should be false", async () => {
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
		let canDistributeReservedTokens = await mintedTokenCappedCrowdsaleExt.canDistributeReservedTokens.call();
		false.should.be.equal(canDistributeReservedTokens);
	});

	it("should set endsAt", async () => {
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
		await mintedTokenCappedCrowdsaleExt.setEndsAt(parseInt((new Date()).getTime()/1000, {from: accounts[0]})).should.be.fulfilled;
	});

	it("should not set endsAt, if crowdsale is already ended", async () => {
		await timeout(2000)
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
		await mintedTokenCappedCrowdsaleExt.setEndsAt(parseInt((new Date()).getTime()/1000, {from: accounts[0]})).should.be.rejected;
	});

	it("can distribute reserved tokens shoul be true", async () => {
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
		let canDistributeReservedTokens = await mintedTokenCappedCrowdsaleExt.canDistributeReservedTokens.call();
		true.should.be.equal(canDistributeReservedTokens);
	});

	it("should get allocate agent: ReservedTokensFinalizeAgent Address", function() {
		return MintedTokenCappedCrowdsaleExt.deployed().then(function(instance) {
	    	return instance.allocateAgents.call(ReservedTokensFinalizeAgent.address);
	    }).then(function(res) {
	    	assert.equal(res, true, "ReservedTokensFinalizeAgent Address should be in allocateAgents of crowdsale contract");
	    });
	});

	it("should fail finalize", async () => {
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
		await mintedTokenCappedCrowdsaleExt.finalize().should.be.rejected;
	});

	it("should fail distribution of reserved tokens with 0 batch", async () => {
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
		await mintedTokenCappedCrowdsaleExt.distributeReservedTokens(0).should.be.rejected;
	});

	it("should distribute 1st batch of reserved tokens", async () => {
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
		await mintedTokenCappedCrowdsaleExt.distributeReservedTokens(1).should.be.fulfilled;
	});

	it("should return that reserved tokens are distributed for one address", async () => {
		let reservedTokensFinalizeAgent = await ReservedTokensFinalizeAgent.deployed();
		let distributedReservedTokensDestinationsLen = await reservedTokensFinalizeAgent.distributedReservedTokensDestinationsLen.call();
		distributedReservedTokensDestinationsLen.should.be.bignumber.equal(1);
	});

	it("should return that not all reserved tokens are distributed", async () => {
		let reservedTokensFinalizeAgent = await ReservedTokensFinalizeAgent.deployed();
		let reservedTokensAreDistributed = await reservedTokensFinalizeAgent.reservedTokensAreDistributed.call();
		reservedTokensAreDistributed.should.be.equal(false);
	});

	it("should fail finalize", async () => {
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
		await mintedTokenCappedCrowdsaleExt.finalize().should.be.rejected;
	});

	it("should distribute reserved tokens", async () => {
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
		await mintedTokenCappedCrowdsaleExt.distributeReservedTokens(1).should.be.fulfilled;
	});

	it("should return that all reserved tokens are distributed", async () => {
		let reservedTokensFinalizeAgent = await ReservedTokensFinalizeAgent.deployed();
		let distributedReservedTokensDestinationsLen  = await reservedTokensFinalizeAgent.distributedReservedTokensDestinationsLen.call();
		distributedReservedTokensDestinationsLen.should.be.bignumber.equal(2);

		let reservedTokensAreDistributed  = await reservedTokensFinalizeAgent.reservedTokensAreDistributed.call();
		reservedTokensAreDistributed.should.be.equal(true);
	});

	it("should fail distribution of reserved tokens", async () => {
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
		await mintedTokenCappedCrowdsaleExt.distributeReservedTokens(1).should.be.rejected;
	});

	it("should can not distribute reserved tokens", async () => {
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
		let canDistributeReservedTokens = await mintedTokenCappedCrowdsaleExt.canDistributeReservedTokens.call();
		false.should.be.equal(canDistributeReservedTokens);
	});

	it("should finalize crowdsale", async () => {
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
		await mintedTokenCappedCrowdsaleExt.finalize().should.be.fulfilled;
	});

	
	

	it("Reserved address 2 updated token balance",  async () => { 
		await checkVestedTokensBalance(accounts[7]); 
	});
    
    it("should get allocate agent: crowdsale contract", function() {
		return TokenVesting.deployed().then(function(instance) {
	    	return instance.allocateAgents.call(MintedTokenCappedCrowdsaleExt.address);
	    }).then(function(res) {
	    	assert.equal(res, true, "Crowdsale contract should be in allocateAgents of token  contract");
	    });
    });
    
    it("should get allocate agent: Owner", function() {
		return TokenVesting.deployed().then(function(instance) {
	    	return instance.allocateAgents.call(accounts[0]);
	    }).then(function(res) {
	    	assert.equal(res, true, "Owner should be in allocateAgents of token  contract");
	    });
    });  
    
    it("checks, that addresses are set to vesting", async () => {
		let tokenVesting = await TokenVesting.deployed();
		let isVestingSetAdd1 = await tokenVesting.isVestingSet.call(accounts[3]);
		true.should.be.equal(isVestingSetAdd1);
		let isVestingSetAdd2 = await tokenVesting.isVestingSet.call(accounts[7]);
		false.should.be.equal(isVestingSetAdd2);
    });

    it("should get vesting Map for 1st account before changeFreezed to true", async () => {
		let tokenVesting = await TokenVesting.deployed();
		let vestingMapAddress1 = await tokenVesting.vestingMap.call(accounts[3]);        
        assert.equal(vestingMapAddress1[1], 1, 'Cliff will be 1')
        assert.equal(vestingMapAddress1[2], 4, 'Duration will be 4')
        assert.equal(vestingMapAddress1[3], 5, 'Step will be 5 sec')        
        constants.reservedTokens.number.should.be.bignumber.equal(vestingMapAddress1[4]);
        assert.equal(vestingMapAddress1[5], 0, 'Token amount Released will be 0')
        false.should.be.equal(vestingMapAddress1[6]);	
	});
    
    it("should set the changeFreezed to true", async () => {
        let tokenVesting = await TokenVesting.deployed();        
        await tokenVesting.freezeChangesToVesting(accounts[3], { from: accounts[0] }).should.be.fulfilled;        
    })
    
    it("should get vesting Map for 1st Accocunt", async () => {
		let tokenVesting = await TokenVesting.deployed();
		let vestingMapAddress1 = await tokenVesting.vestingMap.call(accounts[3]);     
        true.should.be.equal(vestingMapAddress1[6]);	
	});
	
	// it("should get vesting Map for 2nd account before changeFreezed to true", async () => {
	// 	let tokenVesting = await TokenVesting.deployed();
	// 	let vestingMapAddress1 = await tokenVesting.vestingMap.call(accounts[7]);
    //     assert.equal(vestingMapAddress1[1], 1, 'Cliff will be 1')
    //     assert.equal(vestingMapAddress1[2], 4, 'Duration will be 4')
    //     assert.equal(vestingMapAddress1[3], 5, 'Step will be 5 sec')        
    //     constants.reservedTokens.number.should.be.bignumber.equal(vestingMapAddress1[4]);
    //     assert.equal(vestingMapAddress1[5], 0, 'Token amount Released will be 0')
    //     false.should.be.equal(vestingMapAddress1[6]);	
	// });
    
    // it("should set the changeFreezed to true", async () => {
    //     let tokenVesting = await TokenVesting.deployed();
    //     await tokenVesting.freezeChangesToVesting(accounts[7], { from: accounts[0] }).should.be.fulfilled;
    // })

	// it("should get vesting Map for 2nd Accocunt", async () => {
	// 	let tokenVesting = await TokenVesting.deployed();
	// 	let vestingMapAddress1 = await tokenVesting.vestingMap.call(accounts[7]);    
    //     true.should.be.equal(vestingMapAddress1[6]);	
	// });
	

    
    it("Release 1st step vested tokens for 1st Accocunt", async () => {		
		await timeout(5000);
		releaseVestedTokens(accounts[3],constants.reservedTokens.number/4,1);
    });

    it("Release 2nd step vested tokens for 1st Accocunt", async () => { 
		await timeout(5000);     
		releaseVestedTokens(accounts[3],constants.reservedTokens.number/2,2); 
    });

    it("Release 3rd step vested tokens for 1st Accocunt", async () => {  
		await timeout(5000);    
		releaseVestedTokens(accounts[3],(3*constants.reservedTokens.number)/4,3);  
    });

    it("Release 4th step vested tokens for 1st Accocunt", async () => { 
		await timeout(5000);     
        releaseVestedTokens(accounts[3],constants.reservedTokens.number,4);        	
	});	

    // it("Release 4th step vested tokens for 2nd Accocunt", async () => {
	// 	await timeout(5000);       
    //     releaseVestedTokens(accounts[7],constants.reservedTokens.number,4);        	
	// });	

	it("Vested address 1 updated token balance", async () => { 
		await checkVestedTokensBalance(accounts[3]);
	});
	

	function checkUpdatedBalanceOfMultisig(invested) {
		let balanceOfMultisigUpdated = web3.eth.getBalance(accounts[9]);
		let investedTotal = parseInt(balanceOfMultisigInitial) + parseInt(invested);		
		parseInt(balanceOfMultisigUpdated).should.be.equal(investedTotal);
	}

	async function checkTokensBalance(addr, investment) {
		let crowdsaleTokenExt = await CrowdsaleTokenExt.deployed();
		let balance = await crowdsaleTokenExt.balanceOf.call(addr);
		balance.should.be.bignumber.equal(investment * 10**constants.token.decimals);
	}

	async function buySuccessfully(addr, val) {
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
    	await mintedTokenCappedCrowdsaleExt.buy({from: addr, value: val}).should.be.fulfilled;
	}

	async function buyRejected(addr, val) {
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
    	await mintedTokenCappedCrowdsaleExt.buy({from: addr, value: val}).should.be.rejected;
	}


	async function releaseVestedTokens(addr, reservedTokens,step) {	

		let tokenVesting = await TokenVesting.deployed();
		await tokenVesting.releaseVestedTokens(addr).should.be.fulfilled;
       
        let vestingMapAddress1 = await tokenVesting.vestingMap.call(addr);  
		assert.equal(utils.toFixed(vestingMapAddress1[5]), reservedTokens, 'Token amount Released in step '+ step +' should be '+vestingMapAddress1[5])
			
	}

	async function checkVestedTokensBalance(addr) {
		let crowdsaleTokenExt = await CrowdsaleTokenExt.deployed();
		let balance = await crowdsaleTokenExt.balanceOf.call(addr);
		assert.equal(utils.toFixed(balance), constants.reservedTokens.number, 'Verified balance')
	}


});