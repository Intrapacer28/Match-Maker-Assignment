import "dotenv/config";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, Connection, clusterApiUrl } from "@solana/web3.js";
import base58 from "bs58";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { buy, distributeSol, sell } from "../utils/volumeUtils";
import { delay, getSolanaBalance } from "../utils/utils";
import {
  ADDITIONAL_FEE,
  BUY_AMOUNT,
  BUY_INTERVAL_MAX,
  BUY_INTERVAL_MIN,
  BUY_LOWER_AMOUNT,
  BUY_UPPER_AMOUNT,
  DISTRIBUTION_NUM,
  IS_RANDOM,
  TOKEN_MINT,
  TOTAL_TRANSACTION,
} from "../config/volumeConfig";
import fs from 'fs';

// Initialize connection
const connection = new Connection(clusterApiUrl("mainnet-beta")); 

const CHILD_WALLETS_FILE = "./childWallets.json"; // File to store the child wallets

// Function to store child wallets
const storeChildWallets = (wallets: Keypair[]) => {
  const walletData = wallets.map(wallet => ({
    publicKey: wallet.publicKey.toBase58(),
    secretKey: base58.encode(wallet.secretKey),
  }));

  fs.writeFileSync(CHILD_WALLETS_FILE, JSON.stringify(walletData, null, 2));
  console.log(`Child wallets stored in ${CHILD_WALLETS_FILE}`);
};

// Function to load child wallets (if needed)
const loadChildWallets = (): Keypair[] => {
  if (!fs.existsSync(CHILD_WALLETS_FILE)) {
    throw new Error("Child wallets file does not exist. Run the script to create them first.");
  }

  const walletData = JSON.parse(fs.readFileSync(CHILD_WALLETS_FILE, 'utf-8'));
  return walletData.map((wallet: any) => Keypair.fromSecretKey(base58.decode(wallet.secretKey)));
};

// Function to create child wallets regardless of distribution
const createChildWallets = (numWallets: number): Keypair[] => {
  const wallets = [];
  for (let i = 0; i < numWallets; i++) {
    wallets.push(Keypair.generate());
  }
  storeChildWallets(wallets); // Store wallets immediately
  return wallets;
};

