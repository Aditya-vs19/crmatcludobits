import { Product } from '../models/Product.js';
import { get } from '../config/database.js';

/**
 * Create a new product
 */
export const createProduct = async (req, res) => {
    try {
        const { name, pricing, availabilityNotes, specifications } = req.body;

        // Validation
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Product name is required',
            });
        }

        // Create product
        const product = await Product.create({
            name,
            pricing,
            availabilityNotes,
            specifications: specifications || [],
            createdBy: req.user.id,
        });

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product,
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create product',
        });
    }
};

/**
 * Get all products
 */
export const getAllProducts = async (req, res) => {
    try {
        const { search, limit } = req.query;

        const filters = {};
        if (search) filters.search = search;
        if (limit) filters.limit = parseInt(limit);

        const products = await Product.findAll(filters);

        res.json({
            success: true,
            data: products,
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
        });
    }
};

/**
 * Get products for dropdown
 */
export const getProductsForDropdown = async (req, res) => {
    try {
        const products = await Product.findAllForDropdown();

        res.json({
            success: true,
            data: products,
        });
    } catch (error) {
        console.error('Get products dropdown error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
        });
    }
};

/**
 * Get single product by ID
 */
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        res.json({
            success: true,
            data: product,
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product',
        });
    }
};

/**
 * Update product
 */
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, pricing, availabilityNotes, specifications } = req.body;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        const updates = {};
        if (name !== undefined) updates.name = name;
        if (pricing !== undefined) updates.pricing = pricing;
        if (availabilityNotes !== undefined) updates.availabilityNotes = availabilityNotes;
        if (specifications !== undefined) updates.specifications = specifications;

        const updatedProduct = await Product.update(id, updates);

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct,
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product',
        });
    }
};

/**
 * Delete product
 */
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        await Product.delete(id);

        res.json({
            success: true,
            message: 'Product deleted successfully',
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete product',
        });
    }
};

/**
 * Get product statistics
 */
export const getProductStats = async (req, res) => {
    try {
        const total = (await get('SELECT COUNT(*) as count FROM products'))?.count || 0;

        res.json({
            success: true,
            data: { total },
        });
    } catch (error) {
        console.error('Get product stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product statistics',
        });
    }
};
