"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoricalPrice = void 0;
const mongoose = require('mongoose');
const HistoricalPriceSchema = new mongoose.Schema({
    tokenAddress: {
        type: String,
        required: true,
        index: true, // Indexing for faster queries
    },
    prices: [
        {
            price: {
                type: Number,
                required: true,
            },
            timestamp: {
                type: Date,
                required: true,
            },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});
// Middleware to update the updatedAt field before saving
HistoricalPriceSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});
// Create the model
exports.HistoricalPrice = mongoose.model('HistoricalPrice', HistoricalPriceSchema);
module.exports = exports.HistoricalPrice;
