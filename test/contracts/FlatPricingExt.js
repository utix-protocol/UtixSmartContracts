const FlatPricingExt = artifacts.require("./FlatPricingExt.sol");
const MintedTokenCappedCrowdsaleExt = artifacts.require("./MintedTokenCappedCrowdsaleExt.sol");
const constants = require("../constants");
const ETHUSD = artifacts.require("./ETHUSD.sol");
const ERROR_MSG = 'VM Exception while processing transaction: invalid opcode';

require('chai')
.use(require('chai-as-promised'))
.use(require('chai-bignumber')(web3.BigNumber))
.should();

contract('FlatPricingExt', function(accounts) {
	it("should return rate of pricing strategy contract", async () => {
		let flatPricingExt = await FlatPricingExt.deployed();
		let rate = await flatPricingExt.oneTokenInCents.call();		
	    assert.equal(rate, 10, "rate should equal the value(token value in cents) we inserted before");
	});
	
	it("should reject update rate transaction (it can be done only from crowdsale contract)", async() => {
		let flatPricingExt = await FlatPricingExt.deployed();
		flatPricingExt.updateRate(15).should.be.rejected;
	});

	it("should reject set tier transaction (because we already set it)", async() => {
		let flatPricingExt = await FlatPricingExt.deployed();
		flatPricingExt.setTier(MintedTokenCappedCrowdsaleExt.address).should.be.rejected;
	});

	it("should return Eth in Cents", async() => {
		let flatPricingExt = await FlatPricingExt.deployed();
		let incents= await flatPricingExt.getEthInCents.call();
		console.log("getEthInCents : " + incents);
	});

	
	
});