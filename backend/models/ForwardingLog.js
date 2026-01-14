import { run, all, get } from '../config/database.js';

export class ForwardingLog {
    /**
     * Create a forwarding log entry
     */
    static create(logData) {
        const { emailId, recipientEmail, status, messageId, errorMessage } = logData;

        run(`
      INSERT INTO email_forwarding_logs (
        email_id, recipient_email, status, message_id, error_message
      ) VALUES (?, ?, ?, ?, ?)
    `, [emailId, recipientEmail, status, messageId || null, errorMessage || null]);

        return get('SELECT * FROM email_forwarding_logs WHERE email_id = ? AND recipient_email = ?',
            [emailId, recipientEmail]);
    }

    /**
     * Check if email was already forwarded to recipient
     */
    static wasForwarded(emailId, recipientEmail) {
        const log = get(`
      SELECT * FROM email_forwarding_logs 
      WHERE email_id = ? AND recipient_email = ? AND status = 'success'
    `, [emailId, recipientEmail]);

        return !!log;
    }

    /**
     * Get forwarding logs for an email
     */
    static findByEmailId(emailId) {
        return all('SELECT * FROM email_forwarding_logs WHERE email_id = ? ORDER BY forwarded_at DESC',
            [emailId]);
    }

    /**
     * Get all forwarding logs with filters
     */
    static findAll(filters = {}) {
        let query = `
      SELECT fl.*, e.subject, e.sender_email, e.account
      FROM email_forwarding_logs fl
      JOIN emails e ON fl.email_id = e.id
      WHERE 1=1
    `;
        const params = [];

        if (filters.status) {
            query += ' AND fl.status = ?';
            params.push(filters.status);
        }

        if (filters.emailId) {
            query += ' AND fl.email_id = ?';
            params.push(filters.emailId);
        }

        query += ' ORDER BY fl.forwarded_at DESC';

        if (filters.limit) {
            query += ' LIMIT ?';
            params.push(filters.limit);
        }

        return all(query, params);
    }

    /**
     * Get forwarding statistics
     */
    static getStats() {
        const total = get('SELECT COUNT(*) as count FROM email_forwarding_logs')?.count || 0;
        const successful = get('SELECT COUNT(*) as count FROM email_forwarding_logs WHERE status = "success"')?.count || 0;
        const failed = get('SELECT COUNT(*) as count FROM email_forwarding_logs WHERE status = "failed"')?.count || 0;

        return {
            total,
            successful,
            failed,
            successRate: total > 0 ? ((successful / total) * 100).toFixed(1) : 0,
        };
    }
}
