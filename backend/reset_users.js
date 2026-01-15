import { initDatabase, run, all } from './config/database.js';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

async function resetUsers() {
    console.log('🔧 Setting up user accounts...\n');

    try {
        // Initialize database connection
        await initDatabase();
        console.log('✅ Database connected\n');

        // Define the 3 users
        const users = [
            { email: 'vedantchandgude1234@gmail.com', role: 'Admin' },
            { email: 'rudrakshwaghmode12@gmail.com', role: 'Sales' },
            { email: 'exploreaditya0@gmail.com', role: 'Operations' },
        ];

        // Hash the password "123"
        const hashedPassword = await bcrypt.hash('123', SALT_ROUNDS);
        console.log('✅ Password hashed\n');

        // First, delete all existing users
        console.log('🗑️  Deleting all existing users...');
        await run('DELETE FROM assignment_history');
        await run('DELETE FROM quotations');
        await run('DELETE FROM users');
        console.log('✅ All existing users deleted\n');

        // Insert new users
        console.log('👥 Creating new users...\n');
        for (const user of users) {
            try {
                await run(
                    'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
                    [user.email, hashedPassword, user.role]
                );
                console.log(`   ✅ Created: ${user.email} (${user.role})`);
            } catch (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    // Update existing user
                    await run(
                        'UPDATE users SET password = ?, role = ? WHERE email = ?',
                        [hashedPassword, user.role, user.email]
                    );
                    console.log(`   🔄 Updated: ${user.email} (${user.role})`);
                } else {
                    throw err;
                }
            }
        }

        // Verify users
        const allUsers = await all('SELECT id, email, role FROM users');
        console.log('\n==============================================');
        console.log('✅ USER SETUP COMPLETE');
        console.log('==============================================\n');
        console.log('Login Credentials:\n');
        allUsers.forEach(u => {
            console.log(`   ${u.role.padEnd(12)} : ${u.email}`);
        });
        console.log(`\n   Password   : 123 (for all users)\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

resetUsers();
