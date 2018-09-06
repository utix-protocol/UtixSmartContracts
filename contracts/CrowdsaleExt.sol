/**
 * This smart contract code is Copyright 2017 TokenMarket Ltd. For more information see https://tokenmarket.net
 *
 * Licensed under the Apache License, version 2.0: https://github.com/TokenMarketNet/ico/blob/master/LICENSE.txt
 */

pragma solidity 0.4.24;

import "./SafeMathLibExt.sol";
import "./Haltable.sol";
import "./PricingStrategy.sol";
import "./FinalizeAgent.sol";
import "./FractionalERC20Ext.sol";
import "./TokenVesting.sol";
import "./Allocatable.sol";


/**
 * Abstract base contract for token sales.
 *
 * Handle
 * - start and end dates
 * - accepting investments
 * - minimum funding goal and refund
 * - various statistics during the crowdfund
 * - different pricing strategies
 * - different investment policies (require server side customer id, allow only whitelisted addresses)
 *
 */
contract CrowdsaleExt is Allocatable, Haltable {

    /* Max investment count when we are still allowed to change the multisig address */
    uint public MAX_INVESTMENTS_BEFORE_MULTISIG_CHANGE = 5;

    using SafeMathLibExt for uint;

    /* The token we are selling */
    FractionalERC20Ext public token;

    /* How we are going to price our offering */
    PricingStrategy public pricingStrategy;

    /* Post-success callback */
    FinalizeAgent public finalizeAgent;

    TokenVesting public tokenVesting;

    /* name of the crowdsale tier */
    string public name;

    /* tokens will be transfered from this address */
    address public multisigWallet;

    /* if the funding goal is not reached, investors may withdraw their funds */
    uint public minimumFundingGoal;

    /* the UNIX timestamp start date of the crowdsale */
    uint public startsAt;

    /* the UNIX timestamp end date of the crowdsale */
    uint public endsAt;

    /* the number of tokens already sold through this contract*/
    uint public tokensSold = 0;

    /* How many wei of funding we have raised */
    uint public weiRaised = 0;

    /* How many distinct addresses have invested */
    uint public investorCount = 0;

    /* Has this crowdsale been finalized */
    bool public finalized;

    bool public isWhiteListed;

      /* Token Vesting Contract */
    address public tokenVestingAddress;

    address[] public joinedCrowdsales;
    uint8 public joinedCrowdsalesLen = 0;
    uint8 public joinedCrowdsalesLenMax = 50;

    struct JoinedCrowdsaleStatus {
        bool isJoined;
        uint8 position;
    }

    mapping (address => JoinedCrowdsaleStatus) public joinedCrowdsaleState;

    /** How much ETH each address has invested to this crowdsale */
    mapping (address => uint256) public investedAmountOf;

    /** How much tokens this crowdsale has credited for each investor address */
    mapping (address => uint256) public tokenAmountOf;

    struct WhiteListData {
        bool status;
        uint minCap;
        uint maxCap;
    }

    //is crowdsale updatable
    bool public isUpdatable;

    /** Addresses that are allowed to invest even before ICO offical opens. For testing, for ICO partners, etc. */
    mapping (address => WhiteListData) public earlyParticipantWhitelist;

    /** List of whitelisted addresses */
    address[] public whitelistedParticipants;

    /** This is for manul testing for the interaction from owner wallet. 
    You can set it to any value and inspect this in blockchain explorer to see that crowdsale interaction works. */
    uint public ownerTestValue;

    /** State machine
    *
    * - Preparing: All contract initialization calls and variables have not been set yet
    * - Prefunding: We have not passed start time yet
    * - Funding: Active crowdsale
    * - Success: Minimum funding goal reached
    * - Failure: Minimum funding goal not reached before ending time
    * - Finalized: The finalized has been called and succesfully executed
    */
    enum State { Unknown, Preparing, PreFunding, Funding, Success, Failure, Finalized }

    // A new investment was made
    event Invested(address investor, uint weiAmount, uint tokenAmount, uint128 customerId);

    // Address early participation whitelist status changed
    event Whitelisted(address addr, bool status, uint minCap, uint maxCap);
    event WhitelistItemChanged(address addr, bool status, uint minCap, uint maxCap);

    // Crowdsale start time has been changed
    event StartsAtChanged(uint newStartsAt);

    // Crowdsale end time has been changed
    event EndsAtChanged(uint newEndsAt);

    constructor(string _name, address _token, PricingStrategy _pricingStrategy, 
    address _multisigWallet, uint _start, uint _end, 
    uint _minimumFundingGoal, bool _isUpdatable, 
    bool _isWhiteListed, address _tokenVestingAddress) public {

        owner = msg.sender;

        name = _name;

        tokenVestingAddress = _tokenVestingAddress;

        token = FractionalERC20Ext(_token);

        setPricingStrategy(_pricingStrategy);

        multisigWallet = _multisigWallet;
        if (multisigWallet == 0) {
            revert();
        }

        if (_start == 0) {
            revert();
        }

        startsAt = _start;

        if (_end == 0) {
            revert();
        }

        endsAt = _end;

        // Don't mess the dates
        if (startsAt >= endsAt) {
            revert();
        }

        // Minimum funding goal can be zero
        minimumFundingGoal = _minimumFundingGoal;

        isUpdatable = _isUpdatable;

        isWhiteListed = _isWhiteListed;
    }

    /**
    * Don't expect to just send in money and get tokens.
    */
    function() external payable {
        buy();
    }

    /**
    * The basic entry point to participate the crowdsale process.
    *
    * Pay for funding, get invested tokens back in the sender address.
    */
    function buy() public payable {
        invest(msg.sender);
    }

    /**
    * Allow anonymous contributions to this crowdsale.
    */
    function invest(address addr) public payable {
        investInternal(addr, 0);
    }

    /**
    * Make an investment.
    *
    * Crowdsale must be running for one to invest.
    * We must have not pressed the emergency brake.
    *
    * @param receiver The Ethereum address who receives the tokens
    * @param customerId (optional) UUID v4 to track the successful payments on the server side
    *
    */
    function investInternal(address receiver, uint128 customerId) private stopInEmergency {

        // Determine if it's a good time to accept investment from this participant
        if (getState() == State.PreFunding) {
            // Are we whitelisted for early deposit
            revert();
        } else if (getState() == State.Funding) {
            // Retail participants can only come in when the crowdsale is running
            // pass
            if (isWhiteListed) {
                if (!earlyParticipantWhitelist[receiver].status) {
                    revert();
                }
            }
        } else {
            // Unwanted state
            revert();
        }

        uint weiAmount = msg.value;

        // Account presale sales separately, so that they do not count against pricing tranches
        uint tokenAmount = pricingStrategy.calculatePrice(weiAmount, tokensSold, token.decimals());

        if (tokenAmount == 0) {
          // Dust transaction
            revert();
        }

        if (isWhiteListed) {
            if (weiAmount < earlyParticipantWhitelist[receiver].minCap && tokenAmountOf[receiver] == 0) {
              // weiAmount < minCap for investor
                revert();
            }

            // Check that we did not bust the investor's cap
            if (isBreakingInvestorCap(receiver, weiAmount)) {
                revert();
            }

            updateInheritedEarlyParticipantWhitelist(receiver, weiAmount);
        } else {
            if (weiAmount < token.minCap() && tokenAmountOf[receiver] == 0) {
                revert();
            }
        }

        if (investedAmountOf[receiver] == 0) {
          // A new investor
            investorCount++;
        }

        // Update investor
        investedAmountOf[receiver] = investedAmountOf[receiver].plus(weiAmount);
        tokenAmountOf[receiver] = tokenAmountOf[receiver].plus(tokenAmount);

        // Update totals
        weiRaised = weiRaised.plus(weiAmount);
        tokensSold = tokensSold.plus(tokenAmount);

        // Check that we did not bust the cap
        if (isBreakingCap(tokensSold)) {
            revert();
        }

        assignTokens(receiver, tokenAmount);

        // Pocket the money
        if (!multisigWallet.send(weiAmount)) revert();

        // Tell us invest was success
        emit Invested(receiver, weiAmount, tokenAmount, customerId);
    }

    /**
    * allocate tokens for the early investors.
    *
    * Preallocated tokens have been sold before the actual crowdsale opens.
    * This function mints the tokens and moves the crowdsale needle.
    *
    * Investor count is not handled; it is assumed this goes for multiple investors
    * and the token distribution happens outside the smart contract flow.
    *
    * No money is exchanged, as the crowdsale team already have received the payment.
    *
    * param weiPrice Price of a single full token in wei
    *
    */
    function allocate(address receiver, uint256 tokenAmount, uint128 customerId, uint256 lockedTokenAmount) public onlyAllocateAgent {

      // cannot lock more than total tokens
        require(lockedTokenAmount <= tokenAmount);
        uint weiPrice = pricingStrategy.oneTokenInWei(tokensSold, token.decimals());
        // This can be also 0, we give out tokens for free
        uint256 weiAmount = (weiPrice * tokenAmount)/10**uint256(token.decimals());         

        weiRaised = weiRaised.plus(weiAmount);
        tokensSold = tokensSold.plus(tokenAmount);

        investedAmountOf[receiver] = investedAmountOf[receiver].plus(weiAmount);
        tokenAmountOf[receiver] = tokenAmountOf[receiver].plus(tokenAmount);

        // assign locked token to Vesting contract
        if (lockedTokenAmount > 0) {
            tokenVesting = TokenVesting(tokenVestingAddress);
            // to prevent minting of tokens which will be useless as vesting amount cannot be updated
            require(!tokenVesting.isVestingSet(receiver));
            assignTokens(tokenVestingAddress, lockedTokenAmount);
            // set vesting with default schedule
            tokenVesting.setVestingWithDefaultSchedule(receiver, lockedTokenAmount); 
        }

        // assign remaining tokens to contributor
        if (tokenAmount - lockedTokenAmount > 0) {
            assignTokens(receiver, tokenAmount - lockedTokenAmount);
        }

        // Tell us invest was success
        emit Invested(receiver, weiAmount, tokenAmount, customerId);
    }

    //
    // Modifiers
    //
    /** Modified allowing execution only if the crowdsale is currently running.  */

    modifier inState(State state) {
        if (getState() != state) 
            revert();
        _;
    }

    function distributeReservedTokens(uint reservedTokensDistributionBatch) 
    public inState(State.Success) onlyOwner stopInEmergency {
      // Already finalized
        if (finalized) {
            revert();
        }

        // Finalizing is optional. We only call it if we are given a finalizing agent.
        if (address(finalizeAgent) != address(0)) {
            finalizeAgent.distributeReservedTokens(reservedTokensDistributionBatch);
        }
    }

    function areReservedTokensDistributed() public view returns (bool) {
        return finalizeAgent.reservedTokensAreDistributed();
    }

    function canDistributeReservedTokens() public view returns(bool) {
        CrowdsaleExt lastTierCntrct = CrowdsaleExt(getLastTier());
        if ((lastTierCntrct.getState() == State.Success) &&
        !lastTierCntrct.halted() && !lastTierCntrct.finalized() && !lastTierCntrct.areReservedTokensDistributed())
            return true;
        return false;
    }

    /**
    * Finalize a succcesful crowdsale.
    *
    * The owner can triggre a call the contract that provides post-crowdsale actions, like releasing the tokens.
    */
    function finalize() public inState(State.Success) onlyOwner stopInEmergency {

      // Already finalized
        if (finalized) {
            revert();
        }

      // Finalizing is optional. We only call it if we are given a finalizing agent.
        if (address(finalizeAgent) != address(0)) {
            finalizeAgent.finalizeCrowdsale();
        }

        finalized = true;
    }

    /**
    * Allow to (re)set finalize agent.
    *
    * Design choice: no state restrictions on setting this, so that we can fix fat finger mistakes.
    */
    function setFinalizeAgent(FinalizeAgent addr) public onlyOwner {
        assert(address(addr) != address(0));
        assert(address(finalizeAgent) == address(0));
        finalizeAgent = addr;

        // Don't allow setting bad agent
        if (!finalizeAgent.isFinalizeAgent()) {
            revert();
        }
    }

    /**
    * Allow addresses to do early participation.
    */
    function setEarlyParticipantWhitelist(address addr, bool status, uint minCap, uint maxCap) public onlyOwner {
        if (!isWhiteListed) revert();
        assert(addr != address(0));
        assert(maxCap > 0);
        assert(minCap <= maxCap);
        assert(now <= endsAt);

        if (!isAddressWhitelisted(addr)) {
            whitelistedParticipants.push(addr);
            emit Whitelisted(addr, status, minCap, maxCap);
        } else {
            emit WhitelistItemChanged(addr, status, minCap, maxCap);
        }

        earlyParticipantWhitelist[addr] = WhiteListData({status:status, minCap:minCap, maxCap:maxCap});
    }

    function setEarlyParticipantWhitelistMultiple(address[] addrs, bool[] statuses, uint[] minCaps, uint[] maxCaps) 
    public onlyOwner {
        if (!isWhiteListed) revert();
        assert(now <= endsAt);
        assert(addrs.length == statuses.length);
        assert(statuses.length == minCaps.length);
        assert(minCaps.length == maxCaps.length);
        for (uint iterator = 0; iterator < addrs.length; iterator++) {
            setEarlyParticipantWhitelist(addrs[iterator], statuses[iterator], minCaps[iterator], maxCaps[iterator]);
        }
    }

    function updateEarlyParticipantWhitelist(address addr, uint weiAmount) public {
        if (!isWhiteListed) revert();
        assert(addr != address(0));
        assert(now <= endsAt);
        assert(isTierJoined(msg.sender));
        if (weiAmount < earlyParticipantWhitelist[addr].minCap && tokenAmountOf[addr] == 0) revert();
        //if (addr != msg.sender && contractAddr != msg.sender) throw;
        uint newMaxCap = earlyParticipantWhitelist[addr].maxCap;
        newMaxCap = newMaxCap.minus(weiAmount);
        earlyParticipantWhitelist[addr] = WhiteListData({status:earlyParticipantWhitelist[addr].status, minCap:0, maxCap:newMaxCap});
    }

    function updateInheritedEarlyParticipantWhitelist(address reciever, uint weiAmount) private {
        if (!isWhiteListed) revert();
        if (weiAmount < earlyParticipantWhitelist[reciever].minCap && tokenAmountOf[reciever] == 0) revert();

        uint8 tierPosition = getTierPosition(this);

        for (uint8 j = tierPosition + 1; j < joinedCrowdsalesLen; j++) {
            CrowdsaleExt crowdsale = CrowdsaleExt(joinedCrowdsales[j]);
            crowdsale.updateEarlyParticipantWhitelist(reciever, weiAmount);
        }
    }

    function isAddressWhitelisted(address addr) public view returns(bool) {
        for (uint i = 0; i < whitelistedParticipants.length; i++) {
            if (whitelistedParticipants[i] == addr) {
                return true;
                break;
            }
        }

        return false;
    }

    function whitelistedParticipantsLength() public view returns (uint) {
        return whitelistedParticipants.length;
    }

    function isTierJoined(address addr) public view returns(bool) {
        return joinedCrowdsaleState[addr].isJoined;
    }

    function getTierPosition(address addr) public view returns(uint8) {
        return joinedCrowdsaleState[addr].position;
    }

    function getLastTier() public view returns(address) {
        if (joinedCrowdsalesLen > 0)
            return joinedCrowdsales[joinedCrowdsalesLen - 1];
        else
            return address(0);
    }

    function setJoinedCrowdsales(address addr) private onlyOwner {
        assert(addr != address(0));
        assert(joinedCrowdsalesLen <= joinedCrowdsalesLenMax);
        assert(!isTierJoined(addr));
        joinedCrowdsales.push(addr);
        joinedCrowdsaleState[addr] = JoinedCrowdsaleStatus({
            isJoined: true,
            position: joinedCrowdsalesLen
        });
        joinedCrowdsalesLen++;
    }

    function updateJoinedCrowdsalesMultiple(address[] addrs) public onlyOwner {
        assert(addrs.length > 0);
        assert(joinedCrowdsalesLen == 0);
        assert(addrs.length <= joinedCrowdsalesLenMax);
        for (uint8 iter = 0; iter < addrs.length; iter++) {
            setJoinedCrowdsales(addrs[iter]);
        }
    }

    function setStartsAt(uint time) public onlyOwner {
        assert(!finalized);
        assert(isUpdatable);
        assert(now <= time); // Don't change past
        assert(time <= endsAt);
        assert(now <= startsAt);

        CrowdsaleExt lastTierCntrct = CrowdsaleExt(getLastTier());
        if (lastTierCntrct.finalized()) revert();

        uint8 tierPosition = getTierPosition(this);

        //start time should be greater then end time of previous tiers
        for (uint8 j = 0; j < tierPosition; j++) {
            CrowdsaleExt crowdsale = CrowdsaleExt(joinedCrowdsales[j]);
            assert(time >= crowdsale.endsAt());
        }

        startsAt = time;
        emit StartsAtChanged(startsAt);
    }

    /**
    * Allow crowdsale owner to close early or extend the crowdsale.
    *
    * This is useful e.g. for a manual soft cap implementation:
    * - after X amount is reached determine manual closing
    *
    * This may put the crowdsale to an invalid state,
    * but we trust owners know what they are doing.
    *
    */
    function setEndsAt(uint time) public onlyOwner {
        assert(!finalized);
        assert(isUpdatable);
        assert(now <= time);// Don't change past
        assert(startsAt <= time);
        assert(now <= endsAt);

        CrowdsaleExt lastTierCntrct = CrowdsaleExt(getLastTier());
        if (lastTierCntrct.finalized()) revert();


        uint8 tierPosition = getTierPosition(this);

        for (uint8 j = tierPosition + 1; j < joinedCrowdsalesLen; j++) {
            CrowdsaleExt crowdsale = CrowdsaleExt(joinedCrowdsales[j]);
            assert(time <= crowdsale.startsAt());
        }

        endsAt = time;
        emit EndsAtChanged(endsAt);
    }

    /**
    * Allow to (re)set pricing strategy.
    *
    * Design choice: no state restrictions on the set, so that we can fix fat finger mistakes.
    */
    function setPricingStrategy(PricingStrategy _pricingStrategy) public onlyOwner {
        assert(address(_pricingStrategy) != address(0));
        assert(address(pricingStrategy) == address(0));
        pricingStrategy = _pricingStrategy;

        // Don't allow setting bad agent
        if (!pricingStrategy.isPricingStrategy()) {
            revert();
        }
    }

    /**
    * Allow to (re)set Token.
    * @param _token upgraded token address
    */
    function setCrowdsaleTokenExtv1(address _token) public onlyOwner {
        assert(_token != address(0));
        token = FractionalERC20Ext(_token);
        
        if (address(finalizeAgent) != address(0)) {
            finalizeAgent.setCrowdsaleTokenExtv1(_token);
        }
    }

    /**
    * Allow to change the team multisig address in the case of emergency.
    *
    * This allows to save a deployed crowdsale wallet in the case the crowdsale has not yet begun
    * (we have done only few test transactions). After the crowdsale is going
    * then multisig address stays locked for the safety reasons.
    */
    function setMultisig(address addr) public onlyOwner {

      // Change
        if (investorCount > MAX_INVESTMENTS_BEFORE_MULTISIG_CHANGE) {
            revert();
        }

        multisigWallet = addr;
    }

    /**
    * @return true if the crowdsale has raised enough money to be a successful.
    */
    function isMinimumGoalReached() public view returns (bool reached) {
        return weiRaised >= minimumFundingGoal;
    }

    /**
    * Check if the contract relationship looks good.
    */
    function isFinalizerSane() public view returns (bool sane) {
        return finalizeAgent.isSane();
    }

    /**
    * Check if the contract relationship looks good.
    */
    function isPricingSane() public view returns (bool sane) {
        return pricingStrategy.isSane();
    }

    /**
    * Crowdfund state machine management.
    *
    * We make it a function and do not assign the result to a variable, 
    * so there is no chance of the variable being stale.
    */
    function getState() public view returns (State) {
        if(finalized) return State.Finalized;
        else if (address(finalizeAgent) == 0) return State.Preparing;
        else if (!finalizeAgent.isSane()) return State.Preparing;
        else if (!pricingStrategy.isSane()) return State.Preparing;
        else if (block.timestamp < startsAt) return State.PreFunding;
        else if (block.timestamp <= endsAt && !isCrowdsaleFull()) return State.Funding;
        else if (isMinimumGoalReached()) return State.Success;
        else return State.Failure;
    }

    /** Interface marker. */
    function isCrowdsale() public pure returns (bool) {
        return true;
    }

    //
    // Abstract functions
    //

    /**
    * Check if the current invested breaks our cap rules.
    *
    *
    * The child contract must define their own cap setting rules.
    * We allow a lot of flexibility through different capping strategies (ETH, token count)
    * Called from invest().
    *  
    * @param tokensSoldTotal What would be our total sold tokens count after this transaction
    *
    * @return true if taking this investment would break our cap rules
    */
    function isBreakingCap(uint tokensSoldTotal) public view returns (bool limitBroken);

    function isBreakingInvestorCap(address receiver, uint tokenAmount) public view returns (bool limitBroken);

    /**
    * Check if the current crowdsale is full and we can no longer sell any tokens.
    */
    function isCrowdsaleFull() public view returns (bool);

    /**
    * Create new tokens or transfer issued tokens to the investor depending on the cap model.
    */
    function assignTokens(address receiver, uint tokenAmount) private;
}
