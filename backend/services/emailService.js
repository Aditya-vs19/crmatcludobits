import Imap from 'imap';
import { simpleParser } from 'mailparser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Email, EmailAttachment } from '../models/Email.js';
import { extractIntent } from './aiService.js';
import { forwardEmailToTeam } from './emailForwardingOrchestrator.js';
import { createRequestFromEmail } from './requestService.js';
import { emailConfig } from '../config/email.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Ensure attachments directory exists
 */
const ensureAttachmentsDir = () => {
    const dir = path.join(__dirname, '..', emailConfig.attachments.directory);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
};

/**
 * Connect to IMAP server and fetch new emails
 */
export const fetchNewEmails = (accountConfig) => {
    return new Promise((resolve, reject) => {
        const imap = new Imap(accountConfig.imap);
        const emails = [];

        imap.once('ready', () => {
            imap.openBox('INBOX', false, (err, box) => {
                if (err) {
                    reject(err);
                    return;
                }

                // Search for unseen emails
                imap.search(['UNSEEN'], (err, results) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    if (!results || results.length === 0) {
                        console.log(`📭 No new emails for ${accountConfig.name}`);
                        imap.end();
                        resolve([]);
                        return;
                    }

                    console.log(`📬 Found ${results.length} new email(s) for ${accountConfig.name}`);

                    const fetch = imap.fetch(results, { bodies: '', markSeen: true });

                    fetch.on('message', (msg, seqno) => {
                        let buffer = '';

                        msg.on('body', (stream, info) => {
                            stream.on('data', (chunk) => {
                                buffer += chunk.toString('utf8');
                            });
                        });

                        msg.once('end', () => {
                            emails.push(buffer);
                        });
                    });

                    fetch.once('error', (err) => {
                        console.error('Fetch error:', err);
                        reject(err);
                    });

                    fetch.once('end', () => {
                        imap.end();
                    });
                });
            });
        });

        imap.once('error', (err) => {
            console.error(`IMAP error for ${accountConfig.name}:`, err);
            reject(err);
        });

        imap.once('end', () => {
            resolve(emails);
        });

        imap.connect();
    });
};

/**
 * Parse raw email and save to database
 */
export const parseAndSaveEmail = async (rawEmail, accountName) => {
    try {
        const parsed = await simpleParser(rawEmail);

        // Check if email already exists
        const existing = Email.findByMessageId(parsed.messageId);
        if (existing) {
            console.log(`⏭️  Email ${parsed.messageId} already processed`);
            return existing;
        }

        // Create email record
        const emailData = {
            messageId: parsed.messageId || `generated-${Date.now()}`,
            account: accountName,
            senderEmail: parsed.from?.value?.[0]?.address || 'unknown',
            senderName: parsed.from?.value?.[0]?.name || null,
            subject: parsed.subject || '(No Subject)',
            bodyText: parsed.text || '',
            bodyHtml: parsed.html || '',
            receivedAt: parsed.date ? parsed.date.toISOString() : new Date().toISOString(),
        };

        const email = Email.create(emailData);
        console.log(`✅ Saved email ${email.id} from ${emailData.senderEmail}`);

        // Save attachments
        if (parsed.attachments && parsed.attachments.length > 0) {
            const attachmentsDir = ensureAttachmentsDir();

            for (const attachment of parsed.attachments) {
                const filename = attachment.filename || `attachment-${Date.now()}`;
                const filePath = path.join(attachmentsDir, `${email.id}-${filename}`);

                fs.writeFileSync(filePath, attachment.content);

                EmailAttachment.create({
                    emailId: email.id,
                    filename,
                    contentType: attachment.contentType,
                    size: attachment.size,
                    filePath,
                });

                console.log(`📎 Saved attachment: ${filename}`);
            }
        }

        // Extract data using AI
        console.log(`🤖 Extracting data with AI for email ${email.id}...`);
        const extracted = await extractIntent(emailData.bodyText, emailData.subject);

        if (extracted.productName || extracted.quantity) {
            const { ExtractedData } = await import('../models/Email.js');
            ExtractedData.create({
                emailId: email.id,
                ...extracted,
            });

            console.log(`✨ Extracted: ${extracted.productName} (qty: ${extracted.quantity})`);
        }

        // Update status
        Email.updateStatus(email.id, 'processed');

        // Forward email to other departments
        await forwardEmailToTeam(email);

        // Create Request from Email
        await createRequestFromEmail(email);

        return email;
    } catch (error) {
        console.error('❌ Error parsing email:', error);
        throw error;
    }
};

/**
 * Process all accounts
 */
export const processAllAccounts = async () => {
    console.log('\n🔄 Starting email processing for all accounts...\n');

    const results = [];

    for (const account of emailConfig.accounts) {
        try {
            if (!account.imap.password) {
                console.log(`⏭️  Skipping ${account.name} - no password configured`);
                continue;
            }

            console.log(`📥 Checking ${account.name} (${account.email})...`);
            const rawEmails = await fetchNewEmails(account);

            for (const rawEmail of rawEmails) {
                const email = await parseAndSaveEmail(rawEmail, account.name);
                results.push(email);
            }
        } catch (error) {
            console.error(`❌ Error processing ${account.name}:`, error.message);
        }
    }

    console.log(`\n✅ Processing complete. Processed ${results.length} email(s)\n`);
    return results;
};
