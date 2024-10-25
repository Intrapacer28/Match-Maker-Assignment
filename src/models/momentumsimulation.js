"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// Define the schema for the trade entry
const simulationResultSchema = new mongoose_1.default.Schema({
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
    walletAddress: {
        type: String,
        required: true,
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
});
// Create the model from the schema
const SimulationResult = mongoose_1.default.model('MomentumStrategy', simulationResultSchema);
exports.default = SimulationResult;
