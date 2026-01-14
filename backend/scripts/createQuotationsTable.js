import { db, initDatabase, saveDatabase } from '../config/database.js';

console.log('🔧 Creating quotations table...');

const createQuotationsTable = async () => {
    await initDatabase();

    const schema = `
    -- Quotations table
    CREATE TABLE IF NOT EXISTS quotations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id TEXT,
      customer_email TEXT NOT NULL,
      customer_name TEXT,
      product_name TEXT NOT NULL,
      specifications TEXT,
      pricing TEXT,
      quantity INTEGER DEFAULT 1,
      notes TEXT,
      status TEXT DEFAULT 'Draft',
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_quotations_customer ON quotations(customer_email);
    CREATE INDEX IF NOT EXISTS idx_quotations_request ON quotations(request_id);
    CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
    CREATE INDEX IF NOT EXISTS idx_quotations_created_by ON quotations(created_by);
  `;

    db.run(schema);
    saveDatabase();
    console.log('✅ Quotations table created successfully');
};

createQuotationsTable().catch(console.error);
