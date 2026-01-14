import { db, initDatabase } from '../config/database.js';

console.log('🔧 Creating requests table...');

const createRequestsTable = async () => {
    await initDatabase();

    const schema = `
    -- Requests table
    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id TEXT UNIQUE NOT NULL,
      email_id INTEGER NOT NULL,
      customer_email TEXT NOT NULL,
      customer_name TEXT,
      subject TEXT,
      requirements TEXT,
      original_content TEXT,
      funnel_stage TEXT DEFAULT 'New',
      assigned_user_id INTEGER,
      priority TEXT DEFAULT 'Medium',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_requests_stage ON requests(funnel_stage);
    CREATE INDEX IF NOT EXISTS idx_requests_assigned ON requests(assigned_user_id);
    CREATE INDEX IF NOT EXISTS idx_requests_customer ON requests(customer_email);
    CREATE INDEX IF NOT EXISTS idx_requests_created ON requests(created_at);
  `;

    db.run(schema);
    console.log('✅ Requests table created successfully');
};

createRequestsTable().catch(console.error);
