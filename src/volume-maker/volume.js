"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const web3_js_1 = require("@solana/web3.js");
const bs58_1 = __importDefault(require("bs58"));
const spl_token_1 = require("@solana/spl-token");
const volumeUtils_1 = require("../utils/volumeUtils");
const utils_1 = require("../utils/utils");
const volumeConfig_1 = require("../config/volumeConfig");
//Intialialize connection 
const connection = new web3_js_1.Connection((0, web3_js_1.clusterApiUrl)("testnet"));
const main = async () => {
    // Load main wallet's secret key from environment variables
    const mainWalletSecretKey = process.env.WALLET_PRIVATE_KEY;
    if (!mainWalletSecretKey) {
        throw new Error("WALLET_PRIVATE_KEY environment variable is missing");
    }
    // Decode the Base58 private key
    const privateKeyBytes = bs58_1.default.decode(mainWalletSecretKey);
    if (privateKeyBytes.length !== 64) {
        throw new Error("The private key should be 64 bytes long.");
    }
    const mainWalletKeypair = web3_js_1.Keypair.fromSecretKey(privateKeyBytes);
    const solBalance = await (0, utils_1.getSolanaBalance)(mainWalletKeypair.publicKey.toString());
    const baseMint = new web3_js_1.PublicKey(volumeConfig_1.TOKEN_MINT);
    console.log(`Volume bot is running`);
    console.log(`Wallet address: ${mainWalletKeypair.publicKey.toBase58()}`);
    console.log(`Pool token mint: ${baseMint.toBase58()}`);
    console.log(`Wallet SOL balance: ${solBalance} SOL`);
    console.log(`Distribute SOL to ${volumeConfig_1.DISTRIBUTION_NUM} wallets`);
    if (volumeConfig_1.TOTAL_TRANSACTION % 2 !== 0) {
        throw new Error("Total transactions must be even for balanced buy/sell.");
    }
    let data = null;
    // Only proceed with SOL distribution if there's enough balance
    if (solBalance >= (volumeConfig_1.BUY_LOWER_AMOUNT + volumeConfig_1.ADDITIONAL_FEE) * volumeConfig_1.DISTRIBUTION_NUM) {
        console.log("Sufficient balance, distributing SOL...");
        data = (await (0, volumeUtils_1.distributeSol)(mainWalletKeypair, volumeConfig_1.DISTRIBUTION_NUM));
    }
    else {
        console.log("Sol balance is not enough for distribution.");
        return; // Exit if distribution can't happen
    }
    if (data === null || data.length === 0) {
        console.log("Distribution failed or no wallets created.");
        return;
    }
    // Create SPL token accounts for each child wallet
    for (const { kp } of data) {
        const tokenAccount = await (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, mainWalletKeypair, baseMint, kp.publicKey);
        console.log(`SPL Token Account created for ${kp.publicKey.toBase58()}: ${tokenAccount.address.toBase58()}`);
    }
    // Proceed with the rest of the script (buy/sell logic)
    const buyPriority = [];
    const sellPriority = [];
    data.forEach(({ kp }) => {
        buyPriority.push({ kp });
    });
    if (buyPriority.length === 0 || volumeConfig_1.TOTAL_TRANSACTION <= 0) {
        throw new Error("Invalid input: buyPriority cannot be empty and totalTransactions must be positive.");
    }
    let buyCount = 0;
    let sellCount = 0;
    const maxTransactions = volumeConfig_1.TOTAL_TRANSACTION / 2;
    console.log("Transaction will start after 30 Seconds");
    await (0, utils_1.delay)(30000);
    // Transaction loop logic (same as before)
    for (let i = 0; i < volumeConfig_1.TOTAL_TRANSACTION; i++) {
        const BUY_INTERVAL = Math.round(Math.random() * (volumeConfig_1.BUY_INTERVAL_MAX - volumeConfig_1.BUY_INTERVAL_MIN) + volumeConfig_1.BUY_INTERVAL_MIN);
        let buyAmount;
        if (volumeConfig_1.IS_RANDOM) {
            buyAmount = Number((Math.random() * (volumeConfig_1.BUY_UPPER_AMOUNT - volumeConfig_1.BUY_LOWER_AMOUNT) + volumeConfig_1.BUY_LOWER_AMOUNT).toFixed(6));
        }
        else {
            buyAmount = volumeConfig_1.BUY_AMOUNT;
        }
        const buyProbability = buyPriority.length === 0
            ? 0
            : buyPriority.length / (buyPriority.length + sellPriority.length);
        const buyDecision = Math.random() < buyProbability;
        if (buyDecision) {
            if (buyCount < maxTransactions) {
                const wallet = buyPriority.pop();
                if (!wallet) {
                    console.log("No more wallets available for buying");
                    break;
                }
                sellPriority.push(wallet);
                const solBalance = (await (0, utils_1.getSolanaBalance)(wallet.kp.publicKey.toString())) / web3_js_1.LAMPORTS_PER_SOL;
                if (solBalance < volumeConfig_1.ADDITIONAL_FEE) {
                    console.log("Balance is not enough: ", solBalance, "SOL");
                    return;
                }
                let k = 0;
                while (true) {
                    if (k > 10) {
                        console.log("Error in buy transaction");
                        return;
                    }
                    const result = await (0, volumeUtils_1.buy)(wallet.kp, baseMint.toBase58(), buyAmount);
                    if (result) {
                        break;
                    }
                    else {
                        k++;
                        console.log("Buy failed, try again");
                        await (0, utils_1.delay)(2000);
                    }
                }
                buyCount++;
            }
            else {
                console.warn("Buy limit reached, performing random sell (if possible).");
                const wallet = sellPriority.shift();
                if (!wallet) {
                    console.log("No more wallets available for selling");
                    break;
                }
                buyPriority.unshift(wallet);
                let j = 0;
                while (true) {
                    if (j > 10) {
                        console.log("Error in sell transaction");
                        return;
                    }
                    const result = await (0, volumeUtils_1.sell)(wallet.kp, baseMint);
                    if (result) {
                        break;
                    }
                    else {
                        j++;
                        console.log("Sell failed, try again");
                        await (0, utils_1.delay)(2000);
                    }
                }
                sellCount++;
            }
        }
        else {
            if (sellCount < maxTransactions) {
                const wallet = sellPriority.shift();
                if (!wallet) {
                    console.log("No more wallets available for selling");
                    break;
                }
                buyPriority.unshift(wallet);
                let j = 0;
                while (true) {
                    if (j > 10) {
                        console.log("Error in sell transaction");
                        return;
                    }
                    const result = await (0, volumeUtils_1.sell)(wallet.kp, baseMint);
                    if (result) {
                        break;
                    }
                    else {
                        j++;
                        console.log("Sell failed, try again");
                        await (0, utils_1.delay)(2000);
                    }
                }
                sellCount++;
            }
            else {
                console.warn("Sell limit reached, performing random buy (if possible).");
                const wallet = buyPriority.pop();
                if (!wallet) {
                    console.log("No more wallets available for buying");
                    break;
                }
                sellPriority.push(wallet);
                const solBalance = (await (0, utils_1.getSolanaBalance)(wallet.kp.publicKey.toString())) / web3_js_1.LAMPORTS_PER_SOL;
                if (solBalance < volumeConfig_1.ADDITIONAL_FEE) {
                    console.log("Balance is not enough: ", solBalance, "SOL");
                    return;
                }
                let k = 0;
                while (true) {
                    if (k > 10) {
                        console.log("Error in buy transaction");
                        return;
                    }
                    const result = await (0, volumeUtils_1.buy)(wallet.kp, baseMint.toBase58(), buyAmount);
                    if (result) {
                        break;
                    }
                    else {
                        k++;
                        console.log("Buy failed, try again");
                        await (0, utils_1.delay)(2000);
                    }
                }
                buyCount++;
            }
        }
        console.log("Wait for", BUY_INTERVAL, "Seconds for next transaction");
        await (0, utils_1.delay)(BUY_INTERVAL * 1000);
    }
    console.log("Execution finished");
};
main();
