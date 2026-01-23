import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate professional quotation HTML
 */
export const generateQuotationHTML = (quotationData) => {
    const {
        id,
        reference_number,
        customer_name,
        customer_company,
        customer_address,
        customer_email,
        attention_to,
        subject,
        items = [],
        subtotal = 0,
        tax_rate = 0,
        tax_amount = 0,
        total_amount = 0,
        notes = '',
        payment_terms,
        gstin = '27AAFCC6898N1ZQ', // Default from image
        freight,
        warranty_terms,
        delivery,
        validity_date,
        created_at,
        quantity,
        product_name,
        pricing,
        specifications,
        unit_price
    } = quotationData;

    // Logo handling
    let logoSrc = '';
    try {
        const logoPath = path.resolve(__dirname, '../../frontend/public/logo.png');
        if (fs.existsSync(logoPath)) {
            const logoBase64 = fs.readFileSync(logoPath, 'base64');
            logoSrc = `data:image/png;base64,${logoBase64}`;
        }
    } catch (e) {
        console.error('Error loading logo:', e);
    }

    // Date formatting
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        // Format: 26th Nov 2025
        const day = d.getDate();
        const month = d.toLocaleString('en-US', { month: 'short' });
        const year = d.getFullYear();

        let suffix = 'th';
        if (day === 1 || day === 21 || day === 31) suffix = 'st';
        else if (day === 2 || day === 22) suffix = 'nd';
        else if (day === 3 || day === 23) suffix = 'rd';

        return `${day}<sup>${suffix}</sup> ${month} ${year}`;
    };

    const quotationDate = formatDate(created_at);
    const validUntil = formatDate(validity_date);

    // Currency formatting
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount || 0);
    };

    // Prepare single item logic if items array is empty (backward compatibility with single product quotes)
    let displayItems = items;
    if (!items || items.length === 0) {
        // Construct item from main quotation fields
        let specsHtml = '';
        if (specifications && Array.isArray(specifications)) {
            specsHtml = specifications.map(s => `${s.value}`).join(' / ');
        }

        displayItems = [{
            product_name: product_name,
            description: specsHtml, // Can be improved
            quantity: quantity,
            unit_price: parseFloat(pricing) || 0, // Assuming pricing field holds unit price in some contexts or we need a unit_price field
            total_price: subtotal || (quantity * (parseFloat(pricing) || 0))
        }];

        // If we have strict fields like unit_price in updated model, use them
        if (quotationData.unit_rate) { // Assuming unit_rate might be passed
            // Actually, the new fields didn't include unit_rate in the top level SQL, but `pricing` was there.
            // The frontend sends `unitRate`.
        }
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Quotation ${reference_number || id}</title>
    <style>
        body {
            font-family: Calibri, 'Segoe UI', sans-serif;
            font-size: 11pt;
            color: #000;
            padding: 40px;
            max-width: 900px;
            margin: 0 auto;
        }
        .header-table {
            width: 100%;
            margin-bottom: 20px;
        }
        .logo {
            max-width: 250px;
            max-height: 80px;
        }
        .contact-info {
            text-align: right;
            font-size: 10pt;
            color: #008da8; /* Teal color from logo */
        }
        .contact-info a {
            color: #008da8;
            text-decoration: none;
            display: block;
        }
        .doc-title {
            text-align: center;
            font-weight: bold;
            font-size: 16pt;
            margin: 20px 0;
            text-decoration: underline;
        }
        .meta-info {
            margin-bottom: 20px;
            line-height: 1.4;
        }
        .recipient-section {
            margin-bottom: 20px;
            line-height: 1.4;
        }
        .subject-line {
            font-weight: bold;
            margin: 15px 0;
        }
        .attn-line {
            font-weight: bold;
            margin-bottom: 15px;
        }
        .order-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .order-table th {
            background-color: #fca570; /* Orange-ish color from image */
            border: 1px solid #777;
            padding: 8px;
            text-align: center;
            font-weight: bold;
        }
        .order-table td {
            border: 1px solid #777;
            padding: 8px;
            vertical-align: top;
        }
        .order-table td.center { text-align: center; }
        .order-table td.right { text-align: right; }
        
        .footer-total {
            background-color: #fca570;
            font-weight: bold;
            text-align: right;
        }
        .terms-section {
            margin-top: 30px;
        }
        .terms-table {
            width: 100%;
            border: none;
        }
        .terms-table td {
            padding: 3px 0;
            vertical-align: top;
            border: none;
        }
        .term-label {
            width: 150px;
        }
        .highlight {
            background-color: yellow;
            padding: 0 5px;
            font-weight: bold;
        }
        .footer-sign {
            margin-top: 40px;
        }
        .company-name {
            font-weight: bold;
        }
    </style>
</head>
<body>

    <table class="header-table">
        <tr>
            <td valign="top">
                ${logoSrc ? `<img src="${logoSrc}" class="logo" alt="CludoBits">` : '<h1>CludoBits</h1>'}
            </td>
            <td valign="top" class="contact-info">
                <a href="http://www.cludobits.com">www.cludobits.com</a>
                <a href="mailto:info@cludobits.com">info@cludobits.com</a>
            </td>
        </tr>
    </table>

    <div class="doc-title">Quotation</div>

    <div class="meta-info">
        <strong>Date:</strong> ${quotationDate}<br>
        <strong>Ref. No.</strong> ${reference_number || ''}
    </div>

    <div class="recipient-section">
        <strong>To,</strong><br>
        <strong>${customer_company || customer_name || ''}</strong><br>
        <div style="white-space: pre-wrap;">${customer_address || ''}</div>
    </div>

    <div class="subject-line">SUB: ${subject || 'Proposal'}</div>

    ${attention_to ? `<div class="attn-line">Kindly Attn: ${attention_to}</div>` : ''}

    <div>Dear Sir,</div>
    <div style="margin-top: 10px; margin-bottom: 20px;">
        We thank you for your enquiry. With reference to your requirement of same, we are pleased
        to submit our best offer for the same.
    </div>

    <table class="order-table">
        <thead>
            <tr>
                <th style="width: 50px;">Sr. No</th>
                <th>Description</th>
                <th style="width: 50px;">Qty</th>
                <th style="width: 100px;">Unit Rate</th>
                <th style="width: 120px;">Sub Total</th>
            </tr>
        </thead>
        <tbody>
            ${displayItems.map((item, index) => {
        // Parse specs if needed (though backend might convert)
        let specs = item.specifications;
        if (typeof specs === 'string') {
            try { specs = JSON.parse(specs); } catch (e) { specs = []; }
        }
        const specText = Array.isArray(specs) ? specs.map(s => `${s.key}: ${s.value}`).join(' / ') : '';
        const desc = `<strong>${item.product_name}</strong><br>${item.description || specText || ''}`;

        return `
                <tr>
                    <td class="center">${index + 1}</td>
                    <td>${desc}</td>
                    <td class="center">${item.quantity}</td>
                    <td class="right">${formatCurrency(item.unit_price || (parseFloat(pricing)))}</td>
                    <td class="right">${formatCurrency(item.total_price || subtotal)}</td>
                </tr>
                `;
    }).join('')}
            <tr>
                <td colspan="4" class="footer-total">Total (INR)</td>
                <td class="footer-total right">${formatCurrency(total_amount || subtotal)}</td>
            </tr>
        </tbody>
    </table>

    <div class="terms-section">
        <strong>TERMS & CONDITIONS:</strong>
        <table class="terms-table" style="margin-top: 10px;">
            <tr>
                <td class="term-label">1. Payment:</td>
                <td><strong>${payment_terms || '100% Advance Against PO'}</strong></td>
            </tr>
            <tr>
                <td class="term-label">2. Taxes:</td>
                <td>${tax_rate > 0 ? `${tax_rate}% GST Extra` : '18% GST Extra'}</td>
            </tr>
            <tr>
                <td class="term-label">3. Freight:</td>
                <td>${freight || 'Extra At Actual'}</td>
            </tr>
            <tr>
                <td class="term-label">4. Warranty Terms:</td>
                <td>${warranty_terms || 'As Per Offer'}</td>
            </tr>
            <tr>
                <td class="term-label">5. Delivery:</td>
                <td>${delivery || 'Within 1 - 2 Weeks'}</td>
            </tr>
            <tr>
                <td class="term-label">6. Validity :</td>
                <td><span class="highlight">Till ${validUntil}</span></td>
            </tr>
        </table>
    </div>

    ${gstin ? `<div style="margin-top: 30px;"><strong>GSTIN NO</strong>-${gstin}</div>` : ''}

    <div style="margin-top: 20px;">
        We immensely value your patronage & looking forward to long term association with you.<br>
        Please feel free to call us for any further information.
    </div>

    <div class="footer-sign">
        Thanking you,<br><br>
        For <strong class="company-name">CludoBits IT Solutions Pvt. Ltd.</strong><br>
        <br><br>
        <div style="font-weight: bold;">Authorized Signatory</div>
    </div>

</body>
</html>
    `.trim();
};

/**
 * Generate PDF from quotation data
 */
export const generateQuotationPDF = async (quotationData) => {
    const html = generateQuotationHTML(quotationData);

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px',
            },
        });

        return pdfBuffer;
    } finally {
        await browser.close();
    }
};
