const CrowdsaleTokenExt = artifacts.require("./CrowdsaleTokenExt.sol");
const MintedTokenCappedCrowdsaleExt = artifacts.require("./MintedTokenCappedCrowdsaleExt.sol");
const ReservedTokensFinalizeAgent = artifacts.require("./ReservedTokensFinalizeAgent.sol");
const ERROR_MSG = 'VM Exception while processing transaction: invalid opcode';

const constants = require("../constants");
const utils = require("../utils");

require('chai')
.use(require('chai-as-promised'))
.use(require('chai-bignumber')(web3.BigNumber))
.should();

contract('CrowdsaleTokenExt', function(accounts) {

	it('should reject setReservedTokensListMultiple another call', async () => {
		let crowdsaleTokenExt = await CrowdsaleTokenExt.deployed();
		await crowdsaleTokenExt.setReservedTokensListMultiple(
			[accounts[3]], 
	  		[constants.reservedTokens.number], 
	  		[constants.reservedTokens.percentageUnit,], 
			  [constants.reservedTokens.percentageDecimals],
			  [true]
  		).should.be.rejectedWith(ERROR_MSG);
	})

	it("should get number of reserved tokens for investor : " + constants.reservedTokens.number, function() {
		return CrowdsaleTokenExt.deployed().then(function(instance) {
	    	return instance.getReservedTokens.call(accounts[3]);
	    }).then(function(res) {
	    	assert.equal(utils.toFixed(res), constants.reservedTokens.number, "`getReservedTokens` method returns absolute investor's reserved tokens");
	    });
	});

	
	it("should get reserved tokens in percentage unit for investor : " + constants.reservedTokens.percentageUnit, function() {
		return CrowdsaleTokenExt.deployed().then(function(instance) {
	    	return instance.getReservedPercentageUnit.call(accounts[3]);
	    }).then(function(res) {
	    	assert.equal(res, constants.reservedTokens.percentageUnit, "`getReservedPercentageUnit` method returns investor's reserved tokens in percentage unit");
	    });
	});

	
	it("should get mint agent: crowdsale contract", function() {
		return CrowdsaleTokenExt.deployed().then(function(instance) {
	    	return instance.mintAgents.call(MintedTokenCappedCrowdsaleExt.address);
	    }).then(function(res) {
	    	assert.equal(res, true, "Crowdsale contract should be in minAgents of token contract");
	    });
	});

	it("should get mint agent: ReservedTokensFinalizeAgent contract", function() {
		return CrowdsaleTokenExt.deployed().then(function(instance) {
	    	return instance.mintAgents.call(ReservedTokensFinalizeAgent.address);
	    }).then(function(res) {
	    	assert.equal(res, true, "ReservedTokensFinalizeAgent contract should be in minAgents of token contract");
	    });
	});

	it("should get release agent", function() {
		return CrowdsaleTokenExt.deployed().then(function(instance) {
	    	return instance.releaseAgent.call();
	    }).then(function(res) {
	    	assert.equal(res, ReservedTokensFinalizeAgent.address, "ReservedTokensFinalizeAgent contract should be the releaseAgent of token contract");
	    });
	});


    it("should allow claiming tokens", function() {
		const owner = accounts[0]

		const whenToken1 = CrowdsaleTokenExt.new("TestToken1", "TT1", 100, 0, false, 0)
		const whenToken2 = CrowdsaleTokenExt.new("TestToken2", "TT2", 100, 0, false, 0)

		return Promise.all([whenToken1, whenToken2]).then(([token1, token2]) => {
			return Promise.resolve()
				// first, owner has all TT1 tokens
				.then(() => token1.balanceOf(owner))
				.then(balance => assert.equal(balance, 100))
				.then(() => token1.balanceOf(token2.address))
				.then(balance => assert.equal(balance, 0))
				// owner transfers 25 TT1 to token2 address by mistake
				.then(() => token1.setReleaseAgent(owner))
				.then(() => token1.releaseTokenTransfer())
				.then(() => token1.transfer(token2.address, 25))
				// now owner has 75 tokens and token2 has 25
				.then(() => token1.balanceOf(owner))
				.then(balance => assert.equal(balance, 75))
				.then(() => token1.balanceOf(token2.address))
				.then(balance => assert.equal(balance, 25))
				// owner claims TT1 tokens in token2
				.then(() => token2.claimTokens(token1.address))
				// the tokens are transferred
				.then(() => token1.balanceOf(token2.address))
				.then(balance => assert.equal(balance, 0))
				.then(() => token1.balanceOf(owner))
				.then(balance => assert.equal(balance, 100))
		})
    })
});