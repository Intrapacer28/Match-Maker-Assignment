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
exports.getBalanceOfToken = exports.delay = void 0;
exports.getTokenAccounts = getTokenAccounts;
exports.getExclusiveTokenHolders = getExclusiveTokenHolders;
exports.checkExclusiveTokenHolders = checkExclusiveTokenHolders;
exports.getSolanaBalance = getSolanaBalance;
exports.getMultipleAccountsSolanaBalance = getMultipleAccountsSolanaBalance;
exports.readExclusiveTokenHolders = readExclusiveTokenHolders;
exports.readTokenHolders = readTokenHolders;
exports.readOpenTrades = readOpenTrades;
exports.getTokenDecimals = getTokenDecimals;
exports.getParsedProgramAccounts = getParsedProgramAccounts;
exports.checkExclusiveTokenHolder = checkExclusiveTokenHolder;
exports.calculateTokenAmountForUSDC = calculateTokenAmountForUSDC;
exports.getTokenPrice = getTokenPrice;
var fs_1 = require("fs");
var path_1 = require("path");
require("dotenv/config");
var web3_js_1 = require("@solana/web3.js");
var consts_1 = require("../config/consts");
var exclusiveholders_1 = require("../models/exclusiveholders");
var opentrades_1 = require("../models/opentrades");
var logger_1 = require("./logger");
var notexclusiveholders_1 = require("../models/notexclusiveholders");
var profitConfig_1 = require("../config/profitConfig");
// Initialize Helius API key
var apiKey = process.env.HELIUS_API_KEY;
// Function to get token accounts
function getTokenAccounts(tokenMintAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var allOwners, cursor, url, params, response, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    allOwners = new Set();
                    url = "https://mainnet.helius-rpc.com/?api-key=".concat(apiKey);
                    _a.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 4];
                    params = {
                        limit: 1000,
                        mint: tokenMintAddress,
                    };
                    if (cursor != undefined) {
                        params.cursor = cursor;
                    }
                    return [4 /*yield*/, fetch(url, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                jsonrpc: "2.0",
                                id: 1,
                                method: "getTokenAccounts",
                                params: params,
                            }),
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = (_a.sent());
                    if (!data.result || data.result.token_accounts.length === 0) {
                        return [3 /*break*/, 4];
                    }
                    data.result.token_accounts.forEach(function (account) {
                        allOwners.add(account.owner);
                    });
                    cursor = data.result.cursor;
                    return [3 /*break*/, 1];
                case 4:
                    fs_1.default.writeFileSync("./files/tokenHolders.json", JSON.stringify(Array.from(allOwners), null, 2));
                    return [2 /*return*/];
            }
        });
    });
}
// Function to get exclusive token holders
function getExclusiveTokenHolders(tokenMintAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var url, allOwnersData, exclusiveHolders_1, now, i, batchSize, slicedAllOwnersData, error_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = "https://mainnet.helius-rpc.com/?api-key=".concat(apiKey);
                    return [4 /*yield*/, getTokenAccounts(tokenMintAddress)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 7, , 8]);
                    allOwnersData = JSON.parse(fs_1.default.readFileSync("./files/tokenHolders.json", "utf8"));
                    exclusiveHolders_1 = [];
                    now = new Date().getTime();
                    i = 0;
                    batchSize = 50;
                    console.log("allOwnersData.length", allOwnersData.length);
                    _a.label = 3;
                case 3:
                    console.log("i", i);
                    slicedAllOwnersData = allOwnersData.slice(i, Math.min(allOwnersData.length, i + batchSize));
                    return [4 /*yield*/, Promise.all(slicedAllOwnersData.map(function (holder) { return __awaiter(_this, void 0, void 0, function () {
                            var ownerResponse, ownerData, ownerTokenAccounts;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, fetch(url, {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                                jsonrpc: "2.0",
                                                method: "getTokenAccountsByOwner",
                                                id: 1,
                                                params: [
                                                    holder,
                                                    {
                                                        programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                                                    },
                                                    {
                                                        encoding: "jsonParsed",
                                                    },
                                                ],
                                            }),
                                        })];
                                    case 1:
                                        ownerResponse = _a.sent();
                                        return [4 /*yield*/, ownerResponse.json()];
                                    case 2:
                                        ownerData = (_a.sent());
                                        if (ownerData.result) {
                                            ownerTokenAccounts = ownerData.result.value;
                                            if (ownerTokenAccounts.length === 1 &&
                                                ownerTokenAccounts[0].account.data.parsed.info.mint.toLowerCase() ===
                                                    tokenMintAddress.toLowerCase()) {
                                                exclusiveHolders_1.push(holder);
                                            }
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 4:
                    _a.sent();
                    i += batchSize;
                    _a.label = 5;
                case 5:
                    if (i < allOwnersData.length) return [3 /*break*/, 3];
                    _a.label = 6;
                case 6:
                    fs_1.default.writeFileSync("./files/exclusiveHolders.json", JSON.stringify(exclusiveHolders_1, null, 2));
                    console.log("Exclusive token holders saved to file.");
                    return [3 /*break*/, 8];
                case 7:
                    error_1 = _a.sent();
                    console.error("Error reading owner data from file:", error_1);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
// Function to check exclusive token holders
function checkExclusiveTokenHolders(tokenMintAddress, tokenAddresses) {
    return __awaiter(this, void 0, void 0, function () {
        var url, newExclusiveHolders_1, i, batchSize, slicedAllOwnersData, pathFile, data, jsonData_1, updatedData, exclusiveHolderData, error_2;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = "https://mainnet.helius-rpc.com/?api-key=".concat(apiKey);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    newExclusiveHolders_1 = [];
                    i = 0;
                    batchSize = 50;
                    _a.label = 2;
                case 2:
                    slicedAllOwnersData = tokenAddresses.slice(i, Math.min(tokenAddresses.length, i + batchSize));
                    return [4 /*yield*/, Promise.all(slicedAllOwnersData.map(function (holder) { return __awaiter(_this, void 0, void 0, function () {
                            var ownerResponse, ownerData, ownerTokenAccounts;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, fetch(url, {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                                jsonrpc: "2.0",
                                                method: "getTokenAccountsByOwner",
                                                id: 1,
                                                params: [
                                                    holder,
                                                    {
                                                        programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                                                    },
                                                    {
                                                        encoding: "jsonParsed",
                                                    },
                                                ],
                                            }),
                                        })];
                                    case 1:
                                        ownerResponse = _a.sent();
                                        return [4 /*yield*/, ownerResponse.json()];
                                    case 2:
                                        ownerData = (_a.sent());
                                        if (ownerData.result) {
                                            ownerTokenAccounts = ownerData.result.value;
                                            if (ownerTokenAccounts.length === 1 &&
                                                ownerTokenAccounts[0].account.data.parsed.info.mint.toLowerCase() ===
                                                    tokenMintAddress.toLowerCase()) {
                                                newExclusiveHolders_1.push(holder);
                                            }
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 3:
                    _a.sent();
                    i += batchSize;
                    _a.label = 4;
                case 4:
                    if (i < tokenAddresses.length) return [3 /*break*/, 2];
                    _a.label = 5;
                case 5:
                    pathFile = path_1.default.join(__dirname, "..", "./files/exclusiveHolders.json");
                    if (fs_1.default.existsSync(pathFile)) {
                        try {
                            data = fs_1.default.readFileSync(pathFile, 'utf8');
                            if (data.trim() === '') {
                                jsonData_1 = [];
                            }
                            else {
                                jsonData_1 = JSON.parse(data);
                            }
                            newExclusiveHolders_1.forEach(function (holder) {
                                jsonData_1.push(holder);
                            });
                            updatedData = JSON.stringify(jsonData_1, null, 2);
                            fs_1.default.writeFileSync(pathFile, updatedData, 'utf8');
                            console.log('Exclusive Token Holder file has been updated');
                        }
                        catch (err) {
                            console.error('Error reading or writing the Exclusive Token Holder File:', err);
                        }
                    }
                    else {
                        try {
                            exclusiveHolderData = JSON.stringify(newExclusiveHolders_1, null, 2);
                            fs_1.default.writeFileSync(pathFile, exclusiveHolderData, 'utf8');
                            console.log('Exclusive Token Holder file has been updated');
                        }
                        catch (err) {
                            console.error('Error writing the Exclusive Token Holder File:', err);
                        }
                    }
                    return [3 /*break*/, 7];
                case 6:
                    error_2 = _a.sent();
                    console.error("Error updating Exclusive Token Holder File:", error_2);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
// Function to get SOL balance
function getSolanaBalance(walletAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var url, attempts, response, data, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = "https://mainnet.helius-rpc.com/?api-key=".concat(apiKey);
                    attempts = 0;
                    _a.label = 1;
                case 1:
                    if (!(attempts < 5)) return [3 /*break*/, 11];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 9, , 10]);
                    return [4 /*yield*/, fetch(url, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                jsonrpc: "2.0",
                                method: "getBalance",
                                id: 1,
                                params: [walletAddress],
                            }),
                        })];
                case 3:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 4:
                    data = (_a.sent());
                    if (!data.result) return [3 /*break*/, 5];
                    return [2 /*return*/, (data.result.value / 1e9)];
                case 5:
                    if (!(data.error && data.error.code === -32429)) return [3 /*break*/, 7];
                    console.error("Exceeded limit for RPC, retrying in 1 second...");
                    return [4 /*yield*/, (0, exports.delay)(1000)];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 8];
                case 7:
                    console.error("Error fetching balance:", data.error);
                    return [3 /*break*/, 11];
                case 8: return [3 /*break*/, 10];
                case 9:
                    error_3 = _a.sent();
                    console.error("Error fetching balance:", error_3);
                    return [3 /*break*/, 11];
                case 10:
                    attempts++;
                    return [3 /*break*/, 1];
                case 11: return [2 /*return*/, 0];
            }
        });
    });
}
// Function to get multiple SOL balances
function getMultipleAccountsSolanaBalance(walletAddresses) {
    return __awaiter(this, void 0, void 0, function () {
        var url, solBalances, slicedWalletAddress, i, connection, err_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = "https://mainnet.helius-rpc.com/?api-key=".concat(apiKey);
                    solBalances = {};
                    slicedWalletAddress = [];
                    for (i = 0; i < walletAddresses.length; i += 100) {
                        slicedWalletAddress.push(walletAddresses.slice(i, Math.min(walletAddresses.length, i + 100)));
                    }
                    connection = new web3_js_1.Connection(url, 'confirmed');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, Promise.all(slicedWalletAddress.map(function (walletAddresses) { return __awaiter(_this, void 0, void 0, function () {
                            var walletPubkeys, accounts;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        walletPubkeys = walletAddresses.map(function (walletAddress) { return new web3_js_1.PublicKey(walletAddress); });
                                        return [4 /*yield*/, connection.getMultipleAccountsInfo(walletPubkeys)];
                                    case 1:
                                        accounts = _a.sent();
                                        accounts.forEach(function (account, index) {
                                            if (account !== null) {
                                                var lamports = account.lamports;
                                                var sol = lamports / 1e9;
                                                solBalances[walletAddresses[index]] = { sol: sol };
                                            }
                                            else {
                                                solBalances[walletAddresses[index]] = { sol: 0 };
                                            }
                                        });
                                        return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 2:
                    _a.sent();
                    (0, exports.delay)(1000);
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.log("ERROR FETHING SOLANA BALANCES", err_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, solBalances];
            }
        });
    });
}
// Function to read exclusive token holders
function readExclusiveTokenHolders() {
    return __awaiter(this, void 0, void 0, function () {
        var walletAddressArray, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, exclusiveholders_1.default.find({ openTrade: false }, 'walletAddress solBalance tokenAddress').lean()];
                case 1:
                    walletAddressArray = _a.sent();
                    return [2 /*return*/, walletAddressArray];
                case 2:
                    err_2 = _a.sent();
                    console.error("An error occurred while retrieving wallet addresses:", err_2);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function readTokenHolders() {
    var filePath = path_1.default.join(__dirname, "..", "./files/tokenHolders.json");
    if (fs_1.default.existsSync(filePath)) {
        var data = fs_1.default.readFileSync(filePath, "utf8");
        if (data.trim() === "") {
            return [];
        }
        return JSON.parse(data);
    }
    return [];
}
// Function to read open trades
function readOpenTrades() {
    return __awaiter(this, void 0, void 0, function () {
        var openTradesArray, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, opentrades_1.default.find({}).lean()];
                case 1:
                    openTradesArray = _a.sent();
                    return [2 /*return*/, openTradesArray];
                case 2:
                    err_3 = _a.sent();
                    console.error("An error occurred while retrieving open trades:", err_3);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Function to get token decimals
function getTokenDecimals(tokenAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var connection, mint, decimals;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    connection = new web3_js_1.Connection(process.env.RPC_URL);
                    return [4 /*yield*/, connection.getParsedAccountInfo(new web3_js_1.PublicKey(tokenAddress))];
                case 1:
                    mint = _a.sent();
                    if (!mint || !mint.value || mint.value.data instanceof Buffer) {
                        throw new Error("Could not find mint");
                    }
                    decimals = mint.value.data.parsed.info.decimals;
                    return [2 /*return*/, decimals];
            }
        });
    });
}
// Function to delay
var delay = function (ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
};
exports.delay = delay;
/**
 * Gets amount of tokens in wallet for given addressToken
 * @param {string} addressOfToken
 * @returns {Promise<number> || Promise<boolean>} amountOfToken
 */
var getBalanceOfToken = function (publicKeyOfWalletToQuery, addressOfToken) { return __awaiter(void 0, void 0, void 0, function () {
    var accounts, relevantAccount, tokenBalance, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                if (!publicKeyOfWalletToQuery) {
                    throw new Error("No wallet to query");
                }
                return [4 /*yield*/, getParsedProgramAccounts(publicKeyOfWalletToQuery)];
            case 1:
                accounts = _a.sent();
                relevantAccount = accounts.find(function (account) {
                    var parsedAccountInfo = account.account.data;
                    if (parsedAccountInfo instanceof Buffer) {
                        console.log("parsedAccountInfo is a buffer");
                        return false; // Skip this account
                    }
                    var mintAddress = parsedAccountInfo["parsed"]["info"]["mint"];
                    if (mintAddress === addressOfToken) {
                        return true; // This account is relevant
                    }
                    return false; // Skip this account
                });
                if (!relevantAccount) {
                    return [2 /*return*/, 0];
                }
                if (relevantAccount.account.data instanceof Buffer) {
                    throw new Error("relevantAccount is a buffer");
                }
                tokenBalance = relevantAccount.account.data["parsed"]["info"]["tokenAmount"]["uiAmount"];
                return [2 /*return*/, tokenBalance];
            case 2:
                error_4 = _a.sent();
                throw new Error(error_4);
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getBalanceOfToken = getBalanceOfToken;
// Function to get parsed program accounts
function getParsedProgramAccounts(wallet) {
    return __awaiter(this, void 0, void 0, function () {
        var connection, filters, TOKEN_PROGRAM_ID, accounts;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    connection = new web3_js_1.Connection(process.env.RPC_URL);
                    filters = [
                        {
                            dataSize: 165, // size of account (bytes)
                        },
                        {
                            memcmp: {
                                offset: 32, // location of our query in the account (bytes)
                                bytes: wallet, // our search criteria, a base58 encoded string
                            },
                        },
                    ];
                    TOKEN_PROGRAM_ID = new web3_js_1.PublicKey(consts_1.SOLANA_TOKENPROGRAM_ID);
                    return [4 /*yield*/, connection.getParsedProgramAccounts(TOKEN_PROGRAM_ID, { filters: filters })];
                case 1:
                    accounts = _a.sent();
                    return [2 /*return*/, accounts];
            }
        });
    });
}
// Function to check exclusive token holder
function checkExclusiveTokenHolder(tokenMintAddress, walletAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var existingNotExclusiveHolder, url, ownerResponse, ownerData, ownerTokenAccounts, solBalance, tokenBalance, minTokenBalance, error_5;
        var _a, _b, _c, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0: return [4 /*yield*/, notexclusiveholders_1.default.findOne({ walletAddress: walletAddress })];
                case 1:
                    existingNotExclusiveHolder = _g.sent();
                    if (existingNotExclusiveHolder) {
                        return [2 /*return*/, null];
                    }
                    url = "https://mainnet.helius-rpc.com/?api-key=".concat(apiKey);
                    _g.label = 2;
                case 2:
                    _g.trys.push([2, 12, , 13]);
                    return [4 /*yield*/, fetch(url, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                jsonrpc: "2.0",
                                method: "getTokenAccountsByOwner",
                                id: 1,
                                params: [
                                    walletAddress,
                                    {
                                        programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                                    },
                                    {
                                        encoding: "jsonParsed",
                                    },
                                ],
                            }),
                        })];
                case 3:
                    ownerResponse = _g.sent();
                    return [4 /*yield*/, ownerResponse.json()];
                case 4:
                    ownerData = (_g.sent());
                    if (!ownerData.result) return [3 /*break*/, 11];
                    ownerTokenAccounts = ownerData.result.value;
                    if (!(ownerTokenAccounts.length === 1 &&
                        ownerTokenAccounts[0].account.data.parsed.info.mint.toLowerCase() ===
                            tokenMintAddress.toLowerCase())) return [3 /*break*/, 9];
                    logger_1.logger.info("Exclusive Holder Found");
                    return [4 /*yield*/, getSolanaBalance(walletAddress)];
                case 5:
                    solBalance = _g.sent();
                    tokenBalance = (_f = (_e = (_d = (_c = (_b = (_a = ownerTokenAccounts[0]) === null || _a === void 0 ? void 0 : _a.account) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.parsed) === null || _d === void 0 ? void 0 : _d.info) === null || _e === void 0 ? void 0 : _e.tokenAmount) === null || _f === void 0 ? void 0 : _f.uiAmount;
                    return [4 /*yield*/, calculateTokenAmountForUSDC(tokenMintAddress, profitConfig_1.MIN_TOKEN_AMOUNT_EXCLUSIVE)];
                case 6:
                    minTokenBalance = _g.sent();
                    if (!(solBalance > profitConfig_1.MIN_SOL_BALANCE_EXCLUSIVE && tokenBalance > minTokenBalance)) return [3 /*break*/, 8];
                    return [4 /*yield*/, exclusiveholders_1.default.create({
                            walletAddress: walletAddress,
                            tokenAddress: tokenMintAddress,
                            solBalance: solBalance,
                            tokenBalance: tokenBalance,
                            openTrade: false,
                        }).then(function () {
                            logger_1.logger.info('Exclusive holder added successfully');
                        }).catch(function (err) {
                            logger_1.logger.error('Error adding Exclusive holder:', { message: err.message, stack: err.stack });
                        })];
                case 7:
                    _g.sent();
                    return [2 /*return*/, {
                            walletAddress: walletAddress,
                            tokenMintAddress: tokenMintAddress,
                            solBalance: solBalance,
                            tokenBalance: tokenBalance
                        }];
                case 8: return [3 /*break*/, 11];
                case 9: return [4 /*yield*/, notexclusiveholders_1.default.create({
                        walletAddress: walletAddress,
                        tokenAddress: tokenMintAddress,
                    }).catch(function (err) {
                        logger_1.logger.error('Error adding Not Exclusive holder:', { message: err.message, stack: err.stack });
                    })];
                case 10:
                    _g.sent();
                    _g.label = 11;
                case 11: return [3 /*break*/, 13];
                case 12:
                    error_5 = _g.sent();
                    logger_1.logger.error("Error checking for exclusive holder = ", { message: error_5, stack: error_5.stack });
                    return [3 /*break*/, 13];
                case 13: return [2 /*return*/, null];
            }
        });
    });
}
// Function to calculate token amount for USDC
function calculateTokenAmountForUSDC(tokenAddress, amountInUSDC) {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, tokenPrice, tokenAmount;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, fetch("https://price.jup.ag/v6/price?ids=".concat(tokenAddress))];
                case 1:
                    response = _b.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _b.sent();
                    tokenPrice = (_a = data === null || data === void 0 ? void 0 : data.data[tokenAddress]) === null || _a === void 0 ? void 0 : _a.price;
                    tokenAmount = Math.floor((1 / tokenPrice) * amountInUSDC);
                    return [2 /*return*/, tokenAmount];
            }
        });
    });
}
// Function to get token price
function getTokenPrice(tokenAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var response, data;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, fetch("https://price.jup.ag/v6/price?ids=".concat(tokenAddress))];
                case 1:
                    response = _b.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _b.sent();
                    return [2 /*return*/, ((_a = data === null || data === void 0 ? void 0 : data.data[tokenAddress]) === null || _a === void 0 ? void 0 : _a.price) || 0];
            }
        });
    });
}
