import { Request } from '../models/Request.js';
import { User } from '../models/User.js';
import { AssignmentHistory } from '../models/AssignmentHistory.js';

/**
 * Get all requests with filters
 */
export const getRequests = async (req, res) => {
    try {
        const { funnelStage, assignedUserId, priority, customerEmail, limit = 50 } = req.query;

        const filters = {
            funnelStage,
            assignedUserId: assignedUserId ? parseInt(assignedUserId) : undefined,
            priority,
            customerEmail,
            limit: parseInt(limit),
        };

        const requests = await Request.findAll(filters);

        res.json({
            success: true,
            data: requests,
            count: requests.length,
        });
    } catch (error) {
        console.error('Get requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch requests',
        });
    }
};

/**
 * Get request by ID with details
 */
export const getRequestById = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await Request.findById(parseInt(id));

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found',
            });
        }

        res.json({
            success: true,
            data: request,
        });
    } catch (error) {
        console.error('Get request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch request',
        });
    }
};

/**
 * Update request
 */
export const updateRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const request = await Request.update(parseInt(id), updates);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found',
            });
        }

        res.json({
            success: true,
            data: request,
            message: 'Request updated successfully',
        });
    } catch (error) {
        console.error('Update request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update request',
        });
    }
};

/**
 * Assign request to user
 */
export const assignRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, notes } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required',
            });
        }

        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Get current request to check for previous assignment
        const currentRequest = await Request.findById(parseInt(id));
        if (!currentRequest) {
            return res.status(404).json({
                success: false,
                message: 'Request not found',
            });
        }

        const previousAssignedUserId = currentRequest.assigned_user_id;

        // Assign request
        const request = await Request.assignTo(parseInt(id), userId);

        // Create assignment history entry
        await AssignmentHistory.create({
            requestId: parseInt(id),
            assignedBy: req.user.id,
            assignedTo: userId,
            notes,
        });

        res.json({
            success: true,
            data: request,
            message: previousAssignedUserId
                ? `Request reassigned to ${user.email}`
                : `Request assigned to ${user.email}`,
        });
    } catch (error) {
        console.error('Assign request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to assign request',
        });
    }
};

/**
 * Update request funnel stage
 */
export const updateStage = async (req, res) => {
    try {
        const { id } = req.params;
        const { stage } = req.body;

        const validStages = ['New', 'Assigned', 'Quoted', 'Closed'];
        if (!validStages.includes(stage)) {
            return res.status(400).json({
                success: false,
                message: `Invalid stage. Must be one of: ${validStages.join(', ')}`,
            });
        }

        const request = await Request.updateStage(parseInt(id), stage);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found',
            });
        }

        res.json({
            success: true,
            data: request,
            message: `Request stage updated to ${stage}`,
        });
    } catch (error) {
        console.error('Update stage error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update stage',
        });
    }
};

/**
 * Get request statistics
 */
export const getRequestStats = async (req, res) => {
    try {
        const stats = await Request.getStats();

        res.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics',
        });
    }
};

/**
 * Get users for assignment dropdown
 */
export const getAssignableUsers = async (req, res) => {
    try {
        const salesUsers = await User.findByRole('Sales');
        const opsUsers = await User.findByRole('Operations');

        res.json({
            success: true,
            data: [...salesUsers, ...opsUsers],
        });
    } catch (error) {
        console.error('Get assignable users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
        });
    }
};
