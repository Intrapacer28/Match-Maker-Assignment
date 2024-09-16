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
var web3_js_1 = require("@solana/web3.js");
var bs58 = require("bs58"); // Correct import for bs58
require("dotenv/config");
var volumeUtils_1 = require("../utils/volumeUtils");
var utils_1 = require("../utils/utils");
var volumeConfig_1 = require("../config/volumeConfig");

var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var mainKp, solBalance, baseMint, data, buyPriority, sellPriority, buyCount, sellCount, maxTransactions, i, BUY_INTERVAL, buyAmount, buyProbability, buyDecision, wallet, solBalance_1, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                mainKp = web3_js_1.Keypair.fromSecretKey(bs58.decode(process.env.WALLET_PRIVATE_KEY)); // Fixed method call
                return [4 /*yield*/, (0, utils_1.getSolanaBalance)(mainKp.publicKey.toString())];
            case 1:
                solBalance = (_a.sent()) / web3_js_1.LAMPORTS_PER_SOL;
                baseMint = new web3_js_1.PublicKey(volumeConfig_1.TOKEN_MINT);
                console.log("Volume bot is running");
                console.log("Wallet address: ".concat(mainKp.publicKey.toBase58()));
                console.log("Pool token mint: ".concat(baseMint.toBase58()));
                console.log("Wallet SOL balance: ".concat(solBalance.toFixed(3), " SOL"));
                console.log("Distribute SOL to ".concat(volumeConfig_1.DISTRIBUTION_NUM, " wallets"));
                if (volumeConfig_1.TOTAL_TRANSACTION % 2 !== 0) {
                    throw new Error("Total transactions must be even for balanced buy/sell.");
                }
                data = null;
                if (solBalance < (volumeConfig_1.BUY_LOWER_AMOUNT + volumeConfig_1.ADDITIONAL_FEE) * volumeConfig_1.DISTRIBUTION_NUM) {
                    console.log("Sol balance is not enough for distribution");
                }
                return [4 /*yield*/, (0, volumeUtils_1.distributeSol)(mainKp, volumeConfig_1.DISTRIBUTION_NUM)];
            case 2:
                data = (_a.sent());
                if (data === null) {
                    console.log("Distribution failed");
                    return [2 /*return*/];
                }
                buyPriority = [];
                sellPriority = [];
                data.map(function (_a) {
                    var kp = _a.kp;
                    buyPriority.push({ kp: kp });
                });
                if (buyPriority.length === 0 || volumeConfig_1.TOTAL_TRANSACTION <= 0) {
                    throw new Error("Invalid input: buyPriority cannot be empty and totalTransactions must be positive.");
                }
                buyCount = 0;
                sellCount = 0;
                maxTransactions = volumeConfig_1.TOTAL_TRANSACTION / 2;
                console.log("Transaction will start after 30 Seconds");
                return [4 /*yield*/, (0, utils_1.delay)(30000)];
            case 3:
                _a.sent();
                i = 0;
                _a.label = 4;
            case 4:
                if (!(i < volumeConfig_1.TOTAL_TRANSACTION)) return [3 /*break*/, 31];
                BUY_INTERVAL = Math.round(Math.random() * (volumeConfig_1.BUY_INTERVAL_MAX - volumeConfig_1.BUY_INTERVAL_MIN) + volumeConfig_1.BUY_INTERVAL_MIN);
                buyAmount = Math.round(Math.random() * (volumeConfig_1.BUY_AMOUNT_MAX - volumeConfig_1.BUY_AMOUNT_MIN) + volumeConfig_1.BUY_AMOUNT_MIN);
                buyProbability = Math.random();
                buyDecision = buyProbability < volumeConfig_1.BUY_PROBABILITY;
                if (buyDecision) {
                    wallet = buyPriority[buyCount % buyPriority.length];
                    if (wallet === undefined) {
                        console.log("Buy wallet is undefined");
                        return [3 /*break*/, 30];
                    }
                    console.log("Buy amount: ".concat(buyAmount, " SOL"));
                    console.log("Buy wallet: ".concat(wallet.kp.publicKey.toBase58()));
                    solBalance_1 = solBalance - buyAmount;
                    if (solBalance_1 < 0) {
                        console.log("Not enough SOL balance for buying");
                        return [3 /*break*/, 30];
                    }
                    return [4 /*yield*/, (0, volumeUtils_1.buySol)(wallet.kp, buyAmount, baseMint)];
                }
                return [4 /*yield*/, (0, volumeUtils_1.sellSol)(wallet.kp, buyAmount, baseMint)];
            case 5:
                result = _a.sent();
                if (result === null) {
                    console.log("Buying/Selling failed");
                    return [3 /*break*/, 30];
                }
                if (buyDecision) {
                    buyCount++;
                    if (buyCount >= maxTransactions) {
                        return [3 /*break*/, 30];
                    }
                }
                else {
                    sellCount++;
                    if (sellCount >= maxTransactions) {
                        return [3 /*break*/, 30];
                    }
                }
                i++;
                return [4 /*yield*/, (0, utils_1.delay)(BUY_INTERVAL)];
            case 6:
                _a.sent();
                return [3 /*break*/, 4];
            case 31:
                console.log("End of transactions");
                return [2 /*return*/];
        }
    });
}); };

main().catch(function (error) {
    console.error("Error occurred:", error);
});
