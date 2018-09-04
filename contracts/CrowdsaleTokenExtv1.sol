/**
 * This smart contract code is Copyright 2017 TokenMarket Ltd. For more information see https://tokenmarket.net
 *
 * Licensed under the Apache License, version 2.0: https://github.com/TokenMarketNet/ico/blob/master/LICENSE.txt
 */

pragma solidity 0.4.24;

import "./CrowdsaleTokenExt.sol";


/**
 * A crowdsaled token.
 *
 * An ERC-20 token designed specifically for crowdsales with investor protection and further development path.
 *
 * - The token transfer() is disabled until the crowdsale is over
 * - The token contract gives an opt-in upgrade path to a new contract
 * - The same token can be part of several crowdsales through approve() mechanism
 * - The token can be capped (supply set in the constructor) or uncapped (crowdsale contract can mint new tokens)
 *
 */
contract CrowdsaleTokenExtv1 is CrowdsaleTokenExt {

    uint public originalSupply;

    address public oldTokenAddress;

    bool public isUpgradeAgent = false;
    /**
    * Construct the token.
    *
    * This token must be created through a team multisig wallet, so that it is owned by that wallet.
    *
    * @param _name Token name
    * @param _symbol Token symbol - should be all caps
    * @param _initialSupply How many tokens we start with
    * @param _decimals Number of decimal places
    * @param _mintable Are new tokens created over the crowdsale or do we distribute only the initial supply? 
    * Note that when the token becomes transferable the minting always ends.
    */
    constructor(string _name, string _symbol, uint _initialSupply, uint _decimals, bool _mintable, 
    uint _globalMinCap, address _oldTokenAddress, uint _originalSupply) 
    public CrowdsaleTokenExt(_name, _symbol, _initialSupply, _decimals, _mintable, _globalMinCap) {    
        originalSupply = _originalSupply;
        oldTokenAddress = _oldTokenAddress;
        isUpgradeAgent = true;    
    }

    function upgradeFrom(address _from, uint256 value) public {
        // Make sure the call is from old token contract
        require(msg.sender == oldTokenAddress);
        // Validate input value.
        balances[_from] = balances[_from].plus(value);
        // Take tokens out from circulation
        totalSupply = totalSupply.plus(value);
    }

}
