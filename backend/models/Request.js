import { run, get, all } from '../config/database.js';

export class Request {
    /**
     * Generate unique request ID
     */
    static async generateRequestId() {
        const result = await get('SELECT COUNT(*) as count FROM requests');
        const count = result?.count || 0;
        const nextId = count + 1;
        return `REQ-${String(nextId).padStart(3, '0')}`;
    }

    /**
     * Create a new request
     */
    static async create(requestData) {
        const {
            customerEmail,
            customerName,
            subject,
            requirements,
            source = 'Email',
            funnelStage = 'New',
            priority = 'Medium',
            emailMessageId,
            emailReferences,
        } = requestData;

        const requestId = await this.generateRequestId();

        await run(`
            INSERT INTO requests (
                request_id, customer_email, requirements, source, funnel_stage, priority, email_message_id, email_references
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [requestId, customerEmail, requirements, source, funnelStage, priority, emailMessageId || null, emailReferences || null]);

        return await this.findByRequestId(requestId);
    }

    /**
     * Find request by request ID
     */
    static async findByRequestId(requestId) {
        return await get('SELECT * FROM requests WHERE request_id = ?', [requestId]);
    }

    /**
     * Find request by ID
     */
    static async findById(id) {
        return await get('SELECT * FROM requests WHERE id = ?', [id]);
    }

    /**
     * Get all requests with optional filters
     */
    static async findAll(filters = {}) {
        let query = `
            SELECT r.*, u.email as assigned_user_email, u.role as assigned_user_role
            FROM requests r
            LEFT JOIN users u ON r.assigned_user_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (filters.funnelStage) {
            query += ' AND r.funnel_stage = ?';
            params.push(filters.funnelStage);
        }

        if (filters.assignedUserId) {
            query += ' AND r.assigned_user_id = ?';
            params.push(filters.assignedUserId);
        }

        if (filters.priority) {
            query += ' AND r.priority = ?';
            params.push(filters.priority);
        }

        if (filters.customerEmail) {
            query += ' AND r.customer_email LIKE ?';
            params.push(`%${filters.customerEmail}%`);
        }

        query += ' ORDER BY r.created_at DESC';

        // Embed LIMIT directly in query to avoid MySQL2 prepared statement issues
        const limit = parseInt(filters.limit, 10) || 50;
        query += ` LIMIT ${limit}`;

        return await all(query, params);
    }

    /**
     * Update funnel stage
     */
    static async updateStage(id, stage) {
        await run(`
            UPDATE requests 
            SET funnel_stage = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `, [stage, id]);

        return await this.findById(id);
    }

    /**
     * Assign to user
     */
    static async assignTo(id, userId) {
        await run(`
            UPDATE requests 
            SET assigned_user_id = ?, funnel_stage = 'Assigned', updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `, [userId, id]);

        return await this.findById(id);
    }

    /**
     * Update request
     */
    static async update(id, updates) {
        const fields = [];
        const params = [];

        if (updates.requirements !== undefined) {
            fields.push('requirements = ?');
            params.push(updates.requirements);
        }

        if (updates.priority !== undefined) {
            fields.push('priority = ?');
            params.push(updates.priority);
        }

        if (updates.funnelStage !== undefined) {
            fields.push('funnel_stage = ?');
            params.push(updates.funnelStage);
        }

        if (fields.length === 0) return await this.findById(id);

        fields.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id);

        await run(`UPDATE requests SET ${fields.join(', ')} WHERE id = ?`, params);

        return await this.findById(id);
    }

    /**
     * Get statistics
     */
    static async getStats() {
        const total = (await get('SELECT COUNT(*) as count FROM requests'))?.count || 0;
        const newRequests = (await get('SELECT COUNT(*) as count FROM requests WHERE funnel_stage = "New"'))?.count || 0;
        const assigned = (await get('SELECT COUNT(*) as count FROM requests WHERE funnel_stage = "Assigned"'))?.count || 0;
        const quoted = (await get('SELECT COUNT(*) as count FROM requests WHERE funnel_stage = "Quoted"'))?.count || 0;

        const byPriority = await all(`
            SELECT priority, COUNT(*) as count 
            FROM requests 
            GROUP BY priority
        `);

        const byStage = await all(`
            SELECT funnel_stage, COUNT(*) as count 
            FROM requests 
            GROUP BY funnel_stage
        `);

        return {
            total,
            newRequests,
            assigned,
            quoted,
            byPriority,
            byStage,
        };
    }
}
