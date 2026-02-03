export const connectWallet = async () => {
    if (!window.ethereum) {
        throw new Error("No crypto wallet found. Please install MetaMask.");
    }

    try {
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });
        return accounts[0];
    } catch (err) {
        throw new Error(err.message);
    }
};

export const getProvider = () => {
    if (!window.ethereum) {
        throw new Error("No crypto wallet found.");
    }
    return new ethers.BrowserProvider(window.ethereum);
};

export const getSigner = async () => {
    const provider = getProvider();
    return await provider.getSigner();
};
