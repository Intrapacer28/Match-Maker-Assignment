// Import necessary modules and dependencies
import express from 'express'; // Import the Express framework for building the server
import { parseTransactionHeliusSwap, parseTransactionHeliusTransfer, parseTransactionResult, parseTransactionShyft } from '../utils/controllers'; // Import functions to parse different types of transactions
import { calculateTokenAmountForUSDC, checkExclusiveTokenHolder, getTokenDecimals, getTokenPrice } from '../utils/utils'; // Import utility functions for token calculations and checks
import { MIN_TOKEN_AMOUNT, MIN_SOL_BALANCE, TOKEN_DETAILS } from '../config/profitConfig'; // Import configuration constants for token amounts and details
import mongoose from 'mongoose'; // Import Mongoose for MongoDB interactions
import SplitTokenHolders from '../models/splittokenholders'; // Import Mongoose model for split token holders
import OpenTrades from '../models/opentrades'; // Import Mongoose model for open trades
import ExclusiveHolders from '../models/exclusiveholders'; // Import Mongoose model for exclusive token holders
import { buyToken } from '../swapper/buyToken'; // Import function to handle token purchases
import { Keypair } from '@solana/web3.js'; // Import Keypair class from Solana library for wallet management
import bs58 from "bs58"; // Import Base58 library for decoding wallet private key
import { logger, transactionLogger } from '../utils/logger'; // Import logging utilities
import bodyParser from 'body-parser'; // Import body-parser middleware for parsing request bodies
import { createWebhook } from '../webhook/helius-create-webhook'; // Import function to create webhooks
import { deleteWebhook } from '../webhook/helius-delete-webhook'; // Import function to delete webhooks

// Initialize Express app and set port
const app = express(); // Create an instance of the Express application
const port = 3002; // Define the port number for the server

// Create primary wallet from private key
const primaryWallet = Keypair.fromSecretKey(bs58.decode(process.env.WALLET_PRIVATE_KEY || '')); // Initialize the wallet using a private key from environment variables
// Initialize webhook ID
let webhookID; // Variable to store the ID of the created webhook

// Configure middleware
app.use(bodyParser.json()); // Middleware to parse JSON request bodies
app.use(express.urlencoded({ extended: false })); // Middleware to parse URL-encoded request bodies

// Function to create transaction listener
async function createTransactionListener() {
    const tokenAddresses: string[] = Object.values(TOKEN_DETAILS); // Get all token addresses from configuration
    webhookID = await createWebhook(tokenAddresses); // Create a webhook to listen for transactions and store its ID
}

// Call the function to create transaction listener
createTransactionListener(); // Invoke the function to set up transaction listener

// Connect to MongoDB
mongoose
    .connect('mongodb://127.0.0.1:27017/market-maker-bot') // Connect to the MongoDB database
    .then(() => logger.info("Mongo Connected")) // Log success message if connected
    .catch(err => logger.error("Mongo Error", err)); // Log error message if connection fails

