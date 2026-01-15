// IMAP Debug Test Script
import Imap from 'imap';
import 'dotenv/config';

const testIMAP = async () => {
    console.log('🔧 Testing IMAP connection...');
    console.log(`📧 Account: ${process.env.ADMIN_IMAP_USER}`);
    console.log(`🔑 Password length: ${process.env.ADMIN_IMAP_PASSWORD?.length || 0}`);

    const imap = new Imap({
        host: process.env.ADMIN_IMAP_HOST || 'imap.gmail.com',
        port: parseInt(process.env.ADMIN_IMAP_PORT || '993'),
        user: process.env.ADMIN_IMAP_USER,
        password: process.env.ADMIN_IMAP_PASSWORD,
        tls: true,
        tlsOptions: { rejectUnauthorized: false },
    });

    imap.once('ready', () => {
        console.log('✅ IMAP connected!');

        imap.openBox('INBOX', false, (err, box) => {
            if (err) {
                console.error('❌ Error opening INBOX:', err.message);
                imap.end();
                return;
            }

            console.log(`📬 Inbox has ${box.messages.total} total messages`);
            console.log(`📭 ${box.messages.new} new messages`);

            // Search for UNSEEN emails
            imap.search(['UNSEEN'], (err, unseenResults) => {
                if (err) {
                    console.error('❌ Error searching UNSEEN:', err.message);
                } else {
                    console.log(`👁️  Found ${unseenResults?.length || 0} UNSEEN emails`);
                }

                // Also search for ALL recent emails (last 24 hours)
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);

                imap.search([['SINCE', yesterday]], (err, recentResults) => {
                    if (err) {
                        console.error('❌ Error searching recent:', err.message);
                    } else {
                        console.log(`📅 Found ${recentResults?.length || 0} emails from last 24 hours`);

                        if (recentResults && recentResults.length > 0) {
                            console.log('\n📨 Recent email IDs:', recentResults.slice(0, 5).join(', '));
                        }
                    }

                    imap.end();
                });
            });
        });
    });

    imap.once('error', (err) => {
        console.error('❌ IMAP connection error:', err.message);
        if (err.message.includes('authenticate')) {
            console.log('\n💡 TIP: Make sure:');
            console.log('   1. IMAP is enabled in Gmail settings');
            console.log('   2. App Password is correct (no spaces)');
            console.log('   3. Less secure app access OR App Passwords is enabled');
        }
        process.exit(1);
    });

    imap.once('end', () => {
        console.log('\n✅ IMAP test complete');
        process.exit(0);
    });

    imap.connect();
};

testIMAP();
