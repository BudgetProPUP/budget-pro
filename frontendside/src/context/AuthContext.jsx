import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin, logout as apiLogout } from '../API/authAPI'; // Importd new logout function
import { jwtDecode } from 'jwt-decode'; // install this: npm install jwt-decode

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Check for an existing token when the app loads
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                // Decode the token to get user data and expiration time
                const decodedUser = jwtDecode(token);

                // Check if the token is expired
                if (decodedUser.exp * 1000 > Date.now()) {
                    setUser(decodedUser);
                    setIsAuthenticated(true);
                } else {
                    // Token is expired, clear it
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                }
            } catch (error) {
                console.error("Failed to decode token:", error);
                // If token is invalid, clear it
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
            }
        }
        setLoading(false); // Finished initial check
    }, []);

    const login = async (identifier, password) => {
        const response = await apiLogin(identifier, password);
        
        // Store tokens
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);

        // Decode the new token to set the user state
        const decodedUser = jwtDecode(response.access);
        setUser(decodedUser);
        setIsAuthenticated(true);
        
        navigate('/dashboard');
    };

    const logout = async () => {
        const refreshToken = localStorage.getItem('refresh_token');
        try {
            if (refreshToken) {
                // Call the API to invalidate the refresh token on the server
                await apiLogout(refreshToken);
            }
        } catch (error) {
            console.error("Server logout failed, proceeding with client-side cleanup.", error);
        } finally {
            // ALWAYS clear local storage and state, regardless of API call success
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setUser(null);
            setIsAuthenticated(false);
            navigate('/login', { replace: true });
        }
    };

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

export const useAuth = () => {
    return useContext(AuthContext);
};
// MODIFICATION END