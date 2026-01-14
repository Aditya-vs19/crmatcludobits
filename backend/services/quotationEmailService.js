import nodemailer from 'nodemailer';
import { generateQuotationPDF } from './pdfService.js';
import { Quotation } from '../models/Quotation.js';
import { run, get } from '../config/database.js';

/**
 * Create email transporter
 */
const createTransporter = () => {
    // Use environment variables for email configuration
    return nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

/**
 * Get admin email from environment or database
 */
const getAdminEmail = () => {
    return process.env.ADMIN_EMAIL || 'admin@funnelauto.com';
};

/**
 * Send quotation email with PDF attachment
 */
export const sendQuotationEmail = async (quotationId, options = {}) => {
    try {
        // Fetch quotation with items
        const quotation = Quotation.findById(quotationId);
        if (!quotation) {
            throw new Error('Quotation not found');
        }

        // Fetch quotation items
        const items = get(`
            SELECT * FROM quotation_items 
            WHERE quotation_id = ?
            ORDER BY id ASC
        `, [quotationId]);

        const quotationData = {
            ...quotation,
            items: Array.isArray(items) ? items : (items ? [items] : []),
        };

        // Generate PDF
        const pdfBuffer = await generateQuotationPDF(quotationData);

        // Prepare email
        const quotationNumber = `QT-${String(quotationId).padStart(6, '0')}`;
        const adminEmail = getAdminEmail();

        const {
            subject = `Quotation ${quotationNumber} from Funnel Auto`,
            body = `Dear ${quotation.customer_name || 'Valued Customer'},\n\nPlease find attached our quotation ${quotationNumber}.\n\nThis quotation is valid for ${quotation.validity_days || 14} days from the date of issue.\n\nIf you have any questions or would like to proceed with this quotation, please don't hesitate to contact us.\n\nBest regards,\nFunnel Auto Team`,
            ccEmails = [],
            inReplyTo = null,
            references = null,
        } = options;

        // Build CC list (always include admin)
        const ccList = [adminEmail, ...ccEmails].filter((email, index, self) =>
            email && self.indexOf(email) === index
        );

        // Email options
        const mailOptions = {
            from: process.env.SMTP_USER || 'noreply@funnelauto.com',
            to: quotation.customer_email,
            cc: ccList.join(', '),
            subject,
            text: body,
            html: body.replace(/\n/g, '<br>'),
            attachments: [
                {
                    filename: `Quotation_${quotationNumber}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf',
                },
            ],
        };

        // Add email threading headers if provided
        if (inReplyTo) {
            mailOptions.inReplyTo = inReplyTo;
        }
        if (references) {
            mailOptions.references = references;
        }

        // Send email
        const transporter = createTransporter();
        const info = await transporter.sendMail(mailOptions);

        // Update quotation record
        run(`
            UPDATE quotations 
            SET sent_at = CURRENT_TIMESTAMP,
                sent_by = ?,
                status = 'Sent',
                email_message_id = ?
            WHERE id = ?
        `, [options.sentBy || null, info.messageId, quotationId]);

        // Update request funnel stage if request_id exists
        if (quotation.request_id) {
            run(`
                UPDATE requests 
                SET funnel_stage = 'Quoted'
                WHERE id = ?
            `, [quotation.request_id]);
        }

        return {
            success: true,
            messageId: info.messageId,
            quotationNumber,
        };
    } catch (error) {
        console.error('Error sending quotation email:', error);
        throw error;
    }
};

/**
 * Get email thread information from request
 */
export const getEmailThreadInfo = (requestId) => {
    try {
        const request = get('SELECT email_message_id, email_references FROM requests WHERE id = ?', [requestId]);

        if (!request) {
            return null;
        }

        return {
            inReplyTo: request.email_message_id,
            references: request.email_references || request.email_message_id,
        };
    } catch (error) {
        console.error('Error getting email thread info:', error);
        return null;
    }
};
