"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveDataToFile = exports.sell = exports.buy = exports.distributeSol = void 0;
exports.editJson = editJson;
exports.readJson = readJson;
exports.writeJson = writeJson;
const web3_js_1 = require("@solana/web3.js");
const volumeConfig_1 = require("../config/volumeConfig");
require("dotenv/config");
const bs58_1 = __importDefault(require("bs58"));
const fs_1 = __importDefault(require("fs"));
const buyToken_1 = require("../swapper/buyToken");
const utils_1 = require("./utils");
const sellToken_1 = require("../swapper/sellToken");
// Function to distribute SOL among wallets
const distributeSol = async (mainKp, distritbutionNum) => {
    const solanaConnection = new web3_js_1.Connection(process.env.RPC_URL, {
        wsEndpoint: process.env.RPC_WEBSOCKET_ENDPOINT,
    });
    const data = [];
    const wallets = [];
    try {
        const sendSolTx = [];
        sendSolTx.push(web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({ units: 100_000 }), web3_js_1.ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 250_000 }));
        for (let i = 0; i < distritbutionNum; i++) {
            let solAmount = volumeConfig_1.DISTRIBUTION_AMOUNT;
            if (volumeConfig_1.DISTRIBUTION_AMOUNT < volumeConfig_1.ADDITIONAL_FEE + volumeConfig_1.BUY_UPPER_AMOUNT)
                solAmount = volumeConfig_1.ADDITIONAL_FEE + volumeConfig_1.BUY_UPPER_AMOUNT;
            const wallet = web3_js_1.Keypair.generate();
            wallets.push({ kp: wallet, buyAmount: solAmount }); //---REDUNDANCY----(REMOVE IT or modify the code)// 
            sendSolTx.push(web3_js_1.SystemProgram.transfer({
                fromPubkey: mainKp.publicKey,
                toPubkey: wallet.publicKey,
                lamports: solAmount * web3_js_1.LAMPORTS_PER_SOL,
            }));
        }
        let index = 0;
        while (true) {
            try {
                if (index > 3) {
                    console.log("Error in distribution");
                    return null;
                }
                const latestBlockhash = await solanaConnection.getLatestBlockhash();
                const messageV0 = new web3_js_1.TransactionMessage({
                    payerKey: mainKp.publicKey,
                    recentBlockhash: latestBlockhash.blockhash,
                    instructions: sendSolTx,
                }).compileToV0Message();
                const transaction = new web3_js_1.VersionedTransaction(messageV0);
                transaction.sign([mainKp]);
                const signature = await solanaConnection.sendRawTransaction(transaction.serialize(), { skipPreflight: true });
                const confirmation = await solanaConnection.confirmTransaction({
                    signature,
                    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
                    blockhash: latestBlockhash.blockhash,
                });
                if (confirmation.value.err) {
                    console.log("Confrimtaion error");
                    return "";
                }
                else {
                    console.log(`Success in distributing SOL : https://solscan.io/tx/${signature}`);
                }
                break;
            }
            catch (error) {
                index++;
            }
        }
        wallets.map((wallet) => {
            data.push({
                privateKey: bs58_1.default.encode(wallet.kp.secretKey),
                pubkey: wallet.kp.publicKey.toBase58(),
                solBalance: wallet.buyAmount + volumeConfig_1.ADDITIONAL_FEE,
                tokenBuyTx: null,
                tokenSellTx: null,
            });
        });
        try {
            (0, exports.saveDataToFile)(data);
        }
        catch (error) { }
        console.log("Success in transferring sol");
        return wallets;
    }
    catch (error) {
        console.log(`Failed to transfer SOL`);
        return null;
    }
};
exports.distributeSol = distributeSol;
// Function to buy token
const buy = async (newWallet, tokenAddress, buyAmount) => {
    let solBalance = 0;
    try {
        solBalance = await (0, utils_1.getSolanaBalance)(newWallet.publicKey.toString());
    }
    catch (error) {
        console.log("Error getting balance of wallet");
        return null;
    }
    if (solBalance == 0) {
        console.log(`No SOL in ${newWallet.publicKey.toString()}`);
        return null;
    }
    try {
        const tokenBuyTx = (await (0, buyToken_1.buyToken)(newWallet, tokenAddress, buyAmount, true, false));
        editJson({
            tokenBuyTx,
            pubkey: newWallet.publicKey.toBase58(),
            solBalance: solBalance / 10 ** 9 - buyAmount,
        });
        return tokenBuyTx;
    }
    catch (error) {
        return null;
    }
};
exports.buy = buy;
// Function to sell token
const sell = async (wallet, baseMint) => {
    try {
        const data = readJson();
        if (data.length == 0) {
            await (0, utils_1.delay)(1000);
            return null;
        }
        try {
            const tokenSellTx = await (0, sellToken_1.sellToken)(wallet, true, baseMint.toString(), false, true);
            const solBalance = await (0, utils_1.getSolanaBalance)(wallet.publicKey.toString());
            editJson({
                pubkey: wallet.publicKey.toBase58(),
                tokenSellTx,
                solBalance,
            });
            return tokenSellTx;
        }
        catch (error) {
            return null;
        }
    }
    catch (error) {
        return null;
    }
};
exports.sell = sell;
// Function to save data to file
const saveDataToFile = (newData, filePath = "data.json") => {
    try {
        let existingData = [];
        // Check if the file exists
        if (fs_1.default.existsSync(filePath)) {
            // If the file exists, read its content
            const fileContent = fs_1.default.readFileSync(filePath, "utf-8");
            existingData = JSON.parse(fileContent);
        }
        // Add the new data to the existing array
        existingData.push(...newData);
        // Write the updated data back to the file
        fs_1.default.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
    }
    catch (error) {
        try {
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
                console.log(`File ${filePath} deleted and create new file.`);
            }
            fs_1.default.writeFileSync(filePath, JSON.stringify(newData, null, 2));
            console.log("File is saved successfully.");
        }
        catch (error) {
            console.log("Error saving data to JSON file:", error);
        }
    }
};
exports.saveDataToFile = saveDataToFile;
// Function to edit JSON file content
function editJson(newData, filename = "data.json") {
    if (!newData.pubkey) {
        console.log("Pubkey is not provided as an argument");
        return;
    }
    const wallets = readJson(filename);
    const index = wallets.findIndex((wallet) => wallet.pubkey === newData.pubkey);
    if (index !== -1) {
        if (newData.tokenBuyTx) {
            if (!wallets[index].tokenBuyTx) {
                wallets[index].tokenBuyTx = [];
            }
            wallets[index].tokenBuyTx.push(newData.tokenBuyTx);
        }
        if (newData.tokenSellTx) {
            if (!wallets[index].tokenSellTx) {
                wallets[index].tokenSellTx = [];
            }
            wallets[index].tokenSellTx.push(newData.tokenSellTx);
        }
        if (newData.solBalance !== undefined) {
            wallets[index].solBalance = newData.solBalance;
        }
        writeJson(wallets, filename);
    }
    else {
        console.error(`Pubkey ${newData.pubkey} does not exist.`);
    }
}
// Function to read JSON file
function readJson(filename = "data.json") {
    if (!fs_1.default.existsSync(filename)) {
        // If the file does not exist, create an empty array
        fs_1.default.writeFileSync(filename, "[]", "utf-8");
    }
    const data = fs_1.default.readFileSync(filename, "utf-8");
    return JSON.parse(data);
}
// Function to write JSON file
function writeJson(data, filename = "data.json") {
    fs_1.default.writeFileSync(filename, JSON.stringify(data, null, 4), "utf-8");
}
