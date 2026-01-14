# Email Ingestion Setup Guide

## Prerequisites

1. **Email Accounts**: Access to admin@company.com, sales@company.com, ops@company.com
2. **IMAP Access**: Enable IMAP on all email accounts
3. **Gemini API Key**: Get from https://makersuite.google.com/app/apikey

## Gmail Setup (if using Gmail)

### 1. Enable IMAP
- Go to Gmail Settings → Forwarding and POP/IMAP
- Enable IMAP access
- Save changes

### 2. Create App Password (if 2FA enabled)
- Go to Google Account → Security
- Enable 2-Step Verification (if not already)
- Go to App Passwords
- Generate password for "Mail" app
- Copy the 16-character password

## Configuration

### 1. Update Backend `.env` File

```bash
cd backend
```

Edit `.env` and add:

```env
# Enable email polling
EMAIL_POLLING_ENABLED=true
EMAIL_POLL_INTERVAL=300000  # 5 minutes

# Admin Account
ADMIN_IMAP_USER=admin@company.com
ADMIN_IMAP_PASSWORD=your-app-password-here

# Sales Account
SALES_IMAP_USER=sales@company.com
SALES_IMAP_PASSWORD=your-app-password-here

# Operations Account
OPS_IMAP_USER=ops@company.com
OPS_IMAP_PASSWORD=your-app-password-here

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key-here
```

### 2. Create Attachments Directory

```bash
mkdir -p uploads/attachments
```

## Testing

### 1. Test Email Connection

Send a test email to one of the configured accounts:

**Subject**: Quote Request for Dell Servers

**Body**:
```
Hi,

We need 5 Dell PowerEdge R750 servers with the following specs:
- 64GB RAM
- 2TB SSD storage
- Dual Xeon processors

Please send quotation.

Thanks,
John Doe
```

### 2. Check Server Logs

The email poller runs every 5 minutes. Watch the logs:

```bash
npm run dev
```

You should see:
```
🚀 Starting email polling (interval: 300000ms)
📥 Checking admin (admin@company.com)...
📬 Found 1 new email(s) for admin
✅ Saved email 1 from john@example.com
🤖 Extracting data with AI for email 1...
✨ Extracted: Dell PowerEdge R750 Server (qty: 5)
```

### 3. Manual Trigger (Admin Only)

You can manually trigger email processing via API:

```bash
curl -X POST http://localhost:5001/api/emails/process \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 4. View Emails

```bash
# Get all emails
curl http://localhost:5001/api/emails \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get email by ID
curl http://localhost:5001/api/emails/1 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get stats
curl http://localhost:5001/api/emails/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### "Authentication failed"
- Check email/password are correct
- For Gmail, use App Password, not regular password
- Verify IMAP is enabled

### "No new emails found"
- Emails must be UNREAD to be processed
- Check spam folder
- Verify email address is correct

### "AI extraction disabled"
- Set GEMINI_API_KEY in .env
- Get key from https://makersuite.google.com/app/apikey
- Restart server after adding key

### "Connection timeout"
- Check firewall settings
- Verify IMAP host and port
- For Gmail: imap.gmail.com:993

## Production Recommendations

1. **Use OAuth2** instead of app passwords for better security
2. **Implement rate limiting** on email processing
3. **Add email deduplication** logic
4. **Set up monitoring** for failed email fetches
5. **Configure backup** for email database
6. **Add webhook support** for real-time processing (Gmail Push Notifications)

## API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/emails` | GET | Required | List all emails with filters |
| `/api/emails/:id` | GET | Required | Get email details |
| `/api/emails/process` | POST | Admin | Manually trigger processing |
| `/api/emails/stats` | GET | Required | Get statistics |

### Query Parameters for `/api/emails`

- `account`: Filter by account (admin/sales/operations)
- `status`: Filter by status (pending/processed)
- `startDate`: Filter from date (ISO format)
- `endDate`: Filter to date (ISO format)
- `limit`: Number of results (default: 50)

## Database Schema

### emails
- `id`: Primary key
- `message_id`: Unique email identifier
- `account`: Which inbox (admin/sales/operations)
- `sender_email`: From address
- `sender_name`: From name
- `subject`: Email subject
- `body_text`: Plain text body
- `body_html`: HTML body
- `received_at`: When email was received
- `processed_at`: When we processed it
- `status`: pending/processed

### email_attachments
- `id`: Primary key
- `email_id`: Foreign key to emails
- `filename`: Original filename
- `content_type`: MIME type
- `size`: File size in bytes
- `file_path`: Path to saved file

### extracted_data
- `id`: Primary key
- `email_id`: Foreign key to emails
- `product_name`: Extracted product
- `quantity`: Extracted quantity
- `specifications`: JSON specs
- `confidence_score`: AI confidence (0-1)
- `raw_extraction`: Full AI response
