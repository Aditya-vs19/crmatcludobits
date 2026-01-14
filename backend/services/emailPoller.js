import { processAllAccounts } from './emailService.js';
import { emailConfig } from '../config/email.js';

let pollingInterval = null;

/**
 * Start email polling
 */
export const startEmailPolling = () => {
    if (!emailConfig.polling.enabled) {
        console.log('⏸️  Email polling is disabled');
        return;
    }

    console.log(`🚀 Starting email polling (interval: ${emailConfig.polling.interval}ms)`);

    // Process immediately on start
    processAllAccounts().catch(console.error);

    // Then poll at intervals
    pollingInterval = setInterval(() => {
        processAllAccounts().catch(console.error);
    }, emailConfig.polling.interval);
};

/**
 * Stop email polling
 */
export const stopEmailPolling = () => {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
        console.log('🛑 Email polling stopped');
    }
};

/**
 * Get polling status
 */
export const getPollingStatus = () => {
    return {
        enabled: emailConfig.polling.enabled,
        interval: emailConfig.polling.interval,
        running: pollingInterval !== null,
    };
};
