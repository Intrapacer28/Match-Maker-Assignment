"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const fs_1 = __importDefault(require("fs"));
// Initialize connection
const connection = new web3_js_1.Connection(process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com", "confirmed");
// Function to close SPL token accounts and transfer remaining SOL to the main wallet
const closeAndTransfer = async (childWallets, mainWallet) => {
    for (const childWallet of childWallets) {
        try {
            // Fetch SPL token accounts for the child wallet
            const tokenAccounts = await connection.getTokenAccountsByOwner(childWallet.publicKey, {
                programId: spl_token_1.TOKEN_PROGRAM_ID,
            });
            // Close each token account
            for (const { pubkey: tokenAccountPublicKey } of tokenAccounts.value) {
                console.log(`Closing token account: ${tokenAccountPublicKey.toBase58()}`);
                // Create a transaction to close the account
                const closeAccountSignature = await (0, spl_token_1.closeAccount)(connection, // Connection to use
                childWallet, // Payer of the transaction fees
                tokenAccountPublicKey, // Account to close
                childWallet.publicKey, // Destination to receive the remaining balance
                childWallet.publicKey, // Authority allowed to close the account
                [], // No multi-signers in this example
                { commitment: "confirmed" }, // Confirm options
                spl_token_1.TOKEN_PROGRAM_ID // SPL Token program ID
                );
                console.log(`Token account closed: ${tokenAccountPublicKey.toBase58()} with signature: ${closeAccountSignature}`);
            }
            // Transfer remaining SOL to the main wallet
            const balance = await connection.getBalance(childWallet.publicKey); // Fetch the balance for the specified public key
            if (balance > 0) {
                console.log(`Transferring ${balance / web3_js_1.LAMPORTS_PER_SOL} SOL from child wallet ${childWallet.publicKey.toBase58()} to main wallet ${mainWallet.publicKey.toBase58()}`);
                const transferTransaction = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.transfer({
                    fromPubkey: childWallet.publicKey,
                    toPubkey: mainWallet.publicKey,
                    lamports: balance,
                }));
                // Send transaction and confirm
                const transferSignature = await (0, web3_js_1.sendAndConfirmTransaction)(connection, transferTransaction, [childWallet]);
                console.log(`Transferred ${balance / web3_js_1.LAMPORTS_PER_SOL} SOL to main wallet with signature: ${transferSignature}`); //logging comfirmation with signature
            }
        }
        catch (error) {
            console.error(`Error processing wallet ${childWallet.publicKey.toBase58()}:`, error);
        }
    }
};
const main = async () => {
    // Load main wallet's secret key from environment variables
    const mainWalletSecretKey = process.env.WALLET_PRIVATE_KEY; //fetching mainwallet private key from the env variables
    if (!mainWalletSecretKey) {
        throw new Error("Main wallet private key not found in environment variables");
    }
    const mainWalletKeypair = web3_js_1.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(mainWalletSecretKey))); //taking mainwallet keypair from secretkey
    // Load child wallets' keypairs
    const childWalletKeys = JSON.parse(fs_1.default.readFileSync('child_wallets.json', 'utf8'))
        .map((keypair) => web3_js_1.Keypair.fromSecretKey(Uint8Array.from(keypair))); //reading childwallets from file given
    await closeAndTransfer(childWalletKeys, mainWalletKeypair); //calling the entire function
};
