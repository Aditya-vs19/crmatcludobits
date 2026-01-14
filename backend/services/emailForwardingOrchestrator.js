/**
 * Forward email to all departments (except the one that received it)
 */
const forwardEmailToTeam = async (email) => {
    try {
        // Get recipients (all departments except the original)
        const recipients = getForwardingRecipients(email.account);

        if (recipients.length === 0) {
            console.log('⏭️  No recipients to forward to');
            return;
        }

        console.log(`📤 Forwarding email ${email.id} to ${recipients.length} recipient(s)...`);

        // Check if already forwarded to prevent duplicates
        for (const recipient of recipients) {
            const alreadyForwarded = ForwardingLog.wasForwarded(email.id, recipient);

            if (alreadyForwarded) {
                console.log(`⏭️  Already forwarded to ${recipient}, skipping`);
                continue;
            }

            // Forward to this recipient
            const result = await forwardEmail({
                subject: email.subject,
                senderEmail: email.sender_email,
                senderName: email.sender_name,
                bodyText: email.body_text,
                bodyHtml: email.body_html,
                receivedAt: email.received_at,
                account: email.account,
            }, [recipient]);

            // Log the forwarding attempt
            ForwardingLog.create({
                emailId: email.id,
                recipientEmail: recipient,
                status: result.success ? 'success' : 'failed',
                messageId: result.messageId,
                errorMessage: result.error,
            });

            if (result.success) {
                console.log(`✅ Forwarded to ${recipient}`);
            } else {
                console.error(`❌ Failed to forward to ${recipient}: ${result.error}`);
            }
        }
    } catch (error) {
        console.error('❌ Error in forwarding process:', error);
    }
};

export { forwardEmailToTeam };
