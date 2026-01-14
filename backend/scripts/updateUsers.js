import { initDatabase, initSchema } from '../config/database.js';
import { User } from '../models/User.js';

console.log('🔧 Updating user accounts...');

const updateUsers = async () => {
    await initDatabase();
    await initSchema();

    // Give it a moment to ensure everything is setup
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = [
        {
            email: 'vedantchandgude1234@gmail.com',
            password: '123',
            role: 'Admin',
        },
        {
            email: 'rudrakshwaghmode12@gmail.com',
            password: '123',
            role: 'Sales',
        },
        {
            email: 'exploreaditya0@gmail.com',
            password: '123',
            role: 'Operations',
        },
    ];

    try {
        for (const userData of users) {
            // Check if user exists
            const existing = User.findByEmail(userData.email);

            if (existing) {
                console.log(`ℹ️  User ${userData.email} already exists, skipping`);
            } else {
                await User.create(userData);
                console.log(`✅ Created user: ${userData.email} / ${userData.password} (${userData.role})`);
            }
        }

        console.log('\n✨ User accounts ready!\n');
        console.log('Login credentials:');
        console.log('  Admin: vedantchandgude1234@gmail.com / 123');
        console.log('  Sales: rudrakshwaghmode12@gmail.com / 123');
        console.log('  Operations: exploreaditya0@gmail.com / 123');
    } catch (error) {
        console.error('❌ Error updating users:', error);
    }
};

updateUsers();
