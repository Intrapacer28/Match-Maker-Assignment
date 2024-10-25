"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const SimulationResultSchema = new mongoose_1.default.Schema({
    strategy: {
        type: String,
        required: true,
    },
    tokenSymbol: {
        type: String,
        required: true,
    },
    buyPrice: {
        type: Number,
        required: true,
    },
    sellPrice: {
        type: Number,
        required: true,
    },
    profit: {
        type: Number,
        required: true,
    },
    rsiPeriod: {
        type: Number,
        required: true,
    },
    walletAddress: {
        type: String,
        required: false,
    },
    buyTokenVolume: {
        type: Number,
        required: true,
    },
    sellTokenVolume: {
        type: Number,
        required: true,
    },
    tradeTimestamps: {
        buyTime: {
            type: Date,
            required: true,
        },
        sellTime: {
            type: Date,
            required: true,
        },
    },
    balance: {
        type: Number,
        required: true,
    },
    totalDollarsSpent: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt timestamps
});
// Export the model
const SimulationResult_RSI = mongoose_1.default.model('SimulationResult_RSI', SimulationResultSchema);
exports.default = SimulationResult_RSI;
