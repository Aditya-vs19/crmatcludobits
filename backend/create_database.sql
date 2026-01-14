-- =====================================================
-- AMS Database Schema - Complete Setup Script
-- =====================================================
-- Run this script to create all tables for the AMS system
-- Usage: mysql -u root -p < create_database.sql

-- Create database
CREATE DATABASE IF NOT EXISTS ams_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ams_db;

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('Admin', 'Sales', 'Operations') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. REQUESTS TABLE
-- =====================================================
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
  FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_customer_email (customer_email),
  INDEX idx_funnel_stage (funnel_stage),
  INDEX idx_assigned_user (assigned_user_id),
  INDEX idx_request_id (request_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. PRODUCTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  pricing VARCHAR(100),
  availability_notes TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_product_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. PRODUCT SPECIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS product_specifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  spec_key VARCHAR(100) NOT NULL,
  spec_value VARCHAR(255),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product_specs (product_id),
  INDEX idx_spec_key (spec_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. QUOTATIONS TABLE
-- =====================================================
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
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (sent_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE SET NULL,
  INDEX idx_quotation_email (customer_email),
  INDEX idx_quotation_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. QUOTATION ITEMS TABLE
-- =====================================================
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 7. ASSIGNMENT HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS assignment_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  assigned_by INT NOT NULL,
  assigned_to INT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_request_assignment (request_id),
  INDEX idx_assigned_to (assigned_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 8. EMAILS TABLE (Email Ingestion)
-- =====================================================
CREATE TABLE IF NOT EXISTS emails (
  id INT AUTO_INCREMENT PRIMARY KEY,
  message_id VARCHAR(255) UNIQUE NOT NULL,
  account VARCHAR(255) NOT NULL,
  sender_email VARCHAR(255) NOT NULL,
  sender_name VARCHAR(255),
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  received_at TIMESTAMP NOT NULL,
  status ENUM('pending', 'processed', 'failed') DEFAULT 'pending',
  processed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_message_id (message_id),
  INDEX idx_status (status),
  INDEX idx_account (account),
  INDEX idx_sender_email (sender_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 9. EMAIL ATTACHMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS email_attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  content_type VARCHAR(100),
  size INT,
  file_path TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE,
  INDEX idx_email_attachments (email_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 10. EXTRACTED DATA TABLE (AI Extraction from Emails)
-- =====================================================
CREATE TABLE IF NOT EXISTS extracted_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email_id INT NOT NULL,
  product_name VARCHAR(255),
  quantity INT,
  specifications TEXT,
  confidence_score DECIMAL(5,2),
  raw_extraction TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE,
  INDEX idx_extracted_email (email_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 11. EMAIL FORWARDING LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS email_forwarding_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email_id INT NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  status ENUM('success', 'failed') NOT NULL,
  message_id VARCHAR(255),
  error_message TEXT,
  forwarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE,
  INDEX idx_forwarding_email (email_id),
  INDEX idx_forwarding_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SEED DATA - Initial Admin User
-- =====================================================
-- Email: admin@cludobits.com
-- Password: admin123
-- ⚠️  IMPORTANT: CHANGE THIS PASSWORD IMMEDIATELY AFTER FIRST LOGIN!

INSERT INTO users (email, password, role) VALUES 
('admin@cludobits.com', '$2a$10$o/BuvgWm9i66Q09Wann7leu1JyttM.mpktrHhRcA0xSP.gPuZwEbK', 'Admin')
ON DUPLICATE KEY UPDATE email=email;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify setup:
-- SHOW TABLES;
-- SELECT COUNT(*) as user_count FROM users;
-- SELECT * FROM users;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT 'Database schema created successfully!' as Status;
SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'ams_db';
