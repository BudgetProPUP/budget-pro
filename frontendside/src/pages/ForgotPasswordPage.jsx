import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post('http://localhost:8000/api/auth/password/reset/', { email });
      setMessage('If this email is registered, you will receive a password reset link shortly.');
    } catch (error) {
      setMessage('Error sending reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="form-container">
          <h2>Forgot Password</h2>
          {message && <div className="error-message">{message}</div>}
          <form onSubmit={handleSubmit}>
            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="Enter registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit" 
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
          <button 
            className="back-to-login"
            onClick={() => navigate('/login')}
            style={{ marginTop: '15px' }}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;