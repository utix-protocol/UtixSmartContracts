/**
 * This smart contract code is Copyright 2017 TokenMarket Ltd. For more information see https://tokenmarket.net
 *
 * Licensed under the Apache License, version 2.0: https://github.com/TokenMarketNet/ico/blob/master/LICENSE.txt
 */

pragma solidity 0.4.24;


/**
 * Finalize agent defines what happens at the end of succeseful crowdsale.
 *
 * - Allocate tokens for founders, bounties and community
 * - Make tokens transferable
 * - etc.
 */
contract FinalizeAgent {

    bool public reservedTokensAreDistributed = false;

    function isFinalizeAgent() public pure returns(bool) {
        return true;
    }

    /** Return true if we can run finalizeCrowdsale() properly.
    *
    * This is a safety check function that doesn't allow crowdsale to begin
    * unless the finalizer has been set up properly.
    */
    function isSane() public view returns (bool);

    function distributeReservedTokens(uint reservedTokensDistributionBatch) public;

    /** Called once by crowdsale finalize() if the sale was success. */
    function finalizeCrowdsale() public;
    
    /**
    * Allow to (re)set Token.
    */
    function setCrowdsaleTokenExtv1(address _token) public;
}