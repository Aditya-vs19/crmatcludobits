import { run, get, all } from '../config/database.js';

export class Email {
    /**
     * Create a new email record
     */
    static async create(emailData) {
        const {
            messageId,
            account,
            senderEmail,
            senderName,
            subject,
            bodyText,
            bodyHtml,
            receivedAt,
        } = emailData;

        await run(`
      INSERT INTO emails (
        message_id, account, sender_email, sender_name, 
        subject, body_text, body_html, received_at, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [messageId, account, senderEmail, senderName, subject, bodyText, bodyHtml, receivedAt]);

        return await this.findByMessageId(messageId);
    }

    /**
     * Find email by message ID
     */
    static async findByMessageId(messageId) {
        return await get('SELECT * FROM emails WHERE message_id = ?', [messageId]);
    }

    /**
     * Find email by ID
     */
    static async findById(id) {
        return await get('SELECT * FROM emails WHERE id = ?', [id]);
    }

    /**
     * Get all emails with optional filters
     */
    static async findAll(filters = {}) {
        let query = 'SELECT * FROM emails WHERE 1=1';
        const params = [];

        if (filters.account) {
            query += ' AND account = ?';
            params.push(filters.account);
        }

        if (filters.status) {
            query += ' AND status = ?';
            params.push(filters.status);
        }

        if (filters.startDate) {
            query += ' AND received_at >= ?';
            params.push(filters.startDate);
        }

        if (filters.endDate) {
            query += ' AND received_at <= ?';
            params.push(filters.endDate);
        }

        query += ' ORDER BY received_at DESC';

        // Embed LIMIT directly in query to avoid MySQL2 prepared statement issues
        const limit = parseInt(filters.limit, 10) || 50;
        query += ` LIMIT ${limit}`;

        return await all(query, params);
    }

    /**
     * Update email status
     */
    static async updateStatus(id, status) {
        await run(`
      UPDATE emails 
      SET status = ?, processed_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [status, id]);

        return await this.findById(id);
    }

    /**
     * Get email with attachments and extracted data
     */
    static async findByIdWithDetails(id) {
        const email = await this.findById(id);
        if (!email) return null;

        const attachments = await all(
            'SELECT * FROM email_attachments WHERE email_id = ?',
            [id]
        );

        const extractedData = await get(
            'SELECT * FROM extracted_data WHERE email_id = ?',
            [id]
        );

        return {
            ...email,
            attachments,
            extractedData,
        };
    }

    /**
     * Get statistics
     */
    static async getStats() {
        const totalResult = await get('SELECT COUNT(*) as count FROM emails');
        const pendingResult = await get('SELECT COUNT(*) as count FROM emails WHERE status = "pending"');
        const processedResult = await get('SELECT COUNT(*) as count FROM emails WHERE status = "processed"');

        const total = totalResult?.count || 0;
        const pending = pendingResult?.count || 0;
        const processed = processedResult?.count || 0;

        const byAccount = await all(`
      SELECT account, COUNT(*) as count 
      FROM emails 
      GROUP BY account
    `);

        return {
            total,
            pending,
            processed,
            byAccount,
        };
    }
}

export class EmailAttachment {
    /**
     * Create attachment record
     */
    static create(attachmentData) {
        const { emailId, filename, contentType, size, filePath } = attachmentData;

        run(`
      INSERT INTO email_attachments (
        email_id, filename, content_type, size, file_path
      ) VALUES (?, ?, ?, ?, ?)
    `, [emailId, filename, contentType, size, filePath]);

        return get('SELECT * FROM email_attachments WHERE email_id = ? AND filename = ?', [emailId, filename]);
    }

    /**
     * Find attachments by email ID
     */
    static findByEmailId(emailId) {
        return all('SELECT * FROM email_attachments WHERE email_id = ?', [emailId]);
    }
}

export class ExtractedData {
    /**
     * Create extracted data record
     */
    static create(data) {
        const { emailId, productName, quantity, specifications, confidenceScore, rawExtraction } = data;

        run(`
      INSERT INTO extracted_data (
        email_id, product_name, quantity, specifications, 
        confidence_score, raw_extraction
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [emailId, productName, quantity, specifications, confidenceScore, rawExtraction]);

        return get('SELECT * FROM extracted_data WHERE email_id = ?', [emailId]);
    }

    /**
     * Find by email ID
     */
    static findByEmailId(emailId) {
        return get('SELECT * FROM extracted_data WHERE email_id = ?', [emailId]);
    }
}
