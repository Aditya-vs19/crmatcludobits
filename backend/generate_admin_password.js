import bcrypt from 'bcryptjs';

/**
 * Generate Admin User Password Hash
 * 
 * This script generates a bcrypt hash for the admin password
 * Run: node generate_admin_password.js
 */

const password = 'admin123'; // Change this to your desired password
const saltRounds = 10;

async function generateHash() {
    try {
        const hash = await bcrypt.hash(password, saltRounds);

        console.log('\n==============================================');
        console.log('Admin Password Hash Generated Successfully!');
        console.log('==============================================\n');
        console.log('Password:', password);
        console.log('Hash:', hash);
        console.log('\n==============================================');
        console.log('SQL Insert Statement:');
        console.log('==============================================\n');
        console.log(`INSERT INTO users (email, password, role) VALUES`);
        console.log(`('admin@cludobits.com', '${hash}', 'Admin');`);
        console.log('\n==============================================');
        console.log('⚠️  IMPORTANT: Change this password after first login!');
        console.log('==============================================\n');

    } catch (error) {
        console.error('Error generating hash:', error);
    }
}

generateHash();
