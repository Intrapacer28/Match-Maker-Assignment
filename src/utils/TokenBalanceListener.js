"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenBalanceListener = void 0;
const web3_js_1 = require("@solana/web3.js");
const events_1 = require("events");
const spl_token_1 = require("@solana/spl-token");
// Listener for token balance changes & sol balance
class TokenBalanceListener extends events_1.EventEmitter {
    rpcUrl;
    connection;
    subscriptions = {};
    tokenDecimals = {};
    constructor(rpcUrl) {
        super();
        this.rpcUrl = rpcUrl;
        this.connection = new web3_js_1.Connection(rpcUrl, 'confirmed');
    }
    addHolder(walletAddress, tokenAddress, decimals) {
        this.tokenDecimals[tokenAddress] = decimals;
        this.subscribeToWallet(walletAddress, tokenAddress);
    }
    removeHolder(walletAddress) {
        this.unsubscribeFromWallet(walletAddress);
    }
    subscribeToWallet(walletAddress, tokenAddress) {
        if (this.subscriptions[walletAddress]) {
            return;
        }
        const filters = [
            {
                memcmp: {
                    offset: 32,
                    bytes: walletAddress,
                },
            },
            {
                dataSize: 165,
            },
        ];
        const tokenBalanceSubscriptionId = this.connection.onProgramAccountChange(spl_token_1.TOKEN_PROGRAM_ID, (accountInfo) => {
            const data = accountInfo.accountInfo.data;
            const mint = new web3_js_1.PublicKey(data.slice(0, 32));
            const decimals = this.tokenDecimals[tokenAddress];
            if (mint.toBase58() === tokenAddress) {
                const amountBuffer = data.slice(64, 72);
                const newTokenBalance = Number(amountBuffer.readBigUInt64LE(0)) / 10 ** decimals;
                this.emit('tokenBalanceChanged', walletAddress, newTokenBalance);
            }
        }, 'confirmed', filters);
        const publicKey = new web3_js_1.PublicKey(walletAddress);
        const solBalanceSubscriptionId = this.connection.onAccountChange(publicKey, (accountInfo) => {
            const newSolanaBalance = accountInfo.lamports / 1e9;
            this.emit('solBalanceChanged', walletAddress, newSolanaBalance);
        }, 'confirmed');
        this.subscriptions[walletAddress] = { solBalanceSubscriptionId, tokenBalanceSubscriptionId };
    }
    unsubscribeFromWallet(walletAddress) {
        if (this.subscriptions[walletAddress]) {
            this.connection.removeProgramAccountChangeListener(this.subscriptions[walletAddress].solBalanceSubscriptionId);
            this.connection.removeProgramAccountChangeListener(this.subscriptions[walletAddress].tokenBalanceSubscriptionId);
            delete this.subscriptions[walletAddress];
        }
    }
    stop() {
        for (const walletAddress in this.subscriptions) {
            this.unsubscribeFromWallet(walletAddress);
        }
    }
}
exports.TokenBalanceListener = TokenBalanceListener;
