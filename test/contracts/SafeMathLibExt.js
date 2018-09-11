const SafeMathLibExt = artifacts.require("./SafeMathLibExt.sol");


contract('SafeMathLibExt', function(accounts) {
	it("should accurately multiply numbers", function() {
	    return SafeMathLibExt.deployed().then(function(instance) {
	      return instance.times.call(2,3);
	    }).then(function(res) {
	      assert.equal(res, 6, "2 * 3 is equal to 6");
	    });
	});

	it("should accurately divide numbers", function() {
	    return SafeMathLibExt.deployed().then(function(instance) {
	      return instance.divides.call(4,2);
	    }).then(function(res) {
	      assert.equal(res, 2, "4 / 2 is equal to 2");
	    });
	});

	it("should accurately subtract numbers", function() {
	    return SafeMathLibExt.deployed().then(function(instance) {
	      return instance.minus.call(3,2);
	    }).then(function(res) {
	      assert.equal(res, 1, "3 - 2 is equal to 1");
	    });
	});

	it("should accurately add numbers", function() {
	    return SafeMathLibExt.deployed().then(function(instance) {
	      return instance.plus.call(2,3);
	    }).then(function(res) {
	      assert.equal(res, 5, "2 + 3 is equal to 5");
	    });
	});
});