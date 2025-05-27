import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://budget-pro-django-production.up.railway.app/api';

const api = axios.create({
    baseURL: API_BASE_URL,  
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the authentication token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token'); // Replace with your token storage logic
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