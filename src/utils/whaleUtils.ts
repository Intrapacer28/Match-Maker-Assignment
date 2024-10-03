import { getParsedTokenAccountsByOwner } from '../utils/utils'; // Ensure to implement this utility
import WhaleWallets from '../models/whalewallets'; // Adjust import based on your project structure
import { BASE_AMOUNT_FOR_WHALES } from '../config/profitConfig'; // Adjust import based on your config
import { TOKEN_MINT } from '../config/volumeConfig';

export async function getWhaleWallets() {
    try {
        // Fetch all whale wallets from the database
        const whaleWallets = await WhaleWallets.find({}, { walletAddress: 1, _id: 0 });
        const qualifyingWallets: string[] = [];

        for (const wallet of whaleWallets) {
            const tokenBalance = await getParsedTokenAccountsByOwner(wallet.walletAddress, TOKEN_MINT); // Fetch the token balance

            // Check if the wallet has a balance greater than the base amount
            if (tokenBalance > BASE_AMOUNT_FOR_WHALES) {
                qualifyingWallets.push(wallet.walletAddress); // Add to qualifying wallets
            }
        }

        return qualifyingWallets; // Return an array of wallet addresses that are considered whales
    } catch (error) {
        console.error('Error fetching whale wallets:', error);
        return []; // Return an empty array in case of error
    }
}


// ../utils/whaleUtils.js

/**
 * Function to check if a transaction involves a whale wallet.
 * @param {string} fromAccount - The wallet address sending the token/SOL.
 * @param {string} toAccount - The wallet address receiving the token/SOL.
 * @param {string[]} whaleWallets - List of known whale wallet addresses.
 * @returns {boolean} Returns true if either the sender or receiver is a whale wallet.
 */
// Function to check if the transaction involves a whale wallet
export const isWhaleTransaction = (transaction, whaleWallets) => {
    // Check if the 'from' or 'to' address is in the list of whale wallets
    return whaleWallets.some(wallet => wallet.walletAddress === transaction.from || wallet.walletAddress === transaction.to);
};

