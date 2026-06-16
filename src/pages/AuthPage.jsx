import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope } from 'lucide-react';
import { auth } from '../firebase';
import {
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';
import './AuthPage.css';

const AuthPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    if (!accepted) {
      setError('You must agree to the Terms & Privacy Policy before continuing.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkedInSignIn = async () => {
    if (!accepted) {
      setError('You must agree to the Terms & Privacy Policy before continuing.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
      const redirectUri = encodeURIComponent(window.location.origin + '/portal/linkedin-callback');
      const scope = encodeURIComponent('openid profile email');
      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
      window.location.href = authUrl;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);



  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          console.log("reCAPTCHA solved");
        },
        'expired-callback': () => {
          // Response expired. Ask user to solve reCAPTCHA again.
          setError("reCAPTCHA expired. Please try again.");
        }
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpSent) return;

    if (!accepted) {
      setError('You must agree to the Terms & Privacy Policy before continuing.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (confirmationResult) {
        await confirmationResult.confirm(otp);
        console.log("OTP verified successfully");
        navigate('/');
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!accepted) {
      setError('You must agree to the Terms & Privacy Policy before continuing.');
      setLoading(false);
      return;
    }
    let formattedNumber = phoneNumber.trim();
    if (!formattedNumber.startsWith('+')) {
      if (formattedNumber.length === 10) {
        formattedNumber = `+91${formattedNumber}`;
      } else {
        setError("Please enter a phone number with country code (e.g., +91...)");
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      console.log("OTP sent to:", formattedNumber);
    } catch (err) {
      console.error("OTP send error:", err);
      setError(err.message);
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">

        {/* Header Section 
        <div className="auth-header">
          <div className="auth-logo-box">
            <Stethoscope size={28} color="white" />
          </div>
          <div className="auth-title-box">
            <h1>HRM Consultancy</h1>
            <p>Doctors Choice</p>
          </div>
          <div className="auth-menu-icon">
            <div className="menu-line"></div>
            <div className="menu-line"></div>
            <div className="menu-line"></div>
          </div>
        </div>*/}

        {/* Welcome Text */}
        <div className="auth-welcome">
          <h2>{otpSent ? 'Verify OTP' : 'Login / Sign Up'}</h2>
          <p>{otpSent ? `Enter the 6-digit code sent to ${phoneNumber}` : 'Join HRM Consultancy Doctors Choice platform'}</p>
        </div>

        {/* Social Logins */}
        {!otpSent && (
          <>
            <div className="social-login-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 32px', marginTop: '16px' }}>
              <button className="social-btn google-btn" onClick={handleGoogleSignIn} disabled={loading || !accepted} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '14px', border: '1px solid #d1d5db', borderRadius: '12px', background: 'white', fontWeight: '600', cursor: 'pointer' }}>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '20px', marginRight: '12px' }} />
                Continue with Google
              </button>
              <button className="social-btn linkedin-btn" onClick={handleLinkedInSignIn} disabled={loading || !accepted} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '14px', border: '1px solid #d1d5db', borderRadius: '12px', background: 'white', fontWeight: '600', cursor: 'pointer' }}>
                <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '12px' }}>
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" fill="#0077b5"/>
                </svg>
                Continue with LinkedIn
              </button>
            </div>

            <div className="auth-divider" style={{ display: 'flex', alignItems: 'center', margin: '24px 32px' }}>
              <div style={{ flex: 1, borderBottom: '1px solid #e5e7eb' }}></div>
              <span style={{ padding: '0 16px', color: '#9ca3af', fontSize: '14px' }}>OR</span>
              <div style={{ flex: 1, borderBottom: '1px solid #e5e7eb' }}></div>
            </div>
          </>
        )}

        {/* Auth Form */}
        <form className="auth-form" onSubmit={otpSent ? handleSubmit : handleSendOTP}>
          {error && <div className="auth-error">{error}</div>}

          <div id="recaptcha-container"></div>

          <div className="form-group">
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
                className="change-number-link" 
                onClick={() => { setOtpSent(false); setConfirmationResult(null); setOtp(''); }}
              >
                Change Number
              </button>
            )}
          </div>

          {otpSent && (
            <div className="form-group animate-in">
              <label>Enter OTP</label>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
                autoFocus
              />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 32px', marginTop: '16px' }}>
            <input id="acceptTerms" type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} disabled={loading} />
            <label htmlFor="acceptTerms" style={{ fontSize: '13px' }}>
              I agree to the{' '}
              <a href="/terms" style={{ color: '#2563eb', textDecoration: 'underline' }}>Terms</a>
              {' '}and{' '}
              <a href="/privacy" style={{ color: '#2563eb', textDecoration: 'underline' }}>Privacy Policy</a>
            </label>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading || !accepted}>
            {loading ? 'Processing...' : (otpSent ? 'Verify OTP' : 'Send OTP')}
          </button>
        </form>

      </div>
    </div>
  );
};

export default AuthPage;
