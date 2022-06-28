//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.15;


//lpTokenAddress = 0x8bc17512ac769571e574c5333d3e7830adb9e6f0;
//rewardToken deployed to: 0xB97146E2a29a27794274FFC42e5776DDaa3A5b01
//MyStaking deployed to: 0x8bD4C9b6D9bdd28F88F3eBB9Ab292722Ab923B59

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Staking {
    uint8 public percent = 10;
    uint32 public timeToFreezLp = 20 minutes;
    uint32 public timeToReward = 10 minutes;
    address public owner;

    IERC20 rewardToken;
    IERC20 lpToken;

    event Staked(address indexed staker, uint256 _amount);
    event Unstaked(address indexed staker, uint256 _amount);

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
        emit Staked(msg.sender, _amount);
    }

    function unstake() public {
        require(block.timestamp >= stakes[msg.sender].timestamp + timeToFreezLp, "Time lock");
        uint _amount = stakes[msg.sender].amount;
        lpToken.transfer(msg.sender, _amount);
        stakes[msg.sender].amount = 0;
        emit Unstaked(msg.sender, _amount);
    }

    function claim() public {
        require(block.timestamp >= rewards[msg.sender].timestamp + timeToReward, "Time lock");
        rewardToken.transfer(msg.sender, rewards[msg.sender].amount);
        rewards[msg.sender].amount = 0;
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


}
