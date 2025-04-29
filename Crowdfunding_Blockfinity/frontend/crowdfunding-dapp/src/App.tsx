// import { useState, useEffect } from 'react';
// import { ethers } from 'ethers';
// import Header from './components/Header';
// import CampaignList from './components/CampaignList';
// import CreateCampaign from './components/CreateCampaign';
// import CrowdfundingABI from './contracts/Crowdfunding.json';
// import './styles.css';
// import { Campaign } from './types';

// const App = () => {
//   const [account, setAccount] = useState('');
//   const [contract, setContract] = useState<ethers.Contract | null>(null);
//   const [campaigns, setCampaigns] = useState<Campaign[]>([]);
//   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
//   const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
//   const [loading, setLoading] = useState(true);
//   const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

//   useEffect(() => {
//     const init = async () => {
//       try {
//         if (window.ethereum) {
//           const provider = new ethers.BrowserProvider(window.ethereum);
//           const signer = await provider.getSigner();
//           const tempContract = new ethers.Contract(
//             contractAddress,
//             CrowdfundingABI.abi,
//             signer
//           );
//           setContract(tempContract);
//           const accounts = await provider.send('eth_requestAccounts', []);
//           setAccount(accounts[0]);
//         }
//         if (contract) await loadCampaigns(contract);
//       } catch (error) {
//         console.error('Error initializing app:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     init();
//   }, [contract]);

//   const loadCampaigns = async (contractInstance: ethers.Contract) => {
//     try {
//       const count = await contractInstance.getCampaignCount();
//       const campaignCount = Number(count);
//       const campaignsData: Campaign[] = [];
      
//       for (let i = 1; i <= campaignCount; i++) {
//         const campaign = await contractInstance.getCampaignDetails(i);
//         const contributionAmount = account ? 
//           await contractInstance.getContributions(i, account) : 
//           ethers.parseEther('0');
          
//         campaignsData.push({
//           id: i,
//           title: campaign[0],
//           goal: ethers.formatEther(campaign[1]),
//           deadline: new Date(Number(campaign[2]) * 1000),
//           totalContributed: ethers.formatEther(campaign[3]),
//           totalBackers: Number(campaign[4]),
//           creator: campaign[5],
//           isFunded: campaign[6],
//           isRefunded: campaign[7],
//           isCancelled: campaign[8],
//           userContribution: ethers.formatEther(contributionAmount),
//         });
//       }
//       setCampaigns(campaignsData);
//     } catch (error) {
//       console.error('Error loading campaigns:', error);
//     }
//   };

//   const refreshCampaigns = () => contract && loadCampaigns(contract);
//   const openEditModal = (campaign: Campaign) => setEditingCampaign(campaign);

//   return (
//     <div className="app-container">
//       <Header 
//         account={account} 
//         setAccount={setAccount}
//         openCreateModal={() => setIsCreateModalOpen(true)}
//       />
      
//       {loading ? (
//         <div className="loading">Loading campaigns...</div>
//       ) : (
//         <>
//           {!account && (
//             <div className="wallet-warning">
//               Connect wallet to contribute or create campaigns
//             </div>
//           )}
          
//           {(isCreateModalOpen || editingCampaign) && (
//             <CreateCampaign
//               contract={contract}
//               onClose={() => {
//                 setIsCreateModalOpen(false);
//                 setEditingCampaign(null);
//               }}
//               refreshCampaigns={refreshCampaigns}
//               isEdit={!!editingCampaign}
//               campaignId={editingCampaign?.id}
//               initialTitle={editingCampaign?.title}
//               initialGoal={editingCampaign?.goal}
//               initialDeadline={editingCampaign?.deadline}
//             />
//           )}
          
//           <CampaignList
//             campaigns={campaigns}
//             contract={contract}
//             account={account}
//             refreshCampaigns={refreshCampaigns}
//             openEditModal={openEditModal}
//           />
//         </>
//       )}
//     </div>
//   );
// };

// export default App;
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Header from './components/Header';
import CampaignList from './components/CampaignList';
import CreateCampaign from './components/CreateCampaign';
import CrowdfundingABI from './contracts/Crowdfunding.json';
import './styles.css';
import { Campaign } from './types';

const App = () => {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

  // Initialize the provider and contract
  useEffect(() => {
    const init = async () => {
      try {
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const tempContract = new ethers.Contract(
            contractAddress,
            CrowdfundingABI.abi,
            signer
          );
          setContract(tempContract);
          
          // Request accounts and set the account
          const accounts = await provider.send('eth_requestAccounts', []);
          setAccount(accounts[0]);

          // Subscribe to account change events
          window.ethereum.on('accountsChanged', (accounts: string[]) => {
            if (accounts.length > 0) {
              setAccount(accounts[0]);
            } else {
              setAccount('');
            }
          });
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setLoading(false);
      }
    };
    init();

    // Cleanup listener when component is unmounted
    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  // Load campaigns when the contract is set
  useEffect(() => {
    if (contract) {
      loadCampaigns(contract);
    }
  }, [contract]);

  const loadCampaigns = async (contractInstance: ethers.Contract) => {
    try {
      const count = await contractInstance.getCampaignCount();
      const campaignCount = Number(count);
      const campaignsData: Campaign[] = [];
      
      for (let i = 1; i <= campaignCount; i++) {
        const campaign = await contractInstance.getCampaignDetails(i);
        const contributionAmount = account ? 
          await contractInstance.getContributions(i, account) : 
          ethers.parseEther('0');
          
        campaignsData.push({
          id: i,
          title: campaign[0],
          goal: ethers.formatEther(campaign[1]),
          deadline: new Date(Number(campaign[2]) * 1000),
          totalContributed: ethers.formatEther(campaign[3]),
          totalBackers: Number(campaign[4]),
          creator: campaign[5],
          isFunded: campaign[6],
          isRefunded: campaign[7],
          isCancelled: campaign[8],
          userContribution: ethers.formatEther(contributionAmount),
        });
      }
      setCampaigns(campaignsData);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  const refreshCampaigns = () => contract && loadCampaigns(contract);
  const openEditModal = (campaign: Campaign) => setEditingCampaign(campaign);

  return (
    <div className="app-container">
      <Header 
        account={account} 
        setAccount={setAccount}
        openCreateModal={() => setIsCreateModalOpen(true)}
      />
      
      {loading ? (
        <div className="loading">Loading campaigns...</div>
      ) : (
        <>
          {!account && (
            <div className="wallet-warning">
              Connect wallet to contribute or create campaigns
            </div>
          )}
          
          {(isCreateModalOpen || editingCampaign) && (
            <CreateCampaign
              contract={contract}
              onClose={() => {
                setIsCreateModalOpen(false);
                setEditingCampaign(null);
              }}
              refreshCampaigns={refreshCampaigns}
              isEdit={!!editingCampaign}
              campaignId={editingCampaign?.id}
              initialTitle={editingCampaign?.title}
              initialGoal={editingCampaign?.goal}
              initialDeadline={editingCampaign?.deadline}
            />
          )}
          
          <CampaignList
            campaigns={campaigns}
            contract={contract}
            account={account}
            refreshCampaigns={refreshCampaigns}
            openEditModal={openEditModal}
          />
        </>
      )}
    </div>
  );
};

export default App;
