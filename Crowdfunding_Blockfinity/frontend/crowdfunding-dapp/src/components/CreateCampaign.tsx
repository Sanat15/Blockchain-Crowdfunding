import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import '../styles.css';
// import { Campaign } from '../types.ts';

interface CreateCampaignProps {
  contract: ethers.Contract | null;
  onClose: () => void;
  refreshCampaigns: () => void;
  isEdit?: boolean;
  campaignId?: number;
  initialTitle?: string;
  initialGoal?: string;
  initialDeadline?: Date;
}

const CreateCampaign: React.FC<CreateCampaignProps> = ({
  contract,
  onClose,
  refreshCampaigns,
  isEdit,
  campaignId,
  initialTitle,
  initialGoal,
  initialDeadline
}) => {
  const [title, setTitle] = useState(initialTitle || '');
  const [goal, setGoal] = useState(initialGoal || '');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const defaultDate = new Date(Date.now() + 3 * 86400 * 1000);
    const datetimeLocal = defaultDate.toISOString().slice(0, 16);
    setDeadline(initialDeadline ? 
      new Date(initialDeadline.getTime() - (initialDeadline.getTimezoneOffset() * 60000))
        .toISOString()
        .slice(0, 16) : 
      datetimeLocal);
  }, [initialDeadline]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || (isEdit && !campaignId)) return;

    try {
      setLoading(true);
      setError('');
      const goalInWei = ethers.parseEther(goal);
      const selectedDate = new Date(deadline);
      const deadlineTimestamp = Math.floor(selectedDate.getTime() / 1000);

      if (selectedDate.getTime() < Date.now()) {
        throw new Error('Deadline must be in the future');
      }

      if (isEdit) {
        const tx = await contract.editCampaign(campaignId, title, goalInWei, deadlineTimestamp);
        await tx.wait();
      } else {
        const tx = await contract.createCampaign(title, goalInWei, deadlineTimestamp);
        await tx.wait();
      }

      refreshCampaigns();
      onClose();
    } catch (error: any) {
      setError(error.reason || error.message?.substring(0, 100) || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{isEdit ? 'Edit Campaign' : 'Create Campaign'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Goal (ETH)</label>
            <input
              type="number"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              min="0.01"
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label>Deadline</label>
            <input
              type="datetime-local"
              value={deadline}
              min={new Date().toISOString().slice(0, 16)}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>
          {error && <div className="error">{error}</div>}
          <div className="form-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading}>
              {loading ? 'Processing...' : isEdit ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;
