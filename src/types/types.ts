export interface GetTokenAccountsParams {
    limit: number;
    mint: string;
    cursor?: string;
}

export interface IOpenTrade {
  walletAddress: string;   // Make sure this is defined
  solBalance: number;      // Make sure this is defined
  tokenBalance: number;    // Make sure this is defined
  tokenAddress: string;     // Make sure this is defined
  openTradeType: 'BUY' | 'SELL';  // This should be part of the interface
  tokenAmount: number;     // Make sure this is defined
  solAmount: number;       // Make sure this is defined
  timeStamp: number;       // Make sure this is defined
  tokenPrice: number;      // Make sure this is defined
  tokenDecimal: number;    // Make sure this is defined
  amountTraded?: number;   // Optional: adjust based on your schema
  entryTime?: Date;        // Optional: adjust based on your schema
  exitTime?: Date;         // Optional: adjust based on your schema
  classification: string;   // This should also be defined
}


export interface ExclusiveHolder {
  walletAddress: string;
  solBalance: number;
  tokenAddress : string;
}

export interface SolBalanceObject {
    [key: string]: {
        sol: number;
    };
}

export interface ExclusiveHolderDetails {
  [key: string]: {
      sol: number;
      tokenAddress : string;
  };
}

export type Route = {
    routePlan(arg0: string, routePlan: any): unknown;
    inAmount: string;
    outAmount: string;
    priceImpactPct: number;
    marketInfos: MarketInfo[];
    amount: string;
    slippageBps: number; // minimum: 0, maximum: 10000
    otherAmountThreshold: string; // The threshold for the swap based on the provided slippage: when swapMode is ExactIn the minimum out amount, when swapMode is ExactOut the maximum in amount
    swapMode: string;
    fees?: {
      signatureFee: number; // This indicates the total amount needed for signing transaction(s). Value in lamports.
      openOrdersDeposits: number[]; // This indicates the total amount needed for deposit of serum order account(s). Value in lamports.
      ataDeposits: number[]; // This indicates the total amount needed for deposit of associative token account(s). Value in lamports.
      totalFeeAndDeposits: number; // This indicates the total lamports needed for fees and deposits above.
      minimumSOLForTransaction: number; // This indicates the minimum lamports needed for transaction(s). Might be used to create wrapped SOL and will be returned when the wrapped SOL is closed. Also ensures rent exemption of the wallet.
    };
};
  
  type MarketInfo = {
    id: string;
    label: string;
    inputMint: string;
    outputMint: string;
    notEnoughLiquidity: boolean;
    inAmount: string;
    outAmount: string;
    minInAmount?: string; // Optional property, equivalent to `omitempty` in Go
    minOutAmount?: string; // Optional property, equivalent to `omitempty` in Go
    priceImpactPct: number;
    lpFee: Fee | null;
    platformFee: Fee | null;
  };
  
  type Fee = {
    amount: string;
    mint: string;
    pct: number;
  };
  
  export type SwapResponse = {
    swapTransaction: string; // base64 encoded transaction string
  };
  
  export type TokenInfo = {
    symbol: string;
    balance: number;
  };
  
  export type TokensObject = Record<string, TokenInfo>;
  
  export type buyConfig = {
    RPC_ENDPOINT: string;
    WALLET_PRIVATE_KEY: string;
    ADDRESS_OF_TOKEN_TO_BUY: string;
    AMOUNT_OF_SOLANA_TO_SPEND: number;
    SLIPPAGE: number;
  };
  
  export type sellConfig = {
    SELL_ALL: boolean;
    RPC_ENDPOINT: string;
    WALLET_PRIVATE_KEY: string;
    ADDRESS_OF_TOKEN_TO_SELL: string;
    AMOUNT_OF_TOKEN_TO_SELL?: number;
    SLIPPAGE: number;
  };


  // Define the type for the JSON file content
export interface Data {
  privateKey: string;
  pubkey: string;
  solBalance: number | null;
  tokenBuyTx: string[] | null,
  tokenSellTx: string[] | null,
}

export interface Blockhash {
  blockhash: string;
  lastValidBlockHeight: number;
}

export interface TokenData {
  id: string;
  developer_data?: {
    forks: number;
    stars: number;
    subscribers: number;
    total_issues: number;
    closed_issues: number;
    pull_requests_merged: number;
    pull_request_contributors: number;   

    commit_count_4_weeks: number;   

  };
  sentiment_votes_up_percentage?: number;
  sentiment_votes_down_percentage?: number;
  market_cap_fdv_ratio?: number;
  total_supply?: number;
  max_supply?: number;
  circulating_supply?: number;
}