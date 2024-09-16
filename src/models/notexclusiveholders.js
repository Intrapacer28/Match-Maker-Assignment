"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var notExclusiveHolderSchema = new mongoose_1.default.Schema({
    walletAddress: {
        type: String,
        unique: true,
        required: true
    },
    tokenAddress: {
        type: String,
        required: true
    },
});
var NotExclusiveHolders = mongoose_1.default.model('notexclusiveholders', notExclusiveHolderSchema);
exports.default = NotExclusiveHolders;
