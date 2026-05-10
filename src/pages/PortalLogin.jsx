import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import {
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';
import './PortalLogin.css';

const PortalLogin = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (auth.currentUser) {
      navigate('/');
    }
    window.scrollTo(0, 0);
  }, [navigate]);

  const from = location.state?.from?.pathname || "/";

  const handleSocialLogin = async (providerName) => {
    setError('');
    setLoading(true);
    let provider;
    if (providerName === 'google') {
      provider = new GoogleAuthProvider();
    } else if (providerName === 'linkedin') {
      const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
      const redirectUri = encodeURIComponent(window.location.origin + '/portal/linkedin-callback');
      const scope = encodeURIComponent('openid profile email');
      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
      window.location.href = authUrl;
      return;
    }

    try {
      await signInWithPopup(auth, provider);
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      setError(`Failed to sign in with ${providerName}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          console.log("reCAPTCHA solved");
        },
        'expired-callback': () => {
          setError("reCAPTCHA expired. Please try again.");
        }
      });
    }
  };

  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();
    let formattedNumber = phoneNumber.trim();
    if (!formattedNumber.startsWith('+')) {
      if (formattedNumber.length === 10) {
        formattedNumber = `+91${formattedNumber}`;
      } else {
        setError("Please include your country code (e.g., +91...)");
        setLoading(false);
        return;
      }
    }

    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      console.log("OTP sent to:", formattedNumber);
    } catch (err) {
      console.error(err);
      setError(err.message);
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (confirmationResult) {
        await confirmationResult.confirm(otp);
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-login-page">
      <div className="login-card">
        <div className="login-card-header">
          <h1>{otpSent ? 'Verify OTP' : 'Sign Up / Log In'}</h1>
          <p>{otpSent ? `Enter code sent to ${phoneNumber}` : `Join HRM Consultancy ${type.charAt(0).toUpperCase() + type.slice(1)} portal`}</p>
        </div>

        {!otpSent && (
          <>
            <div className="social-login-section">
              <button className="social-btn-large" onClick={() => handleSocialLogin('google')} disabled={loading}>
                <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>

              <button className="social-btn-large" onClick={() => handleSocialLogin('linkedin')} disabled={loading}>
                <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" fill="#0077b5" />
                </svg>
                Continue with LinkedIn
              </button>
            </div>

            <div className="form-divider" style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: '#9ca3af', fontSize: '14px' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
              <span style={{ padding: '0 10px' }}>OR</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
            </div>
          </>
        )}

        <form className="email-login-form" onSubmit={otpSent ? handleVerifyOTP : handleSendOTP}>
          <div id="recaptcha-container"></div>

          <div className="form-input-group">
            <label>Mobile Number</label>
            <input
              type="text"
              placeholder="e.g. +91 98765 43210"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={otpSent || loading}
              required
            />
            {otpSent && (
              <button
                type="button"
                className="change-num-btn"
                onClick={() => { setOtpSent(false); setConfirmationResult(null); setOtp(''); }}
                style={{ background: 'none', border: 'none', color: '#1a73e8', textDecoration: 'underline', cursor: 'pointer', fontSize: '13px', padding: '0', marginTop: '5px' }}
              >
                Change Number
              </button>
            )}
          </div>

          {otpSent && (
            <div className="form-input-group" style={{ animation: 'slideDown 0.3s ease-out forwards' }}>
              <label>Enter OTP</label>
              <input
                type="text"
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
                autoFocus
              />
            </div>
          )}

          {error && <div className="login-error-msg">{error}</div>}

          <button type="submit" className="login-main-btn" disabled={loading}>
            {loading ? 'Processing...' : (otpSent ? 'Verify OTP' : 'Send OTP')}
          </button>
        </form>

        <div className="login-footer">
          By continuing, you agree to our Terms & Privacy Policy
        </div>
      </div>
    </div>
  );
};

export default PortalLogin;
