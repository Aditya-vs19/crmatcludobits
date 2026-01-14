# 🔐 Credentials & Verification Guide

## 1. Login Credentials

I have reset all passwords to `admin123` for your convenience.

| Dashboard | Email | Password |
|-----------|-------|----------|
| **Admin** | `admin@cludobits.com` | `admin123` |
| **Sales** | `sales@company.com` | `admin123` |
| **Operations** | `ops@company.com` | `admin123` |

> ⚠️ **Security Warning**: Please change these passwords after you successfully login!

---

## 2. How to Verify Email Ingestion

To verify that emails are appearing in the dashboard, follow these steps:

### Step 1: Configure Email Credentials (REQUIRED)
You must add your Gmail App Password to `backend/.env` for this to work.

1. Open `backend/.env`
2. Find `ADMIN_IMAP_PASSWORD=` (Line 22)
3. Paste your 16-character Gmail App Password there
   - *If you don't have one, go to Google Account > Security > 2-Step Verification > App Passwords*

### Step 2: Restart Backend
After updating the `.env` file, you must restart the backend server:

```bash
# In the backend terminal
Ctrl+C
npm start
```

### Step 3: Send a Test Email
1. Open your personal email (e.g., Yahoo, Outlook, or another Gmail)
2. Send an email to: `vedantchandgude1234@gmail.com`
   - **Subject**: "Test Request for Laptop"
   - **Body**: "Hi, I need a quote for 5 MacBook Pros."

### Step 4: Verify in Dashboard
1. Login to the **Admin Dashboard** (`admin@cludobits.com`)
2. Look at the **"Recent Emails"** table at the bottom
3. Creating the email might take up to 5 minutes (default polling interval)
   - *Tip: To check instantly, restart the backend server again - it polls immediately on startup.*
4. You should see your email appear in the list with status `Pending` or `Processed`!

### Troubleshooting
- **No emails appearing?** Check the backend terminal logs. It should say `📧 Checking for new emails...`
- **Authentication failed?** Check that your IMAP password is correct and 2FA is enabled on the Gmail account.
