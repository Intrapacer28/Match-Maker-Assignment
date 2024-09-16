"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openTradeSchema = void 0;
var mongoose_1 = require("mongoose");
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
    timeStamp: {
        type: Number,
        required: true
    },
    tokenPrice: {
        type: Number,
        required: true
    },
    tokenDecimal: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});
var OpenTrades = mongoose_1.default.model('opentrades', exports.openTradeSchema);
exports.default = OpenTrades;
