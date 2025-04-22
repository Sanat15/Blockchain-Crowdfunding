// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Crowdfunding is ReentrancyGuard {
    struct Campaign {
        address payable creator;
        string title;
        uint goal;
        uint deadline;
        uint amountCollected;
        bool fundsReleased;
    }

    uint public campaignCount = 0;
    mapping(uint => Campaign) public campaigns;
    mapping(uint => mapping(address => uint)) public contributions;

    event CampaignCreated(uint id, string title, uint goal, uint deadline);
    event ContributionMade(uint id, address backer, uint amount);
    event FundsReleased(uint id);
    event RefundIssued(uint id, address backer, uint amount);

    function createCampaign(string memory _title, uint _goal, uint _durationInDays) public {
        campaignCount++;
        campaigns[campaignCount] = Campaign(
            payable(msg.sender),
            _title,
            _goal,
            block.timestamp + (_durationInDays * 1 days),
            0,
            false
        );
        emit CampaignCreated(campaignCount, _title, _goal, block.timestamp + (_durationInDays * 1 days));
    }

    function contribute(uint _id) public payable {
        Campaign storage campaign = campaigns[_id];
        require(block.timestamp < campaign.deadline, "Campaign ended");
        require(msg.value > 0, "Must send ETH");

        campaign.amountCollected += msg.value;
        contributions[_id][msg.sender] += msg.value;

        emit ContributionMade(_id, msg.sender, msg.value);
    }

	function releaseFunds(uint _id) public nonReentrant {
  	  Campaign storage campaign = campaigns[_id];
  	  require(block.timestamp >= campaign.deadline, "Campaign not ended yet");
  	  require(campaign.amountCollected >= campaign.goal, "Goal not met");
  	  require(!campaign.fundsReleased, "Already released");

  	  campaign.fundsReleased = true;
  	  campaign.creator.transfer(campaign.amountCollected);
  	  emit FundsReleased(_id);
	}

	function claimRefund(uint _id) public nonReentrant {
 	   Campaign storage campaign = campaigns[_id];
  	  require(block.timestamp >= campaign.deadline, "Campaign not ended yet");
  	  require(campaign.amountCollected < campaign.goal, "Goal was met");
    
  	  uint amount = contributions[_id][msg.sender];
  	  require(amount > 0, "No contributions to refund");

 	   contributions[_id][msg.sender] = 0;
  	  payable(msg.sender).transfer(amount);
  	  emit RefundIssued(_id, msg.sender, amount);
	}

        }
    }

    // View functions
    function getCampaignCount() public view returns (uint) {
        return campaignCount;
    }

    function getContribution(uint _id, address _backer) public view returns (uint) {
        return contributions[_id][_backer];
    }
}
