import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { checkEmail } from '../services/api';
import Sidebar from './Sidebar';
import '../App.css';

// Google Client ID - Replace with your actual Google OAuth Client ID
// Get it from: https://console.cloud.google.com/apis/credentials
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE';

function Login() {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();
  const { sidebarOpen, closeSidebar } = useSidebar();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleButtonRendered, setGoogleButtonRendered] = useState(false);
  const googleButtonRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await login(formData.username, formData.password);
    
    if (result.success) {
      // Check if there's a pending bookmark to save
      const pendingBookmark = localStorage.getItem('pendingBookmark');
      if (pendingBookmark) {
        localStorage.removeItem('pendingBookmark');
        // Navigate to the post page where bookmark will be saved
        navigate(`/posts/${pendingBookmark}`);
      } else {
        navigate('/');
      }
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleGoogleCallback = async (response) => {
    try {
      setLoading(true);
      setError(null);

      // Decode the JWT token from Google
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      
      // Prepare data for backend
      const googleUserData = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        sub: payload.sub,
      };

      const result = await googleLogin(googleUserData);

      if (result.success) {
        if (result.needsProfileSetup) {
          // Redirect to profile setup page
          navigate('/profile/setup');
        } else {
          // Check if there's a pending bookmark to save
          const pendingBookmark = localStorage.getItem('pendingBookmark');
          if (pendingBookmark) {
            localStorage.removeItem('pendingBookmark');
            navigate(`/posts/${pendingBookmark}`);
          } else {
            navigate('/');
          }
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError('Failed to process Google login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Wait for Google Identity Services to load
    const initGoogleSignIn = () => {
      if (window.google && googleButtonRef.current && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE') {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCallback,
          });

          window.google.accounts.id.renderButton(
            googleButtonRef.current,
            {
              theme: 'outline',
              size: 'large',
              width: '100%',
              text: 'signin_with',
            }
          );
          setGoogleButtonRendered(true);
        } catch (err) {
          console.error('Error initializing Google Sign-In:', err);
        }
      }
    };

    // Check if Google Identity Services is already loaded
    if (window.google) {
      initGoogleSignIn();
    } else {
      // Wait for the script to load
      const checkGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogle);
          initGoogleSignIn();
        }
      }, 100);

      // Cleanup after 10 seconds
      setTimeout(() => clearInterval(checkGoogle), 10000);
    }

    return () => {
      // Cleanup
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogleLogin = () => {
    if (!window.google) {
      setError('Google Sign-In is not loaded. Please refresh the page.');
      return;
    }
    
    if (GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
      setError('Google OAuth Client ID is not configured. Please set REACT_APP_GOOGLE_CLIENT_ID in your environment variables.');
      return;
    }

    // Trigger Google Sign-In
    window.google.accounts.id.prompt();
  };

  return (
    <>
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={closeSidebar}
        />
      )}
      <div className="magazine-layout">
        <div className={`sidebar-wrapper ${sidebarOpen ? 'open' : ''}`}>
          <Sidebar onClose={closeSidebar} />
        </div>
        <div className={`magazine-main ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div style={{ maxWidth: '400px', margin: '0.5rem auto', padding: '0 1rem' }}>
            <div className="card">
              <h2>Login to lladlad</h2>
              
              {error && <div className="error">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    name="username"
                    className="form-input"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className="form-input"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ width: '100%', marginTop: '1rem' }}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>

              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <p>Don't have an account? <Link to="/register">Register here</Link></p>
              </div>

              <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <p style={{ marginBottom: '0.25rem', fontSize: '0.9rem', color: '#64748b' }}>Or continue with</p>
                
                {/* Google Sign-In Button Container */}
                <div 
                  ref={googleButtonRef}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    marginBottom: '0.5rem',
                    minHeight: '40px'
                  }}
                />
                
                {/* Fallback button when Google OAuth is not configured */}
                {GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE' && !googleButtonRendered && (
                  <>
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: '#fff',
                        border: '1px solid #dadce0',
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        color: '#3c4043',
                        cursor: 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.5rem',
                        opacity: 0.6
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Sign in with Google
                    </button>
                    <div style={{
                      padding: '0.75rem',
                      background: '#fef3c7',
                      border: '1px solid #fbbf24',
                      borderRadius: '6px',
                      marginTop: '0.5rem'
                    }}>
                      <p style={{ 
                        fontSize: '0.85rem', 
                        color: '#92400e',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        justifyContent: 'center'
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                          <line x1="12" y1="9" x2="12" y2="13"></line>
                          <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        <span>
                          <strong>Google OAuth not configured.</strong> Set <code style={{ background: '#fde68a', padding: '0.125rem 0.25rem', borderRadius: '3px' }}>REACT_APP_GOOGLE_CLIENT_ID</code> in your <code style={{ background: '#fde68a', padding: '0.125rem 0.25rem', borderRadius: '3px' }}>.env</code> file.
                        </span>
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;


