import { useState } from 'react';
import { ethers } from 'ethers';
import '../styles.css';
import { Campaign } from '../types';

interface CampaignCardProps {
  campaign: Campaign;
  contract: ethers.Contract | null;
  account: string;
  refreshCampaigns: () => void;
  openEditModal: (campaign: Campaign) => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  contract,
  account,
  refreshCampaigns,
  openEditModal
}) => {
  const [contributionAmount, setContributionAmount] = useState('');
  const [isContributing, setIsContributing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isActive = campaign.deadline > new Date();
  const progress = (parseFloat(campaign.totalContributed) / parseFloat(campaign.goal)) * 100;
  const isCreator = campaign.creator.toLowerCase() === account?.toLowerCase();
  const isGoalMet = parseFloat(campaign.totalContributed) >= parseFloat(campaign.goal);
  const hasContributed = parseFloat(campaign.userContribution) > 0;

  const formatDate = (date: Date) => date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleAction = async (action: () => Promise<void>) => {
    if (!contract) {
      setError('Wallet not connected');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await action();
      refreshCampaigns();
    } catch (error: any) {
      setError(error.reason || error.message?.substring(0, 100) || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="campaign-card">
      <div className="campaign-header">
        <h3>{campaign.title}</h3>
        <div className={`status ${campaign.isCancelled ? 'cancelled' : ''}`}>
          {campaign.isCancelled ? 'Cancelled' : 
           campaign.isFunded ? 'Funded' :
           isGoalMet ? 'Ended' : 
           isActive ? 'Active' : 'Ended'}
        </div>
      </div>

      <div className="campaign-details">
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
        
        <div className="stats">
          <span>Goal: {campaign.goal} ETH</span>
          <span>Raised: {campaign.totalContributed} ETH</span>
          <span>Backers: {campaign.totalBackers}</span>
        </div>

        <div className="deadline-creator">
          <span>Deadline: {formatDate(campaign.deadline)}</span>
          <span>Creator: {isCreator ? 'You' : `${campaign.creator.slice(0, 6)}...${campaign.creator.slice(-4)}`}</span>
        </div>

        {hasContributed && (
          <div className="user-contribution">
            Your contribution: {campaign.userContribution} ETH
          </div>
        )}

        {error && <div className="error">{error}</div>}

        <div className="actions">
          {/* Only show the Contribute button if the wallet is connected */}
          {account && !isGoalMet && isActive ? (
            isContributing ? (
              <>
                <input
                  type="number"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  placeholder="ETH amount"
                  step="0.01"
                  min="0.01"
                />
                <button 
                  onClick={() => handleAction(async () => {
                    await contract!.contribute(campaign.id, {
                      value: ethers.parseEther(contributionAmount)
                    });
                    setIsContributing(false);
                  })}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Confirm'}
                </button>
                <button onClick={() => setIsContributing(false)}>Cancel</button>
              </>
            ) : (
              <button 
                onClick={() => setIsContributing(true)} 
                style={{
                  padding: '12px 20px',
                  fontSize: '16px',
                  fontWeight: '500',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  backgroundColor: '#808080',
                  color: 'white',
                  border: 'none',
                  transition: 'background-color 0.3s ease, transform 0.2s ease',
                  width: '100%', 
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center'
                }}
              >
                Contribute
              </button>
            )
          ) : null}

          {/* Other Action buttons */}
          {isCreator && isGoalMet && !campaign.isFunded && (
            <button 
              onClick={() => handleAction(() => contract!.releaseFunds(campaign.id))}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Release Funds'}
            </button>
          )}
          {!isCreator && hasContributed && !isGoalMet && !campaign.isRefunded && (
            <button 
              onClick={() => handleAction(() => contract!.refundContribution(campaign.id))}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Claim Refund'}
            </button>
          )}

          {/* Creator-only actions */}
          {!isGoalMet && isCreator && !campaign.isFunded && !campaign.isCancelled && (
            <div className="creator-actions">
              <button 
                className="edit-btn"
                onClick={() => openEditModal(campaign)}
              >
                Edit
              </button>
              <button
                className="danger"
                onClick={() => handleAction(() => contract!.cancelCampaign(campaign.id))}
                disabled={loading}
              >
                {loading ? 'Cancelling...' : 'Cancel'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;
