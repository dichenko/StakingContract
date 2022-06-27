//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.15;

//rewardTokenAddress = 0x69746B384A87977c29459FbF82Ce8e447667E580;
//lpTokenAddress = 0x8bc17512ac769571e574c5333d3e7830adb9e6f0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Staking {
    uint8 percent = 20;
    uint32 timeToFreezLp = 20 minutes;
    uint32 timeToReward = 10 minutes;
    address public owner;
    address rewardTokenAddress;
    address lpTokenAddress;

    IERC20 lpToken = IERC20(lpTokenAddress);
    IERC20 rewardToken = IERC20(rewardTokenAddress);

    event Staked(address indexed staker, uint256 _amount);
    event Unstaked(address indexed staker, uint256 _amount);

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

    constructor(address _lpAddress, address _rewardAddress) {
        owner = msg.sender;
        rewardTokenAddress = _rewardAddress;
        lpTokenAddress = _lpAddress;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You a not an owner!");
        _;
    }

    function stake(uint256 _amount) public {
        lpToken.transferFrom(msg.sender, address(this), _amount);
        stakes[msg.sender].push(Stake(uint64(block.timestamp), _amount));
        uint256 rewardsAmount = (_amount * percent) / 100;
        rewards[msg.sender].push(
            Reward(uint64(block.timestamp), rewardsAmount)
        );
        emit Staked(msg.sender, _amount);
    }

    function unstake(uint256 _amount) public {
        Stake[] storage myStakes = stakes[msg.sender];
        //delete unfreezed Stakes
        for (uint256 i = 0; i <= myStakes.length - 1; i++) {
            if (myStakes[i].timestamp + timeToFreezLp <= block.timestamp) {
                unlockedFunds[msg.sender] += myStakes[i].amount;
                myStakes[i] = myStakes[myStakes.length - 1];
                myStakes.pop();
            }
        }
        require(_amount <= unlockedFunds[msg.sender], "insufficient funds");
        lpToken.transfer(msg.sender, _amount);
        emit Unstaked(msg.sender, _amount);
    }

    function claim(uint256 _amount) public {
        Reward[] storage myReward = rewards[msg.sender];
        //delete unfreezed Rewards
        for (uint256 i = 0; i <= myReward.length - 1; i++) {
            if (myReward[i].timestamp + timeToReward <= block.timestamp) {
                unlockedRewards[msg.sender] += myReward[i].amount;
                myReward[i] = myReward[myReward.length - 1];
                myReward.pop();
            }
        }
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

    function setLpTokenAddress(address _address) public onlyOwner {
        lpTokenAddress = _address;
    }

    // function owner() public view returns (address){
    //     return owner;
    // }
}
