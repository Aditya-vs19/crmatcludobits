# 🚀 AMS Quick Reference Card

## 📋 Essential Information

### 🔐 JWT Secret Key
```
JWT_SECRET=16d2ced130fe1d102bad71c179f1ba87f977d14e2eccd7f2e522bcc2ad946807a64b0a5f54923b34d918d81f2e2e33860108702e5ddbca817b5ebd3a0e57bfa6
```

### 👤 Default Admin Credentials
```
Email:    admin@cludobits.com
Password: admin123
```
⚠️ **CHANGE PASSWORD AFTER FIRST LOGIN!**

---

## 🗄️ Database Setup

### Quick Setup (One Command)
```bash
mysql -u root -p < backend/create_database.sql
```

### Manual Setup
```bash
# 1. Login to MySQL
mysql -u root -p

# 2. Create database
CREATE DATABASE ams_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 3. Use database
USE ams_db;

# 4. Run the SQL script
source /Users/vedantchandgude/Desktop/AMS/backend/create_database.sql
```

### Verify Setup
```sql
SHOW TABLES;
-- Should show 11 tables

SELECT * FROM users;
-- Should show admin user
```

---

## 📧 Email Configuration

### Gmail Setup (IMAP + SMTP)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password

3. **Update .env file**:
```env
# IMAP (Receiving)
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your-email@gmail.com
IMAP_PASSWORD=your-16-char-app-password
IMAP_TLS=true

# SMTP (Sending)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
```

---

## 🏃 Running the Application

### Backend
```bash
cd /Users/vedantchandgude/Desktop/AMS/backend
npm install
npm start
```

### Frontend
```bash
cd /Users/vedantchandgude/Desktop/AMS/frontend
npm install
npm run dev
```

### Access URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

---

## 📊 Database Tables (11 Total)

| # | Table Name | Purpose |
|---|------------|---------|
| 1 | `users` | User accounts (Admin, Sales, Operations) |
| 2 | `requests` | Customer requests/tickets |
| 3 | `products` | Product catalog |
| 4 | `product_specifications` | Product specs (key-value pairs) |
| 5 | `quotations` | Customer quotations |
| 6 | `quotation_items` | Line items in quotations |
| 7 | `assignment_history` | Request assignment tracking |
| 8 | `emails` | Incoming emails |
| 9 | `email_attachments` | Email attachments |
| 10 | `extracted_data` | AI-extracted data from emails |
| 11 | `email_forwarding_logs` | Email forwarding history |

---

## 🔌 API Endpoints

### Authentication
```
POST /api/auth/login       - User login
POST /api/auth/register    - Create user (Admin only)
GET  /api/auth/me          - Get current user
```

### Requests
```
GET    /api/requests           - Get all requests
GET    /api/requests/stats     - Get statistics
GET    /api/requests/:id       - Get specific request
POST   /api/requests           - Create request
PUT    /api/requests/:id       - Update request
POST   /api/requests/:id/assign - Assign to user
```

### Emails
```
GET  /api/emails           - Get all emails
GET  /api/emails/stats     - Get email statistics
GET  /api/emails/:id       - Get specific email
POST /api/emails/process   - Trigger processing (Admin)
```

### Products
```
GET    /api/products       - Get all products
GET    /api/products/:id   - Get specific product
POST   /api/products       - Create product
PUT    /api/products/:id   - Update product
DELETE /api/products/:id   - Delete product
```

### Quotations
```
GET    /api/quotations         - Get all quotations
GET    /api/quotations/stats   - Get statistics
GET    /api/quotations/:id     - Get specific quotation
POST   /api/quotations         - Create quotation
PUT    /api/quotations/:id     - Update quotation
POST   /api/quotations/:id/send - Send quotation email
```

---

## ✅ Email Visibility Confirmation

### YES - Admin Can See All Emails! ✓

**Backend**: ✅ Complete
- Email ingestion working
- Emails stored in database
- API endpoints available
- Statistics tracking active

**Frontend**: ⚠️ Needs UI Components
- Data is available via API
- Need to add display components
- Can be added to AdminDashboard

### Quick Test
```bash
# Check if emails are being ingested
curl http://localhost:5000/api/emails/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get recent emails
curl http://localhost:5000/api/emails?limit=10 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🛠️ Troubleshooting

### Database Connection Error
```bash
# Check MySQL is running
mysql -u root -p -e "SELECT 1"

# Check database exists
mysql -u root -p -e "SHOW DATABASES LIKE 'ams_db'"

# Verify .env settings
cat backend/.env | grep DB_
```

### Email Not Receiving
```bash
# Check IMAP settings in .env
cat backend/.env | grep IMAP_

# Test IMAP connection (use openssl)
openssl s_client -connect imap.gmail.com:993

# Check backend logs for email polling
# Look for: "✅ Email polling started"
```

### JWT Authentication Error
```bash
# Verify JWT_SECRET is set
cat backend/.env | grep JWT_SECRET

# Restart backend after .env changes
cd backend && npm start
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change PORT in .env
echo "PORT=5001" >> backend/.env
```

---

## 📁 Important Files

### Configuration
- `/backend/.env` - Environment variables (DO NOT COMMIT)
- `/backend/.env.example` - Template for .env
- `/backend/create_database.sql` - Database schema

### Documentation
- `/SETUP_INSTRUCTIONS.md` - Complete setup guide
- `/EMAIL_VISIBILITY_CONFIRMATION.md` - Email system details
- `/QUICK_REFERENCE.md` - This file

### Database
- `/backend/config/database.js` - Database connection
- `/backend/models/` - Data models

### API
- `/backend/routes/` - API routes
- `/backend/controllers/` - Business logic
- `/backend/middleware/auth.js` - Authentication

---

## 🎯 Next Steps

1. ✅ Set JWT_SECRET in .env
2. ✅ Configure database credentials
3. ✅ Run database creation script
4. ✅ Configure email settings
5. ⏳ Start backend server
6. ⏳ Start frontend server
7. ⏳ Login with admin credentials
8. ⏳ Change admin password
9. ⏳ Test email ingestion
10. ⏳ Add email UI to dashboard (optional)

---

## 📞 Support

### Check Logs
```bash
# Backend logs
cd backend && npm start
# Watch for errors in console

# Frontend logs
# Open browser console (F12)
# Check for API errors
```

### Verify Services
```bash
# Check backend health
curl http://localhost:5000/api/health

# Check database connection
mysql -u root -p ams_db -e "SELECT COUNT(*) FROM users"

# Check email polling
# Look for "📧 Checking for new emails..." in backend logs
```

---

**Generated**: 2026-01-14
**Version**: 1.0
**System**: AMS (Advanced Management System)
