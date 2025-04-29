import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import '../styles.css';

interface HeaderProps {
  account: string;
  setAccount: (account: string) => void; // Accept setAccount as a prop
  openCreateModal: () => void;
}

const Header: React.FC<HeaderProps> = ({ account, setAccount, openCreateModal }) => {
  const [balance, setBalance] = useState<string>('');

  useEffect(() => {
    const getBalance = async () => {
      if (account && window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const balanceWei = await provider.getBalance(account);
          setBalance(ethers.formatEther(balanceWei).substring(0, 6)); // Limit balance to 6 decimal places
        } catch (error) {
          console.error('Error fetching balance:', error);
        }
      }
    };

    getBalance();
  }, [account]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]); // Set account after wallet connection
        // Refresh the page after successful connection
        window.location.href = window.location.href;
        
      } catch (error) {
        console.error('User denied account access');
      }
    } else {
      alert('Please install MetaMask to use this application');
    }
  };

  const disconnectWallet = () => {
    setAccount(''); // Clear account state to simulate disconnect
    setBalance(''); // Clear balance state
    sessionStorage.clear(); // Optionally clear session data
    localStorage.clear(); // Optionally clear localStorage
    // Refresh the page after disconnecting
    
    alert('You have disconnected from the app. Please disconnect from MetaMask manually.');
  };

  return (
    <header className="header">
      <div className="logo">
        <h1>Crowd<span>Fund</span></h1>
      </div>
      
      <div className="header-actions">
        {account ? (
          <>
            <button className="create-btn" onClick={openCreateModal}>
              Create Campaign
            </button>
            <div className="account-info">
              <span className="balance">{balance} ETH</span>
              <span className="account-address">
                {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
              </span>
            </div>
            <button className="disconnect-btn" onClick={disconnectWallet}>
              Disconnect
            </button>
          </>
        ) : (
          <button className="connect-btn" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
