import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const navigate = useNavigate();

  const viteAuthApiUrl = import.meta.env.VITE_AUTH_API_URL;

  // Configure Axios with base URL and interceptors
  const api = axios.create({
    baseURL: viteAuthApiUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add request interceptor to attach access token
  api.interceptors.request.use(
    (config) => {
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Add response interceptor for token refresh
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          const response = await axios.post(`${viteAuthApiUrl}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          const newAccessToken = response.data.access;
          setAccessToken(newAccessToken);
          localStorage.setItem('accessToken', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          logout();
          navigate('/login');
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );

  // Login function
  const login = async (credentials) => {
    try {
      const response = await api.post('auth/login/', credentials);
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

  // Logout function
  const logout = async () => {
    try {
      await api.post('auth/logout/', { refresh: localStorage.getItem('refreshToken') }); // Sends refresh token to backend and blacklisted
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate('/login');
    }
  };

  // Check authentication on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (accessToken) {
        try {
          const response = await api.get('auth/profile/');
          setUser(response.data);
        } catch (error) {
          logout();
        }
      }
    };
    verifyToken();
  }, [accessToken]);

  return (
    <AuthContext.Provider value={{ user, login, logout, api }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);