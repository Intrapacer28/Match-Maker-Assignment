"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// Define the trade timestamps schema
const tradeTimestampsSchema = new mongoose_1.default.Schema({
    buyTime: { type: Date, required: true },
    sellTime: { type: Date, required: true }
});
// Define the SimulationResult schema
const simulationResultSchema = new mongoose_1.default.Schema({
    strategy: { type: String, required: true }, // e.g., "Scalping"
    tokenSymbol: { type: String, required: true }, // e.g., "BTC"
    buyPrice: { type: Number, required: true }, // Buy price at which the trade was executed
    sellPrice: { type: Number, required: true }, // Sell price at which the trade was executed
    profit: { type: Number, required: true }, // Profit or loss from the trade
    walletAddress: { type: String, required: true }, // Wallet address for historical reference
    buyTokenVolume: { type: Number, required: true }, // Volume of tokens bought
    sellTokenVolume: { type: Number, required: true }, // Volume of tokens sold
    tradeTimestamps: { type: tradeTimestampsSchema, required: true }, // Timestamps for buy and sell
    balance: { type: Number, required: true } // Balance after the trade
});
// Create the SimulationResult model
const SimulationResult = mongoose_1.default.model('SimulationResult_Scalping', simulationResultSchema);
exports.default = SimulationResult;
