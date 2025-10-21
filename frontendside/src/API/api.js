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

export default api;