"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// transactionSchema.ts
const mongoose_1 = __importDefault(require("mongoose"));
const transactionSchema = new mongoose_1.default.Schema({
    transactionId: { type: String, required: true, unique: true },
    holderAddress: { type: String, required: true },
    amount: { type: Number, required: true },
    tokenType: { type: String, required: true }, // e.g., 'fish', 'shrimp', 'dolphin', etc.
    timestamp: { type: Date, default: Date.now },
    // Add more features based on your use case
    feature1: { type: Number, required: true }, // Example feature
    feature2: { type: Number, required: true }, // Example feature
    // Add other features as necessary
});
const Transaction = mongoose_1.default.model('Transaction', transactionSchema);
exports.default = Transaction;
