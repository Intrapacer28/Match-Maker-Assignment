"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const bs58_1 = __importDefault(require("bs58"));
// Replace this with your Base58-encoded private key
const base58Key = "23RCKVPjLMqjsp4icn5S7gsd5Ux5ryYPtyTDhCnpYsHdpARGaDovPj8e9DxRNoiitfYbHMrjxEHZrpSMB6vrif9i";
try {
    // Decode the Base58 key
    const privateKeyBytes = bs58_1.default.decode(base58Key);
    // Ensure the private key is 64 bytes long
    if (privateKeyBytes.length !== 64) {
        throw new Error("The private key should be 64 bytes long.");
    }
    // Create the Keypair
    const keypair = web3_js_1.Keypair.fromSecretKey(privateKeyBytes);
    // Get the public key
    const publicKey = keypair.publicKey.toBase58();
    console.log("Private Key Length:", privateKeyBytes.length);
    console.log("Public Key:", publicKey);
}
catch (error) {
    console.error("Error:", error);
}
