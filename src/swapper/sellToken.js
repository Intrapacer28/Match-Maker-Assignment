"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sellToken = void 0;
// Import required modules from Solana web3 library
const web3_js_1 = require("@solana/web3.js");
// Import Wallet class from Anchor library for wallet management
const anchor_1 = require("@project-serum/anchor");
// Import utility functions for token balance and decimals
const utils_1 = require("../utils/utils");
// Import environment configuration
require("dotenv/config");
// Import functions for swap operations and transaction finalization
const swapperHelper_1 = require("./swapperHelper");
// Import constant for Solana address
const consts_1 = require("../config/consts");
// Import logger for logging messages
const logger_1 = require("../utils/logger");
// Function to handle token selling
const sellToken = async (primaryWallet, // Primary wallet for transaction
sellAll, // Flag to indicate if all tokens should be sold
addressOfTokenOut, // Address of the token to be sold
waitForConfirmation, // Flag to wait for transaction confirmation
wantAmountOfSolIn, // Flag to return amount of SOL received
amountOfTokenToSell) => {
    // Throw an error if not selling all tokens and no amount specified
    if (!sellAll && !amountOfTokenToSell) {
        throw new Error("You need to specify AMOUNT_OF_TOKEN_TO_SELL if SELL_ALL is false");
    }
    // Create a connection to the Solana blockchain using the RPC URL from environment variables
    const connection = new web3_js_1.Connection(process.env.RPC_URL);
    // Create a wallet instance from the primary wallet keypair
    const wallet = new anchor_1.Wallet(primaryWallet);
    // Get the public key of the wallet to query for token balance
    const publicKeyOfWalletToQuery = wallet.publicKey.toString();
    // If selling all tokens, get the token balance to sell
    sellAll
        ? (amountOfTokenToSell = await (0, utils_1.getBalanceOfToken)(publicKeyOfWalletToQuery, addressOfTokenOut))
        : amountOfTokenToSell;
    // Throw an error if there are no tokens to sell
    if (!amountOfTokenToSell) {
        throw new Error("No tokens to sell");
    }
    // Log the amount of tokens being sold
    logger_1.logger.info(`Selling ${amountOfTokenToSell} Tokens 🚀`);
    try {
        // Get the decimal places of the token
        const decimals = await (0, utils_1.getTokenDecimals)(addressOfTokenOut);
        // Define slippage as 1% (100 basis points)
        const slippage = 100; // slippage is 1%
        // Convert the amount of tokens to an integer value based on decimals
        const convertedAmountOfTokenOut = (0, swapperHelper_1.convertToInteger)(amountOfTokenToSell, decimals);
        // Get a quote for the swap transaction
        const quoteResponse = await (0, swapperHelper_1.getQuote)(addressOfTokenOut, consts_1.SOLANA_ADDRESS, convertedAmountOfTokenOut, slippage);
        // Extract the amount of SOL to be received from the quote response
        const amountOfSolIn = quoteResponse.routePlan[quoteResponse.routePlan.length - 1].swapInfo
            .outAmount;
        // Get the public key of the wallet for the swap transaction
        const walletPublicKey = wallet.publicKey.toString();
        // Create a swap transaction based on the quote
        const swapTransaction = await (0, swapperHelper_1.getSwapTransaction)(quoteResponse, walletPublicKey);
        // Finalize the transaction and get the transaction ID
        const txid = await (0, swapperHelper_1.finalizeTransaction)(swapTransaction, wallet, connection);
        // Get the latest blockhash for transaction confirmation
        const latestBlockhash = await connection.getLatestBlockhash();
        // If waiting for confirmation, confirm the transaction
        if (waitForConfirmation) {
            logger_1.logger.info("Waiting for confirmation... 🕒");
            const confirmation = await connection.confirmTransaction({
                signature: txid,
                blockhash: latestBlockhash.blockhash,
                lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
            }, "finalized" // Optional commitment level
            );
            // Check if the confirmation was successful
            if (confirmation.value.err) {
                // If confirmation fails, check the wallet's SOL balance to verify if tokens were sold
                const solBalance = await connection.getBalance(new web3_js_1.PublicKey(walletPublicKey));
                logger_1.logger.warn("Confirmation error. Checking SOL balance as fallback...");
                // Compare balance with expected SOL from sale
                if (solBalance >= amountOfSolIn) {
                    logger_1.logger.info(`Transaction likely succeeded. Received ${solBalance} SOL ✅`);
                    return wantAmountOfSolIn ? solBalance : txid;
                }
                else {
                    throw new Error("Transaction confirmation failed and balance check suggests no tokens sold");
                }
            }
        }
        // Log the result of the transaction
        logger_1.logger.info(`Sold ${amountOfTokenToSell} Token for ${amountOfSolIn} SOL ✅`);
        logger_1.logger.info(`Signature = https://solscan.io/tx/${txid}`);
        // Return the amount of SOL received or the transaction ID based on the flag
        return wantAmountOfSolIn ? amountOfSolIn : txid;
    }
    catch (error) {
        // Log the error message
        logger_1.logger.error(`Error in sellToken function: ${error.message}`);
        throw new Error(error);
    }
};
exports.sellToken = sellToken;
