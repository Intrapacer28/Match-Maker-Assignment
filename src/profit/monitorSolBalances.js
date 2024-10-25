"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitorWalletsForSolanaPurchase = monitorWalletsForSolanaPurchase;
// Importing utility functions from a local module
const utils_1 = require("../utils/utils");
// Importing environment variables
require("dotenv/config");
const buyToken_1 = require("../swapper/buyToken");
const web3_js_1 = require("@solana/web3.js");
const bs58_1 = __importDefault(require("bs58"));
const opentrades_1 = __importDefault(require("../models/opentrades"));
const logger_1 = require("../utils/logger");
const mongoose_1 = __importDefault(require("mongoose"));
const exclusiveholders_1 = __importDefault(require("../models/exclusiveholders"));
const SolanaBalanceListener_1 = require("../utils/SolanaBalanceListener");
const profitConfig_1 = require("../config/profitConfig");
// Define constants
const userWalletPublicKey = process.env.WALLET_PUBLIC_KEY || 'YOUR_PUBLIC_KEY';
const primaryWallet = web3_js_1.Keypair.fromSecretKey(bs58_1.default.decode(process.env.WALLET_PRIVATE_KEY || ''));
// Connect to MongoDB
mongoose_1.default
    .connect('mongodb://127.0.0.1:27017/market-maker-bot') // Connecting to MongoDB at the specified URL
    .then(() => logger_1.logger.info("Mongo Connected")) // Log success message if connected
    .catch(err => logger_1.logger.error("Mongo Error", err)); // Log error message if connection fails
