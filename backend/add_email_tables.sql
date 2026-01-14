-- Email-related tables for AMS
-- Run this to add email ingestion capabilities

USE ams_db;

-- 1. EMAILS TABLE (Email Ingestion)
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

-- 2. EMAIL ATTACHMENTS TABLE
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

-- 3. EXTRACTED DATA TABLE (AI Extraction from Emails)
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

-- 4. EMAIL FORWARDING LOGS TABLE
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

SELECT 'Email tables created successfully!' as Status;
