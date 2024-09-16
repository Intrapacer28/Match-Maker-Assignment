import { Connection, Keypair, Transaction, SystemProgram, ComputeBudgetProgram, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, createCloseAccountInstruction } from '@solana/spl-token'; // Correct imports
import dotenv from 'dotenv';

dotenv.config();

const RPC_URL = process.env.RPC_URL!;
const RPC_WEBSOCKET_ENDPOINT = process.env.RPC_WEBSOCKET_ENDPOINT!;

/**
 * Handle transferring SOL from wallets and closing associated SPL token accounts.
 * @param {Keypair} mainKp - The main Keypair to receive the SOL.
 * @param {Array} wallets - Array of wallets with their Keypair and buyAmount.
 */
export const handleAndTransferSol = async (
  mainKp: Keypair,
  wallets: { kp: Keypair; buyAmount: number }[],
) => {
  const solanaConnection = new Connection(RPC_URL, {
    wsEndpoint: RPC_WEBSOCKET_ENDPOINT,
  });

  let totalAmountToTransfer = 0;
  let transaction = new Transaction();

  for (const wallet of wallets) {
    // Fetch account info to get the current balance (SOL balance)
    const accountInfo = await solanaConnection.getAccountInfo(wallet.kp.publicKey);

    if (accountInfo) {
      const accountBalance = accountInfo.lamports;
      const refundAmount = accountBalance; // Refund the total SOL

      // Add SOL transfer instruction if there's a balance
      if (refundAmount > 0) {
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: wallet.kp.publicKey,
            toPubkey: mainKp.publicKey,
            lamports: refundAmount,
          })
        );
        totalAmountToTransfer += refundAmount;
      }

      // Fetch the associated token accounts
      const tokenAccounts = await solanaConnection.getTokenAccountsByOwner(wallet.kp.publicKey, {
        programId: TOKEN_PROGRAM_ID,
      });

      // Iterate through the associated token accounts to close them
      for (const tokenAccountInfo of tokenAccounts.value) {
        const tokenAccountPubkey = tokenAccountInfo.pubkey;

        // Add SPL token account close instruction
        transaction.add(
          createCloseAccountInstruction(
            tokenAccountPubkey, // SPL token account to close
            mainKp.publicKey, // Destination for the remaining balance
            wallet.kp.publicKey // Authority to close the token account
          )
        );
      }
    }
  }

  // Set compute budget limits for the transaction
  transaction.add(
    ComputeBudgetProgram.setComputeUnitLimit({ units: 100_000 }),
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 250_000 })
  );

  // Sign and send the transaction
  const signature = await solanaConnection.sendTransaction(transaction, [mainKp, ...wallets.map(w => w.kp)]);

  // Confirm the transaction
  await solanaConnection.confirmTransaction(signature, 'confirmed');

  console.log('Transaction confirmed:', signature);
};
