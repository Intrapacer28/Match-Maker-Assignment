import path from "path";
import fs from 'fs';
import 'dotenv/config'
import { logger } from "./logger";
import { TOKEN_DETAILS } from "../config/profitConfig";

// Function to convert timestamp to readable format
export const convertTimestampToReadableFormat = (timestamp) => {
  const date = new Date(timestamp);

  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  };

  return date.toLocaleString('en-US', options as any);
};

// Function to parse transaction using Shyft API

//Added response status check and specific error messages for better handling.
//Used error.message || error for logging.
export const parseTransactionShyft = async (txSig) => {
  const url = `https://api.shyft.to/sol/v1/transaction/parsed?network=mainnet-beta&txn_signature=${txSig}`;
  const myHeaders = new Headers();
  myHeaders.append("x-api-key", process.env.SHYFT_API_KEY);

  const requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow',
  };

  try {
    const response = await fetch(url, requestOptions as any);

    // Check if the response is not OK (status code other than 200)
    if (!response.ok) {
      throw new Error(`Failed to fetch transaction data. Status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    logger.error('Error parsing transaction from Shyft: ', error.message || error);
    throw new Error('Error parsing transaction.');
  }
};


// Function to parse shyft transaction result
//Reduced code duplication by simplifying the buyOrSell condition.
//Early returns prevent unnecessary checks and improve readability.
//Added type checks for safer access to properties
export const parseTransactionResult = (transaction) => {
  // Early return if transaction type doesn't include 'SWAP' or missing data
  if (!transaction?.type?.includes('SWAP') || !transaction?.actions?.[0]) {
    return null;
  }

  const action = transaction.actions[0];
  const signature = transaction.signatures?.[0];
  const feePayer = transaction?.fee_payer;
  const allTokenAddresses = Object.values(TOKEN_DETAILS);

  let buyOrSell = '';
  let tokenValue = 0;
  let symbol = '';
  let tokenAddress = '';

  // Early return if tokens_swapped info is missing
  if (!action?.info?.tokens_swapped?.in || !action?.info?.tokens_swapped?.out) {
    return null;
  }

  const inToken = action.info.tokens_swapped.in;
  const outToken = action.info.tokens_swapped.out;

  // Determine the token address and buy/sell condition in a simplified way
  if (allTokenAddresses.includes(inToken.token_address) && !allTokenAddresses.includes(outToken.token_address)) {
    buyOrSell = 'SELL';
    tokenAddress = inToken.token_address;
    tokenValue = inToken.amount;
    symbol = inToken.symbol;
  } else if (!allTokenAddresses.includes(inToken.token_address) && allTokenAddresses.includes(outToken.token_address)) {
    buyOrSell = 'BUY';
    tokenAddress = outToken.token_address;
    tokenValue = outToken.amount;
    symbol = outToken.symbol;
  } else {
    return null; // Token address mismatch
  }

  // Return the parsed transaction details if buyOrSell is determined
  if (buyOrSell) {
    return { buyOrSell, tokenValue, signature, symbol, feePayer, tokenAddress };
  }

  return null;
};


// Function to parse helius swap transaction
export async function parseTransactionHeliusSwap(transaction) {

  const allTokenSymbols: string[] = Object.keys(TOKEN_DETAILS);
  const description = transaction?.description;
  const match = description.split(' ')
  if (match) {
    const amountSold = parseFloat(match[2]);
    const tokenSold = match[3];
    const amountBought = parseFloat(match[5]);
    const tokenBought = match[6];

    let tokenSymbol : string ;

    if(allTokenSymbols.includes(tokenSold) && !allTokenSymbols.includes(tokenBought)){
      tokenSymbol = tokenSold
    }else if(!allTokenSymbols.includes(tokenSold) && allTokenSymbols.includes(tokenBought)){
      tokenSymbol = tokenBought
    }else{
      return null
    }

    if (tokenSold == tokenBought) {
      return null
    }

    if (tokenSold != tokenSymbol && tokenBought != tokenSymbol) {
      return null
    }

    let tokenAddress = TOKEN_DETAILS[tokenSymbol]
    let buyOrSell;
    let tokenValue;
    let signature = transaction?.signature;
    let feePayer = transaction?.feePayer;

    if (tokenSymbol === tokenSold) {
      buyOrSell = 'SELL';
      tokenValue = amountSold;
    } else if (tokenSymbol === tokenBought) {
      buyOrSell = 'BUY';
      tokenValue = amountBought;
    } else {
      buyOrSell = 'unknown';
    }

    return {
      feePayer,
      tokenAddress,
      tokenSymbol,
      signature,
      tokenValue,
      buyOrSell,
    };
  }
  return null;
}
// Function to parse helius transfer transaction
export async function parseTransactionHeliusTransfer(transaction) {
  const description = transaction?.description;
  const parts = description.split(' ');
  if(parts){
    const fromAccount = parts[0];
    const tokenTransferred = parseFloat(parts[2]);
    const tokenSymbol = parts[3];
    let toAccount = parts[5];
  
    toAccount = toAccount.endsWith('.') ? toAccount.slice(0, -1) : toAccount;
  
    return {
      fromAccount,
      tokenTransferred,
      tokenSymbol,
      toAccount
    };
  }
  return null;
}

// Function to get random number in range
export function getRandomNumberInRange(min, max) {
  if (min > max) {
    throw new Error("Minimum value must be less than or equal to the maximum value.");
  }

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to log transaction
export const logTransaction = (transaction, name) => {
  const logFilePath = path.join(__dirname, `${name}.json`)
  let transactions = [];

  if (fs.existsSync(logFilePath)) {
    const data = fs.readFileSync(logFilePath, 'utf8');
    transactions = JSON.parse(data);
  }

  transactions.push(transaction);
  fs.writeFileSync(logFilePath, JSON.stringify(transactions, null, 2), 'utf8')
}

// Function to read transaction
export const readTransaction = (name) => {

  const logFilePath = path.join(__dirname, `${name}.json`);
  let transactions = [];
  let transaction;

  if (fs.existsSync(logFilePath)) {
    const data = fs.readFileSync(logFilePath, 'utf8');
    transactions = JSON.parse(data);
    transaction = transactions.shift();
    fs.writeFileSync(logFilePath, JSON.stringify(transactions, null, 2), 'utf8')

    return transaction;
  }

  return []
}
