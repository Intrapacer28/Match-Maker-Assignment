"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveDataToFile = exports.sell = exports.buy = exports.distributeSol = void 0;
exports.editJson = editJson;
exports.readJson = readJson;
exports.writeJson = writeJson;
var web3_js_1 = require("@solana/web3.js");
var volumeConfig_1 = require("../config/volumeConfig");
require("dotenv/config");
var bs58_1 = require("bs58");
var fs_1 = require("fs");
var buyToken_1 = require("../swapper/buyToken");
var utils_1 = require("./utils");
var sellToken_1 = require("../swapper/sellToken");
// Function to distribute SOL among wallets
var distributeSol = function (mainKp, distritbutionNum) { return __awaiter(void 0, void 0, void 0, function () {
    var solanaConnection, data, wallets, sendSolTx, i, solAmount, wallet, index, latestBlockhash, messageV0, transaction, signature, confirmation, error_1, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                solanaConnection = new web3_js_1.Connection(process.env.RPC_URL, {
                    wsEndpoint: process.env.RPC_WEBSOCKET_ENDPOINT,
                });
                data = [];
                wallets = [];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 10, , 11]);
                sendSolTx = [];
                sendSolTx.push(web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({ units: 100000 }), web3_js_1.ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 250000 }));
                for (i = 0; i < distritbutionNum; i++) {
                    solAmount = volumeConfig_1.DISTRIBUTION_AMOUNT;
                    if (volumeConfig_1.DISTRIBUTION_AMOUNT < volumeConfig_1.ADDITIONAL_FEE + volumeConfig_1.BUY_UPPER_AMOUNT)
                        solAmount = volumeConfig_1.ADDITIONAL_FEE + volumeConfig_1.BUY_UPPER_AMOUNT;
                    wallet = web3_js_1.Keypair.generate();
                    wallets.push({ kp: wallet, buyAmount: solAmount });
                    sendSolTx.push(web3_js_1.SystemProgram.transfer({
                        fromPubkey: mainKp.publicKey,
                        toPubkey: wallet.publicKey,
                        lamports: solAmount * web3_js_1.LAMPORTS_PER_SOL,
                    }));
                }
                index = 0;
                _a.label = 2;
            case 2:
                if (!true) return [3 /*break*/, 9];
                _a.label = 3;
            case 3:
                _a.trys.push([3, 7, , 8]);
                if (index > 3) {
                    console.log("Error in distribution");
                    return [2 /*return*/, null];
                }
                return [4 /*yield*/, solanaConnection.getLatestBlockhash()];
            case 4:
                latestBlockhash = _a.sent();
                messageV0 = new web3_js_1.TransactionMessage({
                    payerKey: mainKp.publicKey,
                    recentBlockhash: latestBlockhash.blockhash,
                    instructions: sendSolTx,
                }).compileToV0Message();
                transaction = new web3_js_1.VersionedTransaction(messageV0);
                transaction.sign([mainKp]);
                return [4 /*yield*/, solanaConnection.sendRawTransaction(transaction.serialize(), { skipPreflight: true })];
            case 5:
                signature = _a.sent();
                return [4 /*yield*/, solanaConnection.confirmTransaction({
                        signature: signature,
                        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
                        blockhash: latestBlockhash.blockhash,
                    })];
            case 6:
                confirmation = _a.sent();
                if (confirmation.value.err) {
                    console.log("Confrimtaion error");
                    return [2 /*return*/, ""];
                }
                else {
                    console.log("Success in distributing SOL : https://solscan.io/tx/".concat(signature));
                }
                return [3 /*break*/, 9];
            case 7:
                error_1 = _a.sent();
                index++;
                return [3 /*break*/, 8];
            case 8: return [3 /*break*/, 2];
            case 9:
                wallets.map(function (wallet) {
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
                return [2 /*return*/, wallets];
            case 10:
                error_2 = _a.sent();
                console.log("Failed to transfer SOL");
                return [2 /*return*/, null];
            case 11: return [2 /*return*/];
        }
    });
}); };
exports.distributeSol = distributeSol;
// Function to buy token
var buy = function (newWallet, tokenAddress, buyAmount) { return __awaiter(void 0, void 0, void 0, function () {
    var solBalance, error_3, tokenBuyTx, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                solBalance = 0;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, utils_1.getSolanaBalance)(newWallet.publicKey.toString())];
            case 2:
                solBalance = _a.sent();
                return [3 /*break*/, 4];
            case 3:
                error_3 = _a.sent();
                console.log("Error getting balance of wallet");
                return [2 /*return*/, null];
            case 4:
                if (solBalance == 0) {
                    console.log("No SOL in ".concat(newWallet.publicKey.toString()));
                    return [2 /*return*/, null];
                }
                _a.label = 5;
            case 5:
                _a.trys.push([5, 7, , 8]);
                return [4 /*yield*/, (0, buyToken_1.buyToken)(newWallet, tokenAddress, buyAmount, true, false)];
            case 6:
                tokenBuyTx = (_a.sent());
                editJson({
                    tokenBuyTx: tokenBuyTx,
                    pubkey: newWallet.publicKey.toBase58(),
                    solBalance: solBalance / Math.pow(10, 9) - buyAmount,
                });
                return [2 /*return*/, tokenBuyTx];
            case 7:
                error_4 = _a.sent();
                return [2 /*return*/, null];
            case 8: return [2 /*return*/];
        }
    });
}); };
exports.buy = buy;
// Function to sell token
var sell = function (wallet, baseMint) { return __awaiter(void 0, void 0, void 0, function () {
    var data, tokenSellTx, solBalance, error_5, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 7, , 8]);
                data = readJson();
                if (!(data.length == 0)) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, utils_1.delay)(1000)];
            case 1:
                _a.sent();
                return [2 /*return*/, null];
            case 2:
                _a.trys.push([2, 5, , 6]);
                return [4 /*yield*/, (0, sellToken_1.sellToken)(wallet, true, baseMint.toString(), false, true)];
            case 3:
                tokenSellTx = _a.sent();
                return [4 /*yield*/, (0, utils_1.getSolanaBalance)(wallet.publicKey.toString())];
            case 4:
                solBalance = _a.sent();
                editJson({
                    pubkey: wallet.publicKey.toBase58(),
                    tokenSellTx: tokenSellTx,
                    solBalance: solBalance,
                });
                return [2 /*return*/, tokenSellTx];
            case 5:
                error_5 = _a.sent();
                return [2 /*return*/, null];
            case 6: return [3 /*break*/, 8];
            case 7:
                error_6 = _a.sent();
                return [2 /*return*/, null];
            case 8: return [2 /*return*/];
        }
    });
}); };
exports.sell = sell;
// Function to save data to file
var saveDataToFile = function (newData, filePath) {
    if (filePath === void 0) { filePath = "data.json"; }
    try {
        var existingData = [];
        // Check if the file exists
        if (fs_1.default.existsSync(filePath)) {
            // If the file exists, read its content
            var fileContent = fs_1.default.readFileSync(filePath, "utf-8");
            existingData = JSON.parse(fileContent);
        }
        // Add the new data to the existing array
        existingData.push.apply(existingData, newData);
        // Write the updated data back to the file
        fs_1.default.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
    }
    catch (error) {
        try {
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
                console.log("File ".concat(filePath, " deleted and create new file."));
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
function editJson(newData, filename) {
    if (filename === void 0) { filename = "data.json"; }
    if (!newData.pubkey) {
        console.log("Pubkey is not provided as an argument");
        return;
    }
    var wallets = readJson(filename);
    var index = wallets.findIndex(function (wallet) { return wallet.pubkey === newData.pubkey; });
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
        console.error("Pubkey ".concat(newData.pubkey, " does not exist."));
    }
}
// Function to read JSON file
function readJson(filename) {
    if (filename === void 0) { filename = "data.json"; }
    if (!fs_1.default.existsSync(filename)) {
        // If the file does not exist, create an empty array
        fs_1.default.writeFileSync(filename, "[]", "utf-8");
    }
    var data = fs_1.default.readFileSync(filename, "utf-8");
    return JSON.parse(data);
}
// Function to write JSON file
function writeJson(data, filename) {
    if (filename === void 0) { filename = "data.json"; }
    fs_1.default.writeFileSync(filename, JSON.stringify(data, null, 4), "utf-8");
}
