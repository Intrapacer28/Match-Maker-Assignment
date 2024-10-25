"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const bs58_1 = __importDefault(require("bs58"));
const generateAndConvertKey = () => {
    // Generate a new Keypair
    const keypair = web3_js_1.Keypair.generate();
    const privateKeyBytes = keypair.secretKey;
    // Convert the private key bytes to Base58 format
    const base58Encoded = bs58_1.default.encode(privateKeyBytes);
    console.log("Base58 Encoded Key:", base58Encoded);
    console.log("Decoded Byte Array Length:", bs58_1.default.decode(base58Encoded).length);
};
generateAndConvertKey();
