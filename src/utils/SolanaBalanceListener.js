"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolanaBalanceListener = void 0;
const web3_js_1 = require("@solana/web3.js");
const events_1 = require("events");
// Listener for SOL balance changes
class SolanaBalanceListener extends events_1.EventEmitter {
    rpcUrl;
    connection;
    subscriptions = {};
    constructor(rpcUrl) {
        super();
        this.rpcUrl = rpcUrl;
        this.connection = new web3_js_1.Connection(rpcUrl, 'confirmed');
    }
    addHolder(walletAddress) {
        this.subscribeToWallet(walletAddress);
    }
    removeHolder(walletAddress) {
        this.unsubscribeFromWallet(walletAddress);
    }
    subscribeToWallet(walletAddress) {
        if (this.subscriptions[walletAddress]) {
            return;
        }
        const publicKey = new web3_js_1.PublicKey(walletAddress);
        const subscriptionId = this.connection.onAccountChange(publicKey, (accountInfo) => {
            const newBalance = accountInfo.lamports / 1e9;
            this.emit('balanceChanged', walletAddress, newBalance);
        }, 'confirmed');
        this.subscriptions[walletAddress] = subscriptionId;
    }
    unsubscribeFromWallet(walletAddress) {
        if (this.subscriptions[walletAddress]) {
            this.connection.removeAccountChangeListener(this.subscriptions[walletAddress]);
            delete this.subscriptions[walletAddress];
        }
    }
    stop() {
        for (const walletAddress in this.subscriptions) {
            this.unsubscribeFromWallet(walletAddress);
        }
    }
}
exports.SolanaBalanceListener = SolanaBalanceListener;
