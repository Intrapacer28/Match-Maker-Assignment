"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readTransaction = exports.logTransaction = exports.parseTransactionResult = exports.parseTransactionShyft = exports.convertTimestampToReadableFormat = void 0;
exports.parseTransactionHeliusSwap = parseTransactionHeliusSwap;
exports.parseTransactionHeliusTransfer = parseTransactionHeliusTransfer;
exports.getRandomNumberInRange = getRandomNumberInRange;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
require("dotenv/config");
const profitConfig_1 = require("../config/profitConfig");
const utils_1 = require("./utils");
// Function to convert timestamp to readable format
const convertTimestampToReadableFormat = (timestamp) => {
    const date = new Date(timestamp);
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    return date.toLocaleString('en-US', options);
};
exports.convertTimestampToReadableFormat = convertTimestampToReadableFormat;
// Function to parse transaction using Shyft API
//Added response status check and specific error messages for better handling.
//Used error.message || error for logging.
// Shyft transaction parsing and classification
const parseTransactionShyft = async (txSig) => {
    const url = `https://api.shyft.to/sol/v1/transaction/parsed?network=mainnet-beta&txn_signature=${txSig}`;
    const myHeaders = new Headers();
    myHeaders.append("x-api-key", process.env.SHYFT_API_KEY);
    const requestOptions = { method: 'GET', headers: myHeaders, redirect: 'follow' };
    try {
        const response = await fetch(url, requestOptions);
        if (!response.ok)
            throw new Error(`Failed to fetch transaction data. Status: ${response.status}`);
        const result = await response.json();
        const holderAddress = result?.transaction?.fee_payer;
        const amountTraded = result?.transaction?.amount_traded || 0;
        const openTradeTime = new Date(result?.transaction?.blockTime * 1000).getTime();
        const finishedTradeTime = Date.now();
        const tokenSymbol = result?.transaction?.token_symbol;
        return { result, holderAddress, amountTraded, openTradeTime, finishedTradeTime };
    }
    catch (error) {
        console.error('Error parsing transaction from Shyft: ', error.message || error);
        throw new Error('Error parsing transaction.');
    }
};
exports.parseTransactionShyft = parseTransactionShyft;
// Function to parse swap transaction and classify
const parseTransactionResult = async (transaction) => {
    if (!transaction?.type?.includes('SWAP') || !transaction?.actions?.[0]) {
        return null;
    }
    const action = transaction.actions[0];
    const signature = transaction.signatures?.[0];
    const feePayer = transaction?.fee_payer;
    const allTokenAddresses = Object.values(profitConfig_1.TOKEN_DETAILS);
    let buyOrSell = '';
    let tokenValue = 0;
    let symbol = '';
    let tokenAddress = '';
    if (!action?.info?.tokens_swapped?.in || !action?.info?.tokens_swapped?.out) {
        return null;
    }
    const inToken = action.info.tokens_swapped.in;
    const outToken = action.info.tokens_swapped.out;
    if (allTokenAddresses.includes(inToken.token_address) && !allTokenAddresses.includes(outToken.token_address)) {
        buyOrSell = 'SELL';
        tokenAddress = inToken.token_address;
        tokenValue = inToken.amount;
        symbol = inToken.symbol;
    }
    else if (!allTokenAddresses.includes(inToken.token_address) && allTokenAddresses.includes(outToken.token_address)) {
        buyOrSell = 'BUY';
        tokenAddress = outToken.token_address;
        tokenValue = outToken.amount;
        symbol = outToken.symbol;
    }
    else {
        return null;
    }
    return {
        buyOrSell,
        tokenValue,
        signature,
        symbol,
        feePayer,
        tokenAddress,
    };
};
exports.parseTransactionResult = parseTransactionResult;
// Function to parse helius swap transaction
// Helper function to add a randomized delay
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// Updated parseTransactionHeliusSwap function
async function parseTransactionHeliusSwap(transaction) {
    const allTokenSymbols = Object.keys(profitConfig_1.TOKEN_DETAILS);
    const description = transaction?.description;
    const match = description?.split(' ');
    // Return null if no match or description doesn't contain SOL or USDC
    if (!match || (!match.includes('SOL') && !match.includes('USDC'))) {
        return null;
    }
    if (match) {
        const amountSold = parseFloat(match[2]);
        const tokenSold = match[3];
        const amountBought = parseFloat(match[5]);
        const tokenBought = match[6];
        let tokenSymbol;
        // Check if tokenSold or tokenBought is a key or value in TOKEN_DETAILS
        const soldKeyMatch = allTokenSymbols.find(symbol => symbol === tokenSold || profitConfig_1.TOKEN_DETAILS[symbol] === tokenSold);
        const boughtKeyMatch = allTokenSymbols.find(symbol => symbol === tokenBought || profitConfig_1.TOKEN_DETAILS[symbol] === tokenBought);
        if (soldKeyMatch && !boughtKeyMatch) {
            tokenSymbol = soldKeyMatch;
        }
        else if (!soldKeyMatch && boughtKeyMatch) {
            tokenSymbol = boughtKeyMatch;
        }
        else {
            return null; // If both are keys or values, return null
        }
        if (tokenSold === tokenBought) {
            return null; // Ensure that tokens sold and bought are not the same
        }
        let tokenAddress = profitConfig_1.TOKEN_DETAILS[tokenSymbol];
        let buyOrSell;
        let tokenValue;
        let signature = transaction?.signature;
        let feePayer = transaction?.feePayer;
        let solamount;
        // Get token prices for buy and sell
        let priceAtBuy = await (0, utils_1.getTokenPrice)(tokenAddress);
        let priceAtSell = await (0, utils_1.getTokenPrice)(tokenAddress);
        // Initialize solamount based on buy or sell action
        if (tokenSymbol === tokenSold) {
            buyOrSell = 'SELL';
            tokenValue = amountSold;
            solamount = amountBought;
        }
        else if (tokenSymbol === tokenBought) {
            buyOrSell = 'BUY';
            tokenValue = amountBought;
            solamount = amountSold;
        }
        else {
            buyOrSell = 'unknown';
        }
        // If the transaction involves USDC, convert USDC to SOL-equivalent
        if (tokenSold === 'USDC' || tokenBought === 'USDC') {
            // Add randomized delay before calling calculateSOLAmountForUSDC
            await delay(Math.floor(Math.random() * (800 - 300 + 1)) + 300); // Delay between 300-800 ms
            solamount = await (0, utils_1.calculateSOLAmountForUSDC)(tokenSold === 'USDC' ? amountSold : amountBought);
        }
        return {
            feePayer,
            tokenAddress,
            tokenSymbol,
            signature,
            tokenValue, // Stores either SOL or USDC
            solamount, // Always in SOL equivalent
            buyOrSell,
            priceAtBuy,
            priceAtSell,
        };
    }
    return null;
}
// Function to parse helius transfer transaction
async function parseTransactionHeliusTransfer(transaction) {
    if (!transaction || !transaction.description) {
        return null;
    }
    const description = transaction.description;
    const parts = description.split(' ');
    if (parts.length < 6) {
        return null;
    }
    const fromAccount = parts[0];
    const tokenTransferred = parseFloat(parts[2]);
    const tokenSymbol = parts[3];
    let toAccount = parts[5];
    toAccount = toAccount.endsWith('.') ? toAccount.slice(0, -1) : toAccount;
    return {
        fromAccount,
        toAccount,
        tokenTransferred,
        tokenSymbol,
    };
}
// Function to get random number in range
function getRandomNumberInRange(min, max) {
    if (min > max) {
        throw new Error("Minimum value must be less than or equal to the maximum value.");
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
// Function to log transaction
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
exports.logTransaction = logTransaction;
// Function to read transaction
const readTransaction = (name) => {
    const logFilePath = path_1.default.join(__dirname, `${name}.json`);
    let transactions = [];
    let transaction;
    if (fs_1.default.existsSync(logFilePath)) {
        const data = fs_1.default.readFileSync(logFilePath, 'utf8');
        transactions = JSON.parse(data);
        transaction = transactions.shift();
        fs_1.default.writeFileSync(logFilePath, JSON.stringify(transactions, null, 2), 'utf8');
        return transaction;
    }
    return [];
};
exports.readTransaction = readTransaction;
