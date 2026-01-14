# MySQL Setup Guide for AMS

## ✅ MySQL Installation Complete!

MySQL 9.5 has been successfully installed via Homebrew.

---

## 🔐 MySQL Password Setup

MySQL 9.5 may have set a temporary root password during installation. Here's how to access MySQL:

### Option 1: Find the Temporary Password

Check the MySQL error log for the temporary password:

```bash
cat /opt/homebrew/var/mysql/$(hostname).err | grep 'temporary password'
```

### Option 2: Reset MySQL Root Password

If you can't find the password, reset it:

```bash
# 1. Stop MySQL
brew services stop mysql

# 2. Start MySQL in safe mode (skip grant tables)
mysqld_safe --skip-grant-tables &

# 3. Wait 5 seconds, then connect
sleep 5
mysql -u root

# 4. In MySQL prompt, run:
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_new_password';
FLUSH PRIVILEGES;
EXIT;

# 5. Kill the safe mode process
killall mysqld

# 6. Start MySQL normally
brew services start mysql

# 7. Test connection
mysql -u root -p
# Enter your new password when prompted
```

### Option 3: Use No Password (Development Only)

For development, you can set an empty password:

```bash
# After connecting to MySQL (using Option 2 above)
ALTER USER 'root'@'localhost' IDENTIFIED BY '';
FLUSH PRIVILEGES;
```

---

## 🗄️ Create AMS Database

Once you can connect to MySQL, create the database:

### Method 1: Using the SQL Script

```bash
# If you set a password
mysql -u root -p < backend/create_database.sql

# If no password
mysql -u root < backend/create_database.sql
```

### Method 2: Manual Creation

```bash
# Connect to MySQL
mysql -u root -p

# In MySQL prompt:
CREATE DATABASE ams_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ams_db;
SOURCE /Users/vedantchandgude/Desktop/AMS/backend/create_database.sql;
EXIT;
```

### Method 3: Copy-Paste SQL

```bash
# Connect to MySQL
mysql -u root -p

# Then copy and paste the contents of backend/create_database.sql
```

---

## 🔧 Update Your .env File

After setting up MySQL, update your `backend/.env` file:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=ams_db
```

**Important**: 
- If you set no password, leave `DB_PASSWORD=` empty
- If you set a password, put it in `DB_PASSWORD=your_password`

---

## ✅ Verify Database Setup

```bash
# Connect to MySQL
mysql -u root -p

# Check database exists
SHOW DATABASES LIKE 'ams_db';

# Check tables
USE ams_db;
SHOW TABLES;
# Should show 11 tables

# Check admin user
SELECT * FROM users;
# Should show admin@cludobits.com

# Exit
EXIT;
```

---

## 🚀 Alternative: Use SQLite (Simpler for Development)

If MySQL is giving you trouble, you can use SQLite instead (no installation needed):

### 1. Update database.js

Edit `/backend/config/database.js` to use SQLite instead of MySQL.

### 2. Update .env

```env
# Comment out MySQL settings
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=
# DB_NAME=ams_db

# Use SQLite
DB_TYPE=sqlite
DB_PATH=./database.sqlite
```

### 3. Install SQLite package

```bash
cd backend
npm install better-sqlite3
```

**Note**: Your current code is already set up for MySQL, so this would require some modifications.

---

## 🛠️ Troubleshooting

### Can't Connect to MySQL

```bash
# Check if MySQL is running
brew services list | grep mysql

# Restart MySQL
brew services restart mysql

# Check MySQL logs
tail -f /opt/homebrew/var/mysql/$(hostname).err
```

### "Access Denied" Error

This means you need the correct password. Try Option 2 above to reset it.

### Port Already in Use

```bash
# Check what's using port 3306
lsof -i :3306

# Kill the process if needed
kill -9 <PID>
```

---

## 📝 Quick Commands Reference

```bash
# Start MySQL
brew services start mysql

# Stop MySQL
brew services stop mysql

# Restart MySQL
brew services restart mysql

# Connect to MySQL (with password)
mysql -u root -p

# Connect to MySQL (no password)
mysql -u root

# Run SQL file
mysql -u root -p < file.sql

# Check MySQL status
brew services list | grep mysql
```

---

## 🎯 Next Steps

1. ✅ MySQL installed
2. ⏳ Set MySQL root password
3. ⏳ Create ams_db database
4. ⏳ Run create_database.sql
5. ⏳ Update backend/.env with DB credentials
6. ⏳ Start backend server
7. ⏳ Test connection

---

## 💡 Recommended Approach

For the quickest setup, I recommend:

1. **Set a simple password** for development (e.g., "root" or "password")
2. **Update .env** with that password
3. **Run the SQL script** to create tables
4. **Start your backend** and test

Example:
```bash
# 1. Set password to 'root'
mysql -u root
# In MySQL: ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';

# 2. Update .env
echo "DB_PASSWORD=root" >> backend/.env

# 3. Create database
mysql -u root -proot < backend/create_database.sql

# 4. Start backend
cd backend && npm start
```

---

Need help? Let me know which option you'd like to try!
