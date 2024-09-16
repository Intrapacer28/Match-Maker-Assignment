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
exports.buyToken = void 0;
// Import necessary modules from Solana web3 library
var web3_js_1 = require("@solana/web3.js");
// Import Wallet class from Anchor library for wallet management
var anchor_1 = require("@project-serum/anchor");
// Import environment variables
require("dotenv/config");
// Import constant for the SOLANA address
var consts_1 = require("../config/consts");
// Import helper functions for swap transactions
var swapperHelper_1 = require("./swapperHelper");
// Import logger for logging messages
var logger_1 = require("../utils/logger");
// Function to handle the process of buying a token
var buyToken = function (primaryWallet, // Keypair object representing the wallet to use for the transaction
addressOfTokenIn, // Address of the token to be bought
amountOfTokenOut, // Amount of SOL to be used for buying the token
waitForConfirmation, // Flag indicating whether to wait for transaction confirmation
wantAmountOfTokenIn // Flag indicating whether to return the amount of token bought or transaction ID
) { return __awaiter(void 0, void 0, void 0, function () {
    var connection, wallet, decimals, slippage, convertedAmountOfTokenOut, quoteResponse, amountOfTokenIn, walletPublicKey, swapTransaction, txid, latestBlockhash, confirmation, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 7, , 8]);
                connection = new web3_js_1.Connection(process.env.RPC_URL, {
                    wsEndpoint: process.env.RPC_WEBSOCKET_ENDPOINT,
                });
                wallet = new anchor_1.Wallet(primaryWallet);
                // Log the initiation of the token purchase
                logger_1.logger.info("Trying to buy token using ".concat(amountOfTokenOut, " SOL...\uD83D\uDE80"));
                decimals = 9;
                slippage = 100;
                convertedAmountOfTokenOut = (0, swapperHelper_1.convertToInteger)(amountOfTokenOut, decimals);
                return [4 /*yield*/, (0, swapperHelper_1.getQuote)(consts_1.SOLANA_ADDRESS, // Address of SOL (the token being used to buy)
                    addressOfTokenIn, // Address of the token to be bought
                    convertedAmountOfTokenOut, // Amount of SOL to be used for buying
                    slippage // Slippage percentage
                    )];
            case 1:
                quoteResponse = _a.sent();
                amountOfTokenIn = quoteResponse.routePlan[quoteResponse.routePlan.length - 1].swapInfo
                    .outAmount;
                walletPublicKey = wallet.publicKey.toString();
                return [4 /*yield*/, (0, swapperHelper_1.getSwapTransaction)(quoteResponse, walletPublicKey)];
            case 2:
                swapTransaction = _a.sent();
                return [4 /*yield*/, (0, swapperHelper_1.finalizeTransaction)(swapTransaction, wallet, connection)];
            case 3:
                txid = _a.sent();
                if (!waitForConfirmation) return [3 /*break*/, 6];
                logger_1.logger.info("Waiting for confirmation... 🕒");
                return [4 /*yield*/, connection.getLatestBlockhash()];
            case 4:
                latestBlockhash = _a.sent();
                return [4 /*yield*/, connection.confirmTransaction({
                        signature: txid, // Transaction ID
                        blockhash: latestBlockhash.blockhash, // Latest blockhash
                        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight, // Last valid block height
                    }, 'finalized' // Commitment level for confirmation
                    )];
            case 5:
                confirmation = _a.sent();
                // Throw an error if the confirmation response contains an error
                if (confirmation.value.err) {
                    throw new Error("Confirmation error");
                }
                _a.label = 6;
            case 6:
                // Log the transaction signature URL for reference
                logger_1.logger.info("Signature = https://solscan.io/tx/".concat(txid));
                // Return the amount of the token bought or the transaction ID based on the flag
                if (wantAmountOfTokenIn) {
                    return [2 /*return*/, amountOfTokenIn];
                }
                else {
                    return [2 /*return*/, txid];
                }
                return [3 /*break*/, 8];
            case 7:
                error_1 = _a.sent();
                // Throw an error if any exception occurs during the process
                throw new Error(error_1.message);
            case 8: return [2 /*return*/];
        }
    });
}); };
exports.buyToken = buyToken;
