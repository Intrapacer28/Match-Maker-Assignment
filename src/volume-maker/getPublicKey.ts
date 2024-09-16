import { Keypair } from "@solana/web3.js";
import base58 from "bs58";

// Replace this with your Base58-encoded private key
const base58Key = "23RCKVPjLMqjsp4icn5S7gsd5Ux5ryYPtyTDhCnpYsHdpARGaDovPj8e9DxRNoiitfYbHMrjxEHZrpSMB6vrif9i";

try {
  // Decode the Base58 key
  const privateKeyBytes = base58.decode(base58Key);

  // Ensure the private key is 64 bytes long
  if (privateKeyBytes.length !== 64) {
    throw new Error("The private key should be 64 bytes long.");
  }

  // Create the Keypair
  const keypair = Keypair.fromSecretKey(privateKeyBytes);

  // Get the public key
  const publicKey = keypair.publicKey.toBase58();

  console.log("Private Key Length:", privateKeyBytes.length);
  console.log("Public Key:", publicKey);
} catch (error) {
  console.error("Error:", error);
}
