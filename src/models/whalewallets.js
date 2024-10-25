"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const whaleWalletSchema = new mongoose_1.default.Schema({
    walletAddress: {
        type: String,
        required: true,
        unique: true, // Each wallet address should be unique
        trim: true // Remove any leading/trailing whitespace
    },
    label: {
        type: String,
        default: 'Whale', // Optional field to label the whale wallet (can be useful for different types of whale wallets)
        trim: true
    },
    addedAt: {
        type: Date,
        default: Date.now // Automatically set the date when the wallet is added
    },
    totalWhaleHeld: {
        type: Number,
        default: 0, // Total Whale tokens held by this wallet
    },
    transactionHistory: [{
            date: { type: Date, required: true }, // Date of transaction
            action: { type: String, enum: ['buy', 'sell', 'transfer'], required: true }, // Action type (buy, sell, transfer)
            amount: { type: Number, required: true }, // Amount of token involved
            tokenSymbol: { type: String, required: true }, // Token symbol (e.g., WHALE)
            tokenAddress: { type: String }, // Address of the token
            fromAccount: { type: String }, // Sender's address (for transfer transactions)
            toAccount: { type: String }, // Receiver's address (for transfer transactions)
            signature: { type: String }, // Transaction signature
            feePayer: { type: String } // Account paying the transaction fee
        }]
});
// Create a model for whale wallets
const WhaleWallets = mongoose_1.default.model('WhaleWallets', whaleWalletSchema);
exports.default = WhaleWallets;
