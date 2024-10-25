"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWebhook = void 0;
require("dotenv/config");
const logger_1 = require("../utils/logger");
const profitConfig_1 = require("../config/profitConfig");
// Function to delete existing webhooks
const deleteExistingWebhooks = async () => {
    try {
        const response = await fetch(`https://api.helius.xyz/v0/webhooks?api-key=${process.env.HELIUS_API_KEY}`, {
            method: 'GET',
        });
        const webhooks = await response.json();
        if (webhooks.length > 0) {
            // Delete all existing webhooks
            for (const webhook of webhooks) {
                await fetch(`https://api.helius.xyz/v0/webhooks/${webhook.webhookID}?api-key=${process.env.HELIUS_API_KEY}`, {
                    method: 'DELETE',
                });
                logger_1.logger.info(`Deleted existing webhook with ID: ${webhook.webhookID}`);
            }
        }
        else {
            logger_1.logger.info('No existing webhooks found to delete.');
        }
    }
    catch (error) {
        throw error;
    }
};
const createWebhook = async (tokenAddresses, webhookURL) => {
    try {
        // First, delete any existing webhooks
        await deleteExistingWebhooks();
        const tokenAddresses = Object.values(profitConfig_1.TOKEN_DETAILS);
        const webhookURL = process.env.WEBHOOK_URL;
        //    console.log(webhookURL);
        // Then, create a new webhook
        const response = await fetch(`https://api.helius.xyz/v0/webhooks?api-key=${process.env.HELIUS_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "webhookURL": webhookURL,
                "transactionTypes": ["Any"],
                "accountAddresses": tokenAddresses,
                "webhookType": "enhanced", // "rawDevnet"
                "txnStatus": "success", // success/failed
            }),
        });
        if (!response.ok) {
            const errorResponse = await response.json();
            logger_1.logger.error('Failed to create webhook:', errorResponse);
            throw new Error(`Webhook creation failed: ${errorResponse.message}`);
        }
        const data = await response.json();
        if (data && data.webhookID) {
            logger_1.logger.info('Webhook setup successfully ✅');
            return data.webhookID;
        }
        else {
            logger_1.logger.error('Webhook creation failed: No webhook ID returned');
            throw new Error('No webhook ID returned');
        }
    }
    catch (error) {
        throw error;
    }
};
exports.createWebhook = createWebhook;
