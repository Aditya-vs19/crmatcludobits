import nodemailer from 'nodemailer';

// Create SMTP transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });
};

/**
 * Forward email to specified recipients
 */
export const forwardEmail = async (emailData, recipients) => {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
            console.warn('⚠️  SMTP not configured, skipping email forwarding');
            return {
                success: false,
                message: 'SMTP not configured',
                recipients: [],
            };
        }

        const transporter = createTransporter();

        // Prepare email content
        const mailOptions = {
            from: `Funnel Automation <${process.env.SMTP_USER}>`,
            to: recipients.join(', '),
            subject: `FWD: ${emailData.subject}`,
            text: `
Forwarded Message
-----------------
From: ${emailData.senderName ? `${emailData.senderName} <${emailData.senderEmail}>` : emailData.senderEmail}
Date: ${new Date(emailData.receivedAt).toLocaleString()}
Subject: ${emailData.subject}

${emailData.bodyText}

---
This email was automatically forwarded by the Funnel Automation System.
Original recipient: ${emailData.account}@company.com
      `.trim(),
            html: emailData.bodyHtml ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <h3 style="margin: 0 0 12px 0; color: #374151;">Forwarded Message</h3>
            <p style="margin: 4px 0;"><strong>From:</strong> ${emailData.senderName ? `${emailData.senderName} &lt;${emailData.senderEmail}&gt;` : emailData.senderEmail}</p>
            <p style="margin: 4px 0;"><strong>Date:</strong> ${new Date(emailData.receivedAt).toLocaleString()}</p>
            <p style="margin: 4px 0;"><strong>Subject:</strong> ${emailData.subject}</p>
            <p style="margin: 4px 0;"><strong>Original Recipient:</strong> ${emailData.account}@company.com</p>
          </div>
          <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px;">
            ${emailData.bodyHtml}
          </div>
          <div style="margin-top: 16px; padding: 12px; background: #fef3c7; border-radius: 8px; font-size: 12px; color: #92400e;">
            ⚠️ This email was automatically forwarded by the Funnel Automation System.
          </div>
        </div>
      ` : undefined,
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);

        console.log(`✅ Email forwarded to ${recipients.length} recipient(s)`);
        console.log(`   Message ID: ${info.messageId}`);

        return {
            success: true,
            messageId: info.messageId,
            recipients,
        };
    } catch (error) {
        console.error('❌ Email forwarding error:', error.message);
        return {
            success: false,
            error: error.message,
            recipients,
        };
    }
};

/**
 * Get forwarding recipients (all departments except the original sender)
 */
export const getForwardingRecipients = (originalAccount) => {
    const allRecipients = [
        process.env.ADMIN_EMAIL,
        process.env.SALES_EMAIL,
        process.env.OPS_EMAIL,
    ].filter(Boolean); // Remove any undefined values

    // Don't forward to the account that received it originally
    const accountEmailMap = {
        'admin': process.env.ADMIN_EMAIL,
        'sales': process.env.SALES_EMAIL,
        'operations': process.env.OPS_EMAIL,
    };

    const originalEmail = accountEmailMap[originalAccount];

    return allRecipients.filter(email => email !== originalEmail);
};
