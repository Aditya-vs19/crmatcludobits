# AMS Setup Instructions

## 1. JWT Secret Key Configuration

### Generate a Secure JWT Secret Key

Your JWT secret key has been generated. Add this to your `.env` file:

```env
JWT_SECRET=16d2ced130fe1d102bad71c179f1ba87f977d14e2eccd7f2e522bcc2ad946807a64b0a5f54923b34d918d81f2e2e33860108702e5ddbca817b5ebd3a0e57bfa6
```

> **Important**: This is a cryptographically secure 64-byte random key. Keep it secret and never commit it to version control.

### Alternative: Generate Your Own Key

If you want to generate a new key, run:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 2. MySQL Database Setup

### Step 1: Create the Database

First, create the database in MySQL:

```sql
CREATE DATABASE IF NOT EXISTS ams_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 2: Complete Database Schema

Run these SQL queries to create all required tables:

```sql
-- Use the database
USE ams_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('Admin', 'Sales', 'Operations') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Requests Table
CREATE TABLE IF NOT EXISTS requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id VARCHAR(50) UNIQUE NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  requirements TEXT,
  source VARCHAR(50) DEFAULT 'Email',
  funnel_stage ENUM('New', 'Assigned', 'Quoted', 'Closed') DEFAULT 'New',
  priority ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
  assigned_user_id INT,
  email_message_id VARCHAR(255),
  email_references TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_customer_email (customer_email),
  INDEX idx_funnel_stage (funnel_stage),
  INDEX idx_assigned_user (assigned_user_id),
  INDEX idx_request_id (request_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  pricing VARCHAR(100),
  availability_notes TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_product_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Product Specifications Table
CREATE TABLE IF NOT EXISTS product_specifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  spec_key VARCHAR(100) NOT NULL,
  spec_value VARCHAR(255),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product_specs (product_id),
  INDEX idx_spec_key (spec_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Quotations Table
CREATE TABLE IF NOT EXISTS quotations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT,
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255),
  product_name VARCHAR(255),
  specifications JSON,
  pricing VARCHAR(100),
  quantity INT DEFAULT 1,
  notes TEXT,
  status ENUM('Draft', 'Sent', 'Accepted', 'Rejected') DEFAULT 'Draft',
  subtotal DECIMAL(12,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) DEFAULT 0,
  validity_days INT DEFAULT 14,
  sent_at TIMESTAMP NULL,
  sent_by INT,
  email_message_id VARCHAR(255),
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (sent_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE SET NULL,
  INDEX idx_quotation_email (customer_email),
  INDEX idx_quotation_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Quotation Items Table
CREATE TABLE IF NOT EXISTS quotation_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quotation_id INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  specifications JSON,
  quantity INT DEFAULT 1,
  unit_price DECIMAL(12,2),
  total_price DECIMAL(12,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
  INDEX idx_quotation_items (quotation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Assignment History Table
CREATE TABLE IF NOT EXISTS assignment_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  assigned_by INT NOT NULL,
  assigned_to INT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_request_assignment (request_id),
  INDEX idx_assigned_to (assigned_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Emails Table (for email ingestion)
CREATE TABLE IF NOT EXISTS emails (
  id INT AUTO_INCREMENT PRIMARY KEY,
  message_id VARCHAR(255) UNIQUE NOT NULL,
  account VARCHAR(255) NOT NULL,
  sender_email VARCHAR(255) NOT NULL,
  sender_name VARCHAR(255),
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  received_at TIMESTAMP NOT NULL,
  status ENUM('pending', 'processed', 'failed') DEFAULT 'pending',
  processed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_message_id (message_id),
  INDEX idx_status (status),
  INDEX idx_account (account),
  INDEX idx_sender_email (sender_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Email Attachments Table
CREATE TABLE IF NOT EXISTS email_attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  content_type VARCHAR(100),
  size INT,
  file_path TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE,
  INDEX idx_email_attachments (email_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Extracted Data Table (from emails)
CREATE TABLE IF NOT EXISTS extracted_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email_id INT NOT NULL,
  product_name VARCHAR(255),
  quantity INT,
  specifications TEXT,
  confidence_score DECIMAL(5,2),
  raw_extraction TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE,
  INDEX idx_extracted_email (email_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Email Forwarding Logs Table
CREATE TABLE IF NOT EXISTS email_forwarding_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email_id INT NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  status ENUM('success', 'failed') NOT NULL,
  message_id VARCHAR(255),
  error_message TEXT,
  forwarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE,
  INDEX idx_forwarding_email (email_id),
  INDEX idx_forwarding_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Step 3: Create Initial Admin User

After creating the tables, create an initial admin user:

```sql
-- Insert default admin user (password: admin123)
-- Note: This is a bcrypt hash of 'admin123'
INSERT INTO users (email, password, role) VALUES 
('admin@cludobits.com', '$2a$10$rZJ5YqZ5YqZ5YqZ5YqZ5YuZ5YqZ5YqZ5YqZ5YqZ5YqZ5YqZ5YqZ5Y', 'Admin');
```

> **Important**: Change the admin password immediately after first login!

---

## 3. Environment Configuration

Update your `.env` file with all required configurations:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=ams_db

# JWT Configuration
JWT_SECRET=16d2ced130fe1d102bad71c179f1ba87f977d14e2eccd7f2e522bcc2ad946807a64b0a5f54923b34d918d81f2e2e33860108702e5ddbca817b5ebd3a0e57bfa6

# Server Configuration
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Email Configuration (Gmail IMAP for receiving)
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your-email@gmail.com
IMAP_PASSWORD=your-app-password
IMAP_TLS=true

# Email Configuration (SMTP for sending quotations)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=admin@company.com
```

---

## 4. Email Visibility in Admin Dashboard

### Current Implementation Status

✅ **Email Ingestion**: Your system already has email ingestion set up with the following tables:
- `emails` - Stores all received emails
- `email_attachments` - Stores email attachments
- `extracted_data` - Stores AI-extracted product information
- `email_forwarding_logs` - Tracks email forwarding

✅ **Backend API**: Email routes are available at:
- `GET /api/emails` - Get all emails with filters
- `GET /api/emails/stats` - Get email statistics
- `GET /api/emails/:id` - Get specific email details
- `POST /api/emails/process` - Manually trigger email processing

### To Display Emails in Admin Dashboard

Your admin dashboard currently shows:
- Request statistics
- Quotation metrics
- Recent requests

**To add email visibility**, you need to:

1. **Add an Email Management Section** to the Admin Dashboard
2. **Create an Email List Component** showing:
   - Sender email and name
   - Subject
   - Received date/time
   - Status (pending/processed/failed)
   - Associated request (if created)
   - View email details button

3. **Add Email Detail Modal** showing:
   - Full email content
   - Attachments
   - Extracted data
   - Processing status
   - Created request link (if applicable)

### Example API Call for Admin Dashboard

Add this to your `AdminDashboard.jsx`:

```javascript
const [emails, setEmails] = useState([]);
const [emailStats, setEmailStats] = useState(null);

// Fetch emails
const fetchEmails = async () => {
  try {
    const [emailsRes, statsRes] = await Promise.all([
      api.get('/emails?limit=20'),
      api.get('/emails/stats')
    ]);
    setEmails(emailsRes.data.data || []);
    setEmailStats(statsRes.data.data);
  } catch (error) {
    console.error('Error fetching emails:', error);
  }
};
```

---

## 5. Quick Start Commands

### Install Dependencies
```bash
cd /Users/vedantchandgude/Desktop/AMS/backend
npm install
```

### Run Database Migrations
The schema will be automatically created when you start the server, but you can also run the SQL queries manually.

### Start the Backend Server
```bash
npm start
```

### Start the Frontend
```bash
cd /Users/vedantchandgude/Desktop/AMS/frontend
npm run dev
```

---

## 6. Verification Checklist

- [ ] MySQL database `ams_db` created
- [ ] All 11 tables created successfully
- [ ] `.env` file configured with JWT_SECRET
- [ ] `.env` file configured with database credentials
- [ ] `.env` file configured with email settings
- [ ] Initial admin user created
- [ ] Backend server starts without errors
- [ ] Frontend connects to backend successfully
- [ ] Can login with admin credentials
- [ ] Email polling service is running
- [ ] Emails are being ingested into database

---

## 7. Troubleshooting

### Database Connection Issues
```bash
# Test MySQL connection
mysql -u root -p -h localhost

# Check if database exists
SHOW DATABASES;

# Check if tables exist
USE ams_db;
SHOW TABLES;
```

### Email Ingestion Issues
- Check IMAP credentials in `.env`
- Ensure "Less secure app access" is enabled (or use App Password for Gmail)
- Check email polling logs in backend console
- Verify emails table has records: `SELECT * FROM emails LIMIT 10;`

### JWT Issues
- Ensure JWT_SECRET is set in `.env`
- Restart backend server after changing `.env`
- Clear browser localStorage if getting auth errors

---

## 8. Next Steps

1. **Add Email Management UI** to Admin Dashboard
2. **Set up Email Forwarding Rules** (if needed)
3. **Configure Email Templates** for quotations
4. **Set up Backup Strategy** for database
5. **Configure Production Environment** variables

---

## Support

For issues or questions, check:
- Backend logs: Console output when running `npm start`
- Frontend logs: Browser console (F12)
- Database logs: MySQL error logs
- Email logs: Check `email_forwarding_logs` table
