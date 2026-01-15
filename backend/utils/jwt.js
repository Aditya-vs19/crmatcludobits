import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

/**
 * Generate access token
 */
export const generateAccessToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRES_IN,
    });
};

/**
 * Verify token
 */
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokens = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
    };

    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
    };
};
