import { run, get, all } from '../config/database.js';

export class Product {
    /**
     * Create a new product
     */
    static async create(productData) {
        const { name, pricing, availabilityNotes, specifications = [], createdBy } = productData;

        await run(`
            INSERT INTO products (name, pricing, availability_notes, created_by)
            VALUES (?, ?, ?, ?)
        `, [name, pricing || '', availabilityNotes || '', createdBy]);

        const product = await get('SELECT * FROM products WHERE id = LAST_INSERT_ID()');

        // Add specifications
        if (specifications.length > 0 && product) {
            for (const spec of specifications) {
                await run(`
                    INSERT INTO product_specifications (product_id, spec_key, spec_value)
                    VALUES (?, ?, ?)
                `, [product.id, spec.key, spec.value]);
            }
        }

        return await this.findById(product?.id);
    }

    /**
     * Find product by ID with specifications
     */
    static async findById(id) {
        const product = await get('SELECT * FROM products WHERE id = ?', [id]);
        if (!product) return null;

        const specifications = await all(
            'SELECT * FROM product_specifications WHERE product_id = ?',
            [id]
        );

        return { ...product, specifications };
    }

    /**
     * Find all products
     */
    static async findAll(filters = {}) {
        let query = 'SELECT * FROM products WHERE 1=1';
        const params = [];

        if (filters.search) {
            query += ' AND name LIKE ?';
            params.push(`%${filters.search}%`);
        }

        query += ' ORDER BY name ASC';

        // Embed LIMIT directly in query to avoid MySQL2 prepared statement issues
        const limit = parseInt(filters.limit, 10) || 100;
        query += ` LIMIT ${limit}`;

        const products = await all(query, params);

        // Get specifications for each product
        for (const product of products) {
            product.specifications = await all(
                'SELECT * FROM product_specifications WHERE product_id = ?',
                [product.id]
            );
        }

        return products;
    }

    /**
     * Find products for dropdown
     */
    static async findAllForDropdown() {
        return await all('SELECT id, name, pricing FROM products ORDER BY name ASC');
    }

    /**
     * Add specification to product
     */
    static async addSpecification(productId, specKey, specValue) {
        await run(`
            INSERT INTO product_specifications (product_id, spec_key, spec_value)
            VALUES (?, ?, ?)
        `, [productId, specKey, specValue]);

        return await this.findById(productId);
    }

    /**
     * Update product
     */
    static async update(id, updates) {
        const fields = [];
        const params = [];

        if (updates.name !== undefined) {
            fields.push('name = ?');
            params.push(updates.name);
        }

        if (updates.pricing !== undefined) {
            fields.push('pricing = ?');
            params.push(updates.pricing);
        }

        if (updates.availabilityNotes !== undefined) {
            fields.push('availability_notes = ?');
            params.push(updates.availabilityNotes);
        }

        if (fields.length > 0) {
            fields.push('updated_at = CURRENT_TIMESTAMP');
            params.push(id);
            await run(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, params);
        }

        // Update specifications if provided
        if (updates.specifications !== undefined) {
            // Delete existing
            await run('DELETE FROM product_specifications WHERE product_id = ?', [id]);

            // Add new
            for (const spec of updates.specifications) {
                await run(`
                    INSERT INTO product_specifications (product_id, spec_key, spec_value)
                    VALUES (?, ?, ?)
                `, [id, spec.key, spec.value]);
            }
        }

        return await this.findById(id);
    }

    /**
     * Delete product
     */
    static async delete(id) {
        await run('DELETE FROM products WHERE id = ?', [id]);
        return true;
    }
}
