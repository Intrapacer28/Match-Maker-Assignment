"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWalletEntry = exports.classifications = exports.classifyHolder = void 0;
// Importing necessary wallet schemas
const fishwallets_1 = __importDefault(require("../models/fishwallets")); // Import FishWallet schema
const whalewallets_1 = __importDefault(require("../models/whalewallets")); // Import WhaleWallet schema
const dolphinwallets_1 = __importDefault(require("../models/dolphinwallets")); // Import DolphinWallet schema
const shrimpwallets_1 = __importDefault(require("../models/shrimpwallets")); // Import ShrimpWallet schema
const planktonwallets_1 = __importDefault(require("../models/planktonwallets")); // Import PlanktonWallet schema
const turtlewallets_1 = __importDefault(require("../models/turtlewallets")); // Import TurtleWallet schema
// Classification types based on marine creatures
const classifications = {
    'Fish': {
        description: 'Small to Medium Size Holders',
        criteria: 'Group trades, quick reactions, and frequent trading.'
    },
    'Whale': {
        description: 'Large Holders / Investors',
        criteria: 'Market manipulation, slow strategic movements, and market control.'
    },
    'Plankton': {
        description: 'Micro Holders',
        criteria: 'Passive trading, influenced by larger movements, quick to sell.'
    },
    'Dolphin': {
        description: 'Medium to Large Holders / Active Traders',
        criteria: 'Strategic trading, agile, and group trading.'
    },
    'Shrimp': {
        description: 'Tiny Holders / Newcomers',
        criteria: 'Searching for small gains, exposed to volatility, and mimicking others.'
    },
    'Turtle': {
        description: 'Long-term Holders',
        criteria: 'Slow but steady trading, patience in the market, and often hold for years.'
    }
};
exports.classifications = classifications;
// Function to classify holders based on their trading patterns and trade completion time
const utils_1 = require("./utils"); // Import the function
// Modify the classifyHolder function to include the newTransaction parameter in the createWalletEntry call
// Modify the classifyHolder function to include the newTransaction parameter in the createWalletEntry call
const classifyHolder = async (holderAddress, amountTradedInUSDC, openTradeTime, finishedTradeTime, tokenAddress) => {
    if (!holderAddress || amountTradedInUSDC == null || openTradeTime == null || finishedTradeTime == null || !tokenAddress) {
        console.log(`Invalid input data for classification.`);
        return 'Invalid';
    }
    try {
        // Convert the traded amount from USDC to the token amount using the provided function
        const amountTradedInTokens = await (0, utils_1.calculateTokenAmountForUSDC)(tokenAddress, amountTradedInUSDC);
        // Calculate the time taken to complete the trade
        const tradeDuration = finishedTradeTime - openTradeTime;
        const durationInMinutes = tradeDuration / (1000 * 60);
        let classification;
        if (amountTradedInTokens > 100000) {
            classification = durationInMinutes < 30 ? 'Whale - Active' : 'Whale - Patient';
        }
        else if (amountTradedInTokens > 10000) {
            classification = durationInMinutes < 30 ? 'Dolphin - Agile' : 'Dolphin - Steady';
        }
        else if (amountTradedInTokens > 1000) {
            classification = durationInMinutes < 30 ? 'Fish - Quick' : 'Fish - Steady';
        }
        else if (amountTradedInTokens <= 100 && amountTradedInTokens > 0) {
            classification = durationInMinutes < 10 ? 'Shrimp - Quick' : 'Shrimp - Patient';
        }
        else {
            classification = 'Plankton';
        }
        console.log(`Holder ${holderAddress} classified as ${classification}.`);
        const newTransaction = {
            amount: amountTradedInTokens,
            timestamp: finishedTradeTime,
            classification,
        };
        // Check if the wallet already exists and update classification if necessary
        await createWalletEntry(holderAddress, classification, newTransaction);
        return classification;
    }
    catch (error) {
        console.error(`Error classifying holder: ${error.message}`);
        return 'Error';
    }
};
exports.classifyHolder = classifyHolder;
// Function to create an entry in the respective wallet schema
const createWalletEntry = async (holderAddress, classification, newTransaction) => {
    try {
        if (!holderAddress || !classification) {
            console.log('Missing address or classification.');
            return;
        }
        const commonWalletData = {
            walletAddress: holderAddress,
            tokenBalance: 0,
            lastTradeDate: null,
            transactionHistory: [],
        };
        let WalletModel;
        // Identify classification type
        switch (classification.split(' - ')[0]) {
            case 'Fish':
                WalletModel = fishwallets_1.default;
                break;
            case 'Whale':
                WalletModel = whalewallets_1.default;
                break;
            case 'Dolphin':
                WalletModel = dolphinwallets_1.default;
                break;
            case 'Shrimp':
                WalletModel = shrimpwallets_1.default;
                break;
            case 'Plankton':
                WalletModel = planktonwallets_1.default;
                break;
            case 'Turtle':
                WalletModel = turtlewallets_1.default;
                break;
            default: return;
        }
        const existingWallet = await WalletModel.findOne({ where: { walletAddress: holderAddress } });
        if (existingWallet) {
            // If a wallet is already classified, check if the classification needs to be updated
            if (existingWallet.classification !== classification) {
                // Move the wallet to the new classification schema
                await (0, utils_1.moveWalletToNewSchema)(existingWallet, classification);
            }
            // Update transaction history
            if (newTransaction) {
                const updatedTransactionHistory = [...existingWallet.transactionHistory, newTransaction];
                await WalletModel.update({ transactionHistory: updatedTransactionHistory, lastTradeDate: new Date() }, { where: { walletAddress: holderAddress } });
            }
        }
        else {
            // Create a new wallet entry if none exists
            await WalletModel.create({
                ...commonWalletData,
                classification,
                transactionHistory: [newTransaction],
                lastTradeDate: new Date()
            });
        }
    }
    catch (error) {
        console.error(`Error creating wallet entry: ${error.message}`);
    }
};
exports.createWalletEntry = createWalletEntry;
//first step --> Classifying after trades are completed 
//Right now i am classifying right after the transaction is listened by the wallet -- which shouldnt be the case so the first step would 
//classification happens when the finishtrade is created while -- if the buy occurs the sale open trade should be created and vice versa --
// and the time should be
//logged which would be trade start time and when that opentrade is fulfilled the time should be logged which would be the trade end time --
// and this would be considered as the trade endtime -- and which will also give us the trade duration which would help us in classifcation later 
//second step -->Updating classifaction with each trade for that wallet 
//i would update the classification if the classification of the wallet already is done in the past and is present in the schemas of the classified types 
//then also classify it again -- then match the previous classifaction with the current classifcation -- if they match then its okay -- 
//if they do not the wallet should be moved to the new classified schema removing it from the previous classification 
//But i am already creating and managing the opentrades and finishtrades in the server script -- so ill need to adjust the classification timing
//instead of happening inside the parsing functions they wwould happen in the server file at the end -->                                    
//third step -->
//3.1-- the trend analysis how that wallet reacted to the trend (did it buy or sell when price high or vice versa?) --3.2. --The trade time of the wallet --
// is there any specific time window the wallet operates in or make trades in that time frame only--or is the wallet a speculative buyer 
//-- categorise accordingly -- 3.3. --map out by the trade analysis and trade patterns -- what is the primary trading strategy the wallet
// operates on -- 
//fourth step -->
//4- trade predictions should be made in advance from the studies in 3rd point and then execute th trade from our main wallet 
//to take a chance for our profit on our predicted trade from that holder
//fifth step -->
// i should also store the data of successful trade predictions and unsuccessful ones for analysing later on -- 
//storage should be made on how much profit i made and how much loss i made -- and the transaction history of my own primary wallet --