// Fetch exclusive holder details
async function fetchExclusiveHolderDetails() {
    // Retrieve the list of exclusive token holders
    const exclusiveHolders = await (0, utils_1.readExclusiveTokenHolders)();
    // If no exclusive holders are found, log info and return empty object
    if (exclusiveHolders.length === 0) {
        logger_1.logger.info("No Exclusive Holder");
        await (0, utils_1.delay)(1000); // Delay before next operation
        return {};
    }
    const exclusiveHolderDetails = exclusiveHolders.reduce((acc, holder) => {
        acc[holder.walletAddress] = {
            sol: holder.solBalance,
            tokenAddress: holder.tokenAddress
        };
        return acc;
    }, {});
    return exclusiveHolderDetails;
}
// Process wallet balances
async function processWallet(walletAddresses, exclusiveHolderDetails, currentBalances) {
    // Iterate over each wallet address
    for (const wallet of walletAddresses) {
        const currentBalance = currentBalances[wallet].sol; // Get the current balance of the wallet
        const previousBalance = exclusiveHolderDetails[wallet].sol; // Get the previous balance of the wallet
        const balanceDifference = currentBalance - previousBalance; // Calculate the difference in balance
        // If SOL was deducted, log and update the balance
        if (currentBalance < previousBalance) {
            logger_1.logger.info(`SOL deducted from wallet ${wallet}: ${balanceDifference.toFixed(4)} SOL ⬇️`);
            await exclusiveholders_1.default.updateOne({ walletAddress: wallet }, // Filter to find the wallet
            { $set: { solBalance: currentBalance } } // Update the SOL balance
            );
            continue;
        }
        // If balance difference is less than the minimum threshold, log and update the balance
        if (Math.floor(balanceDifference) < profitConfig_1.MIN_SOL_DIFFERENCE_TO_UPDATE) {
            logger_1.logger.info(`Wallet ${wallet} balance change (${balanceDifference.toFixed(4)} SOL) doesn't meet the minimum threshold of 5 SOL ⚠️`);
            await exclusiveholders_1.default.updateOne({ walletAddress: wallet }, // Filter to find the wallet
            { $set: { solBalance: currentBalance } } // Update the SOL balance
            );
            continue;
        }
        // If SOL was added, log the addition
        logger_1.logger.info(`SOL added to wallet ${wallet}: ${balanceDifference.toFixed(4)} SOL ✅`);
        // Calculate the amount of SOL to buy with a random percentage
        const randomPercentage = Math.floor(Math.random() * 11) + 50;
        const solanaToBuy = Math.floor((randomPercentage / 100) * currentBalance);
        const userSolanaBalance = await (0, utils_1.getSolanaBalance)(userWalletPublicKey);
        // if (userSolanaBalance < solanaToBuy) {
        //     logger.warn(`User doesn't have enough SOL balance. Required: ${solanaToBuy}, Available: ${userSolanaBalance} ❌`);
        //     continue;  // Skip to the next wallet if insufficient balance
        // }
        try {
            // Retrieve token decimals and price
            const decimals = await (0, utils_1.getTokenDecimals)(exclusiveHolderDetails[wallet].tokenAddress);
            const tokenPrice = await (0, utils_1.getTokenPrice)(exclusiveHolderDetails[wallet].tokenAddress);
            logger_1.logger.info(`Attempting to purchase token with ${solanaToBuy} SOL 🚀`);
            // Buy the token and calculate the amount to sell
            const tokenToSell = await (0, buyToken_1.buyToken)(primaryWallet, exclusiveHolderDetails[wallet].tokenAddress, solanaToBuy, false, true) / 10 ** decimals;
            // Get the initial token balance
            const initialTokenBalance = await (0, utils_1.getBalanceOfToken)(wallet, exclusiveHolderDetails[wallet].tokenAddress);
            // Create a record of the open trade
            await opentrades_1.default.create({
                walletAddress: wallet, // Wallet address
                solBalance: currentBalance, // Current SOL balance
                tokenBalance: initialTokenBalance, // Initial token balance
                tokenAddress: exclusiveHolderDetails[wallet].tokenAddress, // Token address
                openTradeType: 'SELL', // Type of trade
                tokenAmount: tokenToSell, // Amount of token to sell
                solAmount: solanaToBuy, // Amount of SOL used
                tokenDecimal: decimals, // Number of decimals for the token
                tokenPrice: tokenPrice, // Price of the token
                timeStamp: new Date().getTime() // Timestamp of the trade
            }).then(() => {
                logger_1.logger.info(`Open Trade created for wallet ${wallet}`);
            }).catch((err) => {
                logger_1.logger.error("Error in creating open trade", { message: err.message, stack: err.stack });
            });
            await exclusiveholders_1.default.updateOne({ walletAddress: wallet }, { $set: { openTrade: true, solBalance: currentBalance } }).then(() => {
                logger_1.logger.info(`Updated ExclusiveHolder for ${wallet}: openTrade set to true, solBalance updated to ${currentBalance} ✅`);
            }).catch((err) => {
                logger_1.logger.error(`Error updating ExclusiveHolder for ${wallet}`, { message: err.message, stack: err.stack });
            });
        }
        catch (err) {
            logger_1.logger.error("Error in token purchase", { message: err.message, stack: err.stack });
            await exclusiveholders_1.default.updateOne({ walletAddress: wallet }, { $set: { solBalance: currentBalance } }).catch((updateErr) => {
                logger_1.logger.error(`Error updating solBalance for ${wallet} after failed purchase`, { message: updateErr.message, stack: updateErr.stack });
            });
        }
    }
}
// Monitor wallets for SOL balance changes
async function monitorWalletsForSolanaPurchase() {
    const listener = new SolanaBalanceListener_1.SolanaBalanceListener(process.env.RPC_URL || '');
    const monitoredWallets = new Set();
    async function handleBalanceChange(walletAddress, newBalance) {
        const exclusiveHolderDetails = await fetchExclusiveHolderDetails();
        if (exclusiveHolderDetails[walletAddress]) {
            const currentBalances = { [walletAddress]: { sol: newBalance } };
            await processWallet([walletAddress], exclusiveHolderDetails, currentBalances);
        }
    }
    listener.on('balanceChanged', handleBalanceChange);
    while (true) {
        try {
            const exclusiveHolderDetails = await fetchExclusiveHolderDetails();
            if (Object.keys(exclusiveHolderDetails).length === 0) {
                continue;
            }
            logger_1.logger.info('Checking if Exclusive holder SOL balance updated....');
            for (const [walletAddress] of Object.entries(exclusiveHolderDetails)) {
                if (!monitoredWallets.has(walletAddress)) {
                    listener.addHolder(walletAddress);
                    monitoredWallets.add(walletAddress);
                    logger_1.logger.info(`Added listener for wallet: ${walletAddress}`);
                }
            }
            const exclusiveHolderWallets = Object.keys(exclusiveHolderDetails);
            for (const walletAddress of monitoredWallets) {
                if (!(exclusiveHolderWallets.includes(walletAddress))) {
                    listener.removeHolder(walletAddress);
                    monitoredWallets.delete(walletAddress);
                    logger_1.logger.info(`Removed listener for wallet: ${walletAddress}`);
                }
            }
            if (global.gc) {
                global.gc();
            }
            await (0, utils_1.delay)(1000);
        }
        catch (err) {
            logger_1.logger.error("An error occurred:", { message: err.message, stack: err.stack });
            await (0, utils_1.delay)(2000);
        }
    }
}
process.on('SIGINT', () => {
    logger_1.logger.info('Gracefully shutting down...');
    process.exit(0);
});
monitorWalletsForSolanaPurchase().catch(console.error);
