"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.finalizeTransaction = exports.convertToInteger = exports.getSwapTransaction = exports.getQuote = void 0;
// Import required modules from Solana web3 library
const web3_js_1 = require("@solana/web3.js");
// Import fetch for making HTTP requests
const cross_fetch_1 = __importDefault(require("cross-fetch"));
// Import constant for swap execution flag
const swapperConfig_1 = require("../config/swapperConfig");
// Import logger for logging messages
const logger_1 = require("../utils/logger");
// Function to get a quote for a swap transaction
const getQuote = async (addressOfTokenOut, // Address of the token to be swapped out
addressOfTokenIn, // Address of the token to be swapped in
convertedAmountOfTokenOut, // Amount of the token to be swapped out in integer format
slippage // Slippage percentage (in basis points)
) => {
    // Convert slippage to basis points
    slippage *= 100;
    // Construct the URL for fetching the quote from the API
    const url = `https://quote-api.jup.ag/v6/quote?inputMint=${addressOfTokenOut}&outputMint=${addressOfTokenIn}&amount=${convertedAmountOfTokenOut}&slippageBps=${slippage}`;
    // Fetch the quote from the API
    const resp = await (0, cross_fetch_1.default)(url);
    // Parse the response JSON into a Route object
    const quoteResponse = await resp.json();
    // Return the quote response
    return quoteResponse;
};
exports.getQuote = getQuote;
// Function to get the swap transaction
const getSwapTransaction = async (quoteResponse, // Quote response object containing swap details
walletPublicKey) => {
    try {
        // Record the start time of the swap request (for logging or metrics)
        const swapStartTime = new Date().getTime();
        let body;
        // Construct the body of the POST request for the swap transaction
        body = {
            quoteResponse,
            userPublicKey: walletPublicKey,
            wrapAndUnwrapSol: true, // Flag to wrap and unwrap SOL during swap
            restrictIntermediateTokens: false, // Flag to allow intermediate tokens in the swap
            prioritizationFeeLamports: 250000, // Fee for prioritization in lamports
        };
        // Send a POST request to the API to get the swap transaction
        const resp = await (0, cross_fetch_1.default)("https://quote-api.jup.ag/v6/swap", {
            method: "POST",
            headers: {
                "Content-Type": "application/json", // Set content type to JSON
            },
            body: JSON.stringify(body), // Convert the body to a JSON string
        });
        // Parse the response JSON into a SwapResponse object
        const swapResponse = await resp.json();
        // Return the swap transaction in string format
        return swapResponse.swapTransaction;
    }
    catch (error) {
        // Throw an error if the request fails
        throw new Error(error);
    }
};
exports.getSwapTransaction = getSwapTransaction;
// Function to convert an amount to an integer based on token decimals
const convertToInteger = (amount, decimals) => {
    // Convert the amount to an integer by multiplying with 10^decimals and flooring the result
    return Math.floor(amount * 10 ** decimals);
};
exports.convertToInteger = convertToInteger;
// Function to finalize and send the transaction
const finalizeTransaction = async (swapTransaction, // Swap transaction in base64 string format
wallet, // Wallet used to sign the transaction
connection // Solana blockchain connection
) => {
    try {
        // Deserialize the transaction from base64 string to buffer
        const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
        // Deserialize the buffer into a VersionedTransaction object
        let transaction = web3_js_1.VersionedTransaction.deserialize(swapTransactionBuf);
        if (swapperConfig_1.EXECUTE_SWAP) {
            // If executing swap, sign the transaction with the wallet's payer keypair
            transaction.sign([wallet.payer]);
            // Serialize the transaction to raw format
            const rawTransaction = transaction.serialize();
            // Send the raw transaction to the blockchain and get the transaction ID
            const txid = await connection.sendRawTransaction(rawTransaction, {
                skipPreflight: false, // Ensure preflight checks are performed
                // preflightCommitment: "confirmed", // Optional commitment level for preflight check
            });
            // Return the transaction ID
            console.log(`txid is ${txid}`);
            return txid;
        }
        else {
            // If not executing swap, simulate the transaction
            logger_1.logger.info("Simulating Transaction 🚀");
            await connection.simulateTransaction(transaction);
            logger_1.logger.info("Simulated Transaction ✅");
        }
    }
    catch (error) {
        // Log an error if finalizing the transaction fails
        logger_1.logger.error("Error finalizing transaction", error);
    }
};
exports.finalizeTransaction = finalizeTransaction;
