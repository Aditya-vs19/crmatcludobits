import bcrypt from 'bcryptjs';
import { initDatabase, run } from './config/database.js';

async function updateUsers() {
    try {
        console.log('🔄 Updating users...');

        // Initialize database connection
        await initDatabase();

        // Hash the password "123"
        const hashedPassword = await bcrypt.hash('123', 10);
        console.log('✅ Password hashed');

        // Clear existing users
        await run('DELETE FROM users');
        console.log('✅ Cleared existing users');

        // Insert new users
        const users = [
            { email: 'vedantchandgude1234@gmail.com', role: 'Admin' },
            { email: 'rudrakshwaghmode12@gmail.com', role: 'Sales' },
            { email: 'exploreaditya0@gmail.com', role: 'Operations' }
        ];

        for (const user of users) {
            await run(
                'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
                [user.email, hashedPassword, user.role]
            );
            console.log(`✅ Created ${user.role} user: ${user.email}`);
        }

        console.log('\n✅ All users updated successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Admin:      vedantchandgude1234@gmail.com');
        console.log('Sales:      rudrakshwaghmode12@gmail.com');
        console.log('Operations: exploreaditya0@gmail.com');
        console.log('Password:   123 (for all users)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating users:', error);
        process.exit(1);
    }
}

updateUsers();
