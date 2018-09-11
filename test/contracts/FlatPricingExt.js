const FlatPricingExt = artifacts.require("./FlatPricingExt.sol");
const MintedTokenCappedCrowdsaleExt = artifacts.require("./MintedTokenCappedCrowdsaleExt.sol");
const constants = require("../constants");
const ERROR_MSG = 'VM Exception while processing transaction: invalid opcode';

const Web3 = require("web3");

let web3;
if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
}

contract('FlatPricingExt', function(accounts) {
	it("should return rate of pricing strategy contract", async () => {
		let flatPricingExt = await FlatPricingExt.deployed();
		let rate = await flatPricingExt.oneTokenInCents.call();		
	    assert.equal(rate, 10, "rate should equal the value(token value in cents) we inserted before");
	});

	it("should reject update rate transaction (it can be done only from crowdsale contract)", async() => {
		let flatPricingExt = await FlatPricingExt.deployed();
		flatPricingExt.updateRate(15).should.be.rejectedWith(ERROR_MSG);
	});

	it("should reject set tier transaction (because we already set it)", async() => {
		let flatPricingExt = await FlatPricingExt.deployed();
		flatPricingExt.setTier(MintedTokenCappedCrowdsaleExt.address).should.be.rejectedWith(ERROR_MSG);
	});
});