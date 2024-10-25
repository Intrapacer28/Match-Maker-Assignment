"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const strategicSellingConfig_1 = require("../config/strategicSellingConfig");
const bs58_1 = __importDefault(require("bs58"));
require("dotenv/config");
const utils_1 = require("../utils/utils"); // Import market data fetching utility
const utils_2 = require("../utils/utils");
const lodash_1 = require("lodash");
const primaryWallet = web3_js_1.Keypair.fromSecretKey(bs58_1.default.decode(process.env.WALLET_PRIVATE_KEY || ''));
const timelySell = async () => {
    try {
        // Set an interval for timed selling
        setInterval(async () => {
            try {
                // Fetch the latest market data to inform selling decisions
                const marketData = await (0, utils_1.fetchMarketData)();
                // Example: Adjust the sell amount based on market conditions
                const sellAmount = (0, utils_2.getDynamicSellPercentage)(marketData);
                // Log the selling process
                console.log(`Attempting to sell ${sellAmount} ${strategicSellingConfig_1.TOKEN_SYMBOL}...`);
                // Execute the sell transaction
                //const result = await sellToken(primaryWallet, false, TOKEN_MINT, false, sellAmount);
                // Log the result of the sell transaction
                console.log(`Sold ${sellAmount} ${strategicSellingConfig_1.TOKEN_SYMBOL}:`, lodash_1.result);
            }
            catch (error) {
                console.error("Error during sell transaction:", error);
            }
        }, strategicSellingConfig_1.TIME_INTERVAL);
    }
    catch (error) {
        console.error("Error setting up timely selling:", error);
    }
};
timelySell();
