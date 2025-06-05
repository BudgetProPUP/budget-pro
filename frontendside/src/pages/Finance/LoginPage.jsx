import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import './LoginPage.css';
import backgroundImage from '../../assets/BUDGET1.png';

function LoginPage({ setIsAuthenticated }) {
  const [loginData, setLoginData] = useState({ 
    email: '', 
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
      // Replace with your actual authentication logic
      const response = await fakeAuthAPI(loginData);
      
      if (response.success) {
        setIsAuthenticated(true);
        navigate('/dashboard');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
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

  // Mock authentication function - replace with real API call
  const fakeAuthAPI = async ({ email, password }) => {
    return new Promise(resolve => {
      setTimeout(() => {
        // Basic validation - replace with real authentication
        const isValid = email && password && password.length >= 6;
        resolve({ 
          success: isValid
        });
      }, 1000);
    });
  };

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
            {showPassword ? (
              <EyeOff size={18} color="#808080" /> 
            ) : (
              <Eye size={18} color="#808080" />
            )}           
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