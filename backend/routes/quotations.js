import express from 'express';
import {
    createQuotation,
    getAllQuotations,
    getQuotationById,
    getQuotationsByRequestId,
    updateQuotation,
    deleteQuotation,
    getQuotationStats,
    getSpecificationKeys,
    getSpecificationValues,
    addQuotationItem,
    getQuotationItems,
    updateQuotationItem,
    deleteQuotationItem,
    calculateQuotationTotals,
    generatePDF,
    getQuotationPreview,
    sendQuotationViaEmail,
} from '../controllers/quotationController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get specification keys for dropdowns
router.get('/spec-keys', authenticate, getSpecificationKeys);

// Get specification values for a key
router.get('/spec-values/:key', authenticate, getSpecificationValues);

// Get quotation statistics
router.get('/stats', authenticate, getQuotationStats);

// Get quotations by request ID
router.get('/request/:requestId', authenticate, getQuotationsByRequestId);

// Quotation items management
router.post('/:id/items', authenticate, authorize('Admin', 'Sales', 'Operations'), addQuotationItem);
router.get('/:id/items', authenticate, getQuotationItems);
router.put('/items/:itemId', authenticate, authorize('Admin', 'Sales', 'Operations'), updateQuotationItem);
router.delete('/items/:itemId', authenticate, authorize('Admin', 'Sales', 'Operations'), deleteQuotationItem);

// Calculate totals
router.post('/:id/calculate-totals', authenticate, authorize('Admin', 'Sales', 'Operations'), calculateQuotationTotals);

// PDF generation and preview
router.get('/:id/pdf', authenticate, generatePDF);
router.get('/:id/preview', authenticate, getQuotationPreview);

// Send quotation via email
router.post('/:id/send-email', authenticate, authorize('Admin', 'Sales', 'Operations'), sendQuotationViaEmail);

// Get all quotations
router.get('/', authenticate, getAllQuotations);

// Get single quotation
router.get('/:id', authenticate, getQuotationById);

// Create quotation (Admin, Sales, Operations)
router.post('/', authenticate, authorize('Admin', 'Sales', 'Operations'), createQuotation);

// Update quotation (Admin, Sales, Operations)
router.put('/:id', authenticate, authorize('Admin', 'Sales', 'Operations'), updateQuotation);

// Delete quotation (Admin only)
router.delete('/:id', authenticate, authorize('Admin'), deleteQuotation);

export default router;
