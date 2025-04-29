export const connectWallet = async (): Promise<string | null> => {
  if (typeof window !== "undefined" && window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      if (accounts && accounts.length > 0) {
        return accounts[0];
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  } else {
    alert('MetaMask is not installed');
  }
  return null;
};
