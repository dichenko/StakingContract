//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Staking {
    uint8 percent = 20;
    uint32 timeToFreezLp = 20 minutes;
    uint32 timeToReward = 10 minutes;
    address owner;
    address rewardTokenAddress = 0xC2544D5C72b44162561e4c1b336e06cD27CA93c8;
    address lpTokenAddress = 0x4aAded56bd7c69861E8654719195fCA9C670EB45; //DAI

    IERC20 lpToken = IERC20(lpTokenAddress);
    IERC20 rewardToken = IERC20(rewardTokenAddress);

    event Stake(address indexed staker, uint256 _amount);
    event Unstake(address indexed staker, uint256 _amount);

    struct Stake {
        uint64 timestamp;
        uint256 amount;
    }

    struct Reward {
        uint64 timestamp;
        uint256 amount;
    }

    mapping(address => Stake[]) public stakes;
    mapping(address => Reward[]) public rewards;
    mapping(address => uint256) public unlockedFunds;
    mapping(address => uint256) public unlockedRewards;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You a not an owner!");
        _;
    }

    function stake(uint256 _amount) {
        lpToken.transferFrom(msg.sender, address(this), _amount);
        stakes[msg.sender].push(Stake(block.timestamp, _amount));
        uint256 rewardsAmount = (_amount * percent) / 100;
        rewards[msg.sender].push(Reward(block.timestamp, rewardsAmount));
        emit Stake(msg.sender, _amount);
    }

    function unstake(uint256 _amount) {
        Stake[] storage myStakes = stakes[msg.sender];
        //delete unfreezed Stakes
        for (uint256 i = myStakes.length - 1; i >= 0; i--) {
            if (myStakes[i].timestamp + timeToFreezLp <= block.timestamp) {
                unlockedFunds[msg.sender] += myStakes[i].amount;
                myStakes[i] = myStakes[myStakes.length - 1];
                myStakes.pop();
            }
        }
        require(_amount <= unlockedFunds[msg.sender], "insufficient funds");
        lpToken.transfer(msg.sender, _amount);
        emit Unstake(msg.sender, _amount);
    }

    function claim(uint256 _amount) {
        Reward[] storage myReward = rewards[msg.sender];
        //delete unfreezed Rewards
        for (uint256 i = myReward.length - 1; i >= 0; i--) {
            if (myReward[i].timestamp + timeToReward <= block.timestamp) {
                unlockedRewards[msg.sender] += myReward[i].amount;
                myReward[i] = myReward[myReward.length - 1];
                myReward.pop();
            }
        }
        require(_amount <= unlockedRewards[msg.sender], "insufficient funds");
        rewardToken.transfer(msg.sender, _amount);
    }

    function setPercent(uint8 _percent) onlyOwner {
        percent = _percent;
    }

    function setTimeToFreezLp(uint32 _time) onlyOwner {
        timeToFreezLp = _time;
    }

    function setTimeToReward(uint32 _time) onlyOwner {
        timeToReward = _time;
    }

    function setLpTokenAddress(address _address) onlyOwner {
        lpTokenAddress= _address;
    }
}
