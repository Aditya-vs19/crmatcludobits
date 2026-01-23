import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoPath = path.resolve(__dirname, '../../frontend/public/logo.png');

try {
    const bitmap = fs.readFileSync(logoPath);
    const base64 = Buffer.from(bitmap).toString('base64');
    console.log(`data:image/png;base64,${base64}`);
} catch (e) {
    console.error('Error reading logo:', e);
}
