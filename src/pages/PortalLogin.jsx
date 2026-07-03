import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { uploadImageToCloudinary } from '../utils/cloudinary';
import './PortalLogin.css';

const PortalLogin = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  // Determine active tab: if path param is 'login', default to login tab, else default to signup tab
  const [isSignUp, setIsSignUp] = useState(type !== 'login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState(type && type !== 'login' ? type : 'user');
  const [locationField, setLocationField] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // UI/Loading states
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (auth && auth.currentUser) {
      navigate('/');
    }
    window.scrollTo(0, 0);
  }, [navigate]);

  // Sync role selector when type parameter changes
  useEffect(() => {
    if (type && type !== 'login') {
      setRole(type);
      setIsSignUp(true);
    } else if (type === 'login') {
      setIsSignUp(false);
    }
  }, [type]);

  const from = location.state?.from?.pathname || "/";

  // Trigger file selection for avatar upload
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Upload profile photo to Cloudinary
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Invalid file format. Please select an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size too large. Please select an image smaller than 5MB.');
      return;
    }

    setUploadingAvatar(true);
    try {
      const url = await uploadImageToCloudinary(file);
      setAvatarUrl(url);
    } catch (err) {
      console.error('Avatar upload failed:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Unified form submission (Log in or Sign Up)
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!accepted) {
      setError('You must agree to the Terms & Privacy Policy before continuing.');
      return;
    }
    setLoading(true);

    if (isSignUp) {
      // Sign Up Mode validation: Enforce ALL fields as requested by the user
      if (!fullName.trim()) {
        setError('Full Name is required.');
        setLoading(false);
        return;
      }
      if (!phone.trim()) {
        setError('Phone Number is required.');
        setLoading(false);
        return;
      }
      if (!locationField.trim()) {
        setError('Location / City is required.');
        setLoading(false);
        return;
      }
      if (!bio.trim()) {
        setError('Professional Bio / Summary is required.');
        setLoading(false);
        return;
      }
      if (!email.trim() || !password.trim()) {
        setError('Email and Password are required.');
        setLoading(false);
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Store Firestore user
        if (db) {
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            email: userCredential.user.email,
            createdAt: serverTimestamp(),
            type: type && type !== 'login' ? type : role
          });
        }

        // Store Supabase Profile
        const newProfile = {
          email: email.toLowerCase(),
          full_name: fullName.trim(),
          phone: phone.trim(),
          role: role,
          location: locationField.trim(),
          bio: bio.trim(),
          avatar_url: avatarUrl || 'https://via.placeholder.com/150',
          updated_at: new Date().toISOString()
        };

        const { error: profileErr } = await supabase
          .from('user_profiles')
          .insert([newProfile]);

        if (profileErr) {
          console.error('Error inserting profile metadata to Supabase:', profileErr);
        }

        // Provision searches remaining in credits
        try {
          await supabase
            .from('user_search_credits')
            .insert([{ email: email.toLowerCase(), searches_remaining: 3, plan_level: 'free' }]);
        } catch (creditErr) {
          console.error('Error auto-syncing credits in Supabase:', creditErr);
        }

        // Dispatch profile updated event to synchronize other page widgets (e.g. Header)
        window.dispatchEvent(new Event('profileUpdated'));

        navigate(from, { replace: true });
      } catch (signUpErr) {
        console.error(signUpErr);
        switch (signUpErr.code) {
          case 'auth/email-already-in-use':
            setError('This email address is already registered. Please log in instead.');
            break;
          case 'auth/weak-password':
            setError('Password should be at least 6 characters.');
            break;
          case 'auth/invalid-email':
            setError('Please enter a valid email address.');
            break;
          default:
            setError(signUpErr.message);
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Log In Mode
      if (!email.trim() || !password.trim()) {
        setError('Email and Password are required.');
        setLoading(false);
        return;
      }

      try {
        await signInWithEmailAndPassword(auth, email, password);
        navigate(from, { replace: true });
      } catch (err) {
        console.error(err);
        switch (err.code) {
          case 'auth/invalid-credential':
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            setError('Invalid email or password. Please try again.');
            break;
          case 'auth/invalid-email':
            setError('Please enter a valid email address.');
            break;
          case 'auth/too-many-requests':
            setError('Too many failed attempts. Please try again later.');
            break;
          default:
            setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResetSent(false);
    setLoading(true);

    if (!email.trim()) {
      setError('Please enter your email address.');
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
    } catch (err) {
      console.error(err);
      switch (err.code) {
        case 'auth/user-not-found':
          setError('No account found with this email address.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/too-many-requests':
          setError('Too many requests. Please wait a few minutes and try again.');
          break;
        default:
          setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (forgotPasswordMode) {
    return (
      <div className="new-login-page">
        <div className="login-card">

          {/* ── Step indicator ── */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '28px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '12px', fontWeight: '600',
              color: resetSent ? '#9ca3af' : '#2563eb'
            }}>
              <span style={{
                width: '22px', height: '22px', borderRadius: '50%',
                background: resetSent ? '#e5e7eb' : '#2563eb',
                color: resetSent ? '#6b7280' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: '700', flexShrink: 0
              }}>1</span>
              Send Link
            </div>
            <div style={{ width: '32px', height: '2px', background: resetSent ? '#2563eb' : '#e5e7eb', alignSelf: 'center', borderRadius: '2px' }} />
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '12px', fontWeight: '600',
              color: resetSent ? '#2563eb' : '#9ca3af'
            }}>
              <span style={{
                width: '22px', height: '22px', borderRadius: '50%',
                background: resetSent ? '#2563eb' : '#e5e7eb',
                color: resetSent ? '#fff' : '#9ca3af',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: '700', flexShrink: 0
              }}>2</span>
              New Password
            </div>
          </div>

          {!resetSent ? (
            /* ── Step 1: Enter email ── */
            <>
              <div className="login-card-header">
                <h1>Forgot Password?</h1>
                <p>No worries! Enter your email and we'll send you a secure link to reset your password.</p>
              </div>

              <form className="email-login-form" onSubmit={handleForgotPasswordSubmit}>
                <div className="form-input-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                    autoFocus
                  />
                </div>

                {error && <div className="login-error-msg">{error}</div>}

                <button type="submit" className="login-main-btn" disabled={loading}>
                  {loading ? 'Sending…' : '📧 Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            /* ── Step 2: Email sent confirmation ── */
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px', filter: 'drop-shadow(0 2px 8px rgba(37,99,235,0.2))' }}>📬</div>
              <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '10px' }}>Check Your Inbox!</h1>
              <p style={{ color: '#6b7280', fontSize: '15px', marginBottom: '24px', lineHeight: '1.6' }}>
                We sent a password reset link to<br />
                <strong style={{ color: '#2563eb' }}>{email}</strong>
              </p>

              {/* What to do next */}
              <div style={{
                background: '#f0f4ff', borderRadius: '14px',
                padding: '20px', textAlign: 'left',
                border: '1px solid #c7d7fc', marginBottom: '24px'
              }}>
                <p style={{ fontWeight: '700', color: '#1e40af', fontSize: '13px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>What to do next:</p>
                {[
                  { icon: '📧', text: 'Open the email we just sent you' },
                  { icon: '🔗', text: 'Click the "Reset Password" link inside' },
                  { icon: '🔐', text: 'Enter your new password & confirm it' },
                  { icon: '✅', text: 'Done! Log in with your new password' }
                ].map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: i < 3 ? '10px' : 0 }}>
                    <span style={{ fontSize: '18px', flexShrink: 0 }}>{step.icon}</span>
                    <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>{step.text}</span>
                  </div>
                ))}
              </div>

              <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '20px' }}>
                Didn't receive it? Check your spam folder or{' '}
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '600', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline', padding: 0 }}
                  onClick={() => { setResetSent(false); setEmail(''); setError(''); }}
                >
                  try a different email
                </button>.
              </p>
            </div>
          )}

          <div className="login-toggle" style={{ marginTop: '24px' }}>
            <button
              type="button"
              className="toggle-auth-btn"
              onClick={() => {
                setForgotPasswordMode(false);
                setError('');
                setResetSent(false);
              }}
            >
              ← Back to Log In
            </button>
          </div>

          <div className="login-footer">
            By continuing, you agree to our Terms &amp; Privacy Policy
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="new-login-page">
      <div className="login-card">
        <div className="login-card-header">
          <h1>{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
          <p>
            {isSignUp
              ? 'Enter your details to register for HRM Consultancy'
              : 'Sign in to access your HRM Consultancy account'
            }
          </p>
        </div>

        {/* Dynamic Tab Switcher */}
        <div className="login-tabs">
          <button
            type="button"
            className={`tab-btn ${!isSignUp ? 'active' : ''}`}
            onClick={() => {
              setIsSignUp(false);
              setError('');
            }}
          >
            Log In
          </button>
          <button
            type="button"
            className={`tab-btn ${isSignUp ? 'active' : ''}`}
            onClick={() => {
              setIsSignUp(true);
              setError('');
            }}
          >
            Sign Up
          </button>
        </div>

        <form className="email-login-form" onSubmit={handleAuthSubmit}>

          {isSignUp && (
            <>
              {/* Avatar / Profile photo upload widget */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px' }}>
                <div
                  className={`avatar-uploader-circle ${avatarUrl ? 'has-image' : ''}`}
                  onClick={triggerFileInput}
                  style={{
                    width: '85px',
                    height: '85px',
                    borderRadius: '50%',
                    border: '2px dashed rgba(37, 99, 235, 0.3)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    backgroundColor: 'rgba(37, 99, 235, 0.02)',
                    transition: 'all 0.2s'
                  }}
                >
                  {uploadingAvatar ? (
                    <div className="spinner" style={{ width: '16px', height: '16px', borderTopColor: '#2563eb' }}></div>
                  ) : avatarUrl ? (
                    <>
                      <img src={avatarUrl} alt="Avatar Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div className="avatar-upload-overlay" style={{ fontSize: '10px' }}>
                        <Upload size={12} />
                        <span>Change</span>
                      </div>
                    </>
                  ) : (
                    <div className="avatar-upload-placeholder" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', color: '#6b7280', fontSize: '10px' }}>
                      <Upload size={18} style={{ color: '#2563eb' }} />
                      <span>Photo *</span>
                    </div>
                  )}
                </div>
                <span style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px', fontWeight: '500' }}>
                  Upload Profile Picture (New Accounts) *
                </span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>

              {/* Profile Details Fields */}
              <div className="form-input-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe (Required for signup)"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-input-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-input-group">
                <label>Professional Role *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    padding: '14px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '15px',
                    backgroundColor: '#f9fafb',
                    outline: 'none',
                    fontFamily: 'inherit',
                    color: '#374151'
                  }}
                  required
                >
                  <option value="user">General User / Patient</option>
                  <option value="doctor">Medical Specialist / Doctor</option>
                  <option value="hr">HR Professional / Employer</option>
                  <option value="hospital">Hospital Administrator</option>
                  <option value="partner">HRM Network Partner</option>
                </select>
              </div>

              <div className="form-input-group">
                <label>Location / City *</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai, India"
                  value={locationField}
                  onChange={(e) => setLocationField(e.target.value)}
                  required
                />
              </div>

              <div className="form-input-group">
                <label>Professional Bio / Summary *</label>
                <textarea
                  placeholder="Describe your background or healthcare requirements..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  style={{
                    padding: '14px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '15px',
                    backgroundColor: '#f9fafb',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '70px',
                    fontFamily: 'inherit',
                    color: '#374151'
                  }}
                  required
                />
              </div>

              <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '10px 0' }} />
            </>
          )}

          {/* Credentials Section */}
          <div className="form-input-group">
            <label>Email Address *</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>Password *</label>
              <button
                type="button"
                className="forgot-password-link"
                onClick={() => {
                  setForgotPasswordMode(true);
                  setError('');
                  setResetSent(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0
                }}
              >
                Forgot Password?
              </button>
            </div>
            <div className="password-field-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                minLength={6}
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <input
              id="acceptTerms"
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              disabled={loading}
            />
            <label htmlFor="acceptTerms" style={{ fontSize: '13px' }}>
              I agree to the{' '}
              <a href="/terms" style={{ color: '#2563eb', textDecoration: 'underline' }}>Terms</a>
              {' '}and{' '}
              <a href="/privacy" style={{ color: '#2563eb', textDecoration: 'underline' }}>Privacy Policy</a>
            </label>
          </div>

          {error && <div className="login-error-msg">{error}</div>}

          <button type="submit" className="login-main-btn" disabled={loading || (isSignUp && uploadingAvatar) || !accepted}>
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Log In')}
          </button>
        </form>

        <div className="login-toggle">
          {isSignUp ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                className="toggle-auth-btn"
                onClick={() => {
                  setIsSignUp(false);
                  setError('');
                }}
              >
                Log In
              </button>
            </p>
          ) : (
            <p>
              New to HRM Consultancy?{' '}
              <button
                type="button"
                className="toggle-auth-btn"
                onClick={() => {
                  setIsSignUp(true);
                  setError('');
                }}
              >
                Sign Up
              </button>
            </p>
          )}
        </div>

        <div className="login-footer">
          By continuing, you agree to our Terms & Privacy Policy
        </div>
      </div>
    </div>
  );
};

export default PortalLogin;
