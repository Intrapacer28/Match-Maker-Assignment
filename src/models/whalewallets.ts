// models/whalewallets.js

import mongoose from 'mongoose';

const whaleWalletSchema = new mongoose.Schema({
    walletAddress: {
        type: String,
        required: true,
        unique: true, // Each wallet address should be unique
        trim: true    // Remove any leading/trailing whitespace
    },
    label: {
        type: String,
        default: 'Whale', // Optional field to label the whale wallet (can be useful for different types of whale wallets)
        trim: true
    },
    addedAt: {
        type: Date,
        default: Date.now // Automatically set the date when the wallet is added
    }
});

// Create a model for whale wallets
const WhaleWallets = mongoose.model('WhaleWallets', whaleWalletSchema);

export default WhaleWallets;
