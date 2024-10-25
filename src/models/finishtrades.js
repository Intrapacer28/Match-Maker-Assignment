"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const opentrades_1 = require("./opentrades");
const finishTradeSchema = new mongoose_1.default.Schema({
    walletAddress: {
        type: String,
        required: true
    },
    initialAmount: {
        type: Number,
        required: true
    },
    finalAmount: {
        type: Number,
        required: true
    },
    profitOrLoss: {
        type: String,
        enum: ['Profit', 'Loss'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    openTrade: {
        type: opentrades_1.openTradeSchema,
        required: true
    }
}, {
    timestamps: true
});
const FinishTrades = mongoose_1.default.model('finishtrades', finishTradeSchema);
exports.default = FinishTrades;
