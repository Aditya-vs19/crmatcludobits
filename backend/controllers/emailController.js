import { Email } from '../models/Email.js';
import { processAllAccounts } from '../services/emailService.js';

/**
 * Get all emails with filters
 */
export const getEmails = async (req, res) => {
    try {
        const { account, status, startDate, endDate, limit = 50 } = req.query;

        const filters = {
            account,
            status,
            startDate,
            endDate,
            limit: parseInt(limit, 10),
        };

        const emails = await Email.findAll(filters);

        res.json({
            success: true,
            data: emails || [],
            count: emails?.length || 0,
        });
    } catch (error) {
        console.error('Get emails error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch emails',
            data: [],
        });
    }
};

/**
 * Get email by ID with details
 */
export const getEmailById = async (req, res) => {
    try {
        const { id } = req.params;

        const email = await Email.findByIdWithDetails(parseInt(id, 10));

        if (!email) {
            return res.status(404).json({
                success: false,
                message: 'Email not found',
            });
        }

        res.json({
            success: true,
            data: email,
        });
    } catch (error) {
        console.error('Get email error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch email',
        });
    }
};

/**
 * Manually trigger email processing
 */
export const processEmails = async (req, res) => {
    try {
        console.log('📨 Manual email processing triggered');
        const results = await processAllAccounts();

        res.json({
            success: true,
            message: `Processed ${results.length} email(s)`,
            data: results,
        });
    } catch (error) {
        console.error('Process emails error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process emails',
            error: error.message,
        });
    }
};

/**
 * Get email statistics
 */
export const getEmailStats = async (req, res) => {
    try {
        const stats = await Email.getStats();

        res.json({
            success: true,
            data: stats || { total: 0, pending: 0, processed: 0, byAccount: [] },
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics',
            data: { total: 0, pending: 0, processed: 0, byAccount: [] },
        });
    }
};
