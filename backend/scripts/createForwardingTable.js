import { db, initDatabase } from '../config/database.js';

console.log('🔧 Creating forwarding logs table...');

const createForwardingTable = async () => {
    await initDatabase();

    const schema = `
    -- Email forwarding logs table
    CREATE TABLE IF NOT EXISTS email_forwarding_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email_id INTEGER NOT NULL,
      recipient_email TEXT NOT NULL,
      status TEXT NOT NULL,
      message_id TEXT,
      error_message TEXT,
      forwarded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_forwarding_logs_email_id ON email_forwarding_logs(email_id);
    CREATE INDEX IF NOT EXISTS idx_forwarding_logs_status ON email_forwarding_logs(status);
  `;

    db.run(schema);
    console.log('✅ Forwarding logs table created successfully');
};

createForwardingTable().catch(console.error);
