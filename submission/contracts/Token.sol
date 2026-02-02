// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Contract should:
// - Inherit from ERC20
// - Have a maximum supply constant
// - Grant minting role to faucet address in constructor
// - Implement mint function restricted to faucet
// - Override decimals if needed (default 18)

contract YourToken is ERC20 {
    // Define MAX_SUPPLY constant
    uint256 public constant MAX_SUPPLY = 1000000 * 10**18; // Example cap
    
    // Define minter address (faucet)
    address public minter;
    
    // Constructor should:
    // - Call ERC20 constructor with name and symbol
    // - Set minter to faucet address
    constructor(address _faucet) ERC20("MyToken", "MTK") {
        minter = _faucet;
    }
    
    // mint function should:
    // - Check caller is minter
    // - Check total supply + amount <= MAX_SUPPLY
    // - Call _mint(to, amount)
    function mint(address to, uint256 amount) external {
        require(msg.sender == minter, "Only faucet can mint");
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(to, amount);
    }
}
