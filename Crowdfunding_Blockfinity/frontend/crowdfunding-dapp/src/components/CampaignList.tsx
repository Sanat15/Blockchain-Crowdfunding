import { useState } from 'react';
import CampaignCard from './CampaignCard';
import '../styles.css'; // Import the external CSS file
import { Campaign } from '../types';
import { ethers } from 'ethers';

interface CampaignListProps {
  campaigns: Campaign[];
  contract: ethers.Contract | null;
  account: string;
  refreshCampaigns: () => void;
  openEditModal: (campaign: Campaign) => void;
}

const CampaignList: React.FC<CampaignListProps> = ({
  campaigns,
  contract,
  account,
  refreshCampaigns,
  openEditModal
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'ended'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase());
    const isActive = campaign.deadline > new Date() && !campaign.isCancelled;
    
    return matchesSearch && (
      filter === 'all' ||
      (filter === 'active' && isActive) ||
      (filter === 'ended' && !isActive)
    );
  });

  return (
    <div className="campaign-list-container">
      <div className="campaign-list-controls">
        <input
          type="text"
          placeholder="Search campaigns..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="campaign-search-input"
        />
        
        <div className="campaign-filters">
          <button onClick={() => setFilter('all')} className="filter-button">All</button>
          <button onClick={() => setFilter('active')} className="filter-button">Active</button>
          <button onClick={() => setFilter('ended')} className="filter-button">Ended</button>
        </div>
      </div>

      <div className="campaign-grid">
        {filteredCampaigns.map(campaign => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            contract={contract}
            account={account}
            refreshCampaigns={refreshCampaigns}
            openEditModal={openEditModal}
          />
        ))}
      </div>
    </div>
  );
};

export default CampaignList;
