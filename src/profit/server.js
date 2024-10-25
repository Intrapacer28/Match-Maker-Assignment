"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const mongoose_1 = __importDefault(require("mongoose"));
const helius_create_webhook_1 = require("../webhook/helius-create-webhook");
const helius_delete_webhook_1 = require("../webhook/helius-delete-webhook");
const rugCheck_1 = require("../utils/rugCheck");
const readline_1 = __importDefault(require("readline"));
const logger_1 = require("../utils/logger");
const controllers_1 = require("../utils/controllers");
const utils_1 = require("../utils/utils");
const buyToken_1 = require("../swapper/buyToken");
const sellToken_1 = require("../swapper/sellToken");
const profitConfig_1 = require("../config/profitConfig");
const splittokenholders_1 = __importDefault(require("../models/splittokenholders"));
const web3_js_1 = require("@solana/web3.js");
const bytes_1 = require("@project-serum/anchor/dist/cjs/utils/bytes");
const Trade_1 = require("../models/Trade");
const app = (0, express_1.default)();
const PORT = 3010;
app.use(body_parser_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
const primaryWallet = web3_js_1.Keypair.fromSecretKey(bytes_1.bs58.decode(process.env.WALLET_PRIVATE_KEY || ''));
// Initialize webhook ID
let webhookID;
const webhookURL = process.env.webhookURL;
// Function to create transaction listener with rug check
async function createTransactionListener() {
    const tokenAddresses = Object.values(profitConfig_1.TOKEN_DETAILS);
    // Debug log: Creating the transaction listener
    logger_1.logger.info('Initializing transaction listener creation...');
    // Prompt the user to decide whether to perform the rug check
    const userChoice = await promptUser("Do you want to perform the rug checks? (y/n): ");
    // If the user chooses not to proceed with rug checks, log the decision and proceed to create the webhook
    if (userChoice.toLowerCase() !== 'y') {
        logger_1.logger.info("Rug checks skipped by user.");
        // Proceed with creating the webhook
        webhookID = await (0, helius_create_webhook_1.createWebhook)(tokenAddresses, webhookURL);
        logger_1.logger.info('Transaction listener created successfully without rug checks.');
        return; // Exit the function after creating the webhook
    }
    // Perform rug check for each token address and log results
    for (const tokenAddress of tokenAddresses) {
        const rugCheckResult = await (0, rugCheck_1.checkRugPull)(tokenAddress);
        // Log the results of the rug check
        logger_1.logger.info(`Rug check results for ${tokenAddress}:`, rugCheckResult);
    }
    // Prompt the user for confirmation to proceed based on rug check results
    const proceedChoice = await promptUser("In aspects token has failed rug checks. Do you want to proceed with creating the webhook? (y/n): ");
    if (proceedChoice.toLowerCase() !== 'y') {
        logger_1.logger.info("User chose not to proceed after rug check results.");
        process.exit(0); // Exit the process if the user chooses not to proceed
    }
    // If the user decides to proceed, create the webhook
    webhookID = await (0, helius_create_webhook_1.createWebhook)(tokenAddresses, webhookURL);
    logger_1.logger.info('Transaction listener created successfully.');
}
// Function to prompt the user
function promptUser(question) {
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}
// Connect to MongoDB and call transaction listener if successful
mongoose_1.default
    .connect('mongodb://127.0.0.1:27017/market-maker-bot') // Connecting to MongoDB at the specified URL
    .then(async () => {
    logger_1.logger.info("MongoDB connected successfully.");
    await createTransactionListener();
})
    .catch(err => logger_1.logger.error("MongoDB connection error:", err)); // Log error message if connection fails
app.get('/', async (req, res) => {
    logger_1.logger.info('Received request at root endpoint.'); // Debug log: Root endpoint accessed
    res.status(200).send('Market Maker Bot is Running...');
});
app.post('/webhook', async (req, res) => {
    try {
        const transactions = req.body;
        let result;
        let tradeInProgress = false; // Flag to track if a trade is in progress
        transactions.forEach(async (transaction) => {
            if (transaction.type === "TRANSFER" && transaction.description) {
                // Parse the transaction details
                let result = await (0, controllers_1.parseTransactionHeliusTransfer)(transaction);
                const tokenTransferred = result.tokenTransferred;
                const tokenAddress = profitConfig_1.TOKEN_DETAILS[result.tokenSymbol];
                const tokenMininumTransferAmount = await (0, utils_1.calculateTokenAmountForUSDC)(tokenAddress, profitConfig_1.MIN_TOKEN_AMOUNT);
                if (Number(tokenTransferred) > tokenMininumTransferAmount) {
                    const exclusiveHolder = await (0, utils_1.checkExclusiveTokenHolder)(tokenAddress, result?.toAccount);
                    if (exclusiveHolder) {
                        const currentPrice = await (0, utils_1.getTokenPrice)(result.tokenSymbol);
                        const movingAverage = await (0, utils_1.calculateMovingAverage)(result.tokenSymbol, 100); // 50-period MA
                        // Check if the current price is above the moving average
                        if (currentPrice > movingAverage) {
                            const executeTrade = async () => {
                                if (tradeInProgress) {
                                    logger_1.transactionLogger.info("Trade already in progress. Exiting.");
                                    return; // Exit if a trade is already in progress
                                }
                                tradeInProgress = true; // Set flag to indicate a trade is in progress
                                const addressOfTokenIn = tokenAddress; // The token you are buying
                                const amountOfTokenOut = 0.0025; // Amount to buy
                                const waitForConfirmation = true;
                                const wantAmountOfTokenIn = false;
                                // Execute the buyToken function
                                const buySignature = await (0, buyToken_1.buyToken)(primaryWallet, addressOfTokenIn, amountOfTokenOut, waitForConfirmation, wantAmountOfTokenIn);
                                // Check if the buy was successful
                                if (!buySignature || buySignature == undefined) {
                                    logger_1.transactionLogger.info("Buy failed. Continuing to monitor for other opportunities.");
                                    tradeInProgress = false; // Reset flag to allow future trades
                                    return; // Exit to keep monitoring
                                }
                                logger_1.transactionLogger.info("Buy executed ✅");
                                // Calculate buy token volume based on current price and amount spent
                                const buyTokenVolume = amountOfTokenOut / currentPrice; // Calculate the amount of tokens bought
                                const initialBalance = await (0, utils_1.getSolanaBalance)(primaryWallet.publicKey.toBase58());
                                // Create trade entry
                                const newTrade = new Trade_1.Trade({
                                    walletAddress: primaryWallet.publicKey.toString(),
                                    tokenSymbol: result.tokenSymbol,
                                    amountSpentForBuy: amountOfTokenOut, // Actual amount spent
                                    buyTokenVolume: buyTokenVolume, // Amount of tokens bought
                                    priceAtBuy: currentPrice,
                                    buySignature: buySignature,
                                    openTradeTime: new Date(),
                                    walletBalance: initialBalance // Store the current balance before selling
                                });
                                await newTrade.save();
                                // Now, let's handle the sell condition
                                const targetProfitPercentage = 10;
                                let sellTriggered = false;
                                // Poll the price every 1 minute to check if target profit is reached
                                const sellInterval = setInterval(async () => {
                                    const updatedPrice = await (0, utils_1.getTokenPrice)(result.tokenSymbol);
                                    if (updatedPrice >= currentPrice * (1 + targetProfitPercentage / 100)) {
                                        logger_1.transactionLogger.info(`Target profit reached. Current price: ${updatedPrice}. Executing sell.`);
                                        // Execute the sellToken function
                                        const sellSignature = await (0, sellToken_1.sellToken)(primaryWallet, false, addressOfTokenIn, waitForConfirmation, false, buyTokenVolume // Sell the amount bought
                                        );
                                        // Check if the sell was successful
                                        if (!sellSignature || sellSignature == undefined) {
                                            logger_1.transactionLogger.info("Sell failed. Continuing to monitor for other selling opportunities.");
                                            return; // Exit to keep monitoring for new selling opportunities
                                        }
                                        const walletpubkey = process.env.WALLET_PUBLIC_KEY;
                                        logger_1.transactionLogger.info("Sell executed ✅");
                                        clearInterval(sellInterval);
                                        sellTriggered = true;
                                        const finalBalance = await (0, utils_1.getSolanaBalance)(walletpubkey); // Get the balance after selling
                                        const profit = (updatedPrice * buyTokenVolume) - (currentPrice * buyTokenVolume); // Calculate profit
                                        // Update the trade entry with sell details
                                        await Trade_1.Trade.updateOne({ buySignature: buySignature }, // Find the trade by buy signature
                                        {
                                            $set: {
                                                amountSpentForSell: amountOfTokenOut, // Replace with actual spent amount if applicable
                                                sellTokenVolume: buyTokenVolume,
                                                priceAtSell: updatedPrice,
                                                sellSignature: sellSignature,
                                                finishedTradeTime: new Date(),
                                                tradeTime: new Date(),
                                                walletBalance: finalBalance, // Update balance after the trade
                                                profit: profit // Store profit in the trade entry
                                            }
                                        });
                                    }
                                }, 60 * 1000); // Poll every 1 minute
                                // Optionally, stop the polling after a set time to avoid an infinite loop
                                setTimeout(() => {
                                    if (!sellTriggered) {
                                        logger_1.transactionLogger.info("Sell not executed within the time limit. Exiting.");
                                        clearInterval(sellInterval);
                                    }
                                    tradeInProgress = false; // Reset flag to allow future trades
                                }, 60 * 60 * 1000); // Stop after 1 hour
                            };
                            // Apply cooldown for all trades including the first one
                            const cooldownTime = !global.firstTradeExecuted
                                ? 0
                                : Math.floor(Math.random() * (15 - 5 + 1) + 5) * 60 * 1000;
                            // For the first trade, set the flag to true after the execution
                            if (!global.firstTradeExecuted) {
                                global.firstTradeExecuted = true;
                            }
                            setTimeout(async () => {
                                await executeTrade();
                            }, cooldownTime);
                        }
                        else {
                            logger_1.transactionLogger.info("Price is below moving average. No trade executed.");
                        }
                        // Log and update SplitTokenHolders collection with whale transfer details
                        await splittokenholders_1.default.updateOne({ walletAddress: result.toAccount }, {
                            $set: {
                                tokenSymbol: result.tokenSymbol,
                                tokenTransferred: tokenTransferred,
                                signature: `https://solscan.io/tx/${transaction.signature}`,
                            },
                        }, { upsert: true });
                    }
                    else {
                        // logger.info(`Transaction Ignored Not an Exclusive Holder`);
                    }
                }
                else {
                    // logger.info(`Amount transferred is less than minimum transferred Amount, ${tokenTransferred}`);
                }
            }
            //STATEGY 2: 
            // if (transaction.type === "SWAP" && transaction.description) {
            //     result = await parseTransactionHeliusSwap(transaction);
            //     if (result) {
            //         const { buyOrSell,tokenAddress, feePayer, tokenValue, solamount, priceAtBuy, priceAtSell, tokenSymbol,signature } = result;
            //         const existingOpenTrade = await OpenTrades.findOne({ walletAddress: feePayer });
            //         if (buyOrSell === 'BUY') {
            //             const openTradeTime = new Date().getTime(); // Define openTradeTime
            //             logger.info('Creating a Historical Data entry...')
            //             // Create an entry in HistoricalData for the BUY transaction 
            //             await HistoricalData.create({
            //                 walletAddress: feePayer,
            //                 tokenSymbol:  tokenSymbol,
            //                 buyTokenVolume: tokenValue,
            //                 AmountspentforBuy: solamount,
            //                 priceAtBuy: priceAtBuy,  // Store priceAtBuy
            //                 openTradeTime: openTradeTime, // Store the open trade time
            //                 buysignature: signature
            //             });
            //             // const tokenSymbol = Object.keys(TOKEN_DETAILS).find(
            //             //     (symbol) => TOKEN_DETAILS[symbol] === tokenAddress
            //             // );
            //             // const marketContext = await getMarketContext( tokenSymbol);
            //             // Record the buy behavior with transaction and market details
            //             // await recordBuyBehavior({
            //             //      walletAddress:feePayer,
            //             //      tokenAddress,
            //             //      tokenAmount: tokenValue, 
            //             //      solAmount: solamount,  
            //             //      priceAtPurchase: priceAtBuy,
            //             //     marketContext,
            //             // });
            //             // Commented out the exclusive holder check to process for all holders
            //             const exclusiveHolder = await checkExclusiveTokenHolder(tokenAddress, feePayer);
            //             if (exclusiveHolder && exclusiveHolder.solBalance > MIN_SOL_BALANCE) {
            //                 transactionLogger.info(`Transaction https://solscan.io/tx/${transaction.signature}`);
            //                 transactionLogger.info(`Token Purchased = ${tokenValue}`);
            //                 transactionLogger.info(`Sol Balance = ${exclusiveHolder.solBalance}`);
            //                 // Taking advantage of arbitrage opportunities as soon as we can 
            //                 //STRATEGY 3: ARBITRAGE --
            //                 // const amountToTrade = tokenValue;
            //                 // const prices = await getPricesFromDEXs(tokenAddress);
            //                 // const bestPrice = Math.max(...prices);
            //                 // const worstPrice = Math.min(...prices);
            //                 // if (bestPrice > worstPrice * (1 + ARBITRAGE_THRESHOLD)) {
            //                 //     await buyToken(primaryWallet, tokenAddress, amountToTrade, false, true);
            //                 //     await sellToken(primaryWallet, tokenAddress, amountToTrade, true, false);
            //                 // }
            //                 const randomPercentage = Math.floor(Math.random() * 11) + 50;
            //                 const solanaToBuy = Math.floor((randomPercentage / 100) * solamount);  // Using solamount directly
            //                 const decimals = await getTokenDecimals(tokenAddress);
            //                 const tokenPrice = await getTokenPrice(tokenAddress);
            //                 const tokenToSell = (await buyToken(primaryWallet, tokenAddress, solanaToBuy, false, true) as number) / 10 ** decimals;
            //                 transactionLogger.info("Creating a Open Trade for this BUY trasaction....");
            //                 await OpenTrades.create({
            //                     walletAddress: feePayer,
            //                     solBalance: solamount,  
            //                     tokenBalance: tokenValue,  
            //                     tokenAddress: tokenAddress,
            //                     openTradeType: 'BUY',
            //                     tokenAmount: tokenToSell,
            //                     solAmount: solanaToBuy,
            //                     tokenDecimal: decimals,
            //                     tokenPrice: tokenPrice,
            //                     timeStamp: openTradeTime, // Store the open trade time
            //                     priceAtBuy: priceAtBuy,  // Store priceAtBuy
            //                 });
            //                 await ExclusiveHolders.updateOne({ walletAddress: feePayer }, { $set: { openTrade: true } });
            //             }
            //         } else if (buyOrSell === 'SELL') {
            //             // Update the HistoricalData entry with priceAtSell when SELL is detected
            //             // const tokenSymbol = Object.keys(TOKEN_DETAILS).find(
            //             //     (symbol) => TOKEN_DETAILS[symbol] === tokenAddress
            //             // );
            //             //   // Fetch market context for the token
            //             //   const marketContext = await getMarketContext(tokenSymbol);
            //             //   // Record the sell behavior with transaction and market details
            //             //   await recordSellBehavior({
            //             //       walletAddress:feePayer,
            //             //       tokenAddress,
            //             //       tokenAmount: tokenValue, 
            //             //       solAmount: solamount,  
            //             //       priceAtPurchase: priceAtSell, 
            //             //      marketContext,
            //             //  });
            //             const historicalDataEntry = await HistoricalData.findOne(
            //                 { walletAddress: feePayer, priceAtSell: null }, 
            //                 {}, 
            //                 { sort: { openTradeTime: -1 } }  // Sort by most recent openTradeTime
            //             );
            //             if (!historicalDataEntry) {
            //                 // Handle the case where no entry is found
            //                 console.warn(`No historical data entry found for wallet: ${feePayer}`);
            //                 // Move on to the next iteration or logic
            //             } else {
            //                 const finishedTradeTime = new Date().getTime(); // Define finishedTradeTime
            //                 const openTradeTime = historicalDataEntry.openTradeTime;
            //                 const classification = await classifyHolder(feePayer,
            //                     tokenValue,
            //                     openTradeTime,
            //                     finishedTradeTime,
            //                     tokenAddress)
            //                 await HistoricalData.updateOne(
            //                     { walletAddress: feePayer, priceAtSell: null },  // Only update the entry with a null priceAtSell
            //                     {
            //                         $set: {
            //                             sellTokenVolume: tokenValue,
            //                             priceAtSell: priceAtSell,  // Update the sell price
            //                             AmountspentforSell: solamount,  // Update final amount at the sell time
            //                             sellsignature: signature,
            //                             finishedTradeTime: finishedTradeTime,  // Store finishedTradeTime\
            //                             classification : classification,
            //                             TradeTime: finishedTradeTime - openTradeTime, 
            //                         }
            //                     }
            //                 );
            //                 //Checking for existing open trade...
            //             if (existingOpenTrade) {
            //                 transactionLogger.info(`Transaction https://solscan.io/tx/${transaction.signature}`);
            //                 transactionLogger.info(`Token Sold = ${tokenValue}`);
            //                 const soldAmount = existingOpenTrade.tokenAmount;
            //                 await sellToken(primaryWallet, tokenAddress, soldAmount.toString(), true, false);
            //                 const finishedTradeTime = new Date().getTime(); // Define finishedTradeTime
            //                 // After saving the historical data, delete the open trade
            //                 // const newTransaction = {
            //                 //     type: 'SELL',
            //                 //     tokenAddress: existingOpenTrade.tokenAddress,
            //                 //     tokenAmount: soldAmount,
            //                 //     openTradeTime: existingOpenTrade.timeStamp,
            //                 //     finishedTradeTime: finishedTradeTime,
            //                 // };
            //                 // const classification = await classifyHolder(feePayer, tokenValue, existingOpenTrade.timeStamp, finishedTradeTime, tokenAddress);
            //                 // await createWalletEntry(feePayer, classification, newTransaction);
            //                 await OpenTrades.deleteOne({ walletAddress: feePayer });
            //             } else {
            //                 transactionLogger.warn(`No open trade found for SELL transaction for wallet ${feePayer}`);
            //             }
            //         }
            //     }
            // }
            // if (transaction.type === "UNKNOWN" && transaction.description) {
            //     const parsedTransaction = await parseTransactionShyft(transaction?.signature);
            //      result = parseTransactionResult(parsedTransaction?.result);
            //     if (result && (await result)?.buyOrSell === 'BUY') {
            //         const exclusiveHolder = await checkExclusiveTokenHolder((await result).tokenAddress, (await result)?.feePayer);
            //         if (exclusiveHolder && exclusiveHolder.solBalance > MIN_SOL_BALANCE) {
            //             transactionLogger.info(`Transaction: https://solscan.io/tx/${transaction.signature}`);
            //             transactionLogger.info(`Token Purchased = ${(await result).tokenValue}`);
            //             transactionLogger.info(`Sol Balance = ${exclusiveHolder.solBalance}`);
            //             const randomPercentage = Math.floor(Math.random() * 11) + 50;
            //             const solanaToBuy = Math.floor((randomPercentage / 100) * exclusiveHolder.solBalance);
            //             const decimals = await getTokenDecimals((await result).tokenAddress);
            //             console.log(`decimals is,${decimals} decimals` )
            //             const tokenPrice = await getTokenPrice((await result).tokenAddress);
            //             const tokenToSell = (await buyToken(primaryWallet, (await result).tokenAddress, solanaToBuy, false, true) as number) / 10 ** decimals;
            //             await OpenTrades.create({
            //                 walletAddress: (await result).feePayer,
            //                 solBalance: exclusiveHolder.solBalance,
            //                 tokenBalance: exclusiveHolder.tokenBalance,
            //                 tokenAddress: exclusiveHolder.tokenMintAddress,
            //                 openTradeType: 'SELL',
            //                 tokenAmount: tokenToSell,
            //                 solAmount: solanaToBuy,
            //                 tokenDecimal: decimals,
            //                 tokenPrice: tokenPrice,
            //                 timeStamp: new Date().getTime(),
            //             });
            //             await ExclusiveHolders.updateOne({ walletAddress: (await result).feePayer }, { $set: { openTrade: true } });
            //         }
            //     }
            // }
            //     logger.info("Monitoring Transactions...")
            // }
        });
        // res.status(200).send('Transaction processed.');
    }
    catch (error) {
        logger_1.logger.error(`Error processing webhook: ${error.message}`, error);
        res.status(500).send('Error processing transaction.');
    }
});
app.listen(PORT, '0.0.0.0', () => {
    logger_1.logger.info(`Server is running and listening on http://0.0.0.0:${PORT}`); // Debug log: Server listening
});
// Handle SIGINT event to delete webhook and exit
process.on('SIGINT', async () => {
    try {
        logger_1.logger.info('SIGINT received. Attempting to delete webhook.'); // Debug log: SIGINT received
        await (0, helius_delete_webhook_1.deleteWebhook)(webhookID);
        logger_1.logger.info('Webhook deleted successfully.'); // Debug log: Webhook deletion successful
    }
    catch (error) {
        logger_1.logger.error('Failed to delete webhook:', { error });
    }
    finally {
        process.exit(0);
    }
});
function setStopLoss(tokenAddress, stopLossPrice) {
    throw new Error('Function not implemented.');
}
function setTakeProfit(tokenAddress, takeProfitPrice) {
    throw new Error('Function not implemented.');
}
function recordTradeTime(toAccount) {
    throw new Error('Function not implemented.');
}
