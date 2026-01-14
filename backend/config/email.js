export const emailConfig = {
    accounts: [
        {
            name: 'admin',
            email: process.env.ADMIN_EMAIL || 'admin@company.com',
            imap: {
                host: process.env.ADMIN_IMAP_HOST || 'imap.gmail.com',
                port: parseInt(process.env.ADMIN_IMAP_PORT || '993'),
                user: process.env.ADMIN_IMAP_USER || 'admin@company.com',
                password: process.env.ADMIN_IMAP_PASSWORD || '',
                tls: true,
                tlsOptions: { rejectUnauthorized: false },
            },
        },
        {
            name: 'sales',
            email: process.env.SALES_EMAIL || 'sales@company.com',
            imap: {
                host: process.env.SALES_IMAP_HOST || 'imap.gmail.com',
                port: parseInt(process.env.SALES_IMAP_PORT || '993'),
                user: process.env.SALES_IMAP_USER || 'sales@company.com',
                password: process.env.SALES_IMAP_PASSWORD || '',
                tls: true,
                tlsOptions: { rejectUnauthorized: false },
            },
        },
        {
            name: 'operations',
            email: process.env.OPS_EMAIL || 'ops@company.com',
            imap: {
                host: process.env.OPS_IMAP_HOST || 'imap.gmail.com',
                port: parseInt(process.env.OPS_IMAP_PORT || '993'),
                user: process.env.OPS_IMAP_USER || 'ops@company.com',
                password: process.env.OPS_IMAP_PASSWORD || '',
                tls: true,
                tlsOptions: { rejectUnauthorized: false },
            },
        },
    ],

    polling: {
        interval: parseInt(process.env.EMAIL_POLL_INTERVAL || '300000'), // 5 minutes
        enabled: process.env.EMAIL_POLLING_ENABLED !== 'false',
    },

    attachments: {
        directory: process.env.ATTACHMENTS_DIR || './uploads/attachments',
        maxSize: parseInt(process.env.MAX_ATTACHMENT_SIZE || '10485760'), // 10MB
    },
};
