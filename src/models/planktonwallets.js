"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// planktonWallets.ts
const mongoose_1 = __importStar(require("mongoose"));
const planktonWalletSchema = new mongoose_1.Schema({
    walletAddress: { type: String, required: false, unique: true }, // Unique wallet address
    tokenBalance: { type: Number, required: true, default: 0 }, // Current token balance
    lastTradeDate: { type: Date }, // Last trade date (optional, updated during transactions)
    transactionHistory: [{
            date: { type: Date, required: true }, // Date of transaction
            action: { type: String, enum: ['buy', 'sell', 'transfer'], required: true }, // Action: buy, sell, or transfer
            amount: { type: Number, required: true }, // Amount of token involved
            tokenSymbol: { type: String, required: true }, // Symbol of the token (e.g., SOL)
            tokenAddress: { type: String }, // Token's address (optional)
            fromAccount: { type: String }, // Sender's wallet address (for transfers)
            toAccount: { type: String }, // Receiver's wallet address (for transfers)
            signature: { type: String }, // Signature of the transaction
            feePayer: { type: String } // Wallet address paying the transaction fee
        }]
});
const PlanktonWallet = mongoose_1.default.model('PlanktonWallet', planktonWalletSchema);
exports.default = PlanktonWallet;
