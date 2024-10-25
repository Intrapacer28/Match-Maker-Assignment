"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils/utils");
const sellToken_1 = require("../swapper/sellToken");
const web3_js_1 = require("@solana/web3.js");
const bs58_1 = __importDefault(require("bs58"));
const finishtrades_1 = __importDefault(require("../models/finishtrades"));
const opentrades_1 = __importDefault(require("../models/opentrades"));
const logger_1 = require("../utils/logger");
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv/config");
const TokenBalanceListener_1 = require("../utils/TokenBalanceListener");
const profitConfig_1 = require("../config/profitConfig");
const primaryWallet = web3_js_1.Keypair.fromSecretKey(bs58_1.default.decode(process.env.WALLET_PRIVATE_KEY || ''));
// Connect to MongoDB
mongoose_1.default
    .connect('mongodb://127.0.0.1:27017/market-maker-bot')
    .then(() => logger_1.logger.info("Mongo Connected"))
    .catch(err => logger_1.logger.error("Mongo Error", err));
// Process trade with new balances
async function processTrade(trade, newTokenBalance, newSolBalance) {
    const tokenDifference = newTokenBalance - trade.tokenBalance;
    const solDifference = newSolBalance - trade.solBalance;
    const minTokenDifferenceToSell = await (0, utils_1.calculateTokenAmountForUSDC)(trade.tokenAddress, profitConfig_1.MIN_TOKEN_DIFFERENCE_TO_SELL_USDC);
    // Check if token difference is less than minimum token difference to sell
    if (tokenDifference < -minTokenDifferenceToSell) {
        if (solDifference > profitConfig_1.MIN_SOL_DIFFERENCE_TO_SELL) { // 1 sol difference to sell
            logger_1.logger.info(`Token sold by ${trade.walletAddress}. Selling remaining tokens.`);
            await sellAndRecordTrade(trade, `Token sold by ${trade.walletAddress}`);
        }
        else {
            await sellAndRecordTrade(trade, `Token transferred by ${trade.walletAddress}`);
            logger_1.logger.info(`Token transferred by ${trade.walletAddress}. Selling remaining tokens.`);
        }
        return;
    }
    // Check if sol difference is greater than minimum sol difference to update
    if (solDifference > profitConfig_1.MIN_SOL_DIFFERENCE_TO_UPDATE && tokenDifference === 0) {
        logger_1.logger.info(`More SOL added to ${trade.walletAddress}. Updating balance and waiting for token purchase.`);
        await opentrades_1.default.findOneAndUpdate({ walletAddress: trade.walletAddress }, { $set: { solBalance: newSolBalance } }, { new: true });
        return;
    }
    // Check if sol difference is less than minimum sol difference to sell
    if (solDifference < profitConfig_1.MIN_SOL_DIFFERENCE_TO_SELL && tokenDifference === 0) {
        logger_1.logger.info(`SOL transferred out from ${trade.walletAddress} or Another token bought`);
        await sellAndRecordTrade(trade, 'SOL transferred out or Another token bought');
        return;
    }
    // Check if token difference is greater than minimum token difference to sell
    if (tokenDifference > minTokenDifferenceToSell) {
        // Check if sol difference is less than negative trade sol amount
        if (solDifference < -trade.solAmount) {
            logger_1.logger.info(`Token purchased by ${trade.walletAddress}. No more SOL for additional purchases. Selling token.`);
            await sellAndRecordTrade(trade, 'Token purchased, no additional SOL');
        }
        else {
            logger_1.logger.info(`Token purchased by ${trade.walletAddress}. Waiting for potential additional purchases.`);
            // Update the trade with new balances
            await opentrades_1.default.findOneAndUpdate({ walletAddress: trade.walletAddress }, {
                $set: {
                    tokenBalance: newTokenBalance,
                    solBalance: newSolBalance,
                }
            }, { new: true });
        }
        return;
    }
    // Log unexpected balance change
    logger_1.logger.info(`Unexpected balance change for ${trade.walletAddress}. No action taken.`);
    // Update open trade with new balances
    await opentrades_1.default.findOneAndUpdate({ walletAddress: trade.walletAddress }, {
        $set: {
            tokenBalance: newTokenBalance,
            solBalance: newSolBalance,
        }
    }, { new: true }).then(() => logger_1.logger.info("Open Trade Updated"));
}
// Sell token and record trade
async function sellAndRecordTrade(trade, description) {
    try {
        const amountOfSolIn = await (0, sellToken_1.sellToken)(primaryWallet, false, trade.tokenAddress, false, true, trade.tokenAmount) / web3_js_1.LAMPORTS_PER_SOL;
        await finishtrades_1.default.create({
            walletAddress: trade.walletAddress,
            initialAmount: trade.solAmount,
            finalAmount: amountOfSolIn,
            profitOrLoss: amountOfSolIn > trade.solAmount ? 'Profit' : 'Loss',
            openTrade: trade,
            description
        });
        await opentrades_1.default.deleteOne({ walletAddress: trade.walletAddress });
        logger_1.logger.info('Open Trade file has been updated');
    }
    catch (err) {
        logger_1.logger.error("Error in selling token or updating database:", { message: err.message, stack: err.stack });
    }
}
// Monitor wallets for token purchase
async function monitorWalletsForTokenPurchase() {
    // Create listener for token and sol balance changes
    const listener = new TokenBalanceListener_1.TokenBalanceListener(process.env.RPC_URL || '');
    const monitoredWallets = new Set();
    const tokenMonitors = new Map();
    const pendingBalanceChanges = new Map();
    const tradeTimeouts = new Map();
    // Handle token balance change
    async function handleTokenBalanceChange(walletAddress, newTokenBalance) {
        let pending = pendingBalanceChanges.get(walletAddress) || {};
        pending.newTokenBalance = newTokenBalance;
        pendingBalanceChanges.set(walletAddress, pending);
        if (pending.newSolBalance !== undefined) {
            await processTradeWithNewBalances(walletAddress);
        }
    }
    // Handle sol balance change
    async function handleSolBalanceChange(walletAddress, newSolanaBalance) {
        let pending = pendingBalanceChanges.get(walletAddress) || {};
        pending.newSolBalance = newSolanaBalance;
        pendingBalanceChanges.set(walletAddress, pending);
        if (pending.newTokenBalance !== undefined) {
            await processTradeWithNewBalances(walletAddress); //come again
        }
    }
    // Process trade with new balances
    async function processTradeWithNewBalances(walletAddress) {
        const pending = pendingBalanceChanges.get(walletAddress);
        if (!pending || pending.newTokenBalance === undefined || pending.newSolBalance === undefined) {
            return;
        }
        const openTrade = await opentrades_1.default.findOne({ walletAddress });
        if (openTrade) {
            await processTrade(openTrade, pending.newTokenBalance, pending.newSolBalance);
        }
        pendingBalanceChanges.delete(walletAddress);
    }
    //for auto-sell at config profit or loss
    function monitorTokenPrice(tokenAddress, initialPrice) {
        const intervalId = setInterval(async () => {
            const currentPrice = await (0, utils_1.getTokenPrice)(tokenAddress);
            const percentChange = ((currentPrice - initialPrice) / initialPrice) * 100;
            if ((profitConfig_1.ENABLE_AUTO_SELL_PROFIT && percentChange >= profitConfig_1.AUTO_SELL_PROFIT_PERCENTAGE) ||
                (profitConfig_1.ENABLE_AUTO_SELL_LOSS && percentChange <= -profitConfig_1.AUTO_SELL_LOSS_PERCENTAGE)) {
                const monitor = tokenMonitors.get(tokenAddress);
                if (monitor) {
                    // Iterate through all trades for this token
                    for (const walletAddress of monitor.trades) {
                        const trade = await opentrades_1.default.findOne({ walletAddress, tokenAddress });
                        if (trade) {
                            if (percentChange >= profitConfig_1.AUTO_SELL_PROFIT_PERCENTAGE) {
                                logger_1.logger.info(`Auto-selling due to ${percentChange.toFixed(2)}% profit for ${walletAddress}`);
                                await sellAndRecordTrade(trade, `Auto-sold at ${percentChange.toFixed(2)}% profit`);
                            }
                            else {
                                logger_1.logger.info(`Auto-selling due to ${Math.abs(percentChange).toFixed(2)}% loss for ${walletAddress}`);
                                await sellAndRecordTrade(trade, `Auto-sold at ${Math.abs(percentChange).toFixed(2)}% loss`);
                            }
                        }
                    }
                }
                clearInterval(intervalId);
                tokenMonitors.delete(tokenAddress);
            }
        }, profitConfig_1.PRICE_CHECK_INTERVAL);
        return () => {
            logger_1.logger.info(`Cleaning up token price monitoring for ${tokenAddress}`);
            clearInterval(intervalId);
        };
    }
    // Setup trade timeout
    async function setupTradeTimeout(trade) {
        const timeLeft = trade.timeStamp + profitConfig_1.OPEN_TRADE_EXPIRATION_TIME - Date.now();
        if (timeLeft > 0) {
            const timeout = setTimeout(async () => {
                logger_1.logger.info(`Trade for ${trade.walletAddress} has expired. Selling token.`);
                await sellAndRecordTrade(trade, 'Trade time expired');
                tradeTimeouts.delete(trade.walletAddress);
            }, timeLeft);
            tradeTimeouts.set(trade.walletAddress, timeout);
        }
        else {
            logger_1.logger.info(`Trade for ${trade.walletAddress} has already expired. Selling token.`);
            await sellAndRecordTrade(trade, 'Trade time expired');
        }
    }
    listener.on('tokenBalanceChanged', handleTokenBalanceChange);
    listener.on('solBalanceChanged', handleSolBalanceChange);
    // Main loop 
    while (true) {
        try {
            const openTrades = await (0, utils_1.readOpenTrades)();
            if (openTrades.length === 0) {
                logger_1.logger.info("No Open Trades");
                await (0, utils_1.delay)(1000);
                continue;
            }
            logger_1.logger.info('Checking if any Token Purchases in Open Trade....');
            // Add listeners for new open trades
            for (const trade of openTrades) {
                if (!monitoredWallets.has(trade.walletAddress)) {
                    listener.addHolder(trade.walletAddress, trade.tokenAddress, trade.tokenDecimal);
                    monitoredWallets.add(trade.walletAddress);
                    logger_1.logger.info(`Added listener for wallet: ${trade.walletAddress}`);
                    if (!tradeTimeouts.has(trade.walletAddress)) {
                        await setupTradeTimeout(trade);
                    }
                    let monitor = tokenMonitors.get(trade.tokenAddress);
                    if (!monitor) {
                        const cleanup = monitorTokenPrice(trade.tokenAddress, trade.tokenPrice);
                        monitor = {
                            initialPrice: trade.tokenPrice,
                            trades: new Set([trade.walletAddress]),
                            cleanup
                        };
                        tokenMonitors.set(trade.tokenAddress, monitor);
                    }
                    else {
                        monitor.trades.add(trade.walletAddress);
                    }
                }
            }
            const openTradesWallets = openTrades.map(trade => trade.walletAddress);
            // Remove listeners for closed trades
            for (const walletAddress of monitoredWallets) {
                if (!(openTradesWallets.includes(walletAddress))) {
                    listener.removeHolder(walletAddress);
                    monitoredWallets.delete(walletAddress);
                    logger_1.logger.info(`Removed listener for wallet: ${walletAddress}`);
                    const timeout = tradeTimeouts.get(walletAddress);
                    if (timeout) {
                        clearTimeout(timeout);
                        tradeTimeouts.delete(walletAddress);
                    }
                    for (const monitor of tokenMonitors.values()) {
                        monitor.trades.delete(walletAddress);
                    }
                    for (const [tokenAddress, monitor] of tokenMonitors.entries()) {
                        if (monitor.trades.size === 0) {
                            monitor.cleanup();
                            tokenMonitors.delete(tokenAddress);
                        }
                    }
                }
            }
            // Run garbage collection
            if (global.gc) {
                global.gc();
            }
            await (0, utils_1.delay)(1000);
        }
        catch (error) {
            logger_1.logger.error("An error occurred in monitorTokenPurchase file:", { message: error.message, stack: error.stack });
            await (0, utils_1.delay)(5000);
        }
    }
}
process.on('SIGINT', () => {
    logger_1.logger.info('Gracefully shutting down...');
    process.exit(0);
});
monitorWalletsForTokenPurchase().catch(console.error);
