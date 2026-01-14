import { User } from '../models/User.js';

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (req, res) => {
    try {
        // Get all users except passwords
        const users = User.findAll();

        // Remove sensitive data
        const sanitizedUsers = users.map(user => ({
            id: user.id,
            email: user.email,
            role: user.role,
            created_at: user.created_at,
        }));

        res.json({
            success: true,
            data: sanitizedUsers,
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
        });
    }
};
