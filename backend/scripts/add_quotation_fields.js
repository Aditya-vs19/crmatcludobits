import { initDatabase, run } from '../config/database.js';

const migrate = async () => {
    try {
        await initDatabase();
        console.log('Starting migration...');

        const columns = [
            'ADD COLUMN reference_number VARCHAR(100) AFTER request_id',
            'ADD COLUMN customer_company VARCHAR(255) AFTER customer_name',
            'ADD COLUMN customer_address TEXT AFTER customer_company',
            'ADD COLUMN attention_to VARCHAR(255) AFTER customer_address',
            'ADD COLUMN subject VARCHAR(255) AFTER attention_to',
            'ADD COLUMN payment_terms VARCHAR(255) AFTER notes',
            'ADD COLUMN freight VARCHAR(255) AFTER payment_terms',
            'ADD COLUMN warranty_terms VARCHAR(255) AFTER freight',
            'ADD COLUMN delivery VARCHAR(255) AFTER warranty_terms',
            'ADD COLUMN validity_date DATE AFTER validity_days',
            'ADD COLUMN gstin VARCHAR(50) AFTER validity_date'
        ];

        for (const col of columns) {
            try {
                await run(`ALTER TABLE quotations ${col}`);
                console.log(`Executed: ${col}`);
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log(`Column already exists: ${col.split(' ')[2]}`);
                } else {
                    throw err;
                }
            }
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
