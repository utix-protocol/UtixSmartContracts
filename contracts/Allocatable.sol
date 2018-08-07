pragma solidity ^0.4.21;

import "./Ownable.sol";

contract Allocatable is Ownable {

  /** List of agents that are allowed to allocate new tokens */
  mapping (address => bool) public allocateAgents;

  event AllocateAgentChanged(address addr, bool state  );

  /**
   * Owner can allow a crowdsale contract to allocate new tokens.
   */
  function setAllocateAgent(address addr, bool state) onlyOwner public {
    allocateAgents[addr] = state;
    AllocateAgentChanged(addr, state);
  }

  modifier onlyAllocateAgent() {
    // Only crowdsale contracts are allowed to allocate new tokens
    require(allocateAgents[msg.sender]);
    _;
  }
}