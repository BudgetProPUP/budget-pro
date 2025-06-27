import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const navigate = useNavigate();

  const viteAuthApiUrl = import.meta.env.VITE_AUTH_API_URL;

  // This is the internal axios instance for the Auth Service
  const authApi = axios.create({
    baseURL: viteAuthApiUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  }, [navigate]);

  // Interceptor for token refresh
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
            return Promise.reject(new Error("No refresh token available."));
          }
          const response = await axios.post(`${viteAuthApiUrl}/token/refresh/`, {
            refresh: refreshToken,
          });
          const newAccessToken = response.data.access;
          setAccessToken(newAccessToken);
          localStorage.setItem('accessToken', newAccessToken);
          authApi.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
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
  
  const login = async (credentials) => {
    try {
      const response = await authApi.post('/login/', credentials);
      const { access, refresh, user } = response.data;
      setAccessToken(access);
      setUser(user);
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      navigate('/dashboard');
    } catch (error) {
      throw error.response?.data || { detail: 'Login failed' };
    }
  };

  // ADDED: Function to handle password reset requests
  const requestPasswordReset = async (email) => {
    try {
      // This uses the correctly configured authApi instance
      await authApi.post('/password/request-reset/', { email });
    } catch (error) {
      throw error.response?.data || { detail: 'Request failed' };
    }
  };

  // ADDED: Function to handle the final password reset confirmation
  const confirmPasswordReset = async ({ uid, token, password }) => {
    try {
      await authApi.post('/password/reset/confirm/', { uid, token, password });
    } catch (error) {
      throw error.response?.data || { detail: 'Confirmation failed' };
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setAccessToken(token);
    }
  }, []);

  return (
    // MODIFIED: Provide the new functions in the context value
    <AuthContext.Provider value={{ user, accessToken, login, logout, requestPasswordReset, confirmPasswordReset }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);