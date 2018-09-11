const CrowdsaleTokenExt = artifacts.require("./CrowdsaleTokenExt.sol");
const MintedTokenCappedCrowdsaleExt = artifacts.require("./MintedTokenCappedCrowdsaleExt.sol");
const ReservedTokensFinalizeAgent = artifacts.require("./ReservedTokensFinalizeAgent.sol");
const FlatPricingExt = artifacts.require("./FlatPricingExt.sol");
const constants = require("../constants");
const utils = require("../utils");
const ERROR_MSG = 'VM Exception while processing transaction: invalid opcode';

const timeout = ms => new Promise(res => setTimeout(res, ms))

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(web3.BigNumber))
  .should();

let weiToSend1
let weiToSend2
let weiToSend3
let weiToSend4

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
	});

	it("shouldn't set finalize agent once more", async () => {
    	let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
    	let reservedTokensFinalizeAgent = await ReservedTokensFinalizeAgent.deployed();
    	await mintedTokenCappedCrowdsaleExt.setFinalizeAgent(reservedTokensFinalizeAgent.address).should.be.rejectedWith(ERROR_MSG);
	});

	it("shouldn't set pricing strategy once more", async () => {
    	let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
    	let flatPricingExt = await FlatPricingExt.deployed();
    	await mintedTokenCappedCrowdsaleExt.setPricingStrategy(flatPricingExt.address).should.be.rejectedWith(ERROR_MSG);
	});

	it("shouldn't update rate", async () => {
    	let newRate = 15;
    	let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
    	let flatPricingExt = await FlatPricingExt.deployed();
    	await mintedTokenCappedCrowdsaleExt.updateRate(newRate).should.be.rejectedWith(ERROR_MSG);
	});

	it("shouldn't update max cap", async () => {
    	let newMaxCap = 200000000 * 10**18;
    	let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
    	await mintedTokenCappedCrowdsaleExt.setMaximumSellableTokens(newMaxCap).should.be.rejectedWith(ERROR_MSG);
	});

	it("shouldn't set startsAt", async () => {
		let newStartsAt = parseInt(new Date().getTime()/1000);
    	let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
    	await mintedTokenCappedCrowdsaleExt.setStartsAt(newStartsAt).should.be.rejectedWith(ERROR_MSG);
	});

	it("should get last tier tier for crowdsale contract", async () => {
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
		let lastCrowdsale = await mintedTokenCappedCrowdsaleExt.getLastTier.call();
		mintedTokenCappedCrowdsaleExt.address.should.be.bignumber.equal(lastCrowdsale);
	});

	it("should get name of crowdsale", async () => {
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
		let name = await mintedTokenCappedCrowdsaleExt.name.call();
		name.should.be.equal("Test Crowdsale");
	});

	/*it("should update rate", async () => {
    	let newRate = 10**18 / 2000;
    	let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
    	let flatPricingExt = await FlatPricingExt.deployed();
    	await mintedTokenCappedCrowdsaleExt.updateRate(newRate);
    	let rate = await flatPricingExt.oneTokenInWei.call();
    	rate.should.be.bignumber.equal(newRate);
	});

	it("should update max cap", async () => {
    	let newMaxCap = 200000000 * 10**18;
    	let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
    	await mintedTokenCappedCrowdsaleExt.setMaximumSellableTokens(newMaxCap);
    	let maxCap = await mintedTokenCappedCrowdsaleExt.maximumSellableTokens.call();
    	maxCap.should.be.bignumber.equal(newMaxCap);
	});

	it("should update startsAt", async () => {
		let newStartsAt = parseInt(new Date().getTime()/1000);
    	let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
    	await mintedTokenCappedCrowdsaleExt.setStartsAt(newStartsAt);
    	let startsAt = await mintedTokenCappedCrowdsaleExt.startsAt.call();
    	startsAt.should.be.bignumber.equal(newStartsAt);
	});*/

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
    	let weiToSend = parseInt(constants.investments[0]*constants.rate, 10);
    	await buyRejected(accounts[1], weiToSend);
    });

	it("shouldn't accept investment from whitelisted user less than minCap", async () => {
    	let weiToSend = parseInt(constants.investments[0]*constants.rate, 10);
    	await buyRejected(accounts[2], weiToSend);
	});

	it("shouldn't accept investment from whitelisted user more than maxCap", async () => {
    	let weiToSend = parseInt(constants.investments[1]*constants.rate, 10);
    	await buyRejected(accounts[2], weiToSend);
	});

	balanceOfMultisigInitial = web3.eth.getBalance(accounts[3]);

	it("should accept buy from whitelisted user 1 within cap range", async () => { await buySuccessfully(accounts[2], weiToSend1) });

	it("should return updated balance of multisig", () => { checkUpdatedBalanceOfMultisig(weiToSend1) });

	it("should return correct token's balance of user", async () => { await checkTokensBalance(accounts[2], constants.investments[2]) });

	
	it("should accept buy from whitelisted user 2 within cap range", async () => { await buySuccessfully(accounts[4], weiToSend1) });

	it("should return updated balance of multisig", () => { checkUpdatedBalanceOfMultisig(2 * weiToSend1) });

	it("should return correct token's balance of user", async () => { await checkTokensBalance(accounts[4], constants.investments[2]) });

	
	it("should accept buy less than minCap at second buy", async () => { await buySuccessfully(accounts[2], weiToSend2) });

	it("should return updated balance of multisig", () => { checkUpdatedBalanceOfMultisig(2 * weiToSend1 + weiToSend2) });

	it("should return correct token's balance of user", async () => { await checkTokensBalance(accounts[2], constants.investments[2] + constants.investments[3]) });


	it("should accept buy of fractionated amount of tokens from whitelisted user within cap range", async () => { await buySuccessfully(accounts[2], weiToSend3) });

	it("should return updated balance of multisig", () => { checkUpdatedBalanceOfMultisig(2 * weiToSend1 + weiToSend2 + weiToSend3) });

	it("should return correct token's balance of user", async () => { await checkTokensBalance(accounts[2], constants.investments[2] + constants.investments[3] + constants.investments[4]) });

	
	it("shouldn't accept investment from whitelisted user that exceeds maxCap, when maxCap is not sold yet", async () => {
    	let weiToSend = parseInt(constants.investments[5]*constants.rate, 10);
    	await buyRejected(accounts[2], weiToSend);
	});

	it("should accept investment from whitelisted user that reaches maxCap", async () => { await buySuccessfully(accounts[2], weiToSend4) });

	it("should return updated balance of multisig", () => { checkUpdatedBalanceOfMultisig(2 * weiToSend1 + weiToSend2 + weiToSend3 + weiToSend4) });

	it("should return correct token's balance of user", async () => { await checkTokensBalance(accounts[2], constants.investments[2] + constants.investments[3] + constants.investments[4] + constants.investments[6]) });


	it("shouldn't accept investment from whitelisted user that exceeds maxCap, when maxCap is already sold", async () => {
    	let weiToSend = parseInt(constants.investments[0]*constants.rate, 10);
    	await buyRejected(accounts[2], weiToSend);
	});

	it("should get the count of whitelisted participants", async () => {
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
		let whitelistedParticipantsLength = await mintedTokenCappedCrowdsaleExt.whitelistedParticipantsLength.call();
		whitelistedParticipantsLength.should.be.bignumber.equal(2);
	});

	it("should get the whitelist participant from the array", async () => {
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
		let whitelistedParticipant = await mintedTokenCappedCrowdsaleExt.whitelistedParticipants.call(0);
		whitelistedParticipant.should.be.equal(accounts[2]);
	});

	it("should not allow adding the 0 address to the whitelist", async () => {
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
		const token = constants.token;
        const minCap = 1 * 10**token.decimals;
        const maxCap = 10 * 10**token.decimals;
        await mintedTokenCappedCrowdsaleExt.setEarlyParticipantWhitelist('0x0', true, minCap, maxCap, { from: accounts[0] }).should.be.rejectedWith(ERROR_MSG);;
	});

	it("should not allow adding an address to the whitelist with a minCap greater than the maxCap", async () => {
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
		const token = constants.token
        const minCap = 10 * 10**token.decimals
        const maxCap = 1 * 10**token.decimals
        await mintedTokenCappedCrowdsaleExt.setEarlyParticipantWhitelist(accounts[5], true, minCap, maxCap, { from: accounts[0] }).should.be.rejectedWith(ERROR_MSG);;
	});

	it("should not allow adding an address to the whitelist with a maxCap of 0", async () => {
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
		const token = constants.token
        const minCap = 0
        const maxCap = 0
        await mintedTokenCappedCrowdsaleExt.setEarlyParticipantWhitelist(accounts[5], true, minCap, maxCap, { from: accounts[0] }).should.be.rejectedWith(ERROR_MSG);;
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
		await mintedTokenCappedCrowdsaleExt.setEndsAt(parseInt((new Date()).getTime()/1000, {from: accounts[0]})).should.be.rejectedWith(ERROR_MSG);
	});

	it("can distribute reserved tokens shoul be true", async () => {
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
		let canDistributeReservedTokens = await mintedTokenCappedCrowdsaleExt.canDistributeReservedTokens.call();
		true.should.be.equal(canDistributeReservedTokens);
	});

	it("should fail finalize", async () => {
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
		await mintedTokenCappedCrowdsaleExt.finalize().should.be.rejectedWith(ERROR_MSG);
	});

	it("should fail distribution of reserved tokens with 0 batch", async () => {
		let mintedTokenCappedCrowdsaleExt = await MintedTokenCappedCrowdsaleExt.deployed();
		await mintedTokenCappedCrowdsaleExt.distributeReservedTokens(0).should.be.rejectedWith(ERROR_MSG);
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
		await mintedTokenCappedCrowdsaleExt.finalize().should.be.rejectedWith(ERROR_MSG);
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
		await mintedTokenCappedCrowdsaleExt.distributeReservedTokens(1).should.be.rejectedWith(ERROR_MSG);
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

	let user1Investment = (constants.investments[2] + constants.investments[3] + constants.investments[4] + constants.investments[6]) * 10**constants.token.decimals
	let user2Investment = (constants.investments[2]) * 10**constants.token.decimals
	let usersInvestment = user1Investment + user2Investment

	it("should return updated token balance of user 1 including reserved tokens", async () => {
		let crowdsaleTokenExt = await CrowdsaleTokenExt.deployed();
		let tokenBalance = await crowdsaleTokenExt.balanceOf.call(accounts[2]);
		let tokenBalancePattern = user1Investment + usersInvestment * constants.reservedTokens.percentageUnit / 10**constants.reservedTokens.percentageDecimals / 100;
		tokenBalancePattern += constants.reservedTokens.number;
		tokenBalancePattern.should.be.bignumber.equal(tokenBalance);
	});

	it("should return updated token balance of user 2 including reserved tokens", async () => {
		let crowdsaleTokenExt = await CrowdsaleTokenExt.deployed();
		let tokenBalance  = await crowdsaleTokenExt.balanceOf.call(accounts[4]);
		let tokenBalancePattern = user2Investment +  usersInvestment * constants.reservedTokens2.percentageUnit / 10**constants.reservedTokens2.percentageDecimals / 100;
		tokenBalancePattern += constants.reservedTokens2.number;
		tokenBalancePattern.should.be.bignumber.equal(tokenBalance);
	});

	function checkUpdatedBalanceOfMultisig(invested) {
		let balanceOfMultisigUpdated = web3.eth.getBalance(accounts[3]);
		let investedTotal = parseInt(balanceOfMultisigInitial, 10) + parseInt(invested);
		balanceOfMultisigUpdated.should.be.bignumber.equal(investedTotal);
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
    	await mintedTokenCappedCrowdsaleExt.buy({from: addr, value: val}).should.be.rejectedWith(ERROR_MSG);
	}
});