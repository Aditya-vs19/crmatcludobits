import express from 'express';
import { register, login, refresh, getCurrentUser } from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);

// Protected routes
router.get('/me', authenticate, getCurrentUser);

// Admin only - get all users
router.get('/users', authenticate, authorize('Admin'), async (req, res) => {
    try {
        const { User } = await import('../models/User.js');
        const users = User.findAll();

        res.json({
            success: true,
            data: users,
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
        });
    }
});

export default router;
