export const MIN_TOKEN_AMOUNT = 100 // write in USDC 
export const MIN_SOL_BALANCE = 0.5 // write in sol
export const MIN_SOL_BALANCE_EXCLUSIVE = 0.5 //minimum sol balance for exclusive holder
export const MIN_TOKEN_AMOUNT_EXCLUSIVE = 100 //minimum sol balance for exclusive holder //in USDC
export const AUTO_SELL = true // true for making auto sell feature
export const ENABLE_AUTO_SELL_PROFIT = true;  // true for making auto sell feature for limit profit
export const ENABLE_AUTO_SELL_LOSS = true;  // true for making auto sell feature for limit loss
export const AUTO_SELL_PROFIT_PERCENTAGE = 10; // set auto_sell profit limit
export const AUTO_SELL_LOSS_PERCENTAGE = 20;    // set auto_sell loss limit
export const PRICE_CHECK_INTERVAL = 5000; // interval to check price for auto_sell feature
export const OPEN_TRADE_EXPIRATION_TIME = 3600000 // 60 minutes in ms 
export const LAMPORTS_PER_SOL =100000;
export const BASE_AMOUNT_FOR_WHALES = 5;
export const PERCENT_THRESHOLD_FOR_WHALE_WALLET_QUALIFICATION = 0.05;
export const ARBITRAGE_THRESHOLD = 0.03;


export const MIN_SOL_DIFFERENCE_TO_UPDATE = 5; // in SOL 
    // used in monitorSOLBalance to check if there is SOL added in the wallet it should be minimum to this value and then we buy and create open trade
    // used in monitorTokenPurchase to check if there is SOL added in the wallet it should be minimum to this value and then we wait to get balance updated again


export const MIN_SOL_DIFFERENCE_TO_SELL = 1; // in SOL

export const MIN_TOKEN_DIFFERENCE_TO_SELL_USDC = 100; // in USDC how much he have bought so then we sell


// write symbol & token address in same a object
export const TOKEN_DETAILS = { 
    // 'TAofU': "FnQMnE5aC59t3obZK1qfDKHVYKtU2tCPHN63ovuypump",
    'CzLSujWBLFsSjncfkh59rUFqvafWcY5tzedWJSuypump' : "CzLSujWBLFsSjncfkh59rUFqvafWcY5tzedWJSuypump",
    // 'r/snoofi' : "7M9KJcPNC65ShLDmJmTNhVFcuY95Y1VMeYngKgt67D1t",
    // 'WLF' : "vaBHTJ4SF4g4LKVF63cywvbxToZqicGhNcW3Mggpump",
    // 'Whispy': "EEBA6E69rhvGgLSs633u5qVeNjo77fp2wY3yj8Aipump",
    // 'MATRIX' : "B8rewgn27navW3tBXuzErWPBHEb8gKZhrGkx7NuUpump",
    // 'ACT' : "GJAFwWjJ3vnTsrQVabjBVK2TYB1YtRCQXRDfDgUnpump",
    // 'HUMANITY' : "6ipq59qkwJVECtYBwe4qfz3NprvQ5FtQY7THvXWFpump",
    // 'LOGIC' : "J7Cf3uxG8nW76VfUiRrRkM1oy3Adm4obtpM7hd6opump",

}
 