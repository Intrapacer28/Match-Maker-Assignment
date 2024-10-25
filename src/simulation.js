"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mainWalletpublicKey = process.env.WALLET_PUBLIC_KEY;
// MOVING AVERAGE STRATEGY 
// import mongoose from 'mongoose';
// import SimulationResult from './models/simulationResult';
// import HistoricalData from './models/historicaldata'; // Assume this is your trade model
// import { logger } from './utils/logger';
// // MongoDB connection
// mongoose
//   .connect('mongodb://127.0.0.1:27017/market-maker-bot') // Replace with your actual MongoDB connection URL
//   .then(async () => {
//     logger.info("MongoDB connected successfully.");
//   })
//   .catch(err => logger.error("MongoDB connection error:", err));
// // Function to calculate Simple Moving Average (SMA)
// function calculateSMA(prices: number[], period: number): number[] {
//   const sma: number[] = [];
//   for (let i = period - 1; i < prices.length; i++) {
//     const sum = prices.slice(i - period + 1, i + 1).reduce((acc, price) => acc + price, 0);
//     sma.push(sum / period);
//   }
//   return sma;
// }
// // Enhanced profit calculation, considering slippage and fees
// function calculateProfit(buyPrice: number, sellPrice: number, volume: number, slippage: number = 0.001, fee: number = 0.0001): number {
//   const adjustedBuyPrice = buyPrice * (1 + slippage + fee);  // Adjust for slippage and transaction fees
//   const adjustedSellPrice = sellPrice * (1 - slippage - fee); // Adjust for slippage and transaction fees
//   // Profit = (Sell Price * Volume) - (Buy Price * Volume)
//   const profit = (adjustedSellPrice * volume) - (adjustedBuyPrice * volume);
//   return profit;
// }
// // Function to simulate the moving average strategy and store results in MongoDB
// // Function to simulate the moving average strategy and store results in MongoDB
// async function simulateMovingAverageStrategy(shortPeriod: number, longPeriod: number, initialBalance: number, stopLossPercent: number, minProfitPercent: number) {
//   // Fetch historical trades from the database
//   const trades = await HistoricalData.find().sort({ openTradeTime: 1 }); // Sort by time
//   const prices = trades.map(trade => trade.priceAtBuy); // Assuming you are using the buy price for simulation
//   // Calculate short-term and long-term SMAs
//   const shortSMA = calculateSMA(prices, shortPeriod);
//   const longSMA = calculateSMA(prices, longPeriod);
//   // Initialize the trading position, total profit, and balance
//   let position: 'none' | 'buy' = 'none';
//   let totalProfit = 0;
//   let balance = initialBalance;
//   let tradeCounter = 0;
//   let heldVolume = 0; // Track held tokens
//   let averageBuyPrice = 0; // Track the average buy price of held tokens
//   let totalDollarsSpent = 0; // Track total dollars spent for buying
//   // Loop through trades and execute the strategy
//   for (let i = Math.max(shortPeriod, longPeriod) - 1; i < prices.length; i++) {
//     const trade = trades[i];
//     // Buy condition: short-term SMA crosses above long-term SMA
//     if (shortSMA[i - shortPeriod + 1] > longSMA[i - longPeriod + 1] && position === 'none') {
//       const buyVolume = trade.buyTokenVolume || 0; // Use buy token volume or set to 0 if missing
//       const cost = prices[i] * buyVolume; // Calculate cost of buying
//       // Ensure there is enough balance for the purchase
//       if (balance >= cost && buyVolume > 0) {
//         console.log(`Buy condition met at price: ${prices[i]} for ${trade.tokenSymbol}`);
//         position = 'buy';
//         heldVolume += buyVolume; // Increase held tokens
//         averageBuyPrice = (averageBuyPrice * (heldVolume - buyVolume) + prices[i] * buyVolume) / heldVolume; // Update average buy price
//         totalDollarsSpent += prices[i] * buyVolume; // Track total dollars spent
//         balance -= cost; // Deduct the cost from balance
//         tradeCounter++;
//       } else {
//         console.log(`Skipping trade ${i}: Not enough balance to buy ${trade.tokenSymbol}`);
//       }
//     } else if (shortSMA[i - shortPeriod + 1] < longSMA[i - longPeriod + 1] && position === 'buy') {
//       const buyPrice = averageBuyPrice; // Use the average buy price for held tokens
//       const sellPrice = prices[i];
//       const maxLoss = buyPrice * (stopLossPercent / 100);
//       // Stop-loss check
//       if (sellPrice < buyPrice - maxLoss) {
//         console.log(`Stop-loss triggered for trade ${i}: Sell at ${sellPrice}, Loss exceeds ${stopLossPercent}%`);
//         position = 'none';
//       } else {
//         // Target sell price to ensure minimum profit
//         const targetSellPrice = buyPrice * (1 + minProfitPercent / 100);
//         // Sell only if price is above the target sell price for profit or stop-loss
//         if (sellPrice >= targetSellPrice) {
//           console.log(`Profit target met. Selling at ${sellPrice} with profit.`);
//         } else {
//           console.log(`Holding position. Price ${sellPrice} is below target sell price.`);
//         }
//         // Calculate profit with slippage and fees
//         const profit = calculateProfit(buyPrice, sellPrice, heldVolume);
//         totalProfit += profit;
//         balance += sellPrice * heldVolume; // Add sale earnings back to balance
//         // Store the result in the MongoDB database
//         const result = new SimulationResult({
//           strategy: "Moving Average",
//           tokenSymbol: trade.tokenSymbol,
//           buyPrice: buyPrice,
//           sellPrice: sellPrice,
//           profit: profit, // This will be negative for losing trades
//           shortPeriod: shortPeriod,
//           longPeriod: longPeriod,
//           walletAddress: trade.walletAddress, // Wallet address for historical reference
//           buyTokenVolume: heldVolume,
//           sellTokenVolume: heldVolume,
//           tradeTimestamps: {
//             buyTime: new Date(trade.openTradeTime),
//             sellTime: new Date(trade.finishedTradeTime),
//           },
//           balance: balance,
//           totalDollarsSpent: totalDollarsSpent
//         });
//         // Save the simulation result to MongoDB
//         try {
//           await result.save();
//         } catch (error) {
//           console.error(`Error saving simulation result: ${error.message}`);
//         }
//         // Reset held tokens after selling
//         heldVolume = 0;
//         averageBuyPrice = 0; // Reset average buy price
//         position = 'none'; // Reset position
//       }
//     }
//   }
//   console.log(`Total executed trades: ${tradeCounter}`);
//   console.log(`Total trades checked: ${prices.length}`);
//   console.log(`Total Profit from Simulation: ${totalProfit}`);
//   console.log(`Final Balance: ${balance}`);
// }
// // Connect to MongoDB and run the simulation
// (async function () {
//   try {
//     const initialBalance = 500; // Set starting balance
//     const stopLossPercent = 5;  // Set stop-loss at 5%
//     const minProfitPercent = 1;  // Set minimum profit margin to 1%
//     await simulateMovingAverageStrategy(10, 15, initialBalance, stopLossPercent, minProfitPercent); // Adjust short and long periods as needed
//   } catch (error) {
//     logger.error("Error running simulation:", error);
//   }
// })();
//RSI Strategy -- Relative Strength Index 
// import mongoose from 'mongoose';
// import SimulationResult_RSI from './models/RSIsimulation';
// import HistoricalData from './models/historicaldata'; // Assume this is your trade model
// import { logger } from './utils/logger';
// // MongoDB connection
// mongoose
//   .connect('mongodb://127.0.0.1:27017/market-maker-bot') // Replace with your actual MongoDB connection URL
//   .then(async () => {
//     logger.info("MongoDB connected successfully.");
//   })
//   .catch(err => logger.error("MongoDB connection error:", err));
// // Function to calculate RSI
// function calculateRSI(prices: number[], period: number): number[] {
//   const rsi: number[] = [];
//   let gains = 0, losses = 0;
//   // Initial average gains and losses
//   for (let i = 1; i <= period; i++) {
//     const diff = prices[i] - prices[i - 1];
//     if (diff >= 0) {
//       gains += diff;
//     } else {
//       losses -= diff;
//     }
//   }
//   gains /= period;
//   losses /= period;
//   // RSI for the initial period
//   rsi.push(100 - 100 / (1 + gains / losses));
//   // Subsequent RSI values
//   for (let i = period; i < prices.length; i++) {
//     const diff = prices[i] - prices[i - 1];
//     gains = (gains * (period - 1) + Math.max(diff, 0)) / period;
//     losses = (losses * (period - 1) + Math.max(-diff, 0)) / period;
//     rsi.push(100 - 100 / (1 + gains / losses));
//   }
//   return rsi;
// }
// // Enhanced profit calculation, considering slippage and fees
// function calculateProfit(buyPrice: number, sellPrice: number, volume: number, slippage: number = 0.001, fee: number = 0.0001): number {
//   const adjustedBuyPrice = buyPrice * (1 + slippage + fee);  // Adjust for slippage and transaction fees
//   const adjustedSellPrice = sellPrice * (1 - slippage - fee); // Adjust for slippage and transaction fees
//   const profit = (adjustedSellPrice * volume) - (adjustedBuyPrice * volume);
//   return profit;
// }
// // Function to simulate the RSI strategy and store results in MongoDB
// // Function to simulate the RSI strategy and store results in MongoDB
// async function simulateRSIStrategy(rsiPeriod: number, overboughtThreshold: number, oversoldThreshold: number, initialBalance: number, stopLossPercent: number, minProfitPercent: number) {
//   const trades = await HistoricalData.find().sort({ openTradeTime: 1 });
//   const prices = trades.map(trade => trade.priceAtBuy);
//   const rsi = calculateRSI(prices, rsiPeriod);
//   let position: 'none' | 'buy' = 'none';
//   let totalProfit = 0;
//   let balance = initialBalance;
//   let tradeCounter = 0;
//   let heldVolume = 0;
//   let averageBuyPrice = 0;
//   let totalDollarsSpent = 0;
//   for (let i = rsiPeriod; i < prices.length; i++) {
//     const trade = trades[i];
//     // Buy condition: RSI is below the oversold threshold
//     if (rsi[i - rsiPeriod] < oversoldThreshold && position === 'none') {
//       const buyVolume = trade.buyTokenVolume || 0;
//       const cost = prices[i] * buyVolume;
//       if (balance >= cost && buyVolume > 0) {
//         position = 'buy';
//         heldVolume += buyVolume;
//         averageBuyPrice = (averageBuyPrice * (heldVolume - buyVolume) + prices[i] * buyVolume) / heldVolume;
//         totalDollarsSpent += prices[i] * buyVolume;
//         balance -= cost;
//         tradeCounter++;
//       }
//     // Sell condition: RSI is above the overbought threshold
//     } else if (rsi[i - rsiPeriod] > overboughtThreshold && position === 'buy') {
//       const buyPrice = averageBuyPrice;
//       const sellPrice = prices[i];
//       const maxLoss = buyPrice * (stopLossPercent / 100);
//       const profit = calculateProfit(buyPrice, sellPrice, heldVolume);
//       // Check for stop-loss condition
//       if (sellPrice < buyPrice - maxLoss) {
//         console.log(`Stop-loss triggered at ${sellPrice}`);
//       }
//       // Store the result regardless of profit or loss
//       const result = new SimulationResult_RSI({
//         strategy: "RSI",
//         tokenSymbol: trade.tokenSymbol,
//         buyPrice: buyPrice,
//         sellPrice: sellPrice,
//         profit: profit,
//         rsiPeriod: rsiPeriod,
//         walletAddress: mainWalletpublicKey,
//         buyTokenVolume: heldVolume,
//         sellTokenVolume: heldVolume,
//         tradeTimestamps: {
//           buyTime: new Date(trade.openTradeTime),
//           sellTime: new Date(trade.finishedTradeTime),
//         },
//         balance: balance,
//         totalDollarsSpent: totalDollarsSpent
//       });
//       try {
//         await result.save();
//         totalProfit += profit; // Update total profit regardless of trade outcome
//         balance += sellPrice * heldVolume; // Update balance with the sell price
//       } catch (error) {
//         console.error(`Error saving simulation result: ${error.message}`);
//       }
//       // Reset for the next trade
//       heldVolume = 0;
//       averageBuyPrice = 0;
//       position = 'none';
//     }
//   }
//   console.log(`Total executed trades: ${tradeCounter}`);
//   console.log(`Total Profit: ${totalProfit}`);
//   console.log(`Final Balance: ${balance}`);
// }
// // Connect to MongoDB and run the RSI strategy simulation
// (async function () {
//   try {
//     const initialBalance = 500;
//     const stopLossPercent = 5;
//     const minProfitPercent = 1;
//     const overboughtThreshold = 70;  // RSI above 70 considered overbought
//     const oversoldThreshold = 30;    // RSI below 30 considered oversold
//     await simulateRSIStrategy(14, overboughtThreshold, oversoldThreshold, initialBalance, stopLossPercent, minProfitPercent);
//   } catch (error) {
//     logger.error("Error running simulation:", error);
//   }
// })();
// //SCALPING STRATEGY
// import mongoose from 'mongoose';
// import SimulationResult from './models/scalpingsimulation';
// import HistoricalData from './models/historicaldata'; // Assume this is your trade model
// import { logger } from './utils/logger';
// // MongoDB connection
// mongoose
//   .connect('mongodb://127.0.0.1:27017/market-maker-bot') // Replace with your actual MongoDB connection URL
//   .then(async () => {
//     logger.info("MongoDB connected successfully.");
//   })
//   .catch(err => logger.error("MongoDB connection error:", err));
// // Enhanced profit calculation, considering slippage and fees
// function calculateProfit(buyPrice: number, sellPrice: number, volume: number, slippage: number = 0.001, fee: number = 0.0001): number {
//   const adjustedBuyPrice = buyPrice * (1 + slippage + fee);  // Adjust for slippage and transaction fees
//   const adjustedSellPrice = sellPrice * (1 - slippage - fee); // Adjust for slippage and transaction fees
//   // Profit = (Sell Price * Volume) - (Buy Price * Volume)
//   const profit = (adjustedSellPrice * volume) - (adjustedBuyPrice * volume);
//   return profit;
// }
// // Function to simulate the scalping strategy and store results in MongoDB
// async function simulateScalpingStrategy(initialBalance: number, stopLossPercent: number, minProfitPercent: number) {
//   // Fetch historical trades from the database
//   const trades = await HistoricalData.find().sort({ openTradeTime: 1 }); // Sort by time
//   const prices = trades.map(trade => trade.priceAtBuy); // Assuming you are using the buy price for simulation
//   // Initialize the trading position, total profit, and balance
//   let position: 'none' | 'buy' = 'none';
//   let totalProfit = 0;
//   let balance = initialBalance;
//   let tradeCounter = 0;
//   let heldVolume = 0; // Track held tokens
//   let averageBuyPrice = 0; // Track the average buy price of held tokens
//   // Loop through trades and execute the strategy
//   for (let i = 1; i < prices.length; i++) {
//     const trade = trades[i];
//     // Scalping buy condition: Buy if the price is lower than the previous price
//     if (prices[i] < prices[i - 1] && position === 'none') {
//       const buyVolume = trade.buyTokenVolume || 0; // Use buy token volume or set to 0 if missing
//       const cost = prices[i] * buyVolume; // Calculate cost of buying
//       // Ensure there is enough balance for the purchase
//       if (balance >= cost && buyVolume > 0) {
//         console.log(`Buy condition met at price: ${prices[i]} for ${trade.tokenSymbol}`);
//         position = 'buy';
//         heldVolume += buyVolume; // Increase held tokens
//         averageBuyPrice = prices[i]; // Update average buy price
//         balance -= cost; // Deduct the cost from balance
//         tradeCounter++;
//       } else {
//         console.log(`Skipping trade ${i}: Not enough balance to buy ${trade.tokenSymbol}`);
//       }
//     } else if (position === 'buy') {
//       const sellPrice = prices[i];
//       const buyPrice = averageBuyPrice; // Use the average buy price for held tokens
//       const maxLoss = buyPrice * (stopLossPercent / 100);
//       // Stop-loss check
//       if (sellPrice < buyPrice - maxLoss) {
//         console.log(`Stop-loss triggered for trade ${i}: Sell at ${sellPrice}, Loss exceeds ${stopLossPercent}%`);
//         position = 'none';
//         continue;
//       }
//       // Target sell price to ensure minimum profit
//       const targetSellPrice = buyPrice * (1 + minProfitPercent / 100);
//       // Sell only if price is above the target sell price for profit or stop-loss
//       if (sellPrice >= targetSellPrice) {
//         console.log(`Profit target met. Selling at ${sellPrice} with profit.`);
//         // Calculate profit with slippage and fees
//         const profit = calculateProfit(buyPrice, sellPrice, heldVolume);
//         totalProfit += profit;
//         balance += sellPrice * heldVolume; // Add sale earnings back to balance
//         // Store the result in the MongoDB database
//         const result = new SimulationResult({
//           strategy: "Scalping",
//           tokenSymbol: trade.tokenSymbol,
//           buyPrice: buyPrice,
//           sellPrice: sellPrice,
//           profit: profit,
//           walletAddress: trade.walletAddress, // Wallet address for historical reference
//           buyTokenVolume: heldVolume,
//           sellTokenVolume: heldVolume,
//           tradeTimestamps: {
//             buyTime: new Date(trade.openTradeTime),
//             sellTime: new Date(trade.finishedTradeTime),
//           },
//           balance: balance,
//         });
//         // Save the simulation result to MongoDB
//         try {
//           await result.save();
//         } catch (error) {
//           console.error(`Error saving simulation result: ${error.message}`);
//         }
//         // Reset held tokens after selling
//         heldVolume = 0;
//         averageBuyPrice = 0; // Reset average buy price
//         position = 'none';
//       } else {
//         console.log(`Holding position. Price ${sellPrice} is below target sell price.`);
//       }
//     }
//   }
//   console.log(`Total executed trades: ${tradeCounter}`);
//   console.log(`Total trades checked: ${prices.length}`);
//   console.log(`Total Profit from Simulation: ${totalProfit}`);
//   console.log(`Final Balance: ${balance}`);
// }
// // Connect to MongoDB and run the simulation
// (async function () {
//   try {
//     const initialBalance = 500; // Set starting balance
//     const stopLossPercent = 5;  // Set stop-loss at 5%
//     const minProfitPercent = 1;  // Set minimum profit margin to 1%
//     await simulateScalpingStrategy(initialBalance, stopLossPercent, minProfitPercent);
//   } catch (error) {
//     logger.error("Error running simulation:", error);
//   }
// })();
// //MEAN REVERSION STRATEGY
// import mongoose from 'mongoose';
// import SimulationResult from './models/simulationResult';
// import HistoricalData from './models/historicaldata'; // Assume this is your trade model
// import { logger } from './utils/logger';
// // MongoDB connection
// mongoose
//   .connect('mongodb://127.0.0.1:27017/market-maker-bot') // Replace with your actual MongoDB connection URL
//   .then(async () => {
//     logger.info("MongoDB connected successfully.");
//   })
//   .catch(err => logger.error("MongoDB connection error:", err));
// // Enhanced profit calculation, considering slippage and fees
// function calculateProfit(buyPrice: number, sellPrice: number, volume: number, slippage: number = 0.001, fee: number = 0.0001): number {
//   const adjustedBuyPrice = buyPrice * (1 + slippage + fee);  // Adjust for slippage and transaction fees
//   const adjustedSellPrice = sellPrice * (1 - slippage - fee); // Adjust for slippage and transaction fees
//   // Profit = (Sell Price * Volume) - (Buy Price * Volume)
//   const profit = (adjustedSellPrice * volume) - (adjustedBuyPrice * volume);
//   return profit;
// }
// // Function to simulate the mean reversion strategy and store results in MongoDB
// async function simulateMeanReversionStrategy(initialBalance: number, stopLossPercent: number, minProfitPercent: number) {
//   // Fetch historical trades from the database
//   const trades = await HistoricalData.find().sort({ openTradeTime: 1 }); // Sort by time
//   const prices = trades.map(trade => trade.priceAtBuy); // Assuming you are using the buy price for simulation
//   // Initialize the trading position, total profit, and balance
//   let position: 'none' | 'buy' = 'none';
//   let totalProfit = 0;
//   let balance = initialBalance;
//   let tradeCounter = 0;
//   let heldVolume = 0; // Track held tokens
//   let averageBuyPrice = 0; // Track the average buy price of held tokens
//   // Loop through trades and execute the strategy
//   for (let i = 1; i < prices.length; i++) {
//     const trade = trades[i];
//     // Mean reversion buy condition: Buy if the price is lower than the moving average
//     const movingAverage = prices.slice(Math.max(0, i - 10), i).reduce((sum, price) => sum + price, 0) / Math.min(10, i + 1);
//     if (prices[i] < movingAverage && position === 'none') {
//       const buyVolume = trade.buyTokenVolume || 0; // Use buy token volume or set to 0 if missing
//       const cost = prices[i] * buyVolume; // Calculate cost of buying
//       // Ensure there is enough balance for the purchase
//       if (balance >= cost && buyVolume > 0) {
//         console.log(`Buy condition met at price: ${prices[i]} for ${trade.tokenSymbol}`);
//         position = 'buy';
//         heldVolume += buyVolume; // Increase held tokens
//         averageBuyPrice = prices[i]; // Update average buy price
//         balance -= cost; // Deduct the cost from balance
//         tradeCounter++;
//       } else {
//         console.log(`Skipping trade ${i}: Not enough balance to buy ${trade.tokenSymbol}`);
//       }
//     } else if (position === 'buy') {
//       const sellPrice = prices[i];
//       const buyPrice = averageBuyPrice; // Use the average buy price for held tokens
//       const maxLoss = buyPrice * (stopLossPercent / 100);
//       // Stop-loss check
//       if (sellPrice < buyPrice - maxLoss) {
//         console.log(`Stop-loss triggered for trade ${i}: Sell at ${sellPrice}, Loss exceeds ${stopLossPercent}%`);
//         position = 'none';
//         continue;
//       }
//       // Target sell price to ensure minimum profit
//       const targetSellPrice = buyPrice * (1 + minProfitPercent / 100);
//       // Mean reversion sell condition: Sell if the price is higher than the moving average
//       const movingAverageSell = prices.slice(Math.max(0, i - 10), i).reduce((sum, price) => sum + price, 0) / Math.min(10, i + 1);
//       if (sellPrice >= targetSellPrice || sellPrice > movingAverageSell) {
//         console.log(`Profit target met or mean reversion triggered. Selling at ${sellPrice} with profit.`);
//         // Calculate profit with slippage and fees
//         const profit = calculateProfit(buyPrice, sellPrice, heldVolume);
//         totalProfit += profit;
//         balance += sellPrice * heldVolume; // Add sale earnings back to balance
//         // Store the result in the MongoDB database
//         const result = new SimulationResult({
//           strategy: "Mean Reversion",
//           tokenSymbol: trade.tokenSymbol,
//           buyPrice: buyPrice,
//           sellPrice: sellPrice,
//           profit: profit,
//           walletAddress: trade.walletAddress, // Wallet address for historical reference
//           buyTokenVolume: heldVolume,
//           sellTokenVolume: heldVolume,
//           tradeTimestamps: {
//             buyTime: new Date(trade.openTradeTime),
//             sellTime: new Date(trade.finishedTradeTime),
//           },
//           balance: balance,
//         });
//         // Save the simulation result to MongoDB
//         try {
//           await result.save();
//         } catch (error) {
//           console.error(`Error saving simulation result: ${error.message}`);
//         }
//         // Reset held tokens after selling
//         heldVolume = 0;
//         averageBuyPrice = 0; // Reset average buy price
//         position = 'none';
//       } else {
//         console.log(`Holding position. Price ${sellPrice} is below target sell price and mean.`); 
//       }
//     }
//   }
//   console.log(`Total executed trades: ${tradeCounter}`);
//   console.log(`Total trades checked: ${prices.length}`);
//   console.log(`Total Profit from Simulation: ${totalProfit}`);
//   console.log(`Final Balance: ${balance}`);
// }
// // Connect to MongoDB and run the simulation
// (async function () {
//   try {
//     const initialBalance = 500; // Set starting balance
//     const stopLossPercent = 1;  // Set stop-loss at 5%
//     const minProfitPercent = 1;  // Set minimum profit margin to 1%
//     await simulateMeanReversionStrategy(initialBalance, stopLossPercent, minProfitPercent);
//   } catch (error) {
//     logger.error("Error running simulation:", error);
//   }
// })();
//BREAKOUT STRATEGY
// import mongoose from 'mongoose';
// import SimulationResult from './models/simulationResult';
// import HistoricalData from './models/historicaldata'; // Assume this is your trade model
// import { logger } from './utils/logger';
// // MongoDB connection
// mongoose
//   .connect('mongodb://127.0.0.1:27017/market-maker-bot') // Replace with your actual MongoDB connection URL
//   .then(async () => {
//     logger.info("MongoDB connected successfully.");
//   })
//   .catch(err => logger.error("MongoDB connection error:", err));
// // Enhanced profit calculation, considering slippage and fees
// function calculateProfit(buyPrice: number, sellPrice: number, volume: number, slippage: number = 0.001, fee: number = 0.0001): number {
//   const adjustedBuyPrice = buyPrice * (1 + slippage + fee);  // Adjust for slippage and transaction fees
//   const adjustedSellPrice = sellPrice * (1 - slippage - fee); // Adjust for slippage and transaction fees
//   // Profit = (Sell Price * Volume) - (Buy Price * Volume)
//   const profit = (adjustedSellPrice * volume) - (adjustedBuyPrice * volume);
//   return profit;
// }
// Function to simulate the breakout strategy and store results in MongoDB
// async function simulateBreakoutStrategy(initialBalance: number, stopLossPercent: number, minProfitPercent: number) {
//   // Fetch historical trades from the database
//   const trades = await HistoricalData.find().sort({ openTradeTime: 1 }); // Sort by time
//   const prices = trades.map(trade => trade.priceAtBuy); // Assuming you are using the buy price for simulation
//   // Initialize the trading position, total profit, and balance
//   let position: 'none' | 'buy' = 'none';
//   let totalProfit = 0;
//   let balance = initialBalance;
//   let tradeCounter = 0;
//   let heldVolume = 0; // Track held tokens
//   let averageBuyPrice = 0; // Track the average buy price of held tokens
//   // Loop through trades and execute the strategy
//   for (let i = 1; i < prices.length; i++) {
//     const trade = trades[i];
//     // Breakout buy condition: Buy if the price breaks above the previous high
//     const previousHigh = Math.max(...prices.slice(0, i)); // Get the highest price up to the current trade
//     if (prices[i] > previousHigh && position === 'none') {
//       const buyVolume = trade.buyTokenVolume || 0; // Use buy token volume or set to 0 if missing
//       const cost = prices[i] * buyVolume; // Calculate cost of buying
//       // Ensure there is enough balance for the purchase
//       if (balance >= cost && buyVolume > 0) {
//         console.log(`Buy condition met at price: ${prices[i]} for ${trade.tokenSymbol}`);
//         position = 'buy';
//         heldVolume += buyVolume; // Increase held tokens
//         averageBuyPrice = prices[i]; // Update average buy price
//         balance -= cost; // Deduct the cost from balance
//         tradeCounter++;
//       } else {
//         console.log(`Skipping trade ${i}: Not enough balance to buy ${trade.tokenSymbol}`);
//       }
//     } else if (position === 'buy') {
//       const sellPrice = prices[i];
//       const buyPrice = averageBuyPrice; // Use the average buy price for held tokens
//       const maxLoss = buyPrice * (stopLossPercent / 100);
//       // Stop-loss check
//       if (sellPrice < buyPrice - maxLoss) {
//         console.log(`Stop-loss triggered for trade ${i}: Sell at ${sellPrice}, Loss exceeds ${stopLossPercent}%`);
//         position = 'none';
//         continue;
//       }
//       // Target sell price to ensure minimum profit
//       const targetSellPrice = buyPrice * (1 + minProfitPercent / 100);
//       // Breakout sell condition: Sell if the price falls below a certain threshold (e.g., 1% below the current price)
//       if (sellPrice >= targetSellPrice) {
//         console.log(`Profit target met. Selling at ${sellPrice} with profit.`);
//         // Calculate profit with slippage and fees
//         const profit = calculateProfit(buyPrice, sellPrice, heldVolume);
//         totalProfit += profit;
//         balance += sellPrice * heldVolume; // Add sale earnings back to balance
//         // Store the result in the MongoDB database
//         const result = new SimulationResult({
//           strategy: "Breakout",
//           tokenSymbol: trade.tokenSymbol,
//           buyPrice: buyPrice,
//           sellPrice: sellPrice,
//           profit: profit,
//           walletAddress: trade.walletAddress, // Wallet address for historical reference
//           buyTokenVolume: heldVolume,
//           sellTokenVolume: heldVolume,
//           tradeTimestamps: {
//             buyTime: new Date(trade.openTradeTime),
//             sellTime: new Date(trade.finishedTradeTime),
//           },
//           balance: balance,
//         });
//         // Save the simulation result to MongoDB
//         try {
//           await result.save();
//         } catch (error) {
//           console.error(`Error saving simulation result: ${error.message}`);
//         }
//         // Reset held tokens after selling
//         heldVolume = 0;
//         averageBuyPrice = 0; // Reset average buy price
//         position = 'none';
//       } else {
//         console.log(`Holding position. Price ${sellPrice} is below target sell price.`); 
//       }
//     }
//   }
//   console.log(`Total executed trades: ${tradeCounter}`);
//   console.log(`Total trades checked: ${prices.length}`);
//   console.log(`Total Profit from Simulation: ${totalProfit}`);
//   console.log(`Final Balance: ${balance}`);
// }
// // Connect to MongoDB and run the simulation
// (async function () {
//   try {
//     const initialBalance = 500; // Set starting balance
//     const stopLossPercent = 5;  // Set stop-loss at 5%
//     const minProfitPercent = 1;  // Set minimum profit margin to 1%
//     await simulateBreakoutStrategy(initialBalance, stopLossPercent, minProfitPercent);
//   } catch (error) {
//     logger.error("Error running simulation:", error);
//   }
// })();
//Trend Following Strategy 
// import mongoose from 'mongoose';
// import SimulationResult from './models/simulationResult';
// import HistoricalData from './models/historicaldata'; // Assume this is your trade model
// import { logger } from './utils/logger';
// // MongoDB connection
// mongoose
//   .connect('mongodb://127.0.0.1:27017/market-maker-bot') // Replace with your actual MongoDB connection URL
//   .then(async () => {
//     logger.info("MongoDB connected successfully.");
//   })
//   .catch(err => logger.error("MongoDB connection error:", err));
// // Enhanced profit calculation, considering slippage and fees
// function calculateProfit(buyPrice: number, sellPrice: number, volume: number, slippage: number = 0.001, fee: number = 0.0001): number {
//   const adjustedBuyPrice = buyPrice * (1 + slippage + fee);  // Adjust for slippage and transaction fees
//   const adjustedSellPrice = sellPrice * (1 - slippage - fee); // Adjust for slippage and transaction fees
//   // Profit = (Sell Price * Volume) - (Buy Price * Volume)
//   const profit = (adjustedSellPrice * volume) - (adjustedBuyPrice * volume);
//   return profit;
// }
// // Function to simulate the trend-following strategy and store results in MongoDB
// async function simulateTrendFollowingStrategy(initialBalance: number, stopLossPercent: number, minProfitPercent: number) {
//   // Fetch historical trades from the database
//   const trades = await HistoricalData.find().sort({ openTradeTime: 1 }); // Sort by time
//   const prices = trades.map(trade => trade.priceAtBuy); // Assuming you are using the buy price for simulation
//   // Initialize the trading position, total profit, and balance
//   let position: 'none' | 'buy' = 'none';
//   let totalProfit = 0;
//   let balance = initialBalance;
//   let tradeCounter = 0;
//   let heldVolume = 0; // Track held tokens
//   let averageBuyPrice = 0; // Track the average buy price of held tokens
//   // Loop through trades and execute the strategy
//   for (let i = 1; i < prices.length; i++) {
//     const trade = trades[i];
//     // Trend-following buy condition: Buy if the current price is higher than the previous price
//     if (prices[i] > prices[i - 1] && position === 'none') {
//       const buyVolume = trade.buyTokenVolume || 0; // Use buy token volume or set to 0 if missing
//       const cost = prices[i] * buyVolume; // Calculate cost of buying
//       // Ensure there is enough balance for the purchase
//       if (balance >= cost && buyVolume > 0) {
//         console.log(`Buy condition met at price: ${prices[i]} for ${trade.tokenSymbol}`);
//         position = 'buy';
//         heldVolume += buyVolume; // Increase held tokens
//         averageBuyPrice = prices[i]; // Update average buy price
//         balance -= cost; // Deduct the cost from balance
//         tradeCounter++;
//       } else {
//         console.log(`Skipping trade ${i}: Not enough balance to buy ${trade.tokenSymbol}`);
//       }
//     } else if (position === 'buy') {
//       const sellPrice = prices[i];
//       const buyPrice = averageBuyPrice; // Use the average buy price for held tokens
//       const maxLoss = buyPrice * (stopLossPercent / 100);
//       // Stop-loss check
//       if (sellPrice < buyPrice - maxLoss) {
//         console.log(`Stop-loss triggered for trade ${i}: Sell at ${sellPrice}, Loss exceeds ${stopLossPercent}%`);
//         position = 'none';
//         continue;
//       }
//       // Target sell price to ensure minimum profit
//       const targetSellPrice = buyPrice * (1 + minProfitPercent / 100);
//       // Sell if the price is higher than the target sell price
//       if (sellPrice >= targetSellPrice) {
//         console.log(`Profit target met. Selling at ${sellPrice} with profit.`);
//         // Calculate profit with slippage and fees
//         const profit = calculateProfit(buyPrice, sellPrice, heldVolume);
//         totalProfit += profit;
//         balance += sellPrice * heldVolume; // Add sale earnings back to balance
//         // Store the result in the MongoDB database
//         const result = new SimulationResult({
//           strategy: "Trend Following",
//           tokenSymbol: trade.tokenSymbol,
//           buyPrice: buyPrice,
//           sellPrice: sellPrice,
//           profit: profit,
//           walletAddress: trade.walletAddress, // Wallet address for historical reference
//           buyTokenVolume: heldVolume,
//           sellTokenVolume: heldVolume,
//           tradeTimestamps: {
//             buyTime: new Date(trade.openTradeTime),
//             sellTime: new Date(trade.finishedTradeTime),
//           },
//           balance: balance,
//         });
//         // Save the simulation result to MongoDB
//         try {
//           await result.save();
//         } catch (error) {
//           console.error(`Error saving simulation result: ${error.message}`);
//         }
//         // Reset held tokens after selling
//         heldVolume = 0;
//         averageBuyPrice = 0; // Reset average buy price
//         position = 'none';
//       } else {
//         console.log(`Holding position. Price ${sellPrice} is below target sell price.`);
//       }
//     }
//   }
//   console.log(`Total executed trades: ${tradeCounter}`);
//   console.log(`Total trades checked: ${prices.length}`);
//   console.log(`Total Profit from Simulation: ${totalProfit}`);
//   console.log(`Final Balance: ${balance}`);
// }
// // Connect to MongoDB and run the simulation
// (async function () {
//   try {
//     const initialBalance = 500; // Set starting balance
//     const stopLossPercent = 1;  // Set stop-loss at 5%
//     const minProfitPercent = 0.5;  // Set minimum profit margin to 1%
//     await simulateTrendFollowingStrategy(initialBalance, stopLossPercent, minProfitPercent);
//   } catch (error) {
//     logger.error("Error running simulation:", error);
//   }
// })();
//Momentum Strategy
// import mongoose from 'mongoose';
// import SimulationResult from './models/momentumsimulation';
// import HistoricalData from './models/historicaldata'; // Assume this is your trade model
// import { logger } from './utils/logger';
// // MongoDB connection
// mongoose
//   .connect('mongodb://127.0.0.1:27017/market-maker-bot') // Replace with your actual MongoDB connection URL
//   .then(async () => {
//     logger.info("MongoDB connected successfully.");
//   })
//   .catch(err => logger.error("MongoDB connection error:", err));
// // Enhanced profit calculation, considering slippage and fees
// function calculateProfit(buyPrice, sellPrice, volume, slippage = 0.001, fee = 0.0001) {
//   const adjustedBuyPrice = buyPrice * (1 + slippage + fee);  // Adjust for slippage and transaction fees
//   const adjustedSellPrice = sellPrice * (1 - slippage - fee); // Adjust for slippage and transaction fees
//   // Profit = (Sell Price * Volume) - (Buy Price * Volume)
//   const profit = (adjustedSellPrice * volume) - (adjustedBuyPrice * volume);
//   return profit;
// }
// // Function to calculate the Simple Moving Average (SMA)
// function calculateSMA(data, period) {
//   if (data.length < period) return null;  // Not enough data points for the period
//   const sum = data.slice(-period).reduce((acc, val) => acc + val, 0);
//   return sum / period;
// }
// // Function to simulate the momentum strategy and store results in MongoDB
// async function simulateMomentumStrategy(initialBalance, shortTermPeriod, longTermPeriod, stopLossPercent, minProfitPercent) {
//   // Fetch historical trades from the database
//   const trades = await HistoricalData.find().sort({ openTradeTime: 1 }); // Sort by time
//   const prices = trades.map(trade => trade.priceAtBuy); // Assuming you are using the buy price for simulation
//   // Initialize the trading position, total profit, and balance
//   let position = 'none';
//   let totalProfit = 0;
//   let balance = initialBalance;
//   let tradeCounter = 0;
//   let heldVolume = 0; // Track held tokens
//   let averageBuyPrice = 0; // Track the average buy price of held tokens
//   // Loop through trades and execute the strategy
//   for (let i = longTermPeriod; i < prices.length; i++) {
//     const trade = trades[i];
//     // Calculate short-term and long-term moving averages
//     const shortTermSMA = calculateSMA(prices.slice(0, i), shortTermPeriod);
//     const longTermSMA = calculateSMA(prices.slice(0, i), longTermPeriod);
//     // If there's not enough data to calculate the moving averages, continue
//     if (!shortTermSMA || !longTermSMA) continue;
//     // Buy condition: Short-term SMA crosses above long-term SMA (momentum is upwards)
//     if (shortTermSMA > longTermSMA && position === 'none') {
//       const buyVolume = trade.buyTokenVolume || 0; // Use buy token volume or set to 0 if missing
//       const cost = prices[i] * buyVolume; // Calculate cost of buying
//       // Ensure there is enough balance for the purchase
//       if (balance >= cost && buyVolume > 0) {
//         console.log(`Buy signal at price: ${prices[i]} for ${trade.tokenSymbol} (Momentum Upwards)`);
//         position = 'buy';
//         heldVolume += buyVolume; // Increase held tokens
//         averageBuyPrice = prices[i]; // Update average buy price
//         balance -= cost; // Deduct the cost from balance
//         tradeCounter++;
//       } else {
//         console.log(`Skipping trade ${i}: Not enough balance to buy ${trade.tokenSymbol}`);
//       }
//     } else if (position === 'buy') {
//       const sellPrice = prices[i];
//       const buyPrice = averageBuyPrice; // Use the average buy price for held tokens
//       const maxLoss = buyPrice * (stopLossPercent / 100);
//       // Stop-loss check
//       if (sellPrice < buyPrice - maxLoss) {
//         console.log(`Stop-loss triggered for trade ${i}: Sell at ${sellPrice}, Loss exceeds ${stopLossPercent}%`);
//         position = 'none';
//         continue;
//       }
//       // Target sell price to ensure minimum profit
//       const targetSellPrice = buyPrice * (1 + minProfitPercent / 100);
//       // Sell if the price is higher than the target sell price
//       if (sellPrice >= targetSellPrice || shortTermSMA < longTermSMA) {
//         console.log(`Sell signal at price: ${sellPrice} (Momentum Downwards or Profit Target Met)`);
//         // Calculate profit with slippage and fees
//         const profit = calculateProfit(buyPrice, sellPrice, heldVolume);
//         totalProfit += profit;
//         balance += sellPrice * heldVolume; // Add sale earnings back to balance
//         // Store the result in the MongoDB database
//         const result = new SimulationResult({
//           strategy: "Momentum Strategy",
//           tokenSymbol: trade.tokenSymbol,
//           buyPrice: buyPrice,
//           sellPrice: sellPrice,
//           profit: profit,
//           walletAddress: trade.walletAddress, // Wallet address for historical reference
//           buyTokenVolume: heldVolume,
//           sellTokenVolume: heldVolume,
//           tradeTimestamps: {
//             buyTime: new Date(trade.openTradeTime),
//             sellTime: new Date(trade.finishedTradeTime),
//           },
//           balance: balance,
//         });
//         // Save the simulation result to MongoDB
//         try {
//           await result.save();
//         } catch (error) {
//           console.error(`Error saving simulation result: ${error.message}`);
//         }
//         // Reset held tokens after selling
//         heldVolume = 0;
//         averageBuyPrice = 0; // Reset average buy price
//         position = 'none';
//       } else {
//         console.log(`Holding position. Price ${sellPrice} is below target sell price.`);
//       }
//     }
//   }
//   console.log(`Total executed trades: ${tradeCounter}`);
//   console.log(`Total trades checked: ${prices.length}`);
//   console.log(`Total Profit from Simulation: ${totalProfit}`);
//   console.log(`Final Balance: ${balance}`);
// }
// // Connect to MongoDB and run the simulation
// (async function () {
//   try {
//     const initialBalance = 500; // Set starting balance
//     const shortTermPeriod = 5;  // Short-term SMA period
//     const longTermPeriod = 20;  // Long-term SMA period
//     const stopLossPercent = 5;  // Set stop-loss at 5%
//     const minProfitPercent = 1;  // Set minimum profit margin to 1%
//     await simulateMomentumStrategy(initialBalance, shortTermPeriod, longTermPeriod, stopLossPercent, minProfitPercent);
//   } catch (error) {
//     logger.error("Error running simulation:", error);
//   }
// })();
//GRID TRADING STRATEGY 
// import mongoose from 'mongoose';
// import SimulationResult from './models/simulationResult';
// import HistoricalData from './models/historicaldata'; // Assume this is your trade model
// import { logger } from './utils/logger';
// // MongoDB connection
// mongoose
//   .connect('mongodb://127.0.0.1:27017/market-maker-bot') // Replace with your actual MongoDB connection URL
//   .then(async () => {
//     logger.info("MongoDB connected successfully.");
//   })
//   .catch(err => logger.error("MongoDB connection error:", err));
// // Enhanced profit calculation, considering slippage and fees
// function calculateProfit(buyPrice: number, sellPrice: number, volume: number, slippage: number = 0.001, fee: number = 0.0001): number {
//   const adjustedBuyPrice = buyPrice * (1 + slippage + fee);  // Adjust for slippage and transaction fees
//   const adjustedSellPrice = sellPrice * (1 - slippage - fee); // Adjust for slippage and transaction fees
//   // Profit = (Sell Price * Volume) - (Buy Price * Volume)
//   const profit = (adjustedSellPrice * volume) - (adjustedBuyPrice * volume);
//   return profit;
// }
// // Function to simulate the Grid Trading strategy and store results in MongoDB
// async function simulateGridTradingStrategy(gridSize: number, gridSpacing: number, initialBalance: number, stopLossPercent: number, minProfitPercent: number) {
//   // Fetch historical trades from the database
//   const trades = await HistoricalData.find().sort({ openTradeTime: 1 }); // Sort by time
//   const prices = trades.map(trade => trade.priceAtBuy); // Assuming you are using the buy price for simulation
//   // Initialize the trading position, total profit, and balance
//   let position: 'none' | 'buy' = 'none';
//   let totalProfit = 0;
//   let balance = initialBalance;
//   let tradeCounter = 0;
//   let heldVolume = 0; // Track held tokens
//   let gridLevels = [];
//   let averageBuyPrice = 0; // Track the average buy price of held tokens
//   let totalDollarsSpent = 0; // Track total dollars spent for buying
//   // Set up grid levels (buy and sell points)
//   const initialPrice = prices[0];
//   for (let i = 1; i <= gridSize; i++) {
//     const buyPrice = initialPrice - i * gridSpacing;
//     const sellPrice = initialPrice + i * gridSpacing;
//     gridLevels.push({ buyPrice, sellPrice });
//   }
//   // Loop through trades and execute the grid trading strategy
//   for (let i = 0; i < prices.length; i++) {
//     const trade = trades[i];
//     const currentPrice = prices[i];
//     // Check for buy orders in the grid
//     const buyLevel = gridLevels.find(level => currentPrice <= level.buyPrice);
//     if (buyLevel && position === 'none') {
//       const buyVolume = trade.buyTokenVolume || 0; // Use buy token volume or set to 0 if missing
//       const cost = buyLevel.buyPrice * buyVolume;
//       // Ensure there is enough balance for the purchase
//       if (balance >= cost && buyVolume > 0) {
//         console.log(`Buying at grid level: ${buyLevel.buyPrice} for ${trade.tokenSymbol}`);
//         position = 'buy';
//         heldVolume += buyVolume; // Increase held tokens
//         averageBuyPrice = (averageBuyPrice * (heldVolume - buyVolume) + buyLevel.buyPrice * buyVolume) / heldVolume; // Update average buy price
//         totalDollarsSpent += buyLevel.buyPrice * buyVolume; // Track total dollars spent
//         balance -= cost; // Deduct the cost from balance
//         tradeCounter++;
//       }
//     } else if (position === 'buy') {
//       // Check for sell orders in the grid
//       const sellLevel = gridLevels.find(level => currentPrice >= level.sellPrice);
//       const buyPrice = averageBuyPrice; // Use the average buy price for held tokens
//       const sellPrice = currentPrice;
//       // Stop-loss check
//       const maxLoss = buyPrice * (stopLossPercent / 100);
//       if (sellPrice < buyPrice - maxLoss) {
//         console.log(`Stop-loss triggered. Selling at ${sellPrice} with loss exceeding ${stopLossPercent}%`);
//         position = 'none';
//         continue;
//       }
//       // Target sell price to ensure minimum profit
//       const targetSellPrice = buyPrice * (1 + minProfitPercent / 100);
//       // Sell if price is above target or meets a grid level
//       if (sellLevel && sellPrice >= targetSellPrice) {
//         console.log(`Selling at grid level: ${sellLevel.sellPrice} with profit.`);
//         // Calculate profit with slippage and fees
//         const profit = calculateProfit(buyPrice, sellPrice, heldVolume);
//         totalProfit += profit;
//         balance += sellPrice * heldVolume; // Add sale earnings back to balance
//         // Store the result in the MongoDB database
//         const result = new SimulationResult({
//           strategy: "Grid Trading",
//           tokenSymbol: trade.tokenSymbol,
//           buyPrice: buyPrice,
//           sellPrice: sellPrice,
//           profit: profit,
//           gridSize: gridSize,
//           gridSpacing: gridSpacing,
//           walletAddress: trade.walletAddress, // Wallet address for historical reference
//           buyTokenVolume: heldVolume,
//           sellTokenVolume: heldVolume,
//           tradeTimestamps: {
//             buyTime: new Date(trade.openTradeTime),
//             sellTime: new Date(trade.finishedTradeTime),
//           },
//           balance: balance,
//           totalDollarsSpent: totalDollarsSpent
//         });
//         // Save the simulation result to MongoDB
//         try {
//           await result.save();
//         } catch (error) {
//           console.error(`Error saving simulation result: ${error.message}`);
//         }
//         // Reset held tokens after selling
//         heldVolume = 0;
//         averageBuyPrice = 0; // Reset average buy price
//         position = 'none';
//       }
//     }
//   }
//   console.log(`Total executed trades: ${tradeCounter}`);
//   console.log(`Total trades checked: ${prices.length}`);
//   console.log(`Total Profit from Simulation: ${totalProfit}`);
//   console.log(`Final Balance: ${balance}`);
// }
// // Connect to MongoDB and run the simulation
// (async function () {
//   try {
//     const initialBalance = 500; // Set starting balance
//     const stopLossPercent = 5;  // Set stop-loss at 5%
//     const minProfitPercent = 1;  // Set minimum profit margin to 1%
//     const gridSize = 10; // Number of grid levels above and below initial price
//     const gridSpacing = 0.1; // The price difference between grid levels
//     await simulateGridTradingStrategy(gridSize, gridSpacing, initialBalance, stopLossPercent, minProfitPercent);
//   } catch (error) {
//     logger.error("Error running simulation:", error);
//   }
// })();
// Volume - Weighted Average Price Strategy 
// import mongoose from 'mongoose';
// import SimulationResult from './models/vwapsimulation';
// import HistoricalData from './models/historicaldata'; // Assume this is your trade model
// import { logger } from './utils/logger';
// // MongoDB connection
// mongoose
//   .connect('mongodb://127.0.0.1:27017/market-maker-bot') // Replace with your actual MongoDB connection URL
//   .then(async () => {
//     logger.info("MongoDB connected successfully.");
//   })
//   .catch(err => logger.error("MongoDB connection error:", err));
// // Function to calculate Volume-Weighted Average Price (VWAP)
// function calculateVWAP(prices: number[], volumes: number[]): number[] {
//   const vwap: number[] = [];
//   let cumulativePriceVolume = 0;
//   let cumulativeVolume = 0;
//   for (let i = 0; i < prices.length; i++) {
//     cumulativePriceVolume += prices[i] * volumes[i];
//     cumulativeVolume += volumes[i];
//     vwap.push(cumulativePriceVolume / cumulativeVolume);
//   }
//   return vwap;
// }
// // Enhanced profit calculation, considering slippage and fees
// function calculateProfit(buyPrice: number, sellPrice: number, volume: number, slippage: number = 0.001, fee: number = 0.0001): number {
//   const adjustedBuyPrice = buyPrice * (1 + slippage + fee);  // Adjust for slippage and transaction fees
//   const adjustedSellPrice = sellPrice * (1 - slippage - fee); // Adjust for slippage and transaction fees
//   const profit = (adjustedSellPrice * volume) - (adjustedBuyPrice * volume);
//   return profit;
// }
// // Function to simulate VWAP strategy and store results in MongoDB
// async function simulateVWAPStrategy(initialBalance: number, stopLossPercent: number, minProfitPercent: number) {
//   // Fetch historical trades from the database
//   const trades = await HistoricalData.find().sort({ openTradeTime: 1 }); // Sort by time
//   const prices = trades.map(trade => trade.priceAtBuy); // Assuming you are using the buy price for simulation
//   const volumes = trades.map(trade => trade.buyTokenVolume); // Fetch the trade volume
//   // Calculate VWAP
//   const vwap = calculateVWAP(prices, volumes);
//   // Initialize trading position, total profit, and balance
//   let position: 'none' | 'buy' = 'none';
//   let totalProfit = 0;
//   let balance = initialBalance;
//   let tradeCounter = 0;
//   let heldVolume = 0;
//   let averageBuyPrice = 0;
//   // Loop through trades and execute the strategy
//   for (let i = 1; i < prices.length; i++) {
//     const trade = trades[i];
//     // Buy condition: price is lower than VWAP
//     if (prices[i] < vwap[i] && position === 'none') {
//       const buyVolume = trade.buyTokenVolume || 0;
//       const cost = prices[i] * buyVolume;
//       if (balance >= cost && buyVolume > 0) {
//         console.log(`Buy condition met at price: ${prices[i]} for ${trade.tokenSymbol}`);
//         position = 'buy';
//         heldVolume += buyVolume;
//         averageBuyPrice = prices[i];
//         balance -= cost;
//         tradeCounter++;
//       } else {
//         console.log(`Skipping trade ${i}: Not enough balance to buy ${trade.tokenSymbol}`);
//       }
//     // Sell condition: price is higher than VWAP
//     } else if (prices[i] > vwap[i] && position === 'buy') {
//       const buyPrice = averageBuyPrice;
//       const sellPrice = prices[i];
//       const maxLoss = buyPrice * (stopLossPercent / 100);
//       // Stop-loss check
//       if (sellPrice < buyPrice - maxLoss) {
//         console.log(`Stop-loss triggered for trade ${i}: Sell at ${sellPrice}, Loss exceeds ${stopLossPercent}%`);
//         position = 'none';
//         continue;
//       }
//       const targetSellPrice = buyPrice * (1 + minProfitPercent / 100);
//       if (sellPrice >= targetSellPrice) {
//         console.log(`Profit target met. Selling at ${sellPrice} with profit.`);
//         const profit = calculateProfit(buyPrice, sellPrice, heldVolume);
//         totalProfit += profit;
//         balance += sellPrice * heldVolume;
//         // Store the result in the MongoDB database
//         const result = new SimulationResult({
//           strategy: "VWAP",
//           tokenSymbol: trade.tokenSymbol,
//           buyPrice: buyPrice,
//           sellPrice: sellPrice,
//           profit: profit,
//           walletAddress: trade.walletAddress, // Wallet address for historical reference
//           buyTokenVolume: heldVolume,
//           sellTokenVolume: heldVolume,
//           tradeTimestamps: {
//             buyTime: new Date(trade.openTradeTime),
//             sellTime: new Date(trade.finishedTradeTime),
//           },
//           balance: balance,
//         });
//         try {
//           await result.save();
//         } catch (error) {
//           console.error(`Error saving simulation result: ${error.message}`);
//         }
//         heldVolume = 0;
//         averageBuyPrice = 0;
//         position = 'none';
//       } else {
//         console.log(`Holding position. Price ${sellPrice} is below target sell price.`);
//       }
//     }
//   }
//   console.log(`Total executed trades: ${tradeCounter}`);
//   console.log(`Total trades checked: ${prices.length}`);
//   console.log(`Total Profit from Simulation: ${totalProfit}`);
//   console.log(`Final Balance: ${balance}`);
// }
// // Connect to MongoDB and run the simulation
// (async function () {
//   try {
//     const initialBalance = 500; // Set starting balance
//     const stopLossPercent = 5;  // Set stop-loss at 5%
//     const minProfitPercent = 1;  // Set minimum profit margin to 1%
//     await simulateVWAPStrategy(initialBalance, stopLossPercent, minProfitPercent); 
//   } catch (error) {
//     logger.error("Error running simulation:", error);
//   }
// })();
//Bollinger Bands Strategy 
// import mongoose from 'mongoose';
// import SimulationResult from './models/simulationResult';
// import HistoricalData from './models/historicaldata'; // Assume this is your trade model
// import { logger } from './utils/logger';
// // MongoDB connection
// mongoose
//   .connect('mongodb://127.0.0.1:27017/market-maker-bot') // Replace with your actual MongoDB connection URL
//   .then(async () => {
//     logger.info("MongoDB connected successfully.");
//   })
//   .catch(err => logger.error("MongoDB connection error:", err));
// // Function to calculate Bollinger Bands
// function calculateBollingerBands(prices: number[], period: number, numStdDev: number) {
//   const middleBand: number[] = [];
//   const upperBand: number[] = [];
//   const lowerBand: number[] = [];
//   for (let i = period - 1; i < prices.length; i++) {
//     const slice = prices.slice(i - period + 1, i + 1);
//     const mean = slice.reduce((acc, price) => acc + price, 0) / period;
//     const variance = slice.reduce((acc, price) => acc + Math.pow(price - mean, 2), 0) / period;
//     const stdDev = Math.sqrt(variance);
//     middleBand.push(mean);
//     upperBand.push(mean + numStdDev * stdDev);
//     lowerBand.push(mean - numStdDev * stdDev);
//   }
//   return { upperBand, lowerBand, middleBand };
// }
// // Enhanced profit calculation, considering slippage and fees
// function calculateProfit(buyPrice: number, sellPrice: number, volume: number, slippage: number = 0.001, fee: number = 0.0001): number {
//   const adjustedBuyPrice = buyPrice * (1 + slippage + fee);  // Adjust for slippage and transaction fees
//   const adjustedSellPrice = sellPrice * (1 - slippage - fee); // Adjust for slippage and transaction fees
//   const profit = (adjustedSellPrice * volume) - (adjustedBuyPrice * volume);
//   return profit;
// }
// // Function to simulate Bollinger Bands strategy and store results in MongoDB
// async function simulateBollingerBandsStrategy(period: number, numStdDev: number, initialBalance: number, stopLossPercent: number, minProfitPercent: number) {
//   // Fetch historical trades from the database
//   const trades = await HistoricalData.find().sort({ openTradeTime: 1 }); // Sort by time
//   const prices = trades.map(trade => trade.priceAtBuy); // Assuming you are using the buy price for simulation
//   // Calculate Bollinger Bands
//   const { upperBand, lowerBand, middleBand } = calculateBollingerBands(prices, period, numStdDev);
//   // Initialize trading position, total profit, and balance
//   let position: 'none' | 'buy' = 'none';
//   let totalProfit = 0;
//   let balance = initialBalance;
//   let tradeCounter = 0;
//   let heldVolume = 0; // Track held tokens
//   let averageBuyPrice = 0; // Track the average buy price of held tokens
//   // Loop through trades and execute the strategy
//   for (let i = period - 1; i < prices.length; i++) {
//     const trade = trades[i];
//     // Buy condition: price touches the lower band
//     if (prices[i] <= lowerBand[i - period + 1] && position === 'none') {
//       const buyVolume = trade.buyTokenVolume || 0; // Use buy token volume or set to 0 if missing
//       const cost = prices[i] * buyVolume; // Calculate cost of buying
//       // Ensure there is enough balance for the purchase
//       if (balance >= cost && buyVolume > 0) {
//         console.log(`Buy condition met at price: ${prices[i]} for ${trade.tokenSymbol}`);
//         position = 'buy';
//         heldVolume += buyVolume; // Increase held tokens
//         averageBuyPrice = prices[i]; // Update average buy price
//         balance -= cost; // Deduct the cost from balance
//         tradeCounter++;
//       } else {
//         console.log(`Skipping trade ${i}: Not enough balance to buy ${trade.tokenSymbol}`);
//       }
//     // Sell condition: price touches the upper band
//     } else if (prices[i] >= upperBand[i - period + 1] && position === 'buy') {
//       const buyPrice = averageBuyPrice; // Use the average buy price for held tokens
//       const sellPrice = prices[i];
//       const maxLoss = buyPrice * (stopLossPercent / 100);
//       // Stop-loss check
//       if (sellPrice < buyPrice - maxLoss) {
//         console.log(`Stop-loss triggered for trade ${i}: Sell at ${sellPrice}, Loss exceeds ${stopLossPercent}%`);
//         position = 'none';
//         continue;
//       }
//       // Target sell price to ensure minimum profit
//       const targetSellPrice = buyPrice * (1 + minProfitPercent / 100);
//       // Sell only if price is above the target sell price for profit or stop-loss
//       if (sellPrice >= targetSellPrice) {
//         console.log(`Profit target met. Selling at ${sellPrice} with profit.`);
//         // Calculate profit with slippage and fees
//         const profit = calculateProfit(buyPrice, sellPrice, heldVolume);
//         totalProfit += profit;
//         balance += sellPrice * heldVolume; // Add sale earnings back to balance
//         // Store the result in the MongoDB database
//         const result = new SimulationResult({
//           strategy: "Bollinger Bands",
//           tokenSymbol: trade.tokenSymbol,
//           buyPrice: buyPrice,
//           sellPrice: sellPrice,
//           profit: profit,
//           walletAddress: trade.walletAddress, // Wallet address for historical reference
//           buyTokenVolume: heldVolume,
//           sellTokenVolume: heldVolume,
//           tradeTimestamps: {
//             buyTime: new Date(trade.openTradeTime),
//             sellTime: new Date(trade.finishedTradeTime),
//           },
//           balance: balance,
//         });
//         // Save the simulation result to MongoDB
//         try {
//           await result.save();
//         } catch (error) {
//           console.error(`Error saving simulation result: ${error.message}`);
//         }
//         // Reset held tokens after selling
//         heldVolume = 0;
//         averageBuyPrice = 0; // Reset average buy price
//         position = 'none';
//       } else {
//         console.log(`Holding position. Price ${sellPrice} is below target sell price.`);
//       }
//     }
//   }
//   console.log(`Total executed trades: ${tradeCounter}`);
//   console.log(`Total trades checked: ${prices.length}`);
//   console.log(`Total Profit from Simulation: ${totalProfit}`);
//   console.log(`Final Balance: ${balance}`);
// }
// // Connect to MongoDB and run the simulation
// (async function () {
//   try {
//     const initialBalance = 500; // Set starting balance
//     const stopLossPercent = 5;  // Set stop-loss at 5%
//     const minProfitPercent = 1;  // Set minimum profit margin to 1%
//     const period = 10;           // Set the period for Bollinger Bands
//     const numStdDev = 2;        // Set number of standard deviations for the bands
//     await simulateBollingerBandsStrategy(period, numStdDev, initialBalance, stopLossPercent, minProfitPercent);
//   } catch (error) {
//     logger.error("Error running simulation:", error);
//   }
// })();
// Assume these are imported or defined earlier
const historicaldata_1 = __importDefault(require("./models/historicaldata")); // MongoDB model for historical data
const logger_1 = require("./utils/logger");
const buyToken_1 = require("./swapper/buyToken");
const profitConfig_1 = require("./config/profitConfig");
const splittokenholders_1 = __importDefault(require("./models/splittokenholders"));
const utils_1 = require("./utils/utils");
const mongoose_1 = __importDefault(require("mongoose")); // Import mongoose to manage the database connection
mongoose_1.default
    .connect('mongodb://127.0.0.1:27017/market-maker-bot') // Connecting to MongoDB at the specified URL
    .then(async () => {
    logger_1.logger.info("MongoDB connected successfully.");
})
    .catch(err => logger_1.logger.error("MongoDB connection error:", err)); // Log error message if connection fails
