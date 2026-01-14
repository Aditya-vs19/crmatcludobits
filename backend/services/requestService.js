import { Request } from '../models/Request.js';
import { ExtractedData } from '../models/Email.js';

/**
 * Convert email to request
 */
export const createRequestFromEmail = async (email) => {
    try {
        // Check if request already exists for this email
        const existing = Request.findAll({ limit: 1000 }).find(r => r.email_id === email.id);
        if (existing) {
            console.log(`⏭️  Request already exists for email ${email.id}`);
            return existing;
        }

        // Get extracted data
        const extractedData = ExtractedData.findByEmailId(email.id);

        // Determine requirements text
        let requirements = '';
        if (extractedData && extractedData.product_name) {
            requirements = `${extractedData.product_name}`;
            if (extractedData.quantity) {
                requirements += ` (Qty: ${extractedData.quantity})`;
            }
            if (extractedData.specifications) {
                const specs = JSON.parse(extractedData.specifications);
                const specsList = Object.entries(specs).map(([key, value]) => `${key}: ${value}`).join(', ');
                requirements += ` - Specs: ${specsList}`;
            }
        } else {
            // Fallback to email subject or body excerpt
            requirements = email.subject || email.body_text?.substring(0, 200) || 'Manual review required';
        }

        // Determine priority based on keywords or AI confidence
        let priority = 'Medium';
        const urgentKeywords = ['urgent', 'asap', 'immediately', 'critical'];
        const highKeywords = ['important', 'priority', 'soon'];

        const textToCheck = `${email.subject} ${email.body_text}`.toLowerCase();

        if (urgentKeywords.some(keyword => textToCheck.includes(keyword))) {
            priority = 'Urgent';
        } else if (highKeywords.some(keyword => textToCheck.includes(keyword))) {
            priority = 'High';
        } else if (extractedData && extractedData.confidence_score > 0.8) {
            priority = 'Medium';
        } else {
            priority = 'Low';
        }

        // Create request
        const request = Request.create({
            emailId: email.id,
            customerEmail: email.sender_email,
            customerName: email.sender_name,
            subject: email.subject,
            requirements,
            originalContent: email.body_text,
            funnelStage: 'New',
            priority,
        });

        console.log(`✅ Created request ${request.request_id} from email ${email.id}`);
        return request;
    } catch (error) {
        console.error('❌ Error creating request from email:', error);
        throw error;
    }
};
