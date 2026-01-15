import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Extract structured data from email using Gemini AI
 */
export const extractIntent = async (emailBody, emailSubject = '') => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.warn('⚠️  Gemini API key not configured, skipping AI extraction');
            return {
                productName: null,
                quantity: null,
                specifications: null,
                confidenceScore: 0,
                rawExtraction: 'AI extraction disabled - no API key',
            };
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
You are an AI assistant that extracts structured information from customer emails requesting products or services.

Email Subject: ${emailSubject}
Email Body:
${emailBody}

Extract the following information in JSON format:
{
  "productName": "The main product or service being requested (string or null)",
  "quantity": "The number of units requested (integer or null)",
  "specifications": "Any technical specifications, requirements, or details mentioned (object with key-value pairs or null)",
  "confidence": "Your confidence in this extraction from 0.0 to 1.0 (float)"
}

Rules:
- If no product is mentioned, set productName to null
- If no quantity is mentioned, set quantity to null
- Specifications should be an object with keys like "ram", "storage", "processor", etc.
- Be conservative with confidence scores
- Return ONLY valid JSON, no additional text

Example output:
{
  "productName": "Dell PowerEdge R750 Server",
  "quantity": 5,
  "specifications": {
    "ram": "64GB",
    "storage": "2TB SSD",
    "processor": "Dual Xeon"
  },
  "confidence": 0.95
}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON found in AI response');
        }

        const extracted = JSON.parse(jsonMatch[0]);

        return {
            productName: extracted.productName || null,
            quantity: extracted.quantity || null,
            specifications: extracted.specifications ? JSON.stringify(extracted.specifications) : null,
            confidenceScore: extracted.confidence || 0.5,
            rawExtraction: text,
        };
    } catch (error) {
        console.error('❌ AI extraction error:', error.message);
        return {
            productName: null,
            quantity: null,
            specifications: null,
            confidenceScore: 0,
            rawExtraction: `Error: ${error.message}`,
        };
    }
};

/**
 * Test AI extraction with sample email
 */
export const testExtraction = async () => {
    const sampleEmail = `
Subject: Quote Request for Dell Servers

Hi,

We need 5 Dell PowerEdge R750 servers with the following specs:
- 64GB RAM
- 2TB SSD storage
- Dual Xeon processors

Please send quotation ASAP.

Thanks,
John Doe
  `;

    console.log('🧪 Testing AI extraction...\n');
    const result = await extractIntent(sampleEmail, 'Quote Request for Dell Servers');
    console.log('Result:', JSON.stringify(result, null, 2));
};
