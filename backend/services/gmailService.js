import { getGmailClient, setCredentials } from '../config/gmail.js';
import { simpleParser } from 'mailparser';

/**
 * Fetch unread messages from Gmail
 */
export const fetchUnreadMessages = async (tokens) => {
    try {
        // Set credentials
        setCredentials(tokens);

        const gmail = getGmailClient();

        // List unread messages
        const response = await gmail.users.messages.list({
            userId: 'me',
            q: 'is:unread',
            maxResults: 10,
        });

        const messages = response.data.messages || [];

        if (messages.length === 0) {
            console.log('📭 No unread messages');
            return [];
        }

        console.log(`📬 Found ${messages.length} unread message(s)`);

        // Fetch full message details
        const fullMessages = [];
        for (const message of messages) {
            const fullMessage = await gmail.users.messages.get({
                userId: 'me',
                id: message.id,
                format: 'raw',
            });

            fullMessages.push({
                id: message.id,
                raw: fullMessage.data.raw,
            });
        }

        return fullMessages;
    } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
    }
};

/**
 * Parse Gmail message
 */
export const parseGmailMessage = async (rawMessage) => {
    try {
        // Decode base64url
        const decoded = Buffer.from(rawMessage, 'base64url').toString('utf-8');

        // Parse with mailparser
        const parsed = await simpleParser(decoded);

        return {
            messageId: parsed.messageId,
            from: parsed.from?.value?.[0],
            subject: parsed.subject,
            text: parsed.text,
            html: parsed.html,
            date: parsed.date,
            attachments: parsed.attachments || [],
        };
    } catch (error) {
        console.error('Error parsing message:', error);
        throw error;
    }
};

/**
 * Mark message as read
 */
export const markAsRead = async (tokens, messageId) => {
    try {
        setCredentials(tokens);
        const gmail = getGmailClient();

        await gmail.users.messages.modify({
            userId: 'me',
            id: messageId,
            requestBody: {
                removeLabelIds: ['UNREAD'],
            },
        });

        console.log(`✅ Marked message ${messageId} as read`);
    } catch (error) {
        console.error('Error marking as read:', error);
    }
};

/**
 * Send email via Gmail API
 */
export const sendGmailMessage = async (tokens, emailData) => {
    try {
        setCredentials(tokens);
        const gmail = getGmailClient();

        // Create email in RFC 2822 format
        const email = [
            `From: ${emailData.from}`,
            `To: ${emailData.to}`,
            `Subject: ${emailData.subject}`,
            '',
            emailData.body,
        ].join('\n');

        // Encode to base64url
        const encodedEmail = Buffer.from(email)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        const response = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedEmail,
            },
        });

        console.log(`✅ Email sent via Gmail API: ${response.data.id}`);
        return response.data;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};
