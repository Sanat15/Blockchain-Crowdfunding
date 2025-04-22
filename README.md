# Decentralized Crowdfunding Platform (Kickstarter Clone)

A trustless, transparent crowdfunding platform built on the Ethereum blockchain. Campaign creators can launch projects with funding goals and deadlines, and contributors can fund them using ETH. Funds are automatically released to creators if the goal is met, or refunded to backers if not.

## Features

- Campaign Creation: Anyone can start a campaign by setting a title, funding goal (in ETH), and deadline.  
- ETH Contributions: Backers can fund campaigns directly from their wallets (e.g., MetaMask).  
- Smart Contract Logic:
  - Automatically releases funds to creator if the goal is reached by the deadline.
  - Refunds contributors if the campaign fails.
  - Prevents reentrancy attacks using OpenZeppelin’s ReentrancyGuard.
- Campaign Tracking: Real-time updates and viewable campaign status (active, funded, failed).
- Testing: Full test coverage using Truffle and Ganache for deployment and logic testing.

## Tech Stack

- Smart Contracts: Solidity  
- Blockchain: Ethereum (Local via Ganache)  
- Frameworks: Truffle (development & testing)  
- Frontend: React.js + Web3.js  
- Wallet Integration: MetaMask  
- Security: OpenZeppelin Contracts

## Contract Structure

struct Campaign {
  address payable creator;
  string title;
  uint goal;
  uint deadline;
  uint amountCollected;
  bool fundsReleased;
}

Functions:
- createCampaign(): Launches a new campaign  
- contribute(): Allows ETH contributions before deadline  
- releaseFunds(): Transfers funds to creator if goal is met  
- claimRefund(): Refunds backers if campaign fails  
- getCampaignCount() / getContribution(): View helper functions

## Testing

Run Ganache locally and use Truffle for deploying and testing:

truffle compile  
truffle migrate --network development  
truffle test

## MetaMask Integration

- Connect MetaMask to local Ganache at http://127.0.0.1:7545  
- Use one of Ganache's test accounts with imported private key for funding

## Folder Structure

contracts/
- Crowdfunding.sol
- Migrations.sol

migrations/
- 1_initial_migration.js
- 2_deploy_contracts.js

test/
- crowdfunding.test.js

client/
- (React frontend)

## License

MIT License

## Author

Developed by Sanat as a project-based implementation of Ethereum smart contract fundamentals and full-stack blockchain development.
