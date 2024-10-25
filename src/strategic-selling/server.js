"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const controllers_1 = require("../utils/controllers");
const strategicSellingConfig_1 = require("../config/strategicSellingConfig");
const web3_js_1 = require("@solana/web3.js");
const bs58_1 = __importDefault(require("bs58"));
const utils_1 = require("../utils/utils");
const primaryWallet = web3_js_1.Keypair.fromSecretKey(bs58_1.default.decode(process.env.WALLET_PRIVATE_KEY));
const app = (0, express_1.default)();
const port = 3001;
let totalBuy = 0;
let totalSell = 0;
app.use(body_parser_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.get('/', (req, res) => {
    res.send("Hey");
});
app.post('/webhook', async (req, res) => {
    const transactions = req.body;
    for (const transaction of transactions) {
        let parsedTransaction;
        let result;
        try {
            // Determine transaction type
            if (transaction?.type === 'SWAP' && transaction?.description) {
                result = await (0, controllers_1.parseTransactionHeliusSwap)(transaction);
            }
            else {
                parsedTransaction = await (0, controllers_1.parseTransactionShyft)(transaction?.signature);
                // result = parseTransactionResult(parsedTransaction?.result);
            }
            // Update totals based on transaction results
            if (result?.buyOrSell === 'BUY') {
                totalBuy += result?.tokenValue;
            }
            else {
                totalSell += result?.tokenValue;
            }
            const marketData = await (0, utils_1.fetchMarketData)();
            const sellPercentage = (0, utils_1.getDynamicSellPercentage)(marketData);
            // Execute selling strategy based on results
            if (result?.buyOrSell === 'BUY' && result?.tokenValue > strategicSellingConfig_1.BASE_AMOUNT) {
                const tokenToSell = (await sellPercentage / 100) * result.tokenValue;
                //await sellToken(primaryWallet, false, TOKEN_MINT, false, false, tokenToSell);
            }
            // Overall sell logic based on total buy and sell
            if ((totalBuy - totalSell) > strategicSellingConfig_1.BASE_AMOUNT) {
                const tokenToSell = (await sellPercentage / 100) * strategicSellingConfig_1.BASE_AMOUNT;
                // await sellToken(primaryWallet, false, TOKEN_MINT, false, false, tokenToSell);
            }
            // Threshold-based selling logic 
            if ((totalSell - totalBuy) >= strategicSellingConfig_1.SELLING_THRESHOLD) {
                const profitAmount = totalSell - totalBuy;
                // await sellToken(primaryWallet, false, TOKEN_MINT, false, false, profitAmount);
            }
            console.log("Total Buy:", totalBuy);
            console.log("Total Sell:", totalSell);
            console.log("\n");
        }
        catch (error) {
            console.error("Error processing transaction:", error);
            // Log error to the database for future analysis
        }
    }
    res.sendStatus(200);
});
// Periodic analysis (could be called at regular intervals using setInterval)
setInterval(utils_1.analyzeTransactions, strategicSellingConfig_1.TIME_INTERVAL); //what is the role of analyzeTransactions here 
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
