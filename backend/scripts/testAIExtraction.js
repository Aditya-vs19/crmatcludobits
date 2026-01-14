import { testExtraction } from '../services/aiService.js';

console.log('🧪 Testing Gemini AI Extraction\n');

testExtraction().then(() => {
    console.log('\n✅ Test complete');
    process.exit(0);
}).catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
});
