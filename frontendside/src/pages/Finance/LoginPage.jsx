// LoginPage.jsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios'; // Import axios
import './loginPage.css';
import backgroundImage from '../../assets/BUDGET1.png';


const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'https://auth-service-cdln.onrender.com';


function LoginPage({ setIsAuthenticated }) {
  const [loginData, setLoginData] = useState({ 
    email: '', 
    phone_number: '', // Include this even if blank
    password: '' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Call authentication service
      const response = await axios.post(`${AUTH_API_URL}/login/`, loginData);
      

      if (response.data && response.data.access) {
        // Store token
        localStorage.setItem('authToken', response.data.access);
        
        // Store token and refresh info
        localStorage.setItem('refreshToken', response.data.refresh);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        setIsAuthenticated(true);
        navigate('/dashboard');
      } else {
        // Handle cases where the API returns 200 but no token
        setError('Login failed: Invalid response from server.');
      }
    } catch (err) {
      if (err.response && err.response.data) {
        // Display specific error from the backend
        const errorDetail = err.response.data.detail || err.response.data.non_field_errors || ['Login failed. Please try again.'];
        setError(Array.isArray(errorDetail) ? errorDetail.join(' ') : errorDetail);
      } else {
        setError('Login failed. Cannot connect to the server.');
      }
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Removed Fake Auth Function

  return (
    <div 
      className="login-container"
      style={{ 
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <form className="form" onSubmit={handleSubmit}>
        <h1>BUDGET PRO</h1>
        <p>Welcome! Please provide the credentials to log in</p>

        {error && <div className="error-message">{error}</div>}

        <div className="input-group">
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            value={loginData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="input-group">
          <div className="password-input-container">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={loginData.password}
              onChange={handleInputChange}
              required
              minLength="6"
            />
            <button 
              type="button" 
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} color="#808080" /> : <Eye size={18} color="#808080" />}
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          className="form-button"
          disabled={isLoading}
        >
          {isLoading ? 'LOGGING IN...' : 'LOG IN'}
        </button>

        <div className="forgot-password">
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
