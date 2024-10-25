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
        default: "VWAP", // Strategy name, in this case VWAP
    },
    tokenSymbol: {
        type: String,
        required: true, // Token symbol for the trade
    },
    buyPrice: {
        type: Number,
        required: true, // The price at which the token was bought
    },
    sellPrice: {
        type: Number,
        required: true, // The price at which the token was sold
    },
    profit: {
        type: Number,
        required: true, // Profit from the trade
    },
    walletAddress: {
        type: String,
        required: true, // Wallet address used for the trade
    },
    buyTokenVolume: {
        type: Number,
        required: true, // Volume of tokens bought
    },
    sellTokenVolume: {
        type: Number,
        required: true, // Volume of tokens sold
    },
    tradeTimestamps: {
        buyTime: {
            type: Date,
            required: true, // Timestamp of when the token was bought
        },
        sellTime: {
            type: Date,
            required: true, // Timestamp of when the token was sold
        },
    },
    balance: {
        type: Number,
        required: true, // Balance after trade execution
    },
});
// Export the model
const SimulationResult = mongoose_1.default.model('VWAPsimulation', SimulationResultSchema);
exports.default = SimulationResult;
