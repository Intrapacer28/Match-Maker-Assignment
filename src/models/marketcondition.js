"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const marketSchema = new mongoose_1.default.Schema({
    tokenAddress: {
        type: String,
        required: true
    },
    marketPrice: {
        type: Number,
        required: true
    },
    volume24h: {
        type: Number,
        required: true
    },
    volatility: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});
const Market = mongoose_1.default.model('market', marketSchema);
exports.default = Market;
