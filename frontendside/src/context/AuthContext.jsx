// File: frontendside/src/context/AuthContext.jsx

import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../API/authAPI';
import api from '../API/api'; // Import base axios instance for logout

// 1. Create the context
const AuthContext = createContext(null);

// 2. Create the provider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true); // To handle initial auth check
    const navigate = useNavigate();

    useEffect(() => {
        // Check for an existing token when the app loads
        const token = localStorage.getItem('access_token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
            setUser(JSON.parse(userData));
            setIsAuthenticated(true);
        }
        setLoading(false); // Finished initial check
    }, []);

    const login = async (identifier, password) => {
        const response = await apiLogin(identifier, password);
        
        // Store tokens and user data
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        localStorage.setItem('user', JSON.stringify(response.user));

        // Update state
        setUser(response.user);
        setIsAuthenticated(true);
        
        navigate('/dashboard');
    };

    const logout = () => {
        // Clear tokens and user data
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');

        // Update state
        setUser(null);
        setIsAuthenticated(false);
        
        // Redirect to login page
        navigate('/login');
    };

    // The value provided to consuming components
    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. Create a custom hook for easy consumption of the context.
export const useAuth = () => {
    return useContext(AuthContext);
};