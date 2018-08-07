pragma solidity ^0.4.21;

import "./ERC20.sol";
import "./SafeMath.sol";
import "./Allocatable.sol";

/**
 * Contract to enforce Token Vesting
 */
contract TokenVesting is Allocatable, SafeMath {

    address public crowdSaleTokenAddress;

    /** keep track of total tokens yet to be released, 
     * this should be less than or equal to UTIX tokens held by this contract. 
     */
    uint256 public totalUnreleasedTokens;

    // default vesting parameters
    uint256 startAt = 0;
    uint256 cliff = 1;
    uint256 duration = 4; 
    uint256 step = 300; //15778463;  //2592000;
    bool changeFreezed = false;

    struct VestingSchedule {
        uint256 startAt;
        uint256 cliff;
        uint256 duration;
        uint256 step;
        uint256 amount;
        uint256 amountReleased;
        bool changeFreezed;
    }

    mapping (address => VestingSchedule) public vestingMap;

    event VestedTokensReleased(address _adr, uint256 _amount);
    
    function TokenVesting(address _tokenAddress) public {
        
        crowdSaleTokenAddress = _tokenAddress;
    }


    /** Modifier to check if changes to vesting is freezed  */
    modifier changesToVestingFreezed(address _adr){
        require(vestingMap[_adr].changeFreezed);
        _;
    }


    /** Modifier to check if changes to vesting is not freezed yet  */
    modifier changesToVestingNotFreezed(address adr) {
        require(!vestingMap[adr].changeFreezed); // if vesting not set then also changeFreezed will be false
        _;
    }


    /** Function to set default vesting schedule parameters. */
    function setDefaultVestingParameters(uint256 _startAt, uint256 _cliff, uint256 _duration, 
        uint256 _step, bool _changeFreezed) onlyAllocateAgent public {

        // data validation
        require(_step != 0);
        require(_duration != 0);
        require(_cliff <= _duration);

        startAt = _startAt;
        cliff = _cliff;
        duration = _duration; 
        step = _step;
        changeFreezed = _changeFreezed;

    }

    /** Function to set vesting with default schedule. */
    function setVestingWithDefaultSchedule(address _adr, uint256 _amount) 
        public 
        changesToVestingNotFreezed(_adr) onlyAllocateAgent {
       
        setVesting(_adr, startAt, cliff, duration, step, _amount, changeFreezed);
    }

    /** Function to set/update vesting schedule. PS - Amount cannot be changed once set */
    function setVesting(address _adr, uint256 _startAt, uint256 _cliff, uint256 _duration, uint256 _step, uint256 _amount, bool _changeFreezed) 
        public 
        changesToVestingNotFreezed(_adr) onlyAllocateAgent {

        VestingSchedule storage vestingSchedule = vestingMap[_adr];

        // data validation
        require(_step != 0);
        require(_amount != 0 || vestingSchedule.amount > 0);
        require(_duration != 0);
        require(_cliff <= _duration);

        //if startAt is zero, set current time as start time.
        if (_startAt == 0) 
            _startAt = block.timestamp;

        vestingSchedule.startAt = _startAt;
        vestingSchedule.cliff = _cliff;
        vestingSchedule.duration = _duration;
        vestingSchedule.step = _step;

        // special processing for first time vesting setting
        if (vestingSchedule.amount == 0) {
            // check if enough tokens are held by this contract
            ERC20 token = ERC20(crowdSaleTokenAddress);
            require(token.balanceOf(this) >= safeAdd(totalUnreleasedTokens, _amount));
            totalUnreleasedTokens = safeAdd(totalUnreleasedTokens, _amount);
            vestingSchedule.amount = _amount; 
        }

        vestingSchedule.amountReleased = 0;
        vestingSchedule.changeFreezed = _changeFreezed;
    }

    function isVestingSet(address adr) public constant returns (bool isSet) {
        return vestingMap[adr].amount != 0;
    }

    function freezeChangesToVesting(address _adr) public changesToVestingNotFreezed(_adr) onlyAllocateAgent {
        require(isVestingSet(_adr)); // first check if vesting is set
        vestingMap[_adr].changeFreezed = true;
    }


    /** Release tokens as per vesting schedule, called by contributor  */
    function releaseMyVestedTokens() public changesToVestingFreezed(msg.sender) {
        releaseVestedTokens(msg.sender);
    }

    /** Release tokens as per vesting schedule, called by anyone  */
    function releaseVestedTokens(address _adr) public changesToVestingFreezed(_adr) {
        VestingSchedule storage vestingSchedule = vestingMap[_adr];
        
        // check if all tokens are not vested
        require(safeSub(vestingSchedule.amount, vestingSchedule.amountReleased) > 0);
        
        // calculate total vested tokens till now
        uint256 totalTime = block.timestamp - vestingSchedule.startAt;
        uint256 totalSteps = totalTime / vestingSchedule.step;

        // check if cliff is passed
        require(vestingSchedule.cliff <= totalSteps);

        uint256 tokensPerStep = vestingSchedule.amount / vestingSchedule.duration;
        // check if amount is divisble by duration
        if(tokensPerStep * vestingSchedule.duration != vestingSchedule.amount) tokensPerStep++;

        uint256 totalReleasableAmount = safeMul(tokensPerStep, totalSteps);

        // handle the case if user has not claimed even after vesting period is over or amount was not divisible
        if(totalReleasableAmount > vestingSchedule.amount) totalReleasableAmount = vestingSchedule.amount;

        uint256 amountToRelease = safeSub(totalReleasableAmount, vestingSchedule.amountReleased);
        vestingSchedule.amountReleased = safeAdd(vestingSchedule.amountReleased, amountToRelease);

        // transfer vested tokens
        ERC20 token = ERC20(crowdSaleTokenAddress);
        token.transfer(_adr, amountToRelease);
        // decrement overall unreleased token count
        totalUnreleasedTokens = safeSub(totalUnreleasedTokens, amountToRelease);
        VestedTokensReleased(_adr, amountToRelease);
    }
}