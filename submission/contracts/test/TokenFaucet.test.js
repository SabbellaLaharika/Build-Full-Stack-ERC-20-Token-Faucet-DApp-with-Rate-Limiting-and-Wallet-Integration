const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("TokenFaucet", function () {
    let Token, Faucet;
    let token, faucet;
    let owner, addr1, addr2;
    const FAUCET_AMOUNT = ethers.parseEther("10");
    const ONE_DAY = 24 * 60 * 60;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        // Deploy Token temporarily with random address for faucet, then update
        // Actually our Token contract takes faucet in constructor.
        // To solve circular dependency in test:
        // 1. Calculate future address of Faucet? Or just deploy Token with dummy, deploy Faucet, set Faucet on Token.
        // We added setFaucet to Token.sol for this exact reason.

        Token = await ethers.getContractFactory("YourToken");
        token = await Token.deploy(owner.address); // Temporarily owner as faucet to allow initial setup if needed, or just dummy
        // Wait, implementation says: constructor(address _faucet).
        // Let's pass owner address first, then update.

        Faucet = await ethers.getContractFactory("TokenFaucet");
        faucet = await Faucet.deploy(await token.getAddress());

        // Now set the real faucet address on the token
        await token.setFaucet(await faucet.getAddress());
    });

    it("Should set the right owner", async function () {
        expect(await token.owner()).to.equal(owner.address);
        expect(await faucet.admin()).to.equal(owner.address);
    });

    it("Should allow requesting tokens", async function () {
        await expect(faucet.connect(addr1).requestTokens())
            .to.emit(faucet, "TokensClaimed")
            .withArgs(addr1.address, FAUCET_AMOUNT, await time.latest() + 1); // approximate time check

        expect(await token.balanceOf(addr1.address)).to.equal(FAUCET_AMOUNT);
    });

    it("Should prevent requesting tokens before 24 hours", async function () {
        await faucet.connect(addr1).requestTokens();

        await expect(faucet.connect(addr1).requestTokens()).to.be.revertedWith("Cooldown period not elapsed or limit reached");

        // Advance time by 23 hours
        await time.increase(ONE_DAY - 3600);
        await expect(faucet.connect(addr1).requestTokens()).to.be.revertedWith("Cooldown period not elapsed or limit reached");

        // Advance to 24 hours
        await time.increase(3600);
        await expect(faucet.connect(addr1).requestTokens()).to.not.be.reverted;
    });

    it("Should respect lifetime limit", async function () {
        // Limit is 100 tokens, 10 per claim. So 10 claims.
        // We need to advance time for each claim.

        for (let i = 0; i < 10; i++) {
            await faucet.connect(addr1).requestTokens();
            await time.increase(ONE_DAY);
        }

        expect(await token.balanceOf(addr1.address)).to.equal(ethers.parseEther("100"));

        // 11th claim should fail
        await expect(faucet.connect(addr1).requestTokens()).to.be.revertedWith("Lifetime claim limit reached");
    });

    it("Should allow admin to pause and unpause", async function () {
        await faucet.setPaused(true);
        await expect(faucet.connect(addr1).requestTokens()).to.be.revertedWith("Faucet is paused");

        await faucet.setPaused(false);
        await expect(faucet.connect(addr1).requestTokens()).to.not.be.reverted;
    });
});
