const utils = require("./utils");

const token = {
  "ticker": "UTX",
  "name": "Utix",
  "decimals": 18,
  "supply": 0,
  "isMintable": true,
  "globalmincap": 0,
  "oldtokenaddress": "0xf290bbd220864711c5bc5153265d64a3d6d864c7",
  "originalSupply":utils.toFixed(30000 * 10 ** 18),
};

const reservedTokens = {
  number: utils.toFixed(70000000 * 10**token.decimals),
  percentageUnit: 0,
  percentageDecimals: 0,
  isReserved: true
};

const reservedTokens2 = {
  number: utils.toFixed(200 * 10**token.decimals),
  percentageUnit: 0,
  percentageDecimals: 0,
  isReserved: true
};

const reservedTokens3 = {
  number: utils.toFixed(350 * 10**token.decimals),
  percentageUnit: 0,
  percentageDecimals: 0,
  isReserved: true
};
const reservedTokens4 = {
  number: utils.toFixed(75 * 10**token.decimals),
  percentageUnit: 0,
  percentageDecimals: 0,
  isReserved: true
};

const whiteListItem = {
  status: true,
  minCap: utils.toFixed(1 * 10**token.decimals),
  maxCap: utils.toFixed(1000 * 10**token.decimals),
};

const whiteListItem2 = {
  status: true,
  minCap: utils.toFixed(1 * 10**token.decimals),
  maxCap: utils.toFixed(20 * 10**token.decimals),
};

const investments = [0.5, 11, 1, 0.5, 5.5, 4, 3];

const investments2 = [0.5, 21, 1, 0.5, 5.5, 14, 3, 10];

const startCrowdsale = parseInt(new Date().getTime()/1000);
let endCrowdsale = new Date().setDate(new Date().getDate() + 214);
endCrowdsale = parseInt(new Date(endCrowdsale).setUTCHours(0)/1000);

let startCrowdsale2 = endCrowdsale;
let endCrowdsale2 = new Date().setDate(new Date().getDate() + 8);
endCrowdsale2 = parseInt(new Date(endCrowdsale2).setUTCHours(0)/1000);

const crowdsale = {
  "start": startCrowdsale,
  "end": endCrowdsale,
  "minimumFundingGoal": 0,
  "maximumSellableTokens": utils.toFixed(180000000 * 10**token.decimals),
  "isUpdatable": true,
  "isWhiteListed": true
}

const crowdsaleMultiple = [{
  "start": startCrowdsale,
  "end": endCrowdsale,
  "minimumFundingGoal": 0,
  "maximumSellableTokens": utils.toFixed(1000000 * 10**token.decimals),
  "isUpdatable": true,
  "isWhiteListed": true
},{"start": startCrowdsale2,
  "end": endCrowdsale2,
  "minimumFundingGoal": 0,
  "maximumSellableTokens": utils.toFixed(1000000 * 10**token.decimals),
  "isUpdatable": true,
  "isWhiteListed": true}]

const pricingStrategy = {
  "rate1": 7500,        //Noof tokens per ether
  "rate1TokenMin": 0,
  "rate1TokenMax": 25000000,
  "rate2": 5625,
  "rate2TokenMin": 25000000,
  "rate2TokenMax": 80000000,
  "rate3": 5000,
  "rate3TokenMin": 80000000,
  "rate3TokenMax": 120000000,
  "rate4": 4736,
  "rate4TokenMin": 120000000,
  "rate4TokenMax": 140000000,
  "rate5": 4500,
  "rate5TokenMin": 140000000  
};

const pricingStrategyMultiple = [{
  "rate": 1000
},{
  "rate": 1000
}];

module.exports = {
  token,
  reservedTokens,
  reservedTokens2,
  reservedTokens3,
  reservedTokens4,
  investments,
  investments2,
  whiteListItem,
  whiteListItem2,
  crowdsale,
  crowdsaleMultiple,
  pricingStrategy,
  pricingStrategyMultiple
}