import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css'; // Using the same CSS as LoginPage
import backgroundImage from '../../assets/LOGO.jpg'; // Import the image

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
    } catch {
      setMessage('Error sending reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <section className="left-panel">
        <img
          src={backgroundImage} // Use the imported image
          alt="BudgetPro Logo"
          className="asset-image"
        />
      </section>
      
      <section className="right-panel">
        <header className="form-header">
          <section className="logo">
            <h1 className="logo-text">BUDGET PRO</h1>
          </section>
          <p>Enter your email to reset your password</p>
        </header>

        {message && (
          <div className={`error-message ${message.includes('registered') ? 'success-message' : ''}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="forgot-password-form">
          <fieldset>
            <label>Email:</label>
            <input
              type="email"
              className="form-input"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </fieldset>

          <button
            type="submit"
            className="log-in-button"
            disabled={isLoading}
          >
            {isLoading ? 'SENDING...' : 'SEND RESET LINK'}
          </button>
        </form>

        <p className="back-to-login-text" onClick={() => navigate('/login')}>
          Back to Login
        </p>
      </section>
    </div>
  );
}

export default ForgotPasswordPage;