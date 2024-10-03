import "dotenv/config";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionSignature,
  LAMPORTS_PER_SOL,
  TransactionMessage, 
  sendAndConfirmTransaction,
  Signer,
  VersionedTransaction,
} from "@solana/web3.js";
import {TOKEN_MINT} from "../config/volumeConfig"
import {
  closeAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import fs from 'fs';

// Initialize connection
const connection = new Connection(process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com", "confirmed");


// Function to close SPL token accounts and transfer remaining SOL to the main wallet
const closeAndTransfer = async (childWallets: Keypair[], mainWallet: Keypair) => {
 Promise.all(childWallets.map(async(childWallet) =>  {
  try {
    // Fetch SPL token accounts for the child wallet
    const tokenAccounts = await connection.getTokenAccountsByOwner(childWallet.publicKey, {
      programId: TOKEN_PROGRAM_ID,

    });

    const target_tokenAccount = tokenAccounts.value.find(({account})=>{
      const dataParsed = account.data as unknown as ({parsed:{info:{mint:string}}})
      return dataParsed.parsed.info.mint === TOKEN_MINT
    })
    
    if(target_tokenAccount)

    // Close each token account
    {
      const tokenAccountPublicKey = target_tokenAccount.pubkey;
      console.log(`Closing token account: ${tokenAccountPublicKey.toBase58()}`);

      // Create a transaction to close the account
      const closeAccountSignature: TransactionSignature = await closeAccount(
        connection,                  // Connection to use
        childWallet,                 // Payer of the transaction fees
        tokenAccountPublicKey,       // Account to close
        childWallet.publicKey,       // Destination to receive the remaining balance
        childWallet.publicKey,       // Authority allowed to close the account
        [],                          // No multi-signers in this example
        { commitment: "confirmed" }, // Confirm options
        TOKEN_PROGRAM_ID             // SPL Token program ID
      );

      console.log(`Token account closed: ${tokenAccountPublicKey.toBase58()} with signature: ${closeAccountSignature}`);
    }

    // Transfer remaining SOL to the main wallet
    const balance = await connection.getBalance(childWallet.publicKey); // Fetch the balance for the specified public key


    if (balance > 0) {
      console.log(`Transferring ${balance / LAMPORTS_PER_SOL} SOL from child wallet ${childWallet.publicKey.toBase58()} to main wallet ${mainWallet.publicKey.toBase58()}`);
     const {blockhash, lastValidBlockHeight} = await connection.getLatestBlockhash();
      const transferInstruction = 
        SystemProgram.transfer({
          fromPubkey: childWallet.publicKey,
          toPubkey: mainWallet.publicKey,
          lamports: balance,
        })
      const message = new TransactionMessage ({
        payerKey: childWallet.publicKey,
        recentBlockhash: blockhash,
        instructions: [transferInstruction]

      }).compileToV0Message();     

      const transferTransaction = new VersionedTransaction(message);
      transferTransaction.sign([childWallet]);      
      
      // Send transaction and confirm
      const transferSignature = await connection.sendTransaction(
            
        transferTransaction    
      ) 

      const confirmation = await connection.confirmTransaction(
        {
          signature: transferSignature,
          lastValidBlockHeight,
          blockhash
        },
        'confirmed'
      );
      


      console.log(`Transferred ${balance / LAMPORTS_PER_SOL} SOL to main wallet with signature: ${transferSignature}`); //logging comfirmation with signature
    }
  } catch (error) {
    console.error(`Error processing wallet ${childWallet.publicKey.toBase58()}:`, error);
  }
} ))
};

const main = async () => {
  // Load main wallet's secret key from environment variables
  const mainWalletSecretKey = process.env.WALLET_PRIVATE_KEY; //fetching mainwallet private key from the env variables
  if (!mainWalletSecretKey) {
    throw new Error("Main wallet private key not found in environment variables");
  }
  const mainWalletKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(mainWalletSecretKey))); //taking mainwallet keypair from secretkey

  // Load child wallets' keypairs
  const childWalletKeys = JSON.parse(fs.readFileSync('child_wallets.json', 'utf8'))
    .map((keypair: number[]) => Keypair.fromSecretKey(Uint8Array.from(keypair))); //reading childwallets from file given

  await closeAndTransfer(childWalletKeys, mainWalletKeypair); //calling the entire function
};

