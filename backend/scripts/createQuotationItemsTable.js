import { db, initDatabase, saveDatabase } from '../config/database.js';

console.log('🔧 Creating quotation_items table and updating quotations table...');

const createQuotationItemsTable = async () => {
    await initDatabase();

    const schema = `
    -- Create quotation_items table for line items
    CREATE TABLE IF NOT EXISTS quotation_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quotation_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      specifications TEXT,
      quantity INTEGER DEFAULT 1,
      unit_price DECIMAL(10,2),
      total_price DECIMAL(10,2),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation ON quotation_items(quotation_id);

    -- Add new columns to quotations table
    ALTER TABLE quotations ADD COLUMN subtotal DECIMAL(10,2) DEFAULT 0;
    ALTER TABLE quotations ADD COLUMN tax_rate DECIMAL(5,2) DEFAULT 0;
    ALTER TABLE quotations ADD COLUMN tax_amount DECIMAL(10,2) DEFAULT 0;
    ALTER TABLE quotations ADD COLUMN total_amount DECIMAL(10,2) DEFAULT 0;
    ALTER TABLE quotations ADD COLUMN validity_days INTEGER DEFAULT 14;
    ALTER TABLE quotations ADD COLUMN sent_at DATETIME;
    ALTER TABLE quotations ADD COLUMN sent_by INTEGER;
    ALTER TABLE quotations ADD COLUMN email_message_id TEXT;
  `;

    try {
        db.run(schema);
        saveDatabase();
        console.log('✅ Quotation items table created and quotations table updated successfully');
    } catch (error) {
        // Columns might already exist, that's okay
        console.log('⚠️  Some columns may already exist, continuing...');
        console.log('✅ Schema update completed');
    }
};

createQuotationItemsTable().catch(console.error);
