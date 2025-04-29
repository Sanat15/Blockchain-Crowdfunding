// Contract ABI and Address
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your contract address
const contractABI = [
    "function createCampaign(string memory _title, string memory _details, uint256 _goal, uint256 _deadline) public",
    "function contribute(uint256 _campaignId) external payable",
    "function getCampaignDetails(uint256 _campaignId) external view returns (string memory title, string memory details, uint256 goal, uint256 deadline, uint256 totalContributed, address creator, bool isFunded, bool isRefunded)",
    "function getCampaignCount() external view returns (uint256)"
];

// Ensure that MetaMask is available
if (typeof window.ethereum === "undefined") {
    alert("MetaMask is not installed!");
} else {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    let signer;
    let crowdfunding;
    let connected = false;

    // Connect to MetaMask
    document.getElementById("connectMetaMask").onclick = async () => {
        if (!connected) {
            try {
                await window.ethereum.request({ method: "eth_requestAccounts" });
                signer = provider.getSigner();
                crowdfunding = new ethers.Contract(contractAddress, contractABI, signer);
                connected = true;
                document.getElementById("connectMetaMask").innerText = "Disconnect MetaMask";
                loadCampaigns();
                document.getElementById("createCampaignForm").style.display = "block"; // Show create campaign form
            } catch (err) {
                alert("Connection failed.");
                console.error(err);
            }
        } else {
            connected = false;
            document.getElementById("connectMetaMask").innerText = "Connect MetaMask";
            document.getElementById("createCampaignForm").style.display = "none"; // Hide create campaign form
            document.getElementById("campaignDetailsContainer").style.display = "none";
            document.getElementById("campaigns").innerHTML = ""; // Clear campaigns list
        }
    };

    // Create Campaign
    document.getElementById("createCampaign").onclick = async () => {
        const title = document.getElementById("campaignTitle").value;
        const details = document.getElementById("campaignDetails").value;
        const goal = ethers.utils.parseEther(document.getElementById("goalAmount").value);
        const deadlineStr = document.getElementById("deadline").value;
        const deadline = new Date(deadlineStr.split("/").reverse().join("-")).getTime() / 1000;

        try {
            const tx = await crowdfunding.createCampaign(title, details, goal, deadline);
            await tx.wait();
            alert("Campaign Created!");
            loadCampaigns(); // Reload campaigns after creation
        } catch (err) {
            alert("Campaign creation failed.");
            console.error(err);
        }
    };

    // Load Campaigns
    async function loadCampaigns() {
        const campaignCount = await crowdfunding.getCampaignCount();
        const campaignsContainer = document.getElementById("campaigns");
        campaignsContainer.innerHTML = "<h2>All Campaigns</h2>"; // Clear previous campaigns

        for (let i = 0; i < campaignCount; i++) {
            try {
                const campaign = await crowdfunding.getCampaignDetails(i);
                const campaignElement = document.createElement("div");
                campaignElement.classList.add("campaign-card");
                campaignElement.innerHTML = `
                    <h4>Title: ${campaign[0]}</h4>
                    <p>Details: ${campaign[1]}</p>
                    <p>Goal: ${ethers.utils.formatEther(campaign[2])} ETH</p>
                    <p>Deadline: ${new Date(campaign[3] * 1000).toLocaleString()}</p>
                    <p>Total Contributed: ${ethers.utils.formatEther(campaign[4])} ETH</p>
                    <p>Creator: ${campaign[5]}</p>
                    <p>Status: ${campaign[6] ? "Funded" : "Not Funded"}</p>
                    <button onclick="viewCampaignDetails(${i})">View Details</button>
                `;
                campaignsContainer.appendChild(campaignElement);
            } catch (err) {
                console.error("Error fetching campaign details", err);
            }
        }
    }

    // View Campaign Details
    window.viewCampaignDetails = async (campaignId) => {
        try {
            const campaign = await crowdfunding.getCampaignDetails(campaignId);
            const detailsContainer = document.getElementById("campaignDetailsContainer");
            detailsContainer.style.display = "block";
            document.getElementById("campaignDetails").innerText = JSON.stringify(campaign, null, 2);
        } catch (err) {
            alert("Error fetching campaign details.");
            console.error(err);
        }
    };

    // Contribute to Campaign (This is an example; UI for contribution can be added later)
    // For simplicity, we can implement it by calling the `contribute` method with the proper ID and amount.
    // Add additional input and UI elements for the contribution when needed.
}
