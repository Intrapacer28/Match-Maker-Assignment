"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const controllers_1 = require("../utils/controllers");
const minimizeVolatilityConfig_1 = require("../config/minimizeVolatilityConfig");
const app = (0, express_1.default)();
const port = 4786;
app.use(body_parser_1.default.json());
app.get('/', (req, res) => {
    res.send("Hey");
});
app.post('/webhook', async (req, res) => {
    const transactions = req.body;
    let parsedTransaction;
    let result;
    for (const transaction of transactions) {
        logTransaction(transaction, "nero-helius");
        if (transaction?.type === 'SWAP' && transaction?.description) {
            const result = await parseTransactionDescription(transaction, minimizeVolatilityConfig_1.TOKEN_SYMBOL);
        }
        else {
            const parsedTransaction = await (0, controllers_1.parseTransactionShyft)(transaction?.signature);
            const result = (0, controllers_1.parseTransactionResult)(parsedTransaction?.result);
        }
        // Check liquidity before executing trade
        const liquidity = await getLiquidity(minimizeVolatilityConfig_1.TOKEN_MINT); // Fetch current liquidity
        console.log("Current Liquidity:", liquidity);
        if (result?.buyOrSell === 'BUY' && result?.tokenValue > minimizeVolatilityConfig_1.BASE_AMOUNT) {
            // Calculate sell amount based on liquidity
            const randomPercentage = (0, controllers_1.getRandomNumberInRange)(50, 70);
            const tokenToSell = (randomPercentage / 100) * result.tokenValue;
            // Limit sell amount based on liquidity
            const adjustedSellAmount = Math.min(tokenToSell, liquidity * 0.1);
            console.log("Adjusted SELL TOKEN", adjustedSellAmount);
            // await sellToken(primaryWallet, false, TOKEN_MINT, false, adjustedSellAmount);
        }
        if (result?.buyOrSell === 'SELL' && result?.tokenValue > minimizeVolatilityConfig_1.BASE_AMOUNT) {
            // Calculate buy amount based on liquidity
            const randomPercentage = (0, controllers_1.getRandomNumberInRange)(50, 70);
            const response = await fetch(`https://price.jup.ag/v6/price?ids=SOL&vsToken=${minimizeVolatilityConfig_1.TOKEN_MINT}`, {
                headers: {
                    'Accept-Encoding': 'gzip, deflate'
                }
            });
            const priceData = await response.json();
            const tokenToBuy = ((randomPercentage / 100) * result.tokenValue) / priceData?.data?.SOL?.price;
            // Limit buy amount based on liquidity
            const adjustedBuyAmount = Math.min(tokenToBuy, liquidity * 0.1);
            console.log("Adjusted BUY TOKEN", adjustedBuyAmount);
            // await buyToken(primaryWallet, TOKEN_MINT, adjustedBuyAmount, false, false);
        }
    }
    res.sendStatus(200);
});
// Function to get current liquidity for a specific token mint
async function getLiquidity(TOKEN_MINT) {
    // Fetch current liquidity from the appropriate liquidity pool
    // This is a pseudo-code example; you need to implement actual API calls or SDK usage
    const response = await fetch(`https://api.raydium.io/pairs?mint=${TOKEN_MINT}`);
    const liquidityData = await response.json();
    //remains to study the api structure yet (this is a dummy code for the same to get the liquidity)
    return liquidityData?.liquidity;
}
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
const logTransaction = (transaction, name) => {
    const logFilePath = path_1.default.join(__dirname, `${name}.json`);
    let transactions = [];
    if (fs_1.default.existsSync(logFilePath)) {
        const data = fs_1.default.readFileSync(logFilePath, 'utf8');
        transactions = JSON.parse(data);
    }
    transactions.push(transaction);
    fs_1.default.writeFileSync(logFilePath, JSON.stringify(transactions, null, 2), 'utf8');
};
function parseTransactionDescription(transaction, TOKEN_SYMBOL) {
    throw new Error('Function not implemented.');
}
