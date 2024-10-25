import * as fs from 'fs';
import { Keypair } from '@solana/web3.js';
import * as bs58 from 'bs58';  // Change to namespace import

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
