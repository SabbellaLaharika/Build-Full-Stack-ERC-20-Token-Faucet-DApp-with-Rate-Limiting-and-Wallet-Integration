import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ethers } from 'ethers';
import './index.css';

// Import evaluation interface to ensure it loads
import './utils/eval';
import { connectWallet, getProvider } from './utils/wallet';
import { getTokenContract, getFaucetContract } from './utils/contracts';

function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState("0");
  const [cooldown, setCooldown] = useState(0); // timestamp
  const [remainingAllowance, setRemainingAllowance] = useState("0");
  const [loading, setLoading] = useState(false);

  const COOLDOWN_PERIOD = 24 * 60 * 60; // 24 hours in seconds

  useEffect(() => {
    checkConnection();
    // Setup listeners if needed
  }, []);

  useEffect(() => {
    if (account) {
      fetchData();
      const interval = setInterval(fetchData, 15000); // Refresh every 15s
      return () => clearInterval(interval);
    }
  }, [account]);

  const checkConnection = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }
    }
  };

  const handleConnect = async () => {
    try {
      const addr = await connectWallet();
      setAccount(addr);
      toast.success("Wallet Connected!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const fetchData = async () => {
    if (!account) return;
    try {
      const provider = getProvider();
      const token = await getTokenContract(provider);
      const faucet = await getFaucetContract(provider);

      // 1. Get Balance
      const bal = await token.balanceOf(account);
      setBalance(ethers.formatEther(bal));

      // 2. Get Cooldown status
      // We need lastClaimAt.
      const lastClaim = await faucet.lastClaimAt(account);
      const lastClaimTime = Number(lastClaim);

      const nextClaim = lastClaimTime + COOLDOWN_PERIOD;
      setCooldown(nextClaim * 1000); // Convert to ms for UI

      // 3. Get Remaining Allowance
      const allowance = await faucet.remainingAllowance(account);
      setRemainingAllowance(ethers.formatEther(allowance));

    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const handleClaim = async () => {
    setLoading(true);
    try {
      // Use eval interface for consistency or direct contract call
      // Let's use the window.__EVAL__ wrapper logic actually, or just re-implement
      // using the signer from wallet utils to be safe.
      // Re-using eval logic is cleaner but we need UI feedback.
      await window.__EVAL__.requestTokens();

      toast.success("Tokens Claimed Successfully!");
      fetchData(); // Refresh UI immediately
    } catch (err) {
      // Parse error message for better UI
      let msg = err.message;
      if (msg.includes("Cooldown period not elapsed")) msg = "Please wait for cooldown!";
      if (msg.includes("Lifetime claim limit reached")) msg = "Lifetime limit reached!";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Calculate time remaining string
  const getTimeRemaining = () => {
    const now = Date.now();
    if (now > cooldown) return null;

    const diff = cooldown - now;
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    return `${hours}h ${minutes}m`;
  };

  const timeRemaining = getTimeRemaining();
  const isEligible = !timeRemaining && parseFloat(remainingAllowance) > 0;

  return (
    <div className="container">
      <h1>ERC-20 Faucet</h1>

      <div className="card">
        {!account ? (
          <button onClick={handleConnect}>Connect Wallet</button>
        ) : (
          <div>
            <p>Connected: <span title={account}>{account.substring(0, 6)}...{account.substring(38)}</span></p>

            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-label">Your Balance</div>
                <div className="stat-value">{parseFloat(balance).toFixed(2)} MTK</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Lifetime Limit Left</div>
                <div className="stat-value">{parseFloat(remainingAllowance).toFixed(2)} MTK</div>
              </div>
            </div>

            <div className="action-area">
              {timeRemaining ? (
                <div style={{ color: '#ff6b6b', marginBottom: '1rem' }}>
                  Cooldown Active: {timeRemaining}
                </div>
              ) : (
                <div style={{ color: '#42d392', marginBottom: '1rem' }}>
                  Ready to Claim
                </div>
              )}

              <button
                onClick={handleClaim}
                disabled={!isEligible || loading}
              >
                {loading ? <span className="loader">↻</span> : "Claim 10 MTK"}
              </button>
            </div>
          </div>
        )}
      </div>

      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  );
}

export default App;
