"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWhaleTransaction = void 0;
exports.getWhaleWallets = getWhaleWallets;
const utils_1 = require("../utils/utils"); // Ensure to implement this utility
const whalewallets_1 = __importDefault(require("../models/whalewallets")); // Adjust import based on your project structure
const profitConfig_1 = require("../config/profitConfig"); // Adjust import based on your config
const volumeConfig_1 = require("../config/volumeConfig");
async function getWhaleWallets() {
    try {
        // Fetch all whale wallets from the database
        const whaleWallets = await whalewallets_1.default.find({}, { walletAddress: 1, _id: 0 });
        const qualifyingWallets = [];
        for (const wallet of whaleWallets) {
            const tokenBalance = await (0, utils_1.getParsedTokenAccountsByOwner)(wallet.walletAddress, volumeConfig_1.TOKEN_MINT); // Fetch the token balance
            // Check if the wallet has a balance greater than the base amount
            if (tokenBalance > profitConfig_1.BASE_AMOUNT_FOR_WHALES) {
                qualifyingWallets.push(wallet.walletAddress); // Add to qualifying wallets
            }
        }
        return qualifyingWallets; // Return an array of wallet addresses that are considered whales
    }
    catch (error) {
        console.error('Error fetching whale wallets:', error);
        return []; // Return an empty array in case of error
    }
}
// Import necessary packages and config
const axios_1 = __importDefault(require("axios"));
const node_cron_1 = __importDefault(require("node-cron"));
const whalewallets_2 = __importDefault(require("../models/whalewallets")); // Adjust the import based on your project structure
const profitConfig_2 = require("../config/profitConfig"); // Adjust the path as needed
// Function to fetch whale wallets
const fetchWhaleWallets = async () => {
    try {
        // Step 1: Get the total supply of the token
        const totalSupplyResponse = await axios_1.default.post('https://api.mainnet-beta.solana.com', {
            jsonrpc: "2.0",
            id: 1,
            method: "getTokenSupply",
            params: [
                volumeConfig_1.TOKEN_MINT // Use TOKEN_MINT variable
            ]
        });
        const totalSupply = totalSupplyResponse.data.result.value.amount;
        const fivePercentThreshold = totalSupply * profitConfig_2.PERCENT_THRESHOLD_FOR_WHALE_WALLET_QUALIFICATION; // Use the imported constant
        // Step 2: Get the largest accounts (wallets)
        const response = await axios_1.default.post('https://api.mainnet-beta.solana.com', {
            jsonrpc: "2.0",
            id: 1,
            method: "getTokenLargestAccounts",
            params: [
                volumeConfig_1.TOKEN_MINT // Use TOKEN_MINT variable
            ]
        });
        // Adjust based on API response structure
        const wallets = response.data.result.value; // Accessing the wallets from the API response
        // Filter wallets with at least the threshold percentage of the total supply
        const filteredWallets = wallets.filter(wallet => wallet.amount >= fivePercentThreshold);
        // Store wallets in the database
        for (const wallet of filteredWallets) {
            await whalewallets_2.default.updateOne({ walletAddress: wallet.address }, // Adjust based on your schema
            { $set: { address: wallet.address, amount: wallet.amount } }, // Store the necessary fields
            { upsert: true });
        }
        // console.log('Whale wallets updated successfully.');
    }
    catch (error) {
        console.error('Error fetching whale wallets:', error);
    }
};
// Schedule the task to run every hour
fetchWhaleWallets(); // Call immediately
node_cron_1.default.schedule('*/5 * * * *', fetchWhaleWallets); // Schedule for every 5 minutes
// ../utils/whaleUtils.js
/**
 * Function to check if a transaction involves a whale wallet.
 * @param {string} fromAccount - The wallet address sending the token/SOL.
 * @param {string} toAccount - The wallet address receiving the token/SOL.
 * @param {string[]} whaleWallets - List of known whale wallet addresses.
 * @returns {boolean} Returns true if either the sender or receiver is a whale wallet.
 */
// Function to check if the transaction involves a whale wallet
const isWhaleTransaction = (transaction, whaleWallets) => {
    // Check if the 'from' or 'to' address is in the list of whale wallets
    return whaleWallets.some(wallet => wallet.walletAddress === transaction.from || wallet.walletAddress === transaction.to);
};
exports.isWhaleTransaction = isWhaleTransaction;
