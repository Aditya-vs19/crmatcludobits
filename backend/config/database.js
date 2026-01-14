import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// MySQL connection pool
let pool = null;

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ams_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};

// Initialize MySQL database connection
const initDatabase = async () => {
    try {
        pool = mysql.createPool(dbConfig);

        // Test connection
        const connection = await pool.getConnection();
        console.log('✅ MySQL database connected');
        connection.release();

        return pool;
    } catch (error) {
        console.error('❌ MySQL connection error:', error.message);
        throw error;
    }
};

// Initialize schema
const initSchema = async () => {
    if (!pool) {
        await initDatabase();
    }

    const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('Admin', 'Sales', 'Operations') NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      request_id VARCHAR(50) UNIQUE NOT NULL,
      customer_email VARCHAR(255) NOT NULL,
      requirements TEXT,
      source VARCHAR(50) DEFAULT 'Email',
      funnel_stage ENUM('New', 'Assigned', 'Quoted', 'Closed') DEFAULT 'New',
      priority ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
      assigned_user_id INT,
      email_message_id VARCHAR(255),
      email_references TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (assigned_user_id) REFERENCES users(id),
      INDEX idx_customer_email (customer_email),
      INDEX idx_funnel_stage (funnel_stage),
      INDEX idx_assigned_user (assigned_user_id)
    );

    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      pricing VARCHAR(100),
      availability_notes TEXT,
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id),
      INDEX idx_product_name (name)
    );

    CREATE TABLE IF NOT EXISTS product_specifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      spec_key VARCHAR(100) NOT NULL,
      spec_value VARCHAR(255),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      INDEX idx_product_specs (product_id),
      INDEX idx_spec_key (spec_key)
    );

    CREATE TABLE IF NOT EXISTS quotations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      request_id INT,
      customer_email VARCHAR(255) NOT NULL,
      customer_name VARCHAR(255),
      product_name VARCHAR(255),
      specifications JSON,
      pricing VARCHAR(100),
      quantity INT DEFAULT 1,
      notes TEXT,
      status ENUM('Draft', 'Sent', 'Accepted', 'Rejected') DEFAULT 'Draft',
      subtotal DECIMAL(12,2) DEFAULT 0,
      tax_rate DECIMAL(5,2) DEFAULT 0,
      tax_amount DECIMAL(12,2) DEFAULT 0,
      total_amount DECIMAL(12,2) DEFAULT 0,
      validity_days INT DEFAULT 14,
      sent_at TIMESTAMP NULL,
      sent_by INT,
      email_message_id VARCHAR(255),
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id),
      FOREIGN KEY (sent_by) REFERENCES users(id),
      INDEX idx_quotation_email (customer_email),
      INDEX idx_quotation_status (status)
    );

    CREATE TABLE IF NOT EXISTS quotation_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      quotation_id INT NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      specifications JSON,
      quantity INT DEFAULT 1,
      unit_price DECIMAL(12,2),
      total_price DECIMAL(12,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
      INDEX idx_quotation_items (quotation_id)
    );

    CREATE TABLE IF NOT EXISTS assignment_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      request_id INT NOT NULL,
      assigned_by INT NOT NULL,
      assigned_to INT NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_by) REFERENCES users(id),
      FOREIGN KEY (assigned_to) REFERENCES users(id)
    );
  `;

    try {
        // Split schema into individual statements
        const statements = schema.split(';').filter(s => s.trim());

        for (const statement of statements) {
            if (statement.trim()) {
                await pool.execute(statement);
            }
        }

        console.log('✅ Database schema initialized');
    } catch (error) {
        // Tables may already exist
        if (error.code !== 'ER_TABLE_EXISTS_ERROR') {
            console.error('Schema error:', error.message);
        }
    }
};

// Save database - no-op for MySQL (auto-saves)
const saveDatabase = () => {
    // MySQL auto-saves, this is a no-op
};

// Run query without returning results (INSERT, UPDATE, DELETE)
const run = async (sql, params = []) => {
    if (!pool) throw new Error('Database not initialized');
    try {
        const [result] = await pool.execute(sql, params);
        return result;
    } catch (error) {
        console.error('Query error:', error.message);
        throw error;
    }
};

// Get single row
const get = async (sql, params = []) => {
    if (!pool) throw new Error('Database not initialized');
    try {
        const [rows] = await pool.execute(sql, params);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('Query error:', error.message);
        throw error;
    }
};

// Get all rows
const all = async (sql, params = []) => {
    if (!pool) throw new Error('Database not initialized');
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('Query error:', error.message);
        throw error;
    }
};

// Get pool for raw queries
const getPool = () => pool;

export { pool, initDatabase, initSchema, saveDatabase, run, get, all, getPool };
