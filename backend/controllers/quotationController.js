import { Quotation } from '../models/Quotation.js';
import { Product } from '../models/Product.js';
import { all } from '../config/database.js';

/**
 * Create a new quotation
 */
export const createQuotation = async (req, res) => {
    try {
        const {
            requestId,
            customerEmail,
            customerName,
            productName,
            specifications,
            pricing,
            quantity,
            notes,
            status,
            autoSaveProduct,
        } = req.body;

        // Validation
        if (!customerEmail || !productName) {
            return res.status(400).json({
                success: false,
                message: 'Customer email and product name are required',
            });
        }

        // If autoSaveProduct is true and product doesn't exist, create it
        if (autoSaveProduct) {
            const existingProducts = await Product.findAll({ search: productName });
            const exactMatch = existingProducts.find(p => p.name.toLowerCase() === productName.toLowerCase());

            if (!exactMatch) {
                // Create new product
                await Product.create({
                    name: productName,
                    pricing: pricing || '',
                    availabilityNotes: '',
                    specifications: specifications || [],
                    createdBy: req.user.id,
                });
            } else if (specifications && specifications.length > 0) {
                // Product exists, but check if we need to add new specifications
                const existingProduct = await Product.findById(exactMatch.id);
                const existingSpecKeys = existingProduct.specifications.map(s => s.spec_key.toLowerCase());

                for (const spec of specifications) {
                    if (!existingSpecKeys.includes(spec.key.toLowerCase())) {
                        // Add new specification to existing product
                        await Product.addSpecification(exactMatch.id, spec.key, spec.value);
                    }
                }
            }
        }

        // Create quotation
        const quotation = await Quotation.create({
            requestId,
            customerEmail,
            customerName,
            productName,
            specifications,
            pricing,
            quantity,
            notes,
            status,
            createdBy: req.user.id,
        });

        res.status(201).json({
            success: true,
            message: 'Quotation created successfully',
            data: quotation,
        });
    } catch (error) {
        console.error('Create quotation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create quotation',
        });
    }
};

/**
 * Get all quotations
 */
export const getAllQuotations = async (req, res) => {
    try {
        const { customerEmail, status, search, limit } = req.query;

        const filters = {};
        if (customerEmail) filters.customerEmail = customerEmail;
        if (status) filters.status = status;
        if (search) filters.search = search;
        if (limit) filters.limit = parseInt(limit);

        const quotations = await Quotation.findAll(filters);

        res.json({
            success: true,
            data: quotations,
        });
    } catch (error) {
        console.error('Get quotations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch quotations',
        });
    }
};

/**
 * Get single quotation by ID
 */
export const getQuotationById = async (req, res) => {
    try {
        const { id } = req.params;

        const quotation = await Quotation.findById(id);

        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found',
            });
        }

        res.json({
            success: true,
            data: quotation,
        });
    } catch (error) {
        console.error('Get quotation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch quotation',
        });
    }
};

/**
 * Get quotations by request ID
 */
export const getQuotationsByRequestId = async (req, res) => {
    try {
        const { requestId } = req.params;

        const quotations = await Quotation.findByRequestId(requestId);

        res.json({
            success: true,
            data: quotations,
        });
    } catch (error) {
        console.error('Get quotations by request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch quotations',
        });
    }
};

/**
 * Update quotation
 */
export const updateQuotation = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const quotation = await Quotation.findById(id);
        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found',
            });
        }

        const updatedQuotation = await Quotation.update(id, updates);

        res.json({
            success: true,
            message: 'Quotation updated successfully',
            data: updatedQuotation,
        });
    } catch (error) {
        console.error('Update quotation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update quotation',
        });
    }
};

/**
 * Delete quotation
 */
export const deleteQuotation = async (req, res) => {
    try {
        const { id } = req.params;

        const quotation = await Quotation.findById(id);
        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found',
            });
        }

        await Quotation.delete(id);

        res.json({
            success: true,
            message: 'Quotation deleted successfully',
        });
    } catch (error) {
        console.error('Delete quotation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete quotation',
        });
    }
};

/**
 * Get quotation statistics
 */
export const getQuotationStats = async (req, res) => {
    try {
        const stats = await Quotation.getStats();

        res.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        console.error('Get quotation stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch quotation statistics',
        });
    }
};

/**
 * Get unique specification keys for dropdown suggestions
 */
export const getSpecificationKeys = async (req, res) => {
    try {
        // Get all unique specification keys from product_specifications table
        const keys = await all(`
            SELECT DISTINCT spec_key 
            FROM product_specifications 
            ORDER BY spec_key ASC
        `);

        res.json({
            success: true,
            data: keys.map(k => k.spec_key),
        });
    } catch (error) {
        console.error('Get specification keys error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch specification keys',
        });
    }
};

