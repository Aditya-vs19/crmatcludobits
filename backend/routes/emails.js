import express from 'express';
import { getEmails, getEmailById, processEmails, getEmailStats } from '../controllers/emailController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All email routes require authentication
router.use(authenticate);

// Get all emails (with filters)
router.get('/', getEmails);

// Get email statistics
router.get('/stats', getEmailStats);

// Manually trigger email processing (admin only)
router.post('/process', authorize('Admin'), processEmails);

// Get email by ID
router.get('/:id', getEmailById);

export default router;
