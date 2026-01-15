import axios from 'axios';

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        // Skip adding token for login and register requests
        const isAuthRequest = config.url?.includes('/auth/login') || config.url?.includes('/auth/register');

        if (!isAuthRequest) {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Don't intercept login/register requests
        const isAuthRequest = originalRequest.url?.includes('/auth/login') ||
            originalRequest.url?.includes('/auth/register');

        if (isAuthRequest) {
            return Promise.reject(error);
        }

        // If 401 and not already retrying, refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Queue requests while refreshing
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');

                if (!refreshToken) {
                    // No refresh token, clear and let component handle redirect
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    isRefreshing = false;
                    processQueue(error, null);
                    return Promise.reject(error);
                }

                const response = await axios.post('/api/auth/refresh', {
                    refreshToken,
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data.data;

                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                isRefreshing = false;
                processQueue(null, accessToken);

                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, clear tokens
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                isRefreshing = false;
                processQueue(refreshError, null);

                // Only redirect if not already on login page
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