async function recordTradeTime(walletAddress) {
    // You can implement a simple record mechanism like this
    const currentTime = Date.now();
    // Assuming you have a TradeHistory schema to store trade records
    const TradeHistory = mongoose_1.default.model('TradeHistory', new mongoose_1.default.Schema({
        walletAddress: String,
        tradeTime: Number,
    }));
    await TradeHistory.updateOne({ walletAddress: walletAddress }, { $set: { tradeTime: currentTime } }, { upsert: true } // Create or update the document
    );
}
async function simulateTradesFromHistoricalData(primaryWallet) {
    // Fetch historical data from the HistoricData schema
    const historicalData = await historicaldata_1.default.find({}); // Fetching historical trade data directly
    for (const trade of historicalData) {
        const { walletAddress, tokenSymbol, AmountspentforBuy, buyTokenVolume, priceAtBuy, sellTokenVolume, priceAtSell } = trade;
        // Simulating the whale detection logic
        const tokenAddress = profitConfig_1.TOKEN_DETAILS[tokenSymbol];
        const tokenMinimumTransferAmount = await (0, utils_1.calculateTokenAmountForUSDC)(tokenAddress, profitConfig_1.MIN_TOKEN_AMOUNT);
        if (Number(buyTokenVolume) > tokenMinimumTransferAmount) {
            const exclusiveHolder = await (0, utils_1.checkExclusiveTokenHolder)(tokenAddress, walletAddress);
            if (exclusiveHolder) {
                logger_1.transactionLogger.info(`Simulating Whale Detected 🐋 for wallet: ${walletAddress}`);
                // Fetch the current price and calculate the moving average
                const currentPrice = priceAtBuy; // Using historical price at buy
                const movingAverage = await (0, utils_1.calculateMovingAverage)(tokenSymbol, 50); // 50-period MA (adjust period as needed)
                // Check if the current price is above the moving average
                if (currentPrice > movingAverage) {
                    logger_1.transactionLogger.info(`Simulating Trade: Price is above the 50-period moving average. Preparing to trade.`);
                    // Calculate the amount of SOL to use for buying tokens based on historical data
                    const amountOfTokenOut = await (0, utils_1.calculateTokenAmountForUSDC)(tokenAddress, AmountspentforBuy); // Amount to use for buying tokens
                    // Simulate buying the token
                    await (0, buyToken_1.buyToken)(primaryWallet, // Keypair object representing the wallet to use for the transaction
                    tokenAddress, // Address of the token to be bought
                    amountOfTokenOut, // Amount of SOL to be used for buying the token
                    true, // Flag indicating whether to wait for transaction confirmation
                    false // Flag indicating whether to return the amount of token bought or transaction ID
                    );
                    logger_1.transactionLogger.info(`Simulated Trade Executed ✅ for token: ${tokenSymbol}`);
                    // Record trade time to simulate trade history
                    await recordTradeTime(walletAddress);
                }
                else {
                    logger_1.transactionLogger.info(`Simulating Trade: Price is below moving average. No trade executed.`);
                }
                // Log and update SplitTokenHolders collection with simulated trade details
                await splittokenholders_1.default.updateOne({ walletAddress: walletAddress }, {
                    $set: {
                        tokenAddress: tokenAddress,
                        tokenTransferred: buyTokenVolume,
                        priceAtBuy: priceAtBuy,
                        buysignature: trade.buysignature,
                        sellsignature: trade.sellsignature,
                    },
                }, { upsert: true } // Create or update the document
                );
            }
            else {
                logger_1.transactionLogger.info(`Simulating Transaction ignored: Not an exclusive holder for wallet: ${walletAddress}.`);
            }
        }
        else {
            logger_1.transactionLogger.warn(`Simulating Token transferred below minimum threshold: ${buyTokenVolume}`);
        }
    }
}
// Example usage
const primaryWallet = process.env.WALLET_PRIVATE_KEY; // Use your environment variable for the wallet key
simulateTradesFromHistoricalData(primaryWallet);
