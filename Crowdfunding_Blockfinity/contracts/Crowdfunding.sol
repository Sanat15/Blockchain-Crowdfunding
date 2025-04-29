// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Crowdfunding is ReentrancyGuard {

    struct Campaign {
        string title;
        uint256 goal;
        uint256 deadline;
        uint256 totalContributed;
        uint256 totalBackers;
        address creator;
        bool isFunded;
        bool isRefunded;
        bool isCancelled;
    }

    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => uint256)) public contributions;

    uint256 public campaignCount;

    // Events
    event CampaignCreated(uint256 campaignId, string title, uint256 goal, uint256 deadline, address creator);
    event CampaignEdited(uint256 campaignId, string newTitle, uint256 newGoal, uint256 newDeadline);
    event ContributionMade(uint256 campaignId, address backer, uint256 amount);
    event FundsReleased(uint256 campaignId, address creator, uint256 amount);
    event RefundIssued(uint256 campaignId, address backer, uint256 amount);
    event CampaignCancelled(uint256 campaignId);

    // Create a new campaign
    function createCampaign(string memory _title, uint256 _goal, uint256 _deadline) external {
        require(_goal > 0, "Goal must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");

        campaignCount++;
        campaigns[campaignCount] = Campaign({
            title: _title,
            goal: _goal,
            deadline: _deadline,
            totalContributed: 0,
            totalBackers: 0,
            creator: msg.sender,
            isFunded: false,
            isRefunded: false,
            isCancelled: false
        });

        emit CampaignCreated(campaignCount, _title, _goal, _deadline, msg.sender);
    }

    // Allow creator to edit campaign
    function editCampaign(uint256 _campaignId, string memory _newTitle, uint256 _newGoal, uint256 _newDeadline) external {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.creator == msg.sender, "Only creator can edit");
        require(block.timestamp < campaign.deadline, "Cannot edit after deadline");
        require(!campaign.isFunded, "Cannot edit after funds released");
        require(!campaign.isCancelled, "Campaign is cancelled");

        require(_newGoal > 0, "Goal must be greater than 0");
        require(_newDeadline > block.timestamp, "Deadline must be in the future");

        campaign.title = _newTitle;
        campaign.goal = _newGoal;
        campaign.deadline = _newDeadline;

        emit CampaignEdited(_campaignId, _newTitle, _newGoal, _newDeadline);
    }

    // Contribute to a campaign
    function contribute(uint256 _campaignId) external payable {
        Campaign storage campaign = campaigns[_campaignId];
        require(block.timestamp < campaign.deadline, "Campaign has ended");
        require(msg.value > 0, "Contribution must be greater than 0");
        require(!campaign.isCancelled, "Campaign is cancelled");

        // If it's the first contribution by this backer
        if (contributions[_campaignId][msg.sender] == 0) {
            campaign.totalBackers++;
        }

        contributions[_campaignId][msg.sender] += msg.value;
        campaign.totalContributed += msg.value;

        emit ContributionMade(_campaignId, msg.sender, msg.value);
    }

// Modify releaseFunds function
function releaseFunds(uint256 _campaignId) external nonReentrant {
    Campaign storage campaign = campaigns[_campaignId];
    require(campaign.totalContributed >= campaign.goal, "Funding goal not met");
    require(!campaign.isFunded, "Funds already released");
    require(!campaign.isCancelled, "Campaign is cancelled");
    
    // Allow release if either:
    // 1. Deadline passed OR 
    // 2. Goal met before deadline
    require(
        block.timestamp > campaign.deadline || 
        msg.sender == campaign.creator,
        "Only creator can release before deadline"
    );

    campaign.isFunded = true;
    uint256 amount = campaign.totalContributed;
    (bool sent, ) = payable(campaign.creator).call{value: amount}("");
    require(sent, "Failed to send Ether");
    
    emit FundsReleased(_campaignId, campaign.creator, amount);
}

    // Backer can claim refund if goal not met
    function refundContribution(uint256 _campaignId) external nonReentrant {
        Campaign storage campaign = campaigns[_campaignId];
        require(block.timestamp > campaign.deadline || campaign.isCancelled, "Campaign still active");
        require(campaign.totalContributed < campaign.goal || campaign.isCancelled, "Funding goal was met");
        require(!campaign.isRefunded, "Refunds already processed");

        uint256 contributedAmount = contributions[_campaignId][msg.sender];
        require(contributedAmount > 0, "No contributions found for sender");

        contributions[_campaignId][msg.sender] = 0; // Protect from reentrancy
        (bool refunded, ) = payable(msg.sender).call{value: contributedAmount}("");
        require(refunded, "Refund failed");

        emit RefundIssued(_campaignId, msg.sender, contributedAmount);
    }

    // Creator can cancel the campaign and refund everyone
    function cancelCampaign(uint256 _campaignId) external nonReentrant {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.creator == msg.sender, "Only creator can cancel");
        require(!campaign.isCancelled, "Already cancelled");
        require(!campaign.isFunded, "Funds already released");

        campaign.isCancelled = true;

        emit CampaignCancelled(_campaignId);
    }

    // View functions
    function getCampaignCount() external view returns (uint256) {
        return campaignCount;
    }

    function getCampaignDetails(uint256 _campaignId) external view returns (
        string memory title,
        uint256 goal,
        uint256 deadline,
        uint256 totalContributed,
        uint256 totalBackers,
        address creator,
        bool isFunded,
        bool isRefunded,
        bool isCancelled
    ) {
        Campaign memory campaign = campaigns[_campaignId];
        return (
            campaign.title,
            campaign.goal,
            campaign.deadline,
            campaign.totalContributed,
            campaign.totalBackers,
            campaign.creator,
            campaign.isFunded,
            campaign.isRefunded,
            campaign.isCancelled
        );
    }

    function getContributions(uint256 _campaignId, address backer) external view returns (uint256) {
        return contributions[_campaignId][backer];
    }
}