const main = async () => {
  // Load main wallet's secret key from environment variables
  const mainWalletSecretKey = process.env.WALLET_PRIVATE_KEY;
  if (!mainWalletSecretKey) {
    throw new Error("WALLET_PRIVATE_KEY environment variable is missing");
  }

  // Decode the Base58 private key
  const privateKeyBytes = base58.decode(mainWalletSecretKey);
  if (privateKeyBytes.length !== 64) {
    throw new Error("The private key should be 64 bytes long.");
  }
  const mainWalletKeypair = Keypair.fromSecretKey(privateKeyBytes);

  const solBalance = (await getSolanaBalance(mainWalletKeypair.publicKey.toString())) / LAMPORTS_PER_SOL;
  const baseMint = new PublicKey(TOKEN_MINT);

  console.log(`Volume bot is running`);
  console.log(`Wallet address: ${mainWalletKeypair.publicKey.toBase58()}`);
  console.log(`Pool token mint: ${baseMint.toBase58()}`);
  console.log(`Wallet SOL balance: ${solBalance.toFixed(3)} SOL`);
  console.log(`Distribute SOL to ${DISTRIBUTION_NUM} wallets`);

  if (TOTAL_TRANSACTION % 2 !== 0) {
    throw new Error("Total transactions must be even for balanced buy/sell.");
  }

  // Create and store child wallets regardless of distribution
  const childWallets = createChildWallets(DISTRIBUTION_NUM);

  let data: { kp: Keypair; buyAmount: number }[] | null = null;

  // Only proceed with SOL distribution if there's enough balance
  if (solBalance >= (BUY_LOWER_AMOUNT + ADDITIONAL_FEE) * DISTRIBUTION_NUM) {
    console.log("Sufficient balance, distributing SOL...");
    data = (await distributeSol(mainWalletKeypair, DISTRIBUTION_NUM)) as { kp: Keypair; buyAmount: number }[];
  } else {
    console.log("Sol balance is not enough for distribution. Child wallets created but not funded.");
    return; // Exit if distribution can't happen
  }

  if (data === null || data.length === 0) {
    console.log("Distribution failed or no wallets created.");
    return;
  }

  // Save the created child wallets to a file for later use (already done by createChildWallets)
  storeChildWallets(data.map(d => d.kp));

  // Create SPL token accounts for each child wallet
  for (const { kp } of data) {
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      mainWalletKeypair,
      baseMint,
      kp.publicKey
    );
    console.log(`SPL Token Account created for ${kp.publicKey.toBase58()}: ${tokenAccount.address.toBase58()}`);
  }

  // Proceed with the rest of the script (buy/sell logic)
  const buyPriority: { kp: Keypair }[] = [];
  const sellPriority: { kp: Keypair }[] = [];

  data.forEach(({ kp }) => {
    buyPriority.push({ kp });
  });

  if (buyPriority.length === 0 || TOTAL_TRANSACTION <= 0) {
    throw new Error("Invalid input: buyPriority cannot be empty and totalTransactions must be positive.");
  }

  let buyCount = 0;
  let sellCount = 0;
  const maxTransactions = TOTAL_TRANSACTION / 2;

  console.log("Transaction will start after 30 Seconds");
  await delay(30000);

  // Transaction loop logic (same as before)
  for (let i = 0; i < TOTAL_TRANSACTION; i++) {
    const BUY_INTERVAL = Math.round(Math.random() * (BUY_INTERVAL_MAX - BUY_INTERVAL_MIN) + BUY_INTERVAL_MIN);

    let buyAmount: number;
    if (IS_RANDOM) {
      buyAmount = Number(
        (
          Math.random() * (BUY_UPPER_AMOUNT - BUY_LOWER_AMOUNT) + BUY_LOWER_AMOUNT
        ).toFixed(6)
      );
    } else {
      buyAmount = BUY_AMOUNT;
    }

    const buyProbability =
      buyPriority.length === 0
        ? 0
        : buyPriority.length / (buyPriority.length + sellPriority.length);
    const buyDecision = Math.random() < buyProbability;

    if (buyDecision) {
      if (buyCount < maxTransactions) {
        const wallet = buyPriority.pop();
        if (!wallet) {
          console.log("No more wallets available for buying");
          break;
        }
        sellPriority.push(wallet);

        const solBalance =
          (await getSolanaBalance(wallet.kp.publicKey.toString())) / LAMPORTS_PER_SOL;
        if (solBalance < ADDITIONAL_FEE) {
          console.log("Balance is not enough: ", solBalance, "SOL");
          return;
        }

        let k = 0;
        while (true) {
          if (k > 10) {
            console.log("Error in buy transaction");
            return;
          }
          const result = await buy(wallet.kp, baseMint.toBase58(), buyAmount);
          if (result) {
            break;
          } else {
            k++;
            console.log("Buy failed, try again");
            await delay(2000);
          }
        }
        buyCount++;
      } else {
        console.warn("Buy limit reached, performing random sell (if possible).");

        const wallet = sellPriority.shift();
        if (!wallet) {
          console.log("No more wallets available for selling");
          break;
        }
        buyPriority.unshift(wallet);

        let j = 0;
        while (true) {
          if (j > 10) {
            console.log("Error in sell transaction");
            return;
          }
          const result = await sell(wallet.kp, baseMint);
          if (result) {
            break;
          } else {
            j++;
            console.log("Sell failed, try again");
            await delay(2000);
          }
        }
        sellCount++;
      }
    } else {
      if (sellCount < maxTransactions) {
        const wallet = sellPriority.shift();
        if (!wallet) {
          console.log("No more wallets available for selling");
          break;
        }
        buyPriority.unshift(wallet);

        let j = 0;
        while (true) {
          if (j > 10) {
            console.log("Error in sell transaction");
            return;
          }
          const result = await sell(wallet.kp, baseMint);
          if (result) {
            break;
          } else {
            j++;
            console.log("Sell failed, try again");
            await delay(2000);
          }
        }
        sellCount++;
      } else {
        console.warn("Sell limit reached, performing random buy (if possible).");

        const wallet = buyPriority.pop();
        if (!wallet) {
          console.log("No more wallets available for buying");
          break;
        }
        sellPriority.push(wallet);

        const solBalance =
          (await getSolanaBalance(wallet.kp.publicKey.toString())) / LAMPORTS_PER_SOL;
        if (solBalance < ADDITIONAL_FEE) {
          console.log("Balance is not enough: ", solBalance, "SOL");
          return;
        }

        let k = 0;
        while (true) {
          if (k > 10) {
            console.log("Error in buy transaction");
            return;
          }
          const result = await buy(wallet.kp, baseMint.toBase58(), buyAmount);
          if (result) {
            break;
          } else {
            k++;
            console.log("Buy failed, try again");
            await delay(2000);
          }
        }
        buyCount++;
      }
    }

    console.log(`${i + 1} transactions completed. Waiting for next ${BUY_INTERVAL} seconds...`);
    await delay(BUY_INTERVAL * 1000);
  }

  console.log(`${TOTAL_TRANSACTION} transactions completed.`);
};

main().catch(err => {
  console.error(err);
});