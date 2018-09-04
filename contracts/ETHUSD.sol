pragma solidity 0.4.24;

import "./usingOraclize.sol";
import "./Ownable.sol";


/**
 * Contract which exposes `ethInCents` which is the Ether price in USD cents.
 * E.g. if 1 Ether is sold at 840.32 USD on the markets, the `ethInCents` will
 * be `84032`.
 *
 * This price is supplied by Oraclize callback, which sets the value. Currently
 * there is no proof provided for the callback, other then the value and the
 * corresponding ID which was generated when this contract called Oraclize.
 *
 * If this contract runs out of Ether, the callback cycle will interrupt until
 * the `update` function is called with a transaction which also replenishes the
 * balance of the contract.
 */
contract ETHUSD is usingOraclize, Ownable {
   
    uint256 public ethInCents;

    event LogInfo(string description);
    event LogPriceUpdate(uint256 price);
    event LogUpdate(address indexed _owner, uint indexed _balance);

    // Constructor
    constructor (uint _ethInCents)
    public payable {
               
        ethInCents = _ethInCents;

        emit LogUpdate(owner, address(this).balance);

        // Replace the next line with your version:
        oraclize_setNetwork(4);

        oraclize_setProof(proofType_TLSNotary | proofStorage_IPFS);
        update();
    }

    // Fallback function
    function() public payable {
        
    }

    function __callback(bytes32 myid, string result, bytes proof) public {
        require(msg.sender == oraclize_cbAddress());

        ethInCents = parseInt(result, 2);
        emit LogPriceUpdate(ethInCents);
        update();
    }

    function getBalance() public view returns (uint _balance) {
        return address(this).balance;
    }

    function update()
    public payable
    {
        // Check if we have enough remaining funds
        if (oraclize_getPrice("URL") > address(this).balance) {
            emit LogInfo("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
        } else {
            emit LogInfo("Oraclize query was sent, standing by for the answer..");

            // Using XPath to to fetch the right element in the JSON response
            oraclize_query(60, "URL", "json(https://api.coinbase.com/v2/prices/ETH-USD/spot).data.amount");
        }
    }

    function instantUpdate()
    public payable
    onlyOwner {
        // Check if we have enough remaining funds
        if (oraclize_getPrice("URL") > address(this).balance) {
            emit LogInfo("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
        } else {
            emit LogInfo("Oraclize query was sent, standing by for the answer..");

            // Using XPath to to fetch the right element in the JSON response
            oraclize_query("URL", "json(https://api.coinbase.com/v2/prices/ETH-USD/spot).data.amount");
        }
    }

    function withdrawFunds(address _addr) 
    public
    onlyOwner
    {
        if (msg.sender != owner) revert();
        _addr.transfer(address(this).balance);
    } 

}