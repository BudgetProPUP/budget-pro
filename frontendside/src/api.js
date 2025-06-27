import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_BUDGET_API_URL || 'http://localhost:8000/api', 
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        // MODIFIED: Use 'accessToken' to match the key used in AuthContext
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