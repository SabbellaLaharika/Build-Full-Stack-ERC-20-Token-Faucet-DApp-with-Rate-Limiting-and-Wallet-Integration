import { ethers } from "ethers";
import TokenArtifact from "../artifacts/YourToken.json";
import FaucetArtifact from "../artifacts/TokenFaucet.json";
import DeploymentInfo from "../contracts.json";

export const getTokenContract = async (signerOrProvider) => {
    const addr = import.meta.env.VITE_TOKEN_ADDRESS || DeploymentInfo.Token;
    return new ethers.Contract(
        addr,
        TokenArtifact.abi,
        signerOrProvider
    );
};

export const getFaucetContract = async (signerOrProvider) => {
    const addr = import.meta.env.VITE_FAUCET_ADDRESS || DeploymentInfo.TokenFaucet;
    return new ethers.Contract(
        addr,
        FaucetArtifact.abi,
        signerOrProvider
    );
};

export const getContractAddresses = () => {
    return {
        token: import.meta.env.VITE_TOKEN_ADDRESS || DeploymentInfo.Token,
        faucet: import.meta.env.VITE_FAUCET_ADDRESS || DeploymentInfo.TokenFaucet
    };
};
