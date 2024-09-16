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
exports.finalizeTransaction = exports.convertToInteger = exports.getSwapTransaction = exports.getQuote = void 0;
// Import required modules from Solana web3 library
var web3_js_1 = require("@solana/web3.js");
// Import fetch for making HTTP requests
var cross_fetch_1 = require("cross-fetch");
// Import constant for swap execution flag
var swapperConfig_1 = require("../config/swapperConfig");
// Import logger for logging messages
var logger_1 = require("../utils/logger");
// Function to get a quote for a swap transaction
var getQuote = function (addressOfTokenOut, // Address of the token to be swapped out
addressOfTokenIn, // Address of the token to be swapped in
convertedAmountOfTokenOut, // Amount of the token to be swapped out in integer format
slippage // Slippage percentage (in basis points)
) { return __awaiter(void 0, void 0, void 0, function () {
    var url, resp, quoteResponse;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // Convert slippage to basis points
                slippage *= 100;
                url = "https://quote-api.jup.ag/v6/quote?inputMint=".concat(addressOfTokenOut, "&outputMint=").concat(addressOfTokenIn, "&amount=").concat(convertedAmountOfTokenOut, "&slippageBps=").concat(slippage);
                return [4 /*yield*/, (0, cross_fetch_1.default)(url)];
            case 1:
                resp = _a.sent();
                return [4 /*yield*/, resp.json()];
            case 2:
                quoteResponse = _a.sent();
                // Return the quote response
                return [2 /*return*/, quoteResponse];
        }
    });
}); };
exports.getQuote = getQuote;
// Function to get the swap transaction
var getSwapTransaction = function (quoteResponse, // Quote response object containing swap details
walletPublicKey) { return __awaiter(void 0, void 0, void 0, function () {
    var swapStartTime, body, resp, swapResponse, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                swapStartTime = new Date().getTime();
                body = void 0;
                // Construct the body of the POST request for the swap transaction
                body = {
                    quoteResponse: quoteResponse,
                    userPublicKey: walletPublicKey,
                    wrapAndUnwrapSol: true, // Flag to wrap and unwrap SOL during swap
                    restrictIntermediateTokens: false, // Flag to allow intermediate tokens in the swap
                    prioritizationFeeLamports: 250000, // Fee for prioritization in lamports
                };
                return [4 /*yield*/, (0, cross_fetch_1.default)("https://quote-api.jup.ag/v6/swap", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json", // Set content type to JSON
                        },
                        body: JSON.stringify(body), // Convert the body to a JSON string
                    })];
            case 1:
                resp = _a.sent();
                return [4 /*yield*/, resp.json()];
            case 2:
                swapResponse = _a.sent();
                // Return the swap transaction in string format
                return [2 /*return*/, swapResponse.swapTransaction];
            case 3:
                error_1 = _a.sent();
                // Throw an error if the request fails
                throw new Error(error_1);
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getSwapTransaction = getSwapTransaction;
// Function to convert an amount to an integer based on token decimals
var convertToInteger = function (amount, decimals) {
    // Convert the amount to an integer by multiplying with 10^decimals and flooring the result
    return Math.floor(amount * Math.pow(10, decimals));
};
exports.convertToInteger = convertToInteger;
// Function to finalize and send the transaction
var finalizeTransaction = function (swapTransaction, // Swap transaction in base64 string format
wallet, // Wallet used to sign the transaction
connection // Solana blockchain connection
) { return __awaiter(void 0, void 0, void 0, function () {
    var swapTransactionBuf, transaction, rawTransaction, txid, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                swapTransactionBuf = Buffer.from(swapTransaction, "base64");
                transaction = web3_js_1.VersionedTransaction.deserialize(swapTransactionBuf);
                if (!swapperConfig_1.EXECUTE_SWAP) return [3 /*break*/, 2];
                // If executing swap, sign the transaction with the wallet's payer keypair
                transaction.sign([wallet.payer]);
                rawTransaction = transaction.serialize();
                return [4 /*yield*/, connection.sendRawTransaction(rawTransaction, {
                        skipPreflight: false, // Ensure preflight checks are performed
                        // preflightCommitment: "confirmed", // Optional commitment level for preflight check
                    })];
            case 1:
                txid = _a.sent();
                // Return the transaction ID
                return [2 /*return*/, txid];
            case 2:
                // If not executing swap, simulate the transaction
                logger_1.logger.info("Simulating Transaction 🚀");
                return [4 /*yield*/, connection.simulateTransaction(transaction)];
            case 3:
                _a.sent();
                logger_1.logger.info("Simulated Transaction ✅");
                _a.label = 4;
            case 4: return [3 /*break*/, 6];
            case 5:
                error_2 = _a.sent();
                // Log an error if finalizing the transaction fails
                logger_1.logger.error("Error finalizing transaction", error_2);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.finalizeTransaction = finalizeTransaction;
