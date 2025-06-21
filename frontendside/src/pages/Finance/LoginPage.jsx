import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
// import { useForm } from "react-hook-form";
//
import { useForm } from 'react-hook-form';
import './loginPage.css';
import backgroundImage from '../../assets/BUDGETPROLOGO.jpg';

function LoginPage({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [isInvalidCredentials, setInvalidCredentials] = useState(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [isShowPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm({
    mode: "all",
  });

  const password = watch("password", "");

  const submission = async (data) => {
    const { email, password } = data;
    setSubmitting(true);

    try {
      // Replace with your actual authentication logic
      const response = await fakeAuthAPI({ email, password });
      
      if (response.success) {
        setInvalidCredentials(false);
        setIsAuthenticated(true);
        navigate('/dashboard');
      } else {
        setInvalidCredentials(true);
      }
    } catch {
      console.log("login failed!");
      setInvalidCredentials(true);
    } finally {
      setSubmitting(false);
    }
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

  useEffect(() => {
    if (isInvalidCredentials) {
      setTimeout(() => {
        setInvalidCredentials(false);
      }, 5000);
    }
  }, [isInvalidCredentials]);

  // Reset the value of isShowPassword state when the password input is empty.
  useEffect(() => {
    if (password.length == 0) {
      setShowPassword(false);
    }
  }, [password]);

  return (
    <>
      {isInvalidCredentials && (
        <div className="error-message">Invalid credentials.</div>
      )}

      <main className="login-page">
        <section className="left-panel">
          <img
            src={backgroundImage}
            alt="login-illustration"
            className="asset-image"
          />
        </section>
        
        <section className="right-panel">
          <header className="form-header">
            <section className="logo">
              <h1 className="logo-text">BUDGET PRO</h1>
            </section>
            <p>Welcome! Please provide the credentials to log in</p>
          </header>

          <form onSubmit={handleSubmit(submission)}>
            <fieldset>
              <label>Email:</label>

              {errors.email && <span>{errors.email.message}</span>}

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                {...register("email", {
                  required: "Must not empty",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email format",
                  },
                })}
              />
            </fieldset>

            <fieldset>
              <label>Password:</label>

              {errors.password && <span>{errors.password.message}</span>}

              <div className="password-container">
                <input
                  type={isShowPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  {...register("password", { 
                    required: "Must not empty",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters"
                    }
                  })}
                />

                {password.length > 0 && (
                  <button
                    type="button"
                    className="show-password"
                    onClick={() => setShowPassword(!isShowPassword)}
                    aria-label={isShowPassword ? "Hide password" : "Show password"}
                  >
                    {isShowPassword ? (
                      <EyeOff size={18} color="#808080" /> 
                    ) : (
                      <Eye size={18} color="#808080" />
                    )}
                  </button>
                )}
              </div>
            </fieldset>

            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="log-in-button"
            >
              {!isSubmitting ? "LOG IN" : "LOGGING IN..."}
            </button>
          </form>

          <Link to="/forgot-password" className="forgot-password-link">
            Forgot Password?
          </Link>
        </section>
      </main>
    </>
  );
}

export default LoginPage;