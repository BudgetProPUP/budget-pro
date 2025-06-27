import axios from 'axios';

const api = axios.create({
    
    baseURL: import.meta.env.VITE_BUDGET_API_URL, 
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the authentication token
api.interceptors.request.use(
    (config) => {
        // FINAL: Use 'accessToken' to match the key used in AuthContext
        const token = localStorage.getItem('accessToken'); 
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;