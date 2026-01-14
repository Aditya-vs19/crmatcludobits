import { run, get, all } from '../config/database.js';

export class Quotation {
    /**
     * Create a new quotation
     */
    static async create(quotationData) {
        const {
            requestId,
            customerEmail,
            customerName,
            productName,
            specifications = [],
            pricing,
            quantity = 1,
            notes,
            status = 'Draft',
            createdBy,
        } = quotationData;

        // Convert specifications array to JSON string
        const specsJson = JSON.stringify(specifications);

        await run(`
            INSERT INTO quotations (
                request_id, customer_email, customer_name, product_name,
                specifications, pricing, quantity, notes, status, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [requestId || null, customerEmail, customerName, productName, specsJson, pricing, quantity, notes, status, createdBy]);

        const quotation = await get('SELECT * FROM quotations WHERE id = LAST_INSERT_ID()');
        return this.parseQuotation(quotation);
    }

    /**
     * Parse quotation to convert JSON strings back to objects
     */
    static parseQuotation(quotation) {
        if (!quotation) return null;

        let specifications = [];
        if (quotation.specifications) {
            try {
                specifications = typeof quotation.specifications === 'string'
                    ? JSON.parse(quotation.specifications)
                    : quotation.specifications;
            } catch (e) {
                specifications = [];
            }
        }

        return {
            ...quotation,
            specifications,
        };
    }

    /**
     * Find quotation by ID
     */
    static async findById(id) {
        const quotation = await get('SELECT * FROM quotations WHERE id = ?', [id]);
        return this.parseQuotation(quotation);
    }

    /**
     * Find quotations by request ID
     */
    static async findByRequestId(requestId) {
        const quotations = await all('SELECT * FROM quotations WHERE request_id = ?', [requestId]);
        return quotations.map(q => this.parseQuotation(q));
    }

    /**
     * Get all quotations with optional filters
     */
    static async findAll(filters = {}) {
        let query = `
            SELECT q.*, u.email as creator_email, u.role as creator_role
            FROM quotations q
            LEFT JOIN users u ON q.created_by = u.id
            WHERE 1=1
        `;
        const params = [];

        if (filters.customerEmail) {
            query += ' AND q.customer_email LIKE ?';
            params.push(`%${filters.customerEmail}%`);
        }

        if (filters.status) {
            query += ' AND q.status = ?';
            params.push(filters.status);
        }

        if (filters.createdBy) {
            query += ' AND q.created_by = ?';
            params.push(filters.createdBy);
        }

        if (filters.search) {
            query += ' AND (q.product_name LIKE ? OR q.customer_email LIKE ? OR q.customer_name LIKE ?)';
            params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
        }

        query += ' ORDER BY q.created_at DESC';

        if (filters.limit) {
            query += ' LIMIT ?';
            params.push(parseInt(filters.limit));
        }

        const quotations = await all(query, params);
        return quotations.map(q => this.parseQuotation(q));
    }

    /**
     * Update quotation
     */
    static async update(id, updates) {
        const fields = [];
        const params = [];

        if (updates.customerEmail !== undefined) {
            fields.push('customer_email = ?');
            params.push(updates.customerEmail);
        }

        if (updates.customerName !== undefined) {
            fields.push('customer_name = ?');
            params.push(updates.customerName);
        }

        if (updates.productName !== undefined) {
            fields.push('product_name = ?');
            params.push(updates.productName);
        }

        if (updates.specifications !== undefined) {
            fields.push('specifications = ?');
            params.push(JSON.stringify(updates.specifications));
        }

        if (updates.pricing !== undefined) {
            fields.push('pricing = ?');
            params.push(updates.pricing);
        }

        if (updates.quantity !== undefined) {
            fields.push('quantity = ?');
            params.push(updates.quantity);
        }

        if (updates.notes !== undefined) {
            fields.push('notes = ?');
            params.push(updates.notes);
        }

        if (updates.status !== undefined) {
            fields.push('status = ?');
            params.push(updates.status);
        }

        if (fields.length === 0) return await this.findById(id);

        fields.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id);

        await run(`UPDATE quotations SET ${fields.join(', ')} WHERE id = ?`, params);

        return await this.findById(id);
    }

    /**
     * Delete quotation
     */
    static async delete(id) {
        await run('DELETE FROM quotations WHERE id = ?', [id]);
        return true;
    }

    /**
     * Get statistics
     */
    static async getStats() {
        const total = (await get('SELECT COUNT(*) as count FROM quotations'))?.count || 0;
        const draft = (await get('SELECT COUNT(*) as count FROM quotations WHERE status = "Draft"'))?.count || 0;
        const sent = (await get('SELECT COUNT(*) as count FROM quotations WHERE status = "Sent"'))?.count || 0;
        const accepted = (await get('SELECT COUNT(*) as count FROM quotations WHERE status = "Accepted"'))?.count || 0;

        const byStatus = await all(`
            SELECT status, COUNT(*) as count 
            FROM quotations 
            GROUP BY status
        `);

        return {
            total,
            draft,
            sent,
            accepted,
            byStatus,
        };
    }

    /**
     * Add item to quotation
     */
    static async addItem(quotationId, itemData) {
        const {
            productName,
            specifications = [],
            quantity = 1,
            unitPrice = 0,
        } = itemData;

        const specsJson = JSON.stringify(specifications);
        const totalPrice = quantity * unitPrice;

        await run(`
            INSERT INTO quotation_items (
                quotation_id, product_name, specifications, quantity, unit_price, total_price
            ) VALUES (?, ?, ?, ?, ?, ?)
        `, [quotationId, productName, specsJson, quantity, unitPrice, totalPrice]);

        const item = await get('SELECT * FROM quotation_items WHERE id = LAST_INSERT_ID()');

        // Recalculate totals
        await this.calculateTotals(quotationId);

        return {
            ...item,
            specifications: item?.specifications ? JSON.parse(item.specifications) : [],
        };
    }

    /**
     * Get items for a quotation
     */
    static async getItems(quotationId) {
        const items = await all('SELECT * FROM quotation_items WHERE quotation_id = ? ORDER BY id ASC', [quotationId]);

        return items.map(item => ({
            ...item,
            specifications: item.specifications ? JSON.parse(item.specifications) : [],
        }));
    }

    /**
     * Update quotation item
     */
    static async updateItem(itemId, updates) {
        const fields = [];
        const params = [];

        if (updates.productName !== undefined) {
            fields.push('product_name = ?');
            params.push(updates.productName);
        }

        if (updates.specifications !== undefined) {
            fields.push('specifications = ?');
            params.push(JSON.stringify(updates.specifications));
        }

        if (updates.quantity !== undefined) {
            fields.push('quantity = ?');
            params.push(updates.quantity);
        }

        if (updates.unitPrice !== undefined) {
            fields.push('unit_price = ?');
            params.push(updates.unitPrice);
        }

        // Recalculate total_price if quantity or unitPrice changed
        if (updates.quantity !== undefined || updates.unitPrice !== undefined) {
            const currentItem = await get('SELECT * FROM quotation_items WHERE id = ?', [itemId]);
            const newQuantity = updates.quantity !== undefined ? updates.quantity : currentItem.quantity;
            const newUnitPrice = updates.unitPrice !== undefined ? updates.unitPrice : currentItem.unit_price;
            const newTotalPrice = newQuantity * newUnitPrice;

            fields.push('total_price = ?');
            params.push(newTotalPrice);
        }

        if (fields.length === 0) return null;

        params.push(itemId);
        await run(`UPDATE quotation_items SET ${fields.join(', ')} WHERE id = ?`, params);

        const item = await get('SELECT * FROM quotation_items WHERE id = ?', [itemId]);

        // Recalculate quotation totals
        if (item) {
            await this.calculateTotals(item.quotation_id);
        }

        return item ? {
            ...item,
            specifications: item.specifications ? JSON.parse(item.specifications) : [],
        } : null;
    }

    /**
     * Delete quotation item
     */
    static async deleteItem(itemId) {
        const item = await get('SELECT quotation_id FROM quotation_items WHERE id = ?', [itemId]);

        if (!item) return false;

        await run('DELETE FROM quotation_items WHERE id = ?', [itemId]);

        // Recalculate quotation totals
        await this.calculateTotals(item.quotation_id);

        return true;
    }

    /**
     * Calculate and update quotation totals
     */
    static async calculateTotals(quotationId, taxRate = 0) {
        const items = await all('SELECT * FROM quotation_items WHERE quotation_id = ?', [quotationId]);

        const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0);
        const taxAmount = subtotal * (taxRate / 100);
        const totalAmount = subtotal + taxAmount;

        await run(`
            UPDATE quotations 
            SET subtotal = ?,
                tax_rate = ?,
                tax_amount = ?,
                total_amount = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [subtotal, taxRate, taxAmount, totalAmount, quotationId]);

        return {
            subtotal,
            taxRate,
            taxAmount,
            totalAmount,
        };
    }
}
