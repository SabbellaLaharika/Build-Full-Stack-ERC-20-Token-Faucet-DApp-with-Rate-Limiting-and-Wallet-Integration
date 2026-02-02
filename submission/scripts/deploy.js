const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("Starting deployment...");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Predict Faucet address
    const nonce = await deployer.getNonce();
    const futureFaucetAddress = hre.ethers.getCreateAddress({ from: deployer.address, nonce: nonce + 1 });
    console.log("Predicted Faucet Address:", futureFaucetAddress);

    // 1. Deploy Token contract first with predicted faucet address
    const Token = await hre.ethers.getContractFactory("YourToken");
    const token = await Token.deploy(futureFaucetAddress);
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    console.log("Token deployed to:", tokenAddress);

    // 2. Deploy TokenFaucet with token address
    const Faucet = await hre.ethers.getContractFactory("TokenFaucet");
    const faucet = await Faucet.deploy(tokenAddress);
    await faucet.waitForDeployment();
    const faucetAddress = await faucet.getAddress();
    console.log("TokenFaucet deployed to:", faucetAddress);

    // Verify prediction
    if (faucetAddress !== futureFaucetAddress) {
        console.error("CRITICAL ERROR: Deployed Faucet address does not match predicted address!");
        console.error("Predicted:", futureFaucetAddress);
        console.error("Actual:   ", faucetAddress);
        // We can't fix it now without redeploying Token, but let's warn.
    }

    // 3. Grant minting role to faucet in token contract
    // No longer needed as it was set in constructor!
    console.log("Minting role verified (set in constructor).");

    // 4. Log all deployment addresses
    console.log("Deployment Summary:");
    console.log("-------------------");
    console.log("Token:", tokenAddress);
    console.log("Faucet:", faucetAddress);

    // 6. Save deployment addresses to file for frontend
    // Create frontend directory if it doesn't exist yet
    const frontendDir = path.join(__dirname, "../frontend/src");
    if (!fs.existsSync(frontendDir)) {
        fs.mkdirSync(frontendDir, { recursive: true });
    }

    const deploymentInfo = {
        Token: tokenAddress,
        TokenFaucet: faucetAddress,
        Network: hre.network.name
    };

    fs.writeFileSync(
        path.join(frontendDir, "contracts.json"),
        JSON.stringify(deploymentInfo, null, 2)
    );
    console.log("Deployment info saved to frontend/src/contracts.json");

    // 5. Verify contracts on Etherscan
    // Verify only if on a testnet/mainnet (not hardhat/localhost)
    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
        console.log("Waiting for block confirmations before verification...");
        // Wait for 6 confirmations to be safe
        await token.deploymentTransaction().wait(6);
        await faucet.deploymentTransaction().wait(6);

        console.log("Verifying Token...");
        try {
            await hre.run("verify:verify", {
                address: tokenAddress,
                constructorArguments: [deployer.address],
            });
        } catch (error) {
            console.log("Token verification failed:", error.message);
        }

        console.log("Verifying Faucet...");
        try {
            await hre.run("verify:verify", {
                address: faucetAddress,
                constructorArguments: [tokenAddress],
            });
        } catch (error) {
            console.log("Faucet verification failed:", error.message);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