/**
 * Get specification values for a given key
 */
export const getSpecificationValues = async (req, res) => {
    try {
        const { key } = req.params;

        // Get all unique values for this specification key
        const values = await all(`
            SELECT DISTINCT spec_value 
            FROM product_specifications 
            WHERE spec_key = ?
            ORDER BY spec_value ASC
        `, [key]);

        res.json({
            success: true,
            data: values.map(v => v.spec_value),
        });
    } catch (error) {
        console.error('Get specification values error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch specification values',
        });
    }
};

/**
 * Add item to quotation
 */
export const addQuotationItem = async (req, res) => {
    try {
        const { id } = req.params;
        const itemData = req.body;

        const quotation = await Quotation.findById(id);
        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found',
            });
        }

        const item = await Quotation.addItem(id, itemData);

        res.status(201).json({
            success: true,
            message: 'Item added successfully',
            data: item,
        });
    } catch (error) {
        console.error('Add quotation item error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add item',
        });
    }
};

/**
 * Get quotation items
 */
export const getQuotationItems = async (req, res) => {
    try {
        const { id } = req.params;

        const items = await Quotation.getItems(id);

        res.json({
            success: true,
            data: items,
        });
    } catch (error) {
        console.error('Get quotation items error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch items',
        });
    }
};

/**
 * Update quotation item
 */
export const updateQuotationItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const updates = req.body;

        const item = await Quotation.updateItem(itemId, updates);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found',
            });
        }

        res.json({
            success: true,
            message: 'Item updated successfully',
            data: item,
        });
    } catch (error) {
        console.error('Update quotation item error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update item',
        });
    }
};

/**
 * Delete quotation item
 */
export const deleteQuotationItem = async (req, res) => {
    try {
        const { itemId } = req.params;

        const success = await Quotation.deleteItem(itemId);

        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'Item not found',
            });
        }

        res.json({
            success: true,
            message: 'Item deleted successfully',
        });
    } catch (error) {
        console.error('Delete quotation item error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete item',
        });
    }
};

/**
 * Calculate quotation totals
 */
export const calculateQuotationTotals = async (req, res) => {
    try {
        const { id } = req.params;
        const { taxRate = 0 } = req.body;

        const quotation = await Quotation.findById(id);
        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found',
            });
        }

        const totals = await Quotation.calculateTotals(id, taxRate);

        res.json({
            success: true,
            data: totals,
        });
    } catch (error) {
        console.error('Calculate totals error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to calculate totals',
        });
    }
};

/**
 * Generate PDF for quotation
 */
export const generatePDF = async (req, res) => {
    try {
        const { id } = req.params;
        const { generateQuotationPDF } = await import('../services/pdfService.js');

        const quotation = await Quotation.findById(id);
        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found',
            });
        }

        const items = await Quotation.getItems(id);
        const quotationData = { ...quotation, items };

        const pdfBuffer = await generateQuotationPDF(quotationData);

        const quotationNumber = `QT-${String(id).padStart(6, '0')}`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Quotation_${quotationNumber}.pdf"`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Generate PDF error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate PDF',
        });
    }
};

/**
 * Get HTML preview of quotation
 */
export const getQuotationPreview = async (req, res) => {
    try {
        const { id } = req.params;
        const { generateQuotationHTML } = await import('../services/pdfService.js');

        const quotation = await Quotation.findById(id);
        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found',
            });
        }

        const items = await Quotation.getItems(id);
        const quotationData = { ...quotation, items };

        const html = generateQuotationHTML(quotationData);

        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } catch (error) {
        console.error('Get quotation preview error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate preview',
        });
    }
};

/**
 * Send quotation via email
 */
export const sendQuotationViaEmail = async (req, res) => {
    try {
        const { id } = req.params;
        const { subject, body, ccEmails = [] } = req.body;
        const { sendQuotationEmail, getEmailThreadInfo } = await import('../services/quotationEmailService.js');

        const quotation = await Quotation.findById(id);
        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found',
            });
        }

        // Get email thread info if quotation is linked to a request
        let threadInfo = null;
        if (quotation.request_id) {
            threadInfo = await getEmailThreadInfo(quotation.request_id);
        }

        const result = await sendQuotationEmail(id, {
            subject,
            body,
            ccEmails,
            sentBy: req.user.id,
            inReplyTo: threadInfo?.inReplyTo,
            references: threadInfo?.references,
        });

        res.json({
            success: true,
            message: 'Quotation sent successfully',
            data: result,
        });
    } catch (error) {
        console.error('Send quotation email error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to send quotation',
        });
    }
};
