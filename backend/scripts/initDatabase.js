import { initDatabase, initSchema, getPool } from '../config/database.js';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

console.log('🔧 Initializing MySQL database...\n');

const seedUsers = async () => {
    const pool = getPool();

    // Check if users already exist
    const [existingUsers] = await pool.execute('SELECT COUNT(*) as count FROM users');

    if (existingUsers[0].count > 0) {
        console.log('ℹ️  Users already exist, skipping seed');
        return;
    }

    const users = [
        { email: 'admin@company.com', password: 'Admin123!', role: 'Admin' },
        { email: 'sales@company.com', password: 'Sales123!', role: 'Sales' },
        { email: 'ops@company.com', password: 'Ops123!', role: 'Operations' },
    ];

    for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
        await pool.execute(
            'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
            [user.email, hashedPassword, user.role]
        );
        console.log(`✅ Created user: ${user.email} (${user.role})`);
    }
};

const init = async () => {
    try {
        // Initialize database connection
        await initDatabase();
        console.log('✅ Database connected\n');

        // Initialize schema
        await initSchema();
        console.log('✅ Schema initialized\n');

        // Seed users
        await seedUsers();
        console.log('\n✅ Database initialization complete!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Initialization failed:', error.message);
        process.exit(1);
    }
};

init();
