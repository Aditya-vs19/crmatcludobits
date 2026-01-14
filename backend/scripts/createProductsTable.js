import { db, initDatabase, saveDatabase } from '../config/database.js';

console.log('🔧 Creating products tables...');

const createProductsTable = async () => {
    await initDatabase();

    const schema = `
    -- Products table
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      pricing TEXT,
      availability_notes TEXT,
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Product specifications table (key-value pairs)
    CREATE TABLE IF NOT EXISTS product_specifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      spec_key TEXT NOT NULL,
      spec_value TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
    CREATE INDEX IF NOT EXISTS idx_products_created_by ON products(created_by);
    CREATE INDEX IF NOT EXISTS idx_product_specs_product_id ON product_specifications(product_id);
    CREATE INDEX IF NOT EXISTS idx_product_specs_key ON product_specifications(spec_key);
  `;

    db.run(schema);
    saveDatabase();
    console.log('✅ Products tables created successfully');
};

createProductsTable().catch(console.error);
