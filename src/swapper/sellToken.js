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
exports.sellToken = void 0;
// Import required modules from Solana web3 library
var web3_js_1 = require("@solana/web3.js");
// Import Wallet class from Anchor library for wallet management
var anchor_1 = require("@project-serum/anchor");
// Import utility functions for token balance and decimals
var utils_1 = require("../utils/utils");
// Import environment configuration
require("dotenv/config");
// Import functions for swap operations and transaction finalization
var swapperHelper_1 = require("./swapperHelper");
// Import constant for Solana address
var consts_1 = require("../config/consts");
// Import logger for logging messages
var logger_1 = require("../utils/logger");
// Function to handle token selling
var sellToken = function (primaryWallet, // Primary wallet for transaction
sellAll, // Flag to indicate if all tokens should be sold
addressOfTokenOut, // Address of the token to be sold
waitForConfirmation, // Flag to wait for transaction confirmation
wantAmountOfSolIn, // Flag to return amount of SOL received
amountOfTokenToSell) { return __awaiter(void 0, void 0, void 0, function () {
    var connection, wallet, publicKeyOfWalletToQuery, _a, decimals, slippage, convertedAmountOfTokenOut, quoteResponse, amountOfSolIn, walletPublicKey, swapTransaction, txid, latestBlockhash, confirmation, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                // Throw an error if not selling all tokens and no amount specified
                if (!sellAll && !amountOfTokenToSell) {
                    throw new Error("You need to specify AMOUNT_OF_TOKEN_TO_SELL if SELL_ALL is false");
                }
                connection = new web3_js_1.Connection(process.env.RPC_URL);
                wallet = new anchor_1.Wallet(primaryWallet);
                publicKeyOfWalletToQuery = wallet.publicKey.toString();
                if (!
                // If selling all tokens, get the token balance to sell
                sellAll) 
                // If selling all tokens, get the token balance to sell
                return [3 /*break*/, 2];
                return [4 /*yield*/, (0, utils_1.getBalanceOfToken)(publicKeyOfWalletToQuery, addressOfTokenOut)];
            case 1:
                _a = (amountOfTokenToSell = _b.sent());
                return [3 /*break*/, 3];
            case 2:
                _a = amountOfTokenToSell;
                _b.label = 3;
            case 3:
                // If selling all tokens, get the token balance to sell
                _a;
                // Throw an error if there are no tokens to sell
                if (!amountOfTokenToSell) {
                    throw new Error("No tokens to sell");
                }
                // Log the amount of tokens being sold
                logger_1.logger.info("Selling ".concat(amountOfTokenToSell, " Tokens \uD83D\uDE80"));
                _b.label = 4;
            case 4:
                _b.trys.push([4, 12, , 13]);
                return [4 /*yield*/, (0, utils_1.getTokenDecimals)(addressOfTokenOut)];
            case 5:
                decimals = _b.sent();
                slippage = 100;
                convertedAmountOfTokenOut = (0, swapperHelper_1.convertToInteger)(amountOfTokenToSell, decimals);
                return [4 /*yield*/, (0, swapperHelper_1.getQuote)(addressOfTokenOut, consts_1.SOLANA_ADDRESS, convertedAmountOfTokenOut, slippage)];
            case 6:
                quoteResponse = _b.sent();
                amountOfSolIn = quoteResponse.routePlan[quoteResponse.routePlan.length - 1].swapInfo
                    .outAmount;
                walletPublicKey = wallet.publicKey.toString();
                return [4 /*yield*/, (0, swapperHelper_1.getSwapTransaction)(quoteResponse, walletPublicKey)];
            case 7:
                swapTransaction = _b.sent();
                return [4 /*yield*/, (0, swapperHelper_1.finalizeTransaction)(swapTransaction, wallet, connection)];
            case 8:
                txid = _b.sent();
                return [4 /*yield*/, connection.getLatestBlockhash()
                    // If waiting for confirmation, confirm the transaction
                ];
            case 9:
                latestBlockhash = _b.sent();
                if (!waitForConfirmation) return [3 /*break*/, 11];
                logger_1.logger.info("Waiting for confirmation... 🕒");
                return [4 /*yield*/, connection.confirmTransaction({
                        signature: txid,
                        blockhash: latestBlockhash.blockhash,
                        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
                    }, 'finalized' // Optional commitment level
                    )];
            case 10:
                confirmation = _b.sent();
                // Throw an error if confirmation fails
                if (confirmation.value.err) {
                    throw new Error("Confirmation error");
                }
                _b.label = 11;
            case 11:
                // Log the result of the transaction
                logger_1.logger.info("Sold ".concat(amountOfTokenToSell, " Token for ").concat(amountOfSolIn, " SOL \u2705"));
                logger_1.logger.info("Signature = https://solscan.io/tx/".concat(txid));
                // Return the amount of SOL received or the transaction ID based on the flag
                if (wantAmountOfSolIn) {
                    return [2 /*return*/, amountOfSolIn];
                }
                else {
                    return [2 /*return*/, txid];
                }
                return [3 /*break*/, 13];
            case 12:
                error_1 = _b.sent();
                // Throw an error if something goes wrong during the process
                throw new Error(error_1);
            case 13: return [2 /*return*/];
        }
    });
}); };
exports.sellToken = sellToken;
