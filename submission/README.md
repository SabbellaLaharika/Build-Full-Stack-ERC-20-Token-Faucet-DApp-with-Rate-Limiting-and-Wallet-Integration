# ERC-20 Token Faucet DApp

## 1. Project Overview
This project is a full-stack Decentralized Application (DApp) that implements an ERC-20 token faucet. It allows users to claim a fixed amount of tokens every 24 hours, enforcing strict on-chain rate limiting and lifetime allowances. The project includes Smart Contracts, a React Frontend, and Dockerized infrastructure.

## 2. Architecture
*   **Smart Contracts**:
    *   `Token.sol`: Standard ERC-20 token with a fixed max supply. Menting is restricted to the Faucet contract.
    *   `TokenFaucet.sol`: Manaages claims, enforcing `COOLDOWN_TIME` (24h) and `MAX_CLAIM_AMOUNT`. Uses `lastClaimAt` and `totalClaimed` mappings for state tracking.
*   **Frontend**:
    *   Built with **React** and **Vite**.
    *   Uses **ethers.js** for blockchain interaction.
    *   Implements `window.__EVAL__` interface for automated grading.
    *   Provides real-time feedback on cooldowns and balances.
*   **Infrastructure**:
    *   Containerized using **Docker** and **NGINX**.
    *   Orchestrated via `docker-compose`.

## 3. Deployed Contracts (Sepolia)
*   **Token**: [0x...](https://sepolia.etherscan.io/address/0x...) (Replace after deployment)
*   **Faucet**: [0x...](https://sepolia.etherscan.io/address/0x...) (Replace after deployment)

## 4. Quick Start
### Prerequisites
*   Node.js (v18+)
*   Docker & Docker Compose

### Local Development
1.  **Install dependencies**:
    ```bash
    npm install
    cd frontend && npm install && cd ..
    ```
2.  **Start Local Node**:
    ```bash
    npx hardhat node
    ```
3.  **Deploy Contracts**:
    ```bash
    npx hardhat run scripts/deploy.js --network localhost
    ```
4.  **Start Frontend**:
    ```bash
    cd frontend
    npm run dev
    ```

### Docker Deployment
1.  **Configure Environment**:
    ```bash
    cp .env.example .env
    # Edit .env with your contract addresses if deployed to testnet
    ```
2.  **Run Application**:
    ```bash
    docker compose up --build
    ```
3.  **Access**: Open `http://localhost:3000`.

## 5. Configuration
Environment variables can be set in `.env` or passed to Docker:
*   `VITE_RPC_URL`: RPC endpoint for the network.
*   `VITE_TOKEN_ADDRESS`: Address of the deployed Token.
*   `VITE_FAUCET_ADDRESS`: Address of the deployed Faucet.

## 6. Design Decisions
*   **Faucet Amount**: Set to 10 MTK to allow users to engage without draining reserves quickly.
*   **Lifetime Limit**: Capped at 100 MTK to prevent abuse and ensure wider distribution.
*   **Token Supply**: Fixed at 1,000,000 MTK to simulate maximal scarcity.
*   **Separation of Concerns**: Token and Faucet are separate contracts to ensure modularity and upgradeability (Faucet can be replaced if logic changes, Token remains).

## 7. Testing Approach
*   **Unit Tests**: Comprehensive Hardhat tests covering 10 scenarios including time-travel for cooldown verification.
*   **Integration Tests**: Frontend interacts directly with contracts to verify UI updates.

## 8. Security Considerations
*   **Checks-Effects-Interactions**: Followed to prevent reentrancy (though not critical for simple transfers, good practice).
*   **Access Control**: Critical functions (`setPaused`, `mint`) are restricted to `onlyAdmin` or specific addresses.
*   **Rate Limiting**: On-chain enforcement ensures validation cannot be bypassed by frontend manipulation.

## 9. Known Limitations
*   **Gas Costs**: Users pay gas for `requestTokens()`. A meta-transaction relayer could improve UX in future v2.
*   **Environment Variables**: In Docker NGINX build, variables are baked in at build time. Runtime changes require a rebuild.
