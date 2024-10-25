"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWebhook = void 0;
require("dotenv/config");
const logger_1 = require("../utils/logger");
const deleteWebhook = async (id) => {
    try {
        const response = await fetch(`https://api.helius.xyz/v0/webhooks/${id}?api-key=${process.env.HELIUS_API_KEY}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.status == 200) {
            logger_1.logger.info("Webhook deleted successfully ✅");
        }
    }
    catch (e) {
        console.error("Error:", e);
    }
};
exports.deleteWebhook = deleteWebhook;
