import express from 'express';
import {
    getRequests,
    getRequestById,
    updateRequest,
    assignRequest,
    updateStage,
    getRequestStats,
} from '../controllers/requestController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All request routes require authentication
router.use(authenticate);

// Get all requests (with filters)
router.get('/', getRequests);

// Get request statistics
router.get('/stats', getRequestStats);

// Get request by ID
router.get('/:id', getRequestById);

// Update request
router.put('/:id', updateRequest);

// Assign request to user (admin only)
router.post('/:id/assign', authorize('Admin'), assignRequest);

// Update request stage
router.put('/:id/stage', updateStage);

export default router;
