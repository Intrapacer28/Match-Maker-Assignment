import { Keypair } from "@solana/web3.js";
import base58 from "bs58";

const generateAndConvertKey = () => {
  // Generate a new Keypair
  const keypair = Keypair.generate();
  const privateKeyBytes = keypair.secretKey;

  // Convert the private key bytes to Base58 format
  const base58Encoded = base58.encode(privateKeyBytes);

  console.log("Base58 Encoded Key:", base58Encoded);
  console.log("Decoded Byte Array Length:", base58.decode(base58Encoded).length);
};

generateAndConvertKey();
