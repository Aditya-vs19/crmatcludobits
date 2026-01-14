import { google } from 'googleapis';

// OAuth2 configuration
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5001/api/gmail/oauth2callback'
);

// Gmail API scopes
const SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify',
];

/**
 * Generate OAuth2 authorization URL
 */
export const getAuthUrl = () => {
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent', // Force to get refresh token
    });
};

/**
 * Exchange authorization code for tokens
 */
export const getTokensFromCode = async (code) => {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    return tokens;
};

/**
 * Set credentials from stored tokens
 */
export const setCredentials = (tokens) => {
    oauth2Client.setCredentials(tokens);
};

/**
 * Get Gmail API client
 */
export const getGmailClient = () => {
    return google.gmail({ version: 'v1', auth: oauth2Client });
};

/**
 * Refresh access token if needed
 */
export const refreshAccessToken = async () => {
    try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        oauth2Client.setCredentials(credentials);
        return credentials;
    } catch (error) {
        console.error('Error refreshing access token:', error);
        throw error;
    }
};

export { oauth2Client };
