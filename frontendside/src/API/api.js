import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8001/api/auth',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Will automatically add the JWT to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor: Handle automatic token refresh
api.interceptors.response.use(
    (response) => response, // On success, just return the response
    async (error) => {
        const originalRequest = error.config;

        // Check if the error is 401 and it's not a retry request to the refresh endpoint itself
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Mark as a retry to prevent infinite loops

            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    // Use a direct axios call to the refresh endpoint
                    const response = await axios.post(`${api.defaults.baseURL}/token/refresh/`, { refresh: refreshToken });
                    const newAccessToken = response.data.access;
                    
                    localStorage.setItem('access_token', newAccessToken);
                    
                    // Update the authorization header for the original failed request
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    
                    // Retry the original request with the new token
                    return api(originalRequest);

                } catch (refreshError) {
                    // If refresh fails, the refresh token is invalid/expired. Log the user out.
                    console.error("Token refresh failed:", refreshError);
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    // Force a redirect to the login page
                    window.location.href = '/login'; 
                    return Promise.reject(refreshError);
                }
            }
        }
        
        // For any other error, just reject the promise
        return Promise.reject(error);
    }
);
export default api;