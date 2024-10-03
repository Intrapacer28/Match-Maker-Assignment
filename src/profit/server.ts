import express from 'express';
import {
    parseTransactionHeliusSwap,
    parseTransactionHeliusTransfer,
    parseTransactionResult,
    parseTransactionShyft,
} from '../utils/controllers';
import {
    calculateTokenAmountForUSDC,
    checkExclusiveTokenHolder,
    getTokenDecimals,
    getTokenPrice,
    getPricesFromDEXs,
} from '../utils/utils';
import { MIN_TOKEN_AMOUNT, MIN_SOL_BALANCE, TOKEN_DETAILS, ARBITRAGE_THRESHOLD } from '../config/profitConfig';
import mongoose from 'mongoose';
import SplitTokenHolders from '../models/splittokenholders';
import OpenTrades from '../models/opentrades';
import ExclusiveHolders from '../models/exclusiveholders';
import { buyToken } from '../swapper/buyToken';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { logger, transactionLogger } from '../utils/logger';
import bodyParser from 'body-parser';
import { createWebhook } from '../webhook/helius-create-webhook';
import { deleteWebhook } from '../webhook/helius-delete-webhook';
import { getWhaleWallets, isWhaleTransaction } from '../utils/whaleUtils';
import { sellToken } from '../swapper/sellToken';

const app = express();
app.use(express.json());
const port = 3002;

const primaryWallet = Keypair.fromSecretKey(bs58.decode(process.env.WALLET_PRIVATE_KEY || ''));
let webhookID: string | undefined;
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
    req.url = req.url.replace(/%0A|\n/g, '');
    next();
});

// Function to handle webhook creation or check if it's already created
async function createTransactionListener() {
    try {
        const tokenAddresses: string[] = Object.values(TOKEN_DETAILS);
        webhookID = await createWebhook(tokenAddresses);
        logger.info(`Listening on the current webhook with ID: ${webhookID}`);
    } catch (error) {
        logger.error(`Failed to listen to the webhook: ${error.message}`);
    }
}

createTransactionListener();

mongoose
    .connect('mongodb://127.0.0.1:27017/market-maker-bot')
    .then(() => logger.info("MongoDB Connected"))
    .catch(err => logger.error("MongoDB Connection Error", err));

// Simple root route to avoid 404 when browsing
app.get('/', (req, res) => {
    res.send('Market Maker Bot is running');
});

let transactionCounter = 0;
let exclusiveHolderCounter = 0;

app.post('/webhook', async (req, res) => {
    res.status(200).send('Webhook is working!');

    if (!req.body || Object.keys(req.body).length === 0) {
        logger.error('Received an empty or undefined payload');
        return;
    }

    const transactions = Array.isArray(req.body) ? req.body : [req.body];

    for (const transaction of transactions) {
        transactionCounter++;
        logger.info(`Processing transaction counter: ${transactionCounter}`);

        if (!transaction?.type) {
            logger.warn("Transaction type is missing:", transaction);
            continue;
        }

        try {
            let result;
            if (transaction.type === "TRANSFER" && transaction.description) {
                result = await parseTransactionHeliusTransfer(transaction);
                logger.debug("Parsed TRANSFER transaction result:", result);

                if (!result) {
                    continue;
                }

                const tokenTransferred = result.tokenTransferred;
                const tokenAddress = TOKEN_DETAILS[result.tokenSymbol];
                const tokenMinimumTransferAmount = await calculateTokenAmountForUSDC(tokenAddress, MIN_TOKEN_AMOUNT);
                
                const minimumTransferAmount = Number(tokenMinimumTransferAmount);
                if(minimumTransferAmount){

                    logger.info(`The minimum transfer amount is set to be ${minimumTransferAmount}`);


                }
               
                if (Number(tokenTransferred) > minimumTransferAmount) {
                    const exclusiveHolder = await checkExclusiveTokenHolder(tokenAddress, result?.toAccount);
                    logger.debug("Exclusive holder check result:", exclusiveHolder);

                    if (exclusiveHolder) {
                        exclusiveHolderCounter++;
                        logger.info(`Exclusive holder counter: ${exclusiveHolderCounter}`);

                        transactionLogger.info("Split Token 🖖");
                        transactionLogger.info(`Transferred Token = ${tokenTransferred}`);
                        transactionLogger.info(`Transaction: https://solscan.io/tx/${transaction.signature}`);
                        transactionLogger.info(`Sell Token ✅`);

                        try {
                            await SplitTokenHolders.create({
                                walletAddress: result.toAccount,
                                tokenAddress: tokenAddress,
                                tokenTransferred: tokenTransferred,
                                signature: `https://solscan.io/tx/${transaction.signature}`,
                            });
                        } catch (error) {
                            if (error.code !== 11000) {
                                logger.error("Error adding SplitTokenHolders:", error);
                            }
                        }
                    } else {
                        transactionLogger.info("Transaction ignored: Not an exclusive holder.");
                    }
                } else if (tokenTransferred !== null && tokenTransferred !== undefined) {
                    logger.warn(`Token transferred below minimum threshold: ${tokenTransferred}`);
                }
            }

            // Whale wallets strategy
            const whaleWallets = await getWhaleWallets();
            if (transaction.type === "TRANSFER" && isWhaleTransaction(transaction, whaleWallets)) {
                result = await parseTransactionHeliusTransfer(transaction);
                logger.debug("Parsed WHALE transaction result:", result);

                const tokenAddress = TOKEN_DETAILS[result.tokenSymbol];
                const tokenMinimumTransferAmount = await calculateTokenAmountForUSDC(tokenAddress, MIN_TOKEN_AMOUNT);
                logger.debug("Minimum Transfer Amount for Whale Token:", tokenMinimumTransferAmount);

                if (result.tokenTransferred > tokenMinimumTransferAmount) {
                    const exclusiveHolder = await checkExclusiveTokenHolder(tokenAddress, result?.toAccount);
                    logger.debug("Exclusive holder check for whale transaction:", exclusiveHolder);

                    if (exclusiveHolder) {
                        transactionLogger.info("Whale Transfer Detected 🐋");
                        transactionLogger.info(`Transferred Token = ${result.tokenTransferred}`);
                        transactionLogger.info(`Transaction: https://solscan.io/tx/${transaction.signature}`);

                        if (whaleWallets.includes(result?.toAccount)) {
                            transactionLogger.info("Whale Buying Detected - Front Running Buy 🚀");
                            const tokenToBuy = await calculateTokenAmountForUSDC(tokenAddress, result.tokenTransferred);
                            await buyToken(primaryWallet, tokenAddress, tokenToBuy, false, true);
                        } else {
                            transactionLogger.info("Whale Selling Detected - Selling to Avoid Price Drop 🛑");
                            const tokenToSell = result.tokenTransferred;
                            await sellToken(primaryWallet, tokenAddress, tokenToSell.toString(), true, false);

                            await SplitTokenHolders.create({
                                walletAddress: result.toAccount,
                                tokenAddress: tokenAddress,
                                tokenTransferred: result.tokenTransferred,
                                signature: `https://solscan.io/tx/${transaction.signature}`,
                            });
                        }
                    } else {
                        transactionLogger.info("Transaction ignored: Not an exclusive holder.");
                    }
                } else {
                    logger.warn("Whale token transferred below minimum threshold:", result.tokenTransferred);
                }
            }

            // Handle SWAP transactions
            if (transaction?.type === "SWAP" && transaction?.description) {
                const result = await parseTransactionHeliusSwap(transaction);

                if (result && result?.buyOrSell === 'BUY') {
                    const exclusiveHolder = await checkExclusiveTokenHolder(result.tokenAddress, result?.feePayer);

                    if (exclusiveHolder && exclusiveHolder?.solBalance > MIN_SOL_BALANCE) {
                        transactionLogger.info(`Transaction https://solscan.io/tx/${transaction.signature}`);
                        transactionLogger.info(`Token Purchased = ${result.tokenValue}`);
                        transactionLogger.info(`Sol Balance = ${exclusiveHolder.solBalance}`);


        const amountToTrade = result.tokenValue;
        const prices = await getPricesFromDEXs(result.tokenAddress); 
        const bestPrice = Math.max(...prices); 
        const worstPrice = Math.min(...prices);

        if (bestPrice > worstPrice * (1 + ARBITRAGE_THRESHOLD)) {
            // Buy on the cheaper DEX and sell on the more expensive one // Work needed to decide which to buy from and which to sell to 
            await buyToken(primaryWallet, result.tokenAddress, amountToTrade, false, true); 
            await sellToken(primaryWallet, result.tokenAddress, amountToTrade, true, false); 
        }


                        const randomPercentage = Math.floor(Math.random() * 11) + 50;
                        const solanaToBuy = Math.floor((randomPercentage / 100) * exclusiveHolder.solBalance);
                        const decimals = await getTokenDecimals(result.tokenAddress);
                        const tokenPrice = await getTokenPrice(result.tokenAddress);

                        const tokenToSell = (await buyToken(primaryWallet, result.tokenAddress, solanaToBuy, false, true) as number) / 10 ** decimals;

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
                        });

                        await ExclusiveHolders.updateOne({ walletAddress: result.feePayer }, { $set: { openTrade: true } });
                    }
                }
            }

            // Process UNKNOWN transaction
            if (transaction.type === "UNKNOWN" && transaction.description) {
                const parsedTransaction = await parseTransactionShyft(transaction?.signature);
                result = parseTransactionResult(parsedTransaction?.result);
                logger.debug("Parsed UNKNOWN transaction result:", result);

                if (result && result?.buyOrSell === 'BUY') {
                    const exclusiveHolder = await checkExclusiveTokenHolder(result.tokenAddress, result?.feePayer);
                    logger.debug("Exclusive holder check for UNKNOWN transaction:", exclusiveHolder);

                    if (exclusiveHolder && exclusiveHolder.solBalance > MIN_SOL_BALANCE) {
                        transactionLogger.info(`Transaction: https://solscan.io/tx/${transaction.signature}`);
                        transactionLogger.info(`Token Purchased = ${result.tokenValue}`);
                        transactionLogger.info(`Sol Balance = ${exclusiveHolder.solBalance}`);

                        const randomPercentage = Math.floor(Math.random() * 11) + 50;
                        const solanaToBuy = Math.floor((randomPercentage / 100) * exclusiveHolder.solBalance);
                        const decimals = await getTokenDecimals(result.tokenAddress);
                        const tokenPrice = await getTokenPrice(result.tokenAddress);

                        const tokenToSell = (await buyToken(primaryWallet, result.tokenAddress, solanaToBuy, false, true) as number) / 10 ** decimals;

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
                        });

                        await ExclusiveHolders.updateOne({ walletAddress: result.feePayer }, { $set: { openTrade: true } });
                    }
                }
            }

        } catch (error) {
            logger.error(`Error processing transaction: ${error.message}`);
        }
    }
});

app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
});


