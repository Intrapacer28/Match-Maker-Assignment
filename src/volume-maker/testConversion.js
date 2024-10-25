"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bs58_1 = __importDefault(require("bs58"));
const testConversion = (base58Key) => {
    try {
        // Decode the Base58 key
        const privateKeyBytes = bs58_1.default.decode(base58Key);
        // Check the length
        console.log("Decoded Byte Array Length:", privateKeyBytes.length);
    }
    catch (error) {
        console.error("Error decoding Base58 key:", error);
    }
};
// Replace this with your Base58-encoded key
const base58Key = "23RCKVPjLMqjsp4icn5S7gsd5Ux5ryYPtyTDhCnpYsHdpARGaDovPj8e9DxRNoiitfYbHMrjxEHZrpSMB6vrif9i";
testConversion(base58Key);
