import { ethers } from "ethers";
import { connectWallet, getProvider, getSigner } from "./wallet";
import { getTokenContract, getFaucetContract, getContractAddresses } from "./contracts";

const evalInterface = {
    connectWallet: async () => {
        try {
            const address = await connectWallet();
            return address;
        } catch (e) {
            throw e;
        }
    },

    requestTokens: async () => {
        try {
            const signer = await getSigner();
            const faucet = await getFaucetContract(signer);
            const tx = await faucet.requestTokens();
            await tx.wait(); // Wait for confirmation? Req says 'return transaction hash as string'. 
            // Usually "return transaction hash" could mean immediately.
            // But typically we wait for at least one confirmation for stability in tests?
            // "Wait for transaction to be mined" is commented in the image. So YES.
            return tx.hash;
        } catch (e) {
            // "Functions must throw descriptive errors"
            throw new Error(e.reason || e.message);
        }
    },

    getBalance: async (address) => {
        try {
            const provider = getProvider();
            const token = await getTokenContract(provider);
            const balance = await token.balanceOf(address);
            return balance.toString();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    canClaim: async (address) => {
        try {
            const provider = getProvider();
            const faucet = await getFaucetContract(provider);
            return await faucet.canClaim(address);
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getRemainingAllowance: async (address) => {
        try {
            const provider = getProvider();
            const faucet = await getFaucetContract(provider);
            const allowance = await faucet.remainingAllowance(address);
            return allowance.toString();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getContractAddresses: () => {
        return getContractAddresses();
    }
};

window.__EVAL__ = evalInterface;
