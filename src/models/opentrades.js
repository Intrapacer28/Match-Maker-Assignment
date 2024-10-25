"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openTradeSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.openTradeSchema = new mongoose_1.default.Schema({
    walletAddress: {
        type: String,
        required: true
    },
    solBalance: {
        type: Number,
        required: true
    },
    tokenBalance: {
        type: Number,
        required: true
    },
    tokenAddress: {
        type: String,
        required: true
    },
    openTradeType: {
        type: String,
        enum: ['BUY', 'SELL'],
        required: true
    },
    tokenAmount: {
        type: Number,
        required: true
    },
    solAmount: {
        type: Number,
        required: true
    },
    tokenPrice: {
        type: Number,
        required: true
    },
    tokenDecimal: {
        type: Number,
        required: false
    },
    timeStamp: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});
const OpenTrades = mongoose_1.default.model('opentrades', exports.openTradeSchema);
exports.default = OpenTrades;
