// Import necessary modules from Solana web3 library
import { Connection, Keypair } from "@solana/web3.js";
// Import Wallet class from Anchor library for wallet management
import { Wallet } from "@project-serum/anchor";
// Import environment variables
import "dotenv/config";
// Import constant for the SOLANA address
import { SOLANA_ADDRESS } from "../config/consts";
// Import helper functions for swap transactions
import {
  convertToInteger,
  getQuote,
  getSwapTransaction,
  finalizeTransaction,
} from "./swapperHelper";
// Import logger for logging messages
import { logger } from "../utils/logger";

// Function to handle the process of buying a token
export const buyToken = async (
  primaryWallet: Keypair, // Keypair object representing the wallet to use for the transaction
  addressOfTokenIn: string, // Address of the token to be bought
  amountOfTokenOut: number, // Amount of SOL to be used for buying the token
  waitForConfirmation: boolean, // Flag indicating whether to wait for transaction confirmation
  wantAmountOfTokenIn: boolean // Flag indicating whether to return the amount of token bought or transaction ID
): Promise<number | string> => {
  try {
    // Extract environment variables
    const rpcUrl = process.env.RPC_URL;
    const wsEndpoint = process.env.RPC_WEBSOCKET_ENDPOINT;

    // Check if environment variables are defined
    if (!rpcUrl || !wsEndpoint) {
      throw new Error('RPC_URL or RPC_WEBSOCKET_ENDPOINT environment variable is not set.');
    }

    // Create a connection to the Solana blockchain
    const connection = new Connection(rpcUrl, {
      wsEndpoint: wsEndpoint,
    });

    // Create a Wallet instance using the provided Keypair
    const wallet = new Wallet(primaryWallet);

    // Log the initiation of the token purchase
    logger.info(`Trying to buy token using ${amountOfTokenOut} SOL...🚀`);

    // Define the number of decimal places for SOL (usually 9 for SOL)
    const decimals = 9; // Decimal places depend on the input token address (SOL in this case)
    // Define slippage percentage (in basis points, 100 bps = 1%)
    const slippage = 100; // slippage is 1%

  
    const convertedAmountOfTokenOut = convertToInteger(
      amountOfTokenOut,
      decimals
    );

   
    const quoteResponse = await getQuote(
      SOLANA_ADDRESS, // Address of SOL (the token being used to buy)
      addressOfTokenIn, // Address of the token to be bought
      convertedAmountOfTokenOut, // Amount of SOL to be used for buying
      slippage // Slippage percentage
    );

    // Extract the amount of the token to be bought from the quote response
    const amountOfTokenIn: number =
      quoteResponse.routePlan[quoteResponse.routePlan.length - 1].swapInfo
        .outAmount;

    // Get the public key of the wallet
    const walletPublicKey = wallet.publicKey.toString();
    // Get the swap transaction details using the quote response and wallet public key
    const swapTransaction = await getSwapTransaction(
      quoteResponse,
      walletPublicKey
    );

    // Finalize the transaction by sending it to the Solana blockchain
    const txid = await finalizeTransaction(swapTransaction, wallet, connection) as string;
  
    // If waiting for confirmation, log the status and confirm the transaction
    if (waitForConfirmation) {
      logger.info("Waiting for confirmation... 🕒");
      // Get the latest blockhash from the Solana blockchain
      const latestBlockhash = await connection.getLatestBlockhash();
      // Confirm the transaction using the latest blockhash and transaction ID
      const confirmation = await connection.confirmTransaction(
        {
          signature: txid, // Transaction ID
          blockhash: latestBlockhash.blockhash, // Latest blockhash
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight, // Last valid block height
        },
        'finalized' // Commitment level for confirmation
      );
  
      // Throw an error if the confirmation response contains an error
      if (confirmation.value.err) {
        throw new Error("Confirmation error");
      }
    }

    // Log the transaction signature URL for reference
    logger.info(`Signature = https://solscan.io/tx/${txid}`);

    // Return the amount of the token bought or the transaction ID based on the flag
    if (wantAmountOfTokenIn) {
      return amountOfTokenIn;
    } else {
      return txid;
    }
  } catch (error: any) {
    // Throw an error if any exception occurs during the process
    throw new Error(error.message);
  }
};

