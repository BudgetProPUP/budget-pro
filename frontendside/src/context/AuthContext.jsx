import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken'));
  const navigate = useNavigate();

  const viteAuthApiUrl = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8001/api/auth';

  // Configure Axios instance for the Auth Service
  const authApi = axios.create({
    baseURL: viteAuthApiUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptor to add the token to authApi requests
  authApi.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Define logout here so it can be used in the interceptor
  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    // Clean up all possible old token keys
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('authToken');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login');
  }, [navigate]);

  // Add response interceptor for token refresh to authApi
  authApi.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            logout();
            return Promise.reject(error);
          }
          const response = await axios.post(`${viteAuthApiUrl}/token/refresh/`, {
            refresh: refreshToken,
          });
          const newAccessToken = response.data.access;
          setAccessToken(newAccessToken);
          localStorage.setItem('accessToken', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return authApi(originalRequest);
        } catch (refreshError) {
          logout();
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );

  // Login function
  const login = async (credentials) => {
    try {
      const response = await authApi.post('/login/', credentials);
      const { access, refresh, user } = response.data;
      setAccessToken(access);
      setUser(user);
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('user', JSON.stringify(user)); // Store user info
      // Navigation is now handled by the component calling login
    } catch (error) {
      throw error.response?.data || { detail: 'Login failed' };
    }
  };

  // ADDED: New function to handle password reset request
  const requestPasswordReset = async (email) => {
    try {
      // This function uses the correctly configured authApi instance
      await authApi.post('/password/request-reset/', { email });
    } catch (error) {
      // Re-throw the error so the component can handle it
      throw error.response?.data || { detail: 'Request failed' };
    }
  };

  // ADDED: New function to handle password reset confirmation
  const confirmPasswordReset = async ({ uid, token, password }) => {
    try {
      await authApi.post('/password/reset/confirm/', { uid, token, password });
    } catch (error) {
      throw error.response?.data || { detail: 'Confirmation failed' };
    }
  };
  
  // Check authentication on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    if (storedToken) {
      setAccessToken(storedToken);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, []);

  return (
    // MODIFIED: Added authApi, requestPasswordReset, and confirmPasswordReset to the value
    <AuthContext.Provider value={{ user, accessToken, login, logout, authApi, requestPasswordReset, confirmPasswordReset }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);