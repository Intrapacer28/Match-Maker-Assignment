"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const splitTokenHolderSchema = new mongoose_1.default.Schema({
    walletAddress: {
        type: String,
        unique: true,
        required: true
    },
    tokenSymbol: {
        type: String,
        required: false
    },
    tokenTransferred: {
        type: Number,
        required: true
    },
    signature: {
        type: String,
        required: true
    }
});
const SplitTokenHolders = mongoose_1.default.model('splittokenholders', splitTokenHolderSchema);
exports.default = SplitTokenHolders;
