"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRugPull = checkRugPull;
const logger_1 = require("./logger");
const utils_1 = require("./utils");
// Global variables to store token data values
let totalSupply = null;
let maxSupply = null;
let circulatingSupply = null;
let developerData;
let sentimentVotesUpPercentage = 0;
let sentimentVotesDownPercentage = 0;
let marketCapFDVRatio = null;
// Utility function for logging with emojis
const logStatus = (message, status) => {
    if (status === null) {
        logger_1.logger.info(`⚠️ ${message} - Data unavailable.`);
    }
    else if (status) {
        logger_1.logger.info(`✅ ${message}`);
    }
    else {
        logger_1.logger.info(`❌ ${message}`);
    }
};
// Check developer activity
async function checkDeveloperActivity() {
    if (!developerData)
        return null;
    const { forks, stars, commit_count_4_weeks } = developerData;
    const lowActivityThreshold = 10; // Adjust threshold as needed
    const activityScore = (forks + stars + commit_count_4_weeks) / 3;
    return activityScore >= lowActivityThreshold;
}
// Check sentiment votes percentages
async function checkSentimentVotes() {
    if (sentimentVotesUpPercentage === null || sentimentVotesDownPercentage === null)
        return null;
    return sentimentVotesUpPercentage > 50; // Return true if sentiment is positive
}
// Check market cap to FDV ratio
async function checkMarketCapFDVRatio() {
    if (marketCapFDVRatio === null)
        return null;
    return marketCapFDVRatio < 1.2; // Return true if market cap to FDV ratio is healthy
}
// Check total, max, and circulating supply
async function checkSupply() {
    if (totalSupply === null || maxSupply === null || circulatingSupply === null)
        return null;
    const highSupplyThreshold = 10000000000;
    return (totalSupply === maxSupply &&
        totalSupply < highSupplyThreshold &&
        circulatingSupply > 0); // Return true if supply checks are met
}
// Main function to check for rug pulls
async function checkRugPull(tokenAddress) {
    const tokenData = await (0, utils_1.fetchTokenData)(tokenAddress);
    if (!tokenData || !tokenData.developer_data) {
        console.error("Required token data is missing.");
        return;
    }
    totalSupply = tokenData.total_supply || null;
    maxSupply = tokenData.max_supply || null;
    circulatingSupply = tokenData.circulating_supply || null;
    developerData = tokenData.developer_data;
    sentimentVotesUpPercentage = tokenData.sentiment_votes_up_percentage || 0;
    sentimentVotesDownPercentage = tokenData.sentiment_votes_down_percentage || 0;
    marketCapFDVRatio = tokenData.market_cap_fdv_ratio || null;
    // Check developer activity and log result
    const developerActivityCheck = await checkDeveloperActivity();
    logStatus("Developer activity is low", !developerActivityCheck); // Negate the result for clarity
    // Check sentiment votes and log result
    const sentimentCheck = await checkSentimentVotes();
    logStatus("Sentiment analysis is positive", sentimentCheck);
    // Check market cap to FDV ratio and log result
    const marketCapFDVCheck = await checkMarketCapFDVRatio();
    logStatus("Market Cap to FDV Ratio is healthy", marketCapFDVCheck);
    // Check supply and log result
    const supplyCheck = await checkSupply();
    logStatus("Supply check is valid", supplyCheck);
}