// Webhook endpoint to handle incoming transactions
app.post('/webhook', (req, res) => {
    const transactions = req.body; // Extract transactions from the request body

    transactions.forEach(async (transaction) => {
        // Handle TRANSFER transactions
        if (transaction?.type == "TRANSFER" && transaction?.description) {
            const result = await parseTransactionHeliusTransfer(transaction); // Parse transfer transaction
            const tokenAddress = TOKEN_DETAILS[result.tokenSymbol]; // Get token address based on token symbol

            const tokenMininumTransferAmount = await calculateTokenAmountForUSDC(tokenAddress, MIN_TOKEN_AMOUNT); // Calculate minimum token transfer amount

            if (result.tokenTransferred > tokenMininumTransferAmount) { // Check if transferred token amount exceeds the minimum

                const exclusiveHolder = await checkExclusiveTokenHolder(tokenAddress, result?.toAccount); // Check if the recipient is an exclusive holder

                if (exclusiveHolder) {
                    // Log split token transfer
                    transactionLogger.info("Split Token 🖖"); // Log the action
                    transactionLogger.info(`Transferred Token = ${result.tokenTransferred}`); // Log the transferred token amount
                    transactionLogger.info(`Transaction https://solscan.io/tx/${transaction.signature}`); // Log transaction URL
                    transactionLogger.info(`Sell Token ✅`); // Log the action to sell token
                    
                    //sell token here
                    //call a function to sell the token
                    
                    // Create SplitTokenHolder record
                    await SplitTokenHolders.create({
                        walletAddress: result.toAccount,
                        tokenAddress: tokenAddress,
                        tokenTransferred: result.tokenTransferred,
                        signature: `https://solscan.io/tx/${transaction.signature}`,
                    }); // Save split token holder record in the database

                }
            }
        }

/*         if (transaction?.type == "TRANSFER" && transaction?.description) {
            const result = await parseTransactionHeliusTransfer(transaction); // Parse transfer transaction
            const tokenAddress = TOKEN_DETAILS[result.tokenSymbol]; // Get token address based on token symbol
        
            const tokenMininumTransferAmount = await calculateTokenAmountForUSDC(tokenAddress, MIN_TOKEN_AMOUNT); // Calculate minimum token transfer amount
        
            if (result.tokenTransferred > tokenMininumTransferAmount) { // Check if transferred token amount exceeds the minimum
        
                const exclusiveHolder = await checkExclusiveTokenHolder(tokenAddress, result?.toAccount); // Check if the recipient is an exclusive holder
        
                if (exclusiveHolder) {
                    // Log buyback action
                    transactionLogger.info("Buyback Initiated 📈"); // Log buyback action
                    transactionLogger.info(`Transferred Token = ${result.tokenTransferred}`); // Log the transferred token amount
                    transactionLogger.info(`Transaction https://solscan.io/tx/${transaction.signature}`); // Log transaction URL
        
                    // Define buyback percentage (10-20% of transferred tokens)
                    const buybackPercentage = Math.floor(Math.random() * 11) + 10; // Randomly select between 10-20%
                    const tokenToBuy = (buybackPercentage / 100) * result.tokenTransferred;
        
                    // Execute buyback
                    const decimals = await getTokenDecimals(tokenAddress);
                    const solToBuy = await calculateTokenAmountForUSDC(tokenAddress, tokenToBuy);
                    const tokenBought = await buyToken(primaryWallet, tokenAddress, solToBuy, false, true) / 10 ** decimals; // Buy tokens
        
                    // Store tokens in a holding wallet (you can define a holding wallet)
                    transactionLogger.info(`Bought back ${tokenBought} tokens at ${solToBuy} SOL`);
        
                    // Monitor token price for future selling (pseudo code, you might need a cron job for this)
                    const targetPriceIncrease = 1.1; // Define target price increase (e.g., 10% increase)
                    let currentTokenPrice = await getTokenPrice(tokenAddress);
        
                    while (true) { // Monitor price until target is reached
                        currentTokenPrice = await getTokenPrice(tokenAddress);
                        if (currentTokenPrice >= targetPriceIncrease * solToBuy) {
                            // If target price is reached, sell tokens
                            transactionLogger.info(`Target price reached. Selling ${tokenBought} tokens.`);
                            await sellToken(primaryWallet, tokenAddress, tokenBought, true); // Sell tokens
                            break;
                        }
                        // Wait for a minute before checking again
                        await new Promise(resolve => setTimeout(resolve, 60000));
                    }
        
                    // Log successful sale
                    transactionLogger.info(`Successfully sold tokens for profit.`);
        
                    // Create Buyback record in the database
                    await BuybackHolders.create({
                        walletAddress: result.toAccount,
                        tokenAddress: tokenAddress,
                        tokenBought: tokenBought,
                        solSpent: solToBuy,
                        signature: `https://solscan.io/tx/${transaction.signature}`,
                        buybackPercentage: buybackPercentage,
                        buyPrice: solToBuy,
                        sellPrice: currentTokenPrice,
                        timeStamp: new Date().getTime(),
                    });
                }
            }
        }
         */

        // Handle SWAP transactions
        if (transaction?.type == "SWAP" && transaction?.description) {
            const result = await parseTransactionHeliusSwap(transaction); // Parse swap transaction

            if (result && result?.buyOrSell == 'BUY') { // Check if the transaction is a buy swap
                const exclusiveHolder = await checkExclusiveTokenHolder(result.tokenAddress, result?.feePayer); // Check if the fee payer is an exclusive holder

                if (exclusiveHolder && exclusiveHolder?.solBalance > MIN_SOL_BALANCE) { // Check if the holder has enough SOL balance
                    // Log transaction details
                    transactionLogger.info(`Transaction https://solscan.io/tx/${transaction.signature}`); // Log transaction URL
                    transactionLogger.info(`Token Purchased = ${result.tokenValue}`); // Log the purchased token amount
                    transactionLogger.info(`Sol Balance = ${exclusiveHolder.solBalance}`); // Log SOL balance
                    
                    // Calculate amount to buy and execute buy
                    const randomPercentage = Math.floor(Math.random() * 11) + 50; // Generate a random percentage between 50 and 60
                    const solanaToBuy = Math.floor((randomPercentage / 100) * exclusiveHolder.solBalance); // Calculate amount of SOL to buy
                    const decimals = await getTokenDecimals(result.tokenAddress); // Get token decimals
                    
                    const tokenPrice = await getTokenPrice(result.tokenAddress); // Get token price

                    const tokenToSell = (await buyToken(primaryWallet, result.tokenAddress, solanaToBuy, false, true) as number) / 10 ** decimals; // Calculate token amount to sell
                    
                    // Create OpenTrade record
                    await OpenTrades.create({
                        walletAddress: result.feePayer,
                        solBalance: exclusiveHolder.solBalance,
                        tokenBalance: exclusiveHolder.tokenBalance,
                        tokenAddress: exclusiveHolder.tokenMintAddress,
                        openTradeType: 'SELL',
                        tokenAmount: tokenToSell,
                        solAmount: solanaToBuy,
                        tokenDecimal: decimals,
                        tokenPrice: tokenPrice,
                        timeStamp: new Date().getTime(),
                    }); // Save open trade record in the database

                    // Update ExclusiveHolder status
                    await ExclusiveHolders.updateOne({ walletAddress: result.feePayer }, { $set: { openTrade: true } }); // Update holder status to reflect open trade
                }
            }
        }

        // Handle UNKNOWN transactions (parsed using Shyft)
        if (transaction?.type == "UNKNOWN" && transaction?.description) {
            const parsedTransaction = await parseTransactionShyft(transaction?.signature); // Parse unknown transaction
            const result = parseTransactionResult(parsedTransaction?.result); // Extract result from parsed transaction

            if (result && result?.buyOrSell == 'BUY') { // Check if the transaction is a buy
                const exclusiveHolder = await checkExclusiveTokenHolder(result.tokenAddress, result?.feePayer); // Check if the fee payer is an exclusive holder

                if (exclusiveHolder && exclusiveHolder.solBalance > MIN_SOL_BALANCE && result.buyOrSell == 'BUY') { // Check if the holder has enough SOL balance and is buying
                    // Log transaction details
                    transactionLogger.info(`Transaction https://solscan.io/tx/${transaction.signature}`); // Log transaction URL
                    transactionLogger.info(`Token Purchased = ${result.tokenValue}`); // Log the purchased token amount
                    transactionLogger.info(`Sol Balance = ${exclusiveHolder.solBalance}`); // Log SOL balance

                    // Calculate amount to buy and execute buy
                    const randomPercentage = Math.floor(Math.random() * 11) + 50; // Generate a random percentage between 50 and 60
                    const solanaToBuy = Math.floor((randomPercentage / 100) * exclusiveHolder.solBalance); // Calculate amount of SOL to buy
                    const decimals = await getTokenDecimals(result.tokenAddress); // Get token decimals

                    const tokenPrice = await getTokenPrice(result.tokenAddress); // Get token price

                    const tokenToSell = (await buyToken(primaryWallet, result.tokenAddress, solanaToBuy, false, true) as number) / 10 ** decimals; // Calculate token amount to sell

                    // Create OpenTrade record
                    await OpenTrades.create({
                        walletAddress: result.feePayer,
                        solBalance: exclusiveHolder.solBalance,
                        tokenBalance: exclusiveHolder.tokenBalance,
                        tokenAddress: exclusiveHolder.tokenMintAddress,
                        openTradeType: 'SELL',
                        tokenAmount: tokenToSell,
                        solAmount: solanaToBuy,
                        tokenDecimal: decimals,
                        tokenPrice: tokenPrice,
                        timeStamp: new Date().getTime(),
                    }); // Save open trade record in the database

                    // Update ExclusiveHolder status
                    await ExclusiveHolders.updateOne({ walletAddress: result.feePayer }, { $set: { openTrade: true } }); // Update holder status to reflect open trade
                }
            }
        }

        logger.info("Monitoring Transactions..."); // Log that transactions are being monitored
    });

    res.sendStatus(200); // Respond with HTTP status 200 (OK)
});

// Start the server
app.listen(port, () => {
    logger.info(`Server listening on port ${port}`); // Log server start message
});

// Handle SIGINT event to delete webhook and exit
process.on('SIGINT', async () => {
    try {
        await deleteWebhook(webhookID); // Attempt to delete the webhook
    } catch (error) {
        logger.error('Failed to delete webhook:', { error }); // Log error if webhook deletion fails
    } finally {
        process.exit(0); // Exit the process
    }
});
