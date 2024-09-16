"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var exclusiveHolderSchema = new mongoose_1.default.Schema({
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
var ExclusiveHolders = mongoose_1.default.model('exclusiveholders', exclusiveHolderSchema);
exports.default = ExclusiveHolders;
