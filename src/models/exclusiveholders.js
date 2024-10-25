"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const exclusiveHolderSchema = new mongoose_1.default.Schema({
    walletAddress: {
        type: String,
        unique: true,
        required: true
    },
    tokenAddress: {
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
    openTrade: {
        type: Boolean,
        required: true
    }
});
const ExclusiveHolders = mongoose_1.default.model('exclusiveholders', exclusiveHolderSchema);
exports.default = ExclusiveHolders;
