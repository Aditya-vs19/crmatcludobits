import { run, get, all } from '../config/database.js';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export class User {
    /**
     * Create a new user
     */
    static async create({ email, password, role }) {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        try {
            await run(`
                INSERT INTO users (email, password, role)
                VALUES (?, ?, ?)
            `, [email, hashedPassword, role]);

            // Get the newly created user
            return await this.findByEmail(email);
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Email already exists');
            }
            throw error;
        }
    }

    /**
     * Find user by ID
     */
    static async findById(id) {
        return await get('SELECT * FROM users WHERE id = ?', [id]);
    }

    /**
     * Find user by email
     */
    static async findByEmail(email) {
        return await get('SELECT * FROM users WHERE email = ?', [email]);
    }

    /**
     * Get all users
     */
    static async findAll() {
        return await all('SELECT id, email, role, created_at FROM users');
    }

    /**
     * Find users by role (for assignment dropdowns)
     */
    static async findByRole(role) {
        return await all('SELECT id, email, role FROM users WHERE role = ?', [role]);
    }

    /**
     * Verify password
     */
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    /**
     * Remove password from user object
     */
    static sanitize(user) {
        if (!user) return null;
        const { password, ...sanitizedUser } = user;
        return sanitizedUser;
    }

    /**
     * Update user
     */
    static async update(id, updates) {
        const fields = Object.keys(updates)
            .map(key => `${key} = ?`)
            .join(', ');

        const values = [...Object.values(updates), id];

        await run(`
            UPDATE users 
            SET ${fields}, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `, values);

        return await this.findById(id);
    }

    /**
     * Delete user
     */
    static async delete(id) {
        await run('DELETE FROM users WHERE id = ?', [id]);
        return { success: true };
    }
}
