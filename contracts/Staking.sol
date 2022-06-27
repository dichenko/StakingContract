//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.15;

//rewardTokenAddress = 0x69746B384A87977c29459FbF82Ce8e447667E580;
//lpTokenAddress = 0x8bc17512ac769571e574c5333d3e7830adb9e6f0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract StakingOLD {
    uint8 public percent = 10;
    uint32 timeToFreezLp = 20 minutes;
    uint32 timeToReward = 10 minutes;
    address public owner;

    IERC20 rewardToken;
    IERC20 lpToken;

    event Staked(uint timestamp, address indexed staker, uint256 _amount);
    event Unstaked(uint timestamp, address indexed staker, uint256 _amount);

    struct Stake {
        uint timestamp;
        uint256 amount;
    }

    struct Reward {
        uint timestamp;
        uint256 amount;
    }

    mapping(address => Stake) public stakes;
    mapping(address => Reward) public rewards;
    

    constructor(address _lpAddress, address _rewardAddress) {
        owner = msg.sender;
        lpToken = IERC20(_lpAddress);
        rewardToken = IERC20(_rewardAddress);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You a not an owner!");
        _;
    }

    function stake(uint256 _amount) public {
        lpToken.transferFrom(msg.sender, address(this), _amount);
        stakes[msg.sender].amount += _amount;
        stakes[msg.sender].timestamp  = block.timestamp;
        uint256 rewardsAmount = (_amount * percent) / 100;
        rewards[msg.sender].amount += rewardsAmount;
        rewards[msg.sender].timestamp  = block.timestamp;
        emit Staked(block.timestamp, msg.sender, _amount);
    }

    function unstake(uint256 _amount) public {
        require(block.timestamp >= stakes[msg.sender].timestamp + timeToFreezLp, "Time lock");
        require(_amount <= stakes[msg.sender].amount, "Insufficient funds");
        lpToken.transfer(msg.sender, _amount);
        emit Unstaked(block.timestamp, msg.sender, _amount);
    }

    function claim(uint256 _amount) public {
        require(_amount <= unlockedRewards[msg.sender], "insufficient funds");
        rewardToken.transfer(msg.sender, _amount);
    }

    function setPercent(uint8 _percent) public onlyOwner {
        percent = _percent;
    }

    function setTimeToFreezLp(uint32 _time) public onlyOwner {
        timeToFreezLp = _time;
    }

    function setTimeToReward(uint32 _time) public onlyOwner {
        timeToReward = _time;
    }

    function setRewardTokenAddress(address _address) public onlyOwner {
        rewardTokenAddress = _address;
    }

    // function owner() public view returns (address){
    //     return owner;
    // }
}
