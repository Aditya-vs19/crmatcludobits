import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate professional quotation HTML
 */
export const generateQuotationHTML = (quotationData) => {
    const {
        id,
        customer_name,
        customer_email,
        items = [],
        subtotal = 0,
        tax_rate = 0,
        tax_amount = 0,
        total_amount = 0,
        notes = '',
        validity_days = 14,
        created_at,
    } = quotationData;

    const quotationNumber = `QT-${String(id).padStart(6, '0')}`;
    const quotationDate = new Date(created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const validUntil = new Date(created_at);
    validUntil.setDate(validUntil.getDate() + validity_days);
    const validUntilStr = validUntil.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount || 0);
    };

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quotation ${quotationNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 40px 20px;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 60px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            padding-bottom: 30px;
            border-bottom: 3px solid #3b82f6;
        }
        
        .company-info h1 {
            font-size: 28px;
            color: #3b82f6;
            margin-bottom: 10px;
        }
        
        .company-info p {
            color: #666;
            font-size: 14px;
        }
        
        .quotation-info {
            text-align: right;
        }
        
        .quotation-title {
            font-size: 32px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
        }
        
        .quotation-number {
            font-size: 18px;
            color: #666;
            margin-bottom: 5px;
        }
        
        .quotation-date {
            font-size: 14px;
            color: #888;
        }
        
        .customer-section {
            margin-bottom: 40px;
        }
        
        .section-title {
            font-size: 14px;
            font-weight: 600;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
        }
        
        .customer-details {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
        }
        
        .customer-details p {
            margin-bottom: 5px;
            font-size: 15px;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        
        .items-table thead {
            background: #1e40af;
            color: white;
        }
        
        .items-table th {
            padding: 15px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .items-table th:last-child,
        .items-table td:last-child {
            text-align: right;
        }
        
        .items-table tbody tr {
            border-bottom: 1px solid #e5e7eb;
        }
        
        .items-table tbody tr:hover {
            background: #f9fafb;
        }
        
        .items-table td {
            padding: 15px;
            font-size: 14px;
        }
        
        .product-name {
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 5px;
        }
        
        .specifications {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
        }
        
        .spec-item {
            margin-bottom: 3px;
        }
        
        .spec-key {
            font-weight: 600;
            color: #555;
        }
        
        .totals-section {
            margin-top: 30px;
            display: flex;
            justify-content: flex-end;
        }
        
        .totals-table {
            width: 350px;
        }
        
        .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            font-size: 15px;
        }
        
        .totals-row.subtotal {
            border-top: 1px solid #e5e7eb;
        }
        
        .totals-row.total {
            border-top: 2px solid #1e40af;
            margin-top: 10px;
            padding-top: 15px;
            font-size: 20px;
            font-weight: bold;
            color: #1e40af;
        }
        
        .totals-label {
            font-weight: 600;
        }
        
        .notes-section {
            margin-top: 40px;
            padding: 20px;
            background: #fffbeb;
            border-left: 4px solid #f59e0b;
            border-radius: 4px;
        }
        
        .notes-section h3 {
            font-size: 16px;
            color: #92400e;
            margin-bottom: 10px;
        }
        
        .notes-section p {
            font-size: 14px;
            color: #78350f;
            line-height: 1.8;
        }
        
        .terms-section {
            margin-top: 40px;
            padding-top: 30px;
            border-top: 2px solid #e5e7eb;
        }
        
        .terms-section h3 {
            font-size: 16px;
            color: #1e40af;
            margin-bottom: 15px;
        }
        
        .terms-section ul {
            list-style-position: inside;
            color: #666;
            font-size: 13px;
            line-height: 2;
        }
        
        .footer {
            margin-top: 50px;
            padding-top: 30px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #888;
            font-size: 12px;
        }
        
        .validity-badge {
            display: inline-block;
            background: #dcfce7;
            color: #166534;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="company-info">
                <h1>Funnel Auto</h1>
                <p>Advanced Management System</p>
                <p>Email: admin@funnelauto.com</p>
            </div>
            <div class="quotation-info">
                <div class="quotation-title">QUOTATION</div>
                <div class="quotation-number">${quotationNumber}</div>
                <div class="quotation-date">${quotationDate}</div>
                <div class="validity-badge">Valid Until: ${validUntilStr}</div>
            </div>
        </div>
        
        <div class="customer-section">
            <div class="section-title">Bill To</div>
            <div class="customer-details">
                ${customer_name ? `<p><strong>${customer_name}</strong></p>` : ''}
                <p>${customer_email}</p>
            </div>
        </div>
        
        <table class="items-table">
            <thead>
                <tr>
                    <th>Product</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: right;">Unit Price</th>
                    <th style="text-align: right;">Total</th>
                </tr>
            </thead>
            <tbody>
                ${items.map(item => {
        const specs = typeof item.specifications === 'string'
            ? JSON.parse(item.specifications)
            : item.specifications || [];

        return `
                    <tr>
                        <td>
                            <div class="product-name">${item.product_name}</div>
                            ${specs.length > 0 ? `
                                <div class="specifications">
                                    ${specs.map(spec => `
                                        <div class="spec-item">
                                            <span class="spec-key">${spec.key}:</span> ${spec.value}
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </td>
                        <td style="text-align: center;">${item.quantity}</td>
                        <td style="text-align: right;">${formatCurrency(item.unit_price)}</td>
                        <td style="text-align: right;">${formatCurrency(item.total_price)}</td>
                    </tr>
                    `;
    }).join('')}
            </tbody>
        </table>
        
        <div class="totals-section">
            <div class="totals-table">
                <div class="totals-row subtotal">
                    <span class="totals-label">Subtotal:</span>
                    <span>${formatCurrency(subtotal)}</span>
                </div>
                ${tax_rate > 0 ? `
                    <div class="totals-row">
                        <span class="totals-label">Tax (${tax_rate}%):</span>
                        <span>${formatCurrency(tax_amount)}</span>
                    </div>
                ` : ''}
                <div class="totals-row total">
                    <span class="totals-label">TOTAL:</span>
                    <span>${formatCurrency(total_amount)}</span>
                </div>
            </div>
        </div>
        
        ${notes ? `
            <div class="notes-section">
                <h3>Notes</h3>
                <p>${notes.replace(/\n/g, '<br>')}</p>
            </div>
        ` : ''}
        
        <div class="terms-section">
            <h3>Terms & Conditions</h3>
            <ul>
                <li>This quotation is valid for ${validity_days} days from the date of issue</li>
                <li>Prices are subject to change without prior notice</li>
                <li>Payment terms: Net 30 days from invoice date</li>
                <li>Delivery timeline will be confirmed upon order confirmation</li>
                <li>All products come with standard manufacturer warranty</li>
            </ul>
        </div>
        
        <div class="footer">
            <p>Thank you for your business!</p>
            <p>For any questions, please contact us at admin@funnelauto.com</p>
        </div>
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
