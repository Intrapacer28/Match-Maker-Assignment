import { getParsedTokenAccountsByOwner } from '../utils/utils'; // Ensure to implement this utility
import WhaleWallets from '../models/whalewallets'; // Adjust import based on your project structure
import { BASE_AMOUNT_FOR_WHALES } from '../config/profitConfig'; // Adjust import based on your config
import { TOKEN_MINT } from '../config/volumeConfig';


export async function getWhaleWallets() {
    try {
        // Fetch all whale wallets from the database
        const whaleWallets = await WhaleWallets.find({}, { walletAddress: 1, _id: 0 });
        const qualifyingWallets: string[] = [];

        for (const wallet of whaleWallets) {
            const tokenBalance = await getParsedTokenAccountsByOwner(wallet.walletAddress, TOKEN_MINT); // Fetch the token balance

            // Check if the wallet has a balance greater than the base amount
            if (tokenBalance > BASE_AMOUNT_FOR_WHALES) {
                qualifyingWallets.push(wallet.walletAddress); // Add to qualifying wallets
            }
        }

        return qualifyingWallets; // Return an array of wallet addresses that are considered whales
    } catch (error) {
        console.error('Error fetching whale wallets:', error);
        return []; // Return an empty array in case of error
    }
}

// Import necessary packages and config
import axios from 'axios';
import cron from 'node-cron';
import WhaleWallet from '../models/whalewallets'; // Adjust the import based on your project structure
import { PERCENT_THRESHOLD_FOR_WHALE_WALLET_QUALIFICATION } from '../config/profitConfig'; // Adjust the path as needed

// Function to fetch whale wallets
const fetchWhaleWallets = async () => {
    try {
        // Step 1: Get the total supply of the token
        const totalSupplyResponse = await axios.post('https://api.mainnet-beta.solana.com', {
            jsonrpc: "2.0",
            id: 1,
            method: "getTokenSupply",
            params: [
                TOKEN_MINT // Use TOKEN_MINT variable
            ]
        });

        const totalSupply = totalSupplyResponse.data.result.value.amount;
        const fivePercentThreshold = totalSupply * PERCENT_THRESHOLD_FOR_WHALE_WALLET_QUALIFICATION; // Use the imported constant

        // Step 2: Get the largest accounts (wallets)
        const response = await axios.post('https://api.mainnet-beta.solana.com', {
            jsonrpc: "2.0",
            id: 1,
            method: "getTokenLargestAccounts",
            params: [
                TOKEN_MINT // Use TOKEN_MINT variable
            ]
        });

        // Adjust based on API response structure
        const wallets = response.data.result.value; // Accessing the wallets from the API response

        // Filter wallets with at least the threshold percentage of the total supply
        const filteredWallets = wallets.filter(wallet => wallet.amount >= fivePercentThreshold);

        // Store wallets in the database
        for (const wallet of filteredWallets) {
            await WhaleWallet.updateOne(
                { walletAddress: wallet.address }, // Adjust based on your schema
                { $set: { address: wallet.address, amount: wallet.amount } }, // Store the necessary fields
                { upsert: true }
            );
        }
        // console.log('Whale wallets updated successfully.');
    } catch (error) {
        console.error('Error fetching whale wallets:', error);
    }
};

// Schedule the task to run every hour
fetchWhaleWallets(); // Call immediately
cron.schedule('*/5 * * * *', fetchWhaleWallets); // Schedule for every 5 minutes





// ../utils/whaleUtils.js

/**
 * Function to check if a transaction involves a whale wallet.
 * @param {string} fromAccount - The wallet address sending the token/SOL.
 * @param {string} toAccount - The wallet address receiving the token/SOL.
 * @param {string[]} whaleWallets - List of known whale wallet addresses.
 * @returns {boolean} Returns true if either the sender or receiver is a whale wallet.
 */
// Function to check if the transaction involves a whale wallet
export const isWhaleTransaction = (transaction, whaleWallets) => {
    // Check if the 'from' or 'to' address is in the list of whale wallets
    return whaleWallets.some(wallet => wallet.walletAddress === transaction.from || wallet.walletAddress === transaction.to);
};

