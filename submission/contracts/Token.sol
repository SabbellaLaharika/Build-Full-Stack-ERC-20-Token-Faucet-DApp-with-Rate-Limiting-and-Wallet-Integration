// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Contract should:
// - Inherit from ERC20
// - Have a maximum supply constant
// - Grant minting role to faucet address in constructor
// - Implement mint function restricted to faucet
// - Override decimals if needed (default 18)

contract YourToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1000000 * 10**18; // Example cap
    address public faucet;

    constructor(address _faucet) ERC20("MyToken", "MTK") Ownable(msg.sender) {
        faucet = _faucet;
    }

    function setFaucet(address _faucet) external onlyOwner {
        faucet = _faucet;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == faucet, "Only faucet can mint");
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(to, amount);
    }
}
