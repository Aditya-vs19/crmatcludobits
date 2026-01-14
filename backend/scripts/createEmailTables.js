import { db, initDatabase } from '../config/database.js';

console.log('🔧 Creating email tables...');

const createEmailTables = async () => {
    await initDatabase();

    const schema = `
    -- Emails table
    CREATE TABLE IF NOT EXISTS emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id TEXT UNIQUE NOT NULL,
      account TEXT NOT NULL,
      sender_email TEXT NOT NULL,
      sender_name TEXT,
      subject TEXT,
      body_text TEXT,
      body_html TEXT,
      received_at DATETIME NOT NULL,
      processed_at DATETIME,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_emails_account ON emails(account);
    CREATE INDEX IF NOT EXISTS idx_emails_status ON emails(status);
    CREATE INDEX IF NOT EXISTS idx_emails_received_at ON emails(received_at);

    -- Email attachments table
    CREATE TABLE IF NOT EXISTS email_attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      content_type TEXT,
      size INTEGER,
      file_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_attachments_email_id ON email_attachments(email_id);

    -- Extracted data table
    CREATE TABLE IF NOT EXISTS extracted_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email_id INTEGER NOT NULL,
      product_name TEXT,
      quantity INTEGER,
      specifications TEXT,
      confidence_score REAL,
      raw_extraction TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_extracted_data_email_id ON extracted_data(email_id);
  `;

    db.run(schema);
    console.log('✅ Email tables created successfully');
};

createEmailTables().catch(console.error);
