import { run, all, get } from '../config/database.js';

export class AssignmentHistory {
  /**
   * Create assignment history entry
   */
  static async create(historyData) {
    const { requestId, assignedBy, assignedTo, notes } = historyData;

    await run(`
            INSERT INTO assignment_history (
                request_id, assigned_by, assigned_to, notes
            ) VALUES (?, ?, ?, ?)
        `, [requestId, assignedBy, assignedTo, notes || null]);

    return await get('SELECT * FROM assignment_history WHERE request_id = ? ORDER BY created_at DESC LIMIT 1', [requestId]);
  }

  /**
   * Get assignment history for a request
   */
  static async findByRequestId(requestId) {
    return await all(`
            SELECT 
                ah.*,
                ut.email as to_user_email, ut.role as to_user_role,
                ab.email as assigned_by_email, ab.role as assigned_by_role
            FROM assignment_history ah
            JOIN users ut ON ah.assigned_to = ut.id
            JOIN users ab ON ah.assigned_by = ab.id
            WHERE ah.request_id = ?
            ORDER BY ah.created_at DESC
        `, [requestId]);
  }

  /**
   * Get all assignment history with filters
   */
  static async findAll(filters = {}) {
    let query = `
            SELECT 
                ah.*,
                r.request_id as request_code,
                ut.email as to_user_email, ut.role as to_user_role,
                ab.email as assigned_by_email
            FROM assignment_history ah
            JOIN requests r ON ah.request_id = r.id
            JOIN users ut ON ah.assigned_to = ut.id
            JOIN users ab ON ah.assigned_by = ab.id
            WHERE 1=1
        `;
    const params = [];

    if (filters.requestId) {
      query += ' AND ah.request_id = ?';
      params.push(filters.requestId);
    }

    if (filters.assignedTo) {
      query += ' AND ah.assigned_to = ?';
      params.push(filters.assignedTo);
    }

    query += ' ORDER BY ah.created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }

    return await all(query, params);
  }
}
