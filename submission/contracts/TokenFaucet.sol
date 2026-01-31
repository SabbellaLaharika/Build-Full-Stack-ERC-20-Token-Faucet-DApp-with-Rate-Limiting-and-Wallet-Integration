// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Token.sol";

// Contract should:
// - Store reference to token contract
// - Define FAUCET_AMOUNT constant (amount per claim)
// - Define COOLDOWN_TIME constant (24 hours in seconds)
// - Define MAX_CLAIM_AMOUNT constant (lifetime limit per address)
// - Have admin address (deployer)
// - Have paused boolean state
// - Have lastClaimAt mapping (address => uint256)
// - Have totalClaimed mapping (address => uint256)

contract TokenFaucet {
    YourToken public token;
    uint256 public constant FAUCET_AMOUNT = 10 * 10**18;
    uint256 public constant COOLDOWN_TIME = 24 hours;
    uint256 public constant MAX_CLAIM_AMOUNT = 100 * 10**18;
    
    address public admin;
    bool public paused;
    
    mapping(address => uint256) public lastClaimAt;
    mapping(address => uint256) public totalClaimed;

    event TokensClaimed(address indexed user, uint256 amount, uint256 timestamp);
    event FaucetPaused(bool paused);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Faucet is paused");
        _;
    }

    constructor(address _token) {
        token = YourToken(_token);
        admin = msg.sender;
        paused = false;
    }

    function requestTokens() external whenNotPaused {
        require(canClaim(msg.sender), "Cooldown period not elapsed or limit reached");
        require(remainingAllowance(msg.sender) >= FAUCET_AMOUNT, "Lifetime claim limit reached");
        
        lastClaimAt[msg.sender] = block.timestamp;
        totalClaimed[msg.sender] += FAUCET_AMOUNT;
        
        token.mint(msg.sender, FAUCET_AMOUNT);
        emit TokensClaimed(msg.sender, FAUCET_AMOUNT, block.timestamp);
    }

    function canClaim(address user) public view returns (bool) {
        if (paused) return false;
        if (totalClaimed[user] >= MAX_CLAIM_AMOUNT) return false;
        if (block.timestamp < lastClaimAt[user] + COOLDOWN_TIME) return false;
        return true;
    }

    function remainingAllowance(address user) public view returns (uint256) {
        if (totalClaimed[user] >= MAX_CLAIM_AMOUNT) return 0;
        return MAX_CLAIM_AMOUNT - totalClaimed[user];
    }

    function setPaused(bool _paused) external onlyAdmin {
        paused = _paused;
        emit FaucetPaused(_paused);
    }
    
    function isPaused() external view returns (bool) {
        return paused;
    }
}
