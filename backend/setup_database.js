#!/usr/bin/env node

/**
 * Database Setup Script
 * 
 * This script will help you set up the MySQL database for AMS.
 * It will prompt for MySQL credentials and create the database.
 */

import mysql from 'mysql2/promise';
import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
    console.log('\n==============================================');
    console.log('🚀 AMS Database Setup');
    console.log('==============================================\n');

    console.log('Please enter your MySQL credentials:\n');

    const host = await question('MySQL Host (default: localhost): ') || 'localhost';
    const port = await question('MySQL Port (default: 3306): ') || '3306';
    const user = await question('MySQL User (default: root): ') || 'root';
    const password = await question('MySQL Password (press Enter if none): ');

    console.log('\n==============================================');
    console.log('Testing MySQL connection...');
    console.log('==============================================\n');

    try {
        // Connect to MySQL (without database)
        const connection = await mysql.createConnection({
            host,
            port: parseInt(port),
            user,
            password: password || undefined
        });

        console.log('✅ Successfully connected to MySQL!\n');

        // Create database
        console.log('Creating database ams_db...');
        await connection.query('CREATE DATABASE IF NOT EXISTS ams_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        console.log('✅ Database created!\n');

        // Switch to the database
        await connection.query('USE ams_db');

        // Read and execute SQL file
        console.log('Reading SQL schema file...');
        const sqlFile = fs.readFileSync('./create_database.sql', 'utf8');

        // Split by semicolon and execute each statement
        const statements = sqlFile
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`Executing ${statements.length} SQL statements...\n`);

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.trim()) {
                try {
                    await connection.query(statement);
                    // Show progress for CREATE TABLE statements
                    if (statement.includes('CREATE TABLE')) {
                        const tableName = statement.match(/CREATE TABLE.*?`?(\w+)`?/i)?.[1];
                        console.log(`  ✓ Created table: ${tableName}`);
                    }
                } catch (err) {
                    // Ignore "table already exists" errors
                    if (err.code !== 'ER_TABLE_EXISTS_ERROR') {
                        console.error(`  ✗ Error executing statement: ${err.message}`);
                    }
                }
            }
        }

        console.log('\n✅ All tables created successfully!\n');

        // Verify tables
        const [tables] = await connection.query('SHOW TABLES');
        console.log(`📊 Total tables created: ${tables.length}`);
        console.log('\nTables:');
        tables.forEach((row, index) => {
            const tableName = Object.values(row)[0];
            console.log(`  ${index + 1}. ${tableName}`);
        });

        // Check for admin user
        const [users] = await connection.query('SELECT email, role FROM users');
        console.log(`\n👥 Users in database: ${users.length}`);
        if (users.length > 0) {
            users.forEach(user => {
                console.log(`  - ${user.email} (${user.role})`);
            });
        }

        await connection.end();

        // Update .env file
        console.log('\n==============================================');
        console.log('Updating .env file...');
        console.log('==============================================\n');

        const envPath = './.env';
        let envContent = '';

        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf8');
        } else {
            envContent = fs.readFileSync('./.env.example', 'utf8');
        }

        // Update database credentials
        envContent = envContent
            .replace(/DB_HOST=.*/, `DB_HOST=${host}`)
            .replace(/DB_PORT=.*/, `DB_PORT=${port}`)
            .replace(/DB_USER=.*/, `DB_USER=${user}`)
            .replace(/DB_PASSWORD=.*/, `DB_PASSWORD=${password}`)
            .replace(/DB_NAME=.*/, `DB_NAME=ams_db`);

        fs.writeFileSync(envPath, envContent);
        console.log('✅ .env file updated with database credentials!\n');

        console.log('==============================================');
        console.log('🎉 Database setup complete!');
        console.log('==============================================\n');

        console.log('Next steps:');
        console.log('1. Start the backend server: cd backend && npm start');
        console.log('2. Start the frontend: cd frontend && npm run dev');
        console.log('3. Login with:');
        console.log('   Email: admin@cludobits.com');
        console.log('   Password: admin123');
        console.log('\n⚠️  Remember to change the admin password after first login!\n');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('\nPlease check your MySQL credentials and try again.');
        console.error('If MySQL is not running, start it with:');
        console.error('  brew services start mysql');
        console.error('\nOr if you have an existing MySQL installation:');
        console.error('  sudo /usr/local/mysql/support-files/mysql.server start\n');
    } finally {
        rl.close();
    }
}

main().catch(console.error);
