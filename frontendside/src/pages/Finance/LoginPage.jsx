// src/Pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', loginData);
    
    // Basic validation - replace with actual authentication
    if (loginData.email && loginData.password) {
      navigate('/dashboard'); // Redirect to dashboard on successful login
    }
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    console.log('Signup attempt:', signupData);
    if (signupData.email && signupData.password) {
      navigate('/dashboard');
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
  };

  const EyeIcon = ({ show }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#666" viewBox="0 0 16 16">
      {show ? (
        <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
      ) : (
        <>
          <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
          <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
        </>
      )}
    </svg>
  );

  return (
    <div className="fullscreen-slider-container">
      <div className={`container ${isSignUp ? 'right-panel-active' : ''}`}>
        {/* Sign Up Form */}
        <div className="form-container sign-up-container">
          <div className="form">
            <h1>ADMIN</h1>
            <input
              type="email"
              placeholder="Email"
              value={signupData.email}
              onChange={(e) => setSignupData({...signupData, email: e.target.value})}
              required
            />
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={signupData.password}
                onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                required
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <EyeIcon show={showPassword} />
              </button>
            </div>
            <button 
              type="button" 
              className="form-button"
              onClick={handleSignupSubmit}
            >
              Log In
            </button>
          </div>
        </div>

        {/* Sign In Form */}
        <div className="form-container sign-in-container">
          <div className="form">
            <h1>FINANCE HEAD</h1>
            <input
              type="email"
              placeholder="Email"
              value={loginData.email}
              onChange={(e) => setLoginData({...loginData, email: e.target.value})}
              required
            />
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                required
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <EyeIcon show={showPassword} />
              </button>
            </div>
            <button 
              type="button" 
              className="form-button"
              onClick={handleLoginSubmit}
            >
              Log In
            </button>
          </div>
        </div>

        {/* Overlay Container */}
        <div className="overlay-container">
          <div className="overlay">
            <img 
              src="/assets/LOGO.png" 
              alt="Slide Image"
              className="slide-image"
            />
            
            <div className="overlay-panel overlay-left">
              <h1>FINANCE HEAD</h1>
              <button className="ghost-button" onClick={toggleMode}>
                Log In
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>ADMIN</h1>
              <button className="ghost-button" onClick={toggleMode}>
                Log In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;