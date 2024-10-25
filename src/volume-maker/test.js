"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const bs58 = __importStar(require("bs58")); // Change to namespace import
// Define your file path
const filePath = "C:\\Users\\1234p\\Videos\\Blockchain-Project\\marketmaker-main\\marketmaker-main\\src\\volume-maker\\~\\my_testnet_wallet.json";
// Read the JSON file
const jsonData = fs.readFileSync(filePath, 'utf-8');
const keypairData = JSON.parse(jsonData);
// Extract the private key array
const privateKeyArray = Uint8Array.from(keypairData);
// Convert the private key array to Base58
const base58PrivateKey = bs58.encode(privateKeyArray);
// Log the Base58 private key
console.log('Base58 Private Key:', base58PrivateKey);
