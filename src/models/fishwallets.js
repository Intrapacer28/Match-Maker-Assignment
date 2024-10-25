"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// fishWalletsSchema.ts
const mongoose_1 = __importDefault(require("mongoose"));
const fishWalletsSchema = new mongoose_1.default.Schema({
    walletAddress: { type: String, required: true, unique: true },
    totalFishHeld: { type: Number, default: 0 },
    transactions: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Transaction' }], // Reference to transactions
    // Additional fields relevant to fish holders
});
const FishWallet = mongoose_1.default.model('FishWallet', fishWalletsSchema);
exports.default = FishWallet;
