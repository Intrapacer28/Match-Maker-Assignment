"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buyToken = void 0;
// Import necessary modules from Solana web3 library
const web3_js_1 = require("@solana/web3.js");
const anchor_1 = require("@project-serum/anchor");
require("dotenv/config");
const consts_1 = require("../config/consts");
const swapperHelper_1 = require("./swapperHelper");
const logger_1 = require("../utils/logger");
const utils_1 = require("../utils/utils");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const buyToken = async (primaryWallet, addressOfTokenIn, amountOfTokenOut, waitForConfirmation, wantAmountOfTokenIn) => {
    try {
        const rpcUrl = process.env.RPC_URL;
        const wsEndpoint = process.env.RPC_WEBSOCKET_ENDPOINT;
        if (!rpcUrl || !wsEndpoint) {
            throw new Error("RPC_URL or RPC_WEBSOCKET_ENDPOINT environment variable is not set.");
        }
        const connection = new web3_js_1.Connection(rpcUrl, { wsEndpoint: wsEndpoint });
        const wallet = new anchor_1.Wallet(primaryWallet);
        const walletPublicKey = wallet.publicKey.toString();
        logger_1.logger.info(`Trying to buy token using ${amountOfTokenOut} SOL...🚀`);
        const initialTokenBalance = await (0, utils_1.getBalanceOfToken)(walletPublicKey, addressOfTokenIn);
        const decimals = 9;
        const slippage = 100;
        const convertedAmountOfTokenOut = (0, swapperHelper_1.convertToInteger)(amountOfTokenOut, decimals);
        const quoteResponse = await (0, swapperHelper_1.getQuote)(consts_1.SOLANA_ADDRESS, addressOfTokenIn, convertedAmountOfTokenOut, slippage);
        const amountOfTokenIn = quoteResponse.routePlan[quoteResponse.routePlan.length - 1].swapInfo.outAmount;
        const swapTransaction = await (0, swapperHelper_1.getSwapTransaction)(quoteResponse, walletPublicKey);
        const txid = await (0, swapperHelper_1.finalizeTransaction)(swapTransaction, wallet, connection);
        if (!txid) {
            throw new Error("Transaction ID is undefined. Transaction may have failed.");
        }
        if (waitForConfirmation) {
            logger_1.logger.info("Waiting for confirmation... 🕒");
            const latestBlockhash = await connection.getLatestBlockhash();
            let confirmed = false;
            const retries = 5;
            const baseDelay = 1000;
            for (let i = 0; i < retries; i++) {
                try {
                    // Try to confirm the transaction first
                    await connection.confirmTransaction({
                        signature: txid,
                        blockhash: latestBlockhash.blockhash,
                        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
                    }, "finalized");
                    confirmed = true; // Confirmation succeeded
                    break; // Exit the loop if confirmation is successful
                }
                catch (error) {
                    // If confirmation fails, check the balance
                    const latestBalance = await (0, utils_1.getBalanceOfToken)(walletPublicKey, addressOfTokenIn);
                    // Check if the balance has increased, indicating successful buy
                    if (latestBalance > initialTokenBalance) {
                        confirmed = true; // Successful balance check
                        break; // Exit the loop
                    }
                    const delay = baseDelay * Math.pow(2, i); // Exponential backoff
                    logger_1.logger.warn(`Confirmation failed. Retrying in ${delay / 1000} seconds...`);
                    await sleep(delay); // Wait before retrying
                }
            }
            if (!confirmed) {
                throw new Error("Transaction confirmation failed, or token balance didn't update.");
            }
        }
        logger_1.logger.info(`Transaction successful. Signature: https://solscan.io/tx/${txid}`);
        return wantAmountOfTokenIn ? amountOfTokenIn : txid;
    }
    catch (error) {
        logger_1.logger.error(`Error in buyToken: ${error.message}`);
        throw new Error(error.message);
    }
};
exports.buyToken = buyToken;
