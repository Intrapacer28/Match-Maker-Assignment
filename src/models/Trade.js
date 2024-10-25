"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trade = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const tradeSchema = new mongoose_1.default.Schema({
    walletAddress: {
        type: String,
        required: true
    },
    tokenSymbol: {
        type: String,
        required: true
    },
    amountSpentForBuy: {
        type: Number,
        required: true
    },
    buyTokenVolume: {
        type: Number,
        required: true
    },
    amountSpentForSell: {
        type: Number,
        default: null
    },
    priceAtBuy: {
        type: Number,
        required: true
    },
    sellTokenVolume: {
        type: Number,
        default: null
    },
    priceAtSell: {
        type: Number,
        default: null
    },
    buySignature: {
        type: String,
        required: true
    },
    sellSignature: {
        type: String,
        default: null
    },
    openTradeTime: {
        type: Date,
        required: true
    },
    finishedTradeTime: {
        type: Date,
        default: null
    },
    classification: {
        type: String,
        default: null
    },
    tradeTime: {
        type: Date,
        default: null
    },
    profit: {
        type: Number,
        default: null
    },
    walletBalance: {
        type: Number,
        required: true // Track balance after each trade
    }
});
exports.Trade = mongoose_1.default.model('Trade', tradeSchema);
