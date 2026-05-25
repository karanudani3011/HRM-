import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
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

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState(type || 'user');
  const [locationField, setLocationField] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // UI/Loading states
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  // Unified form submission (Log in if exists, otherwise sign up with details)
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Try to sign in first
      await signInWithEmailAndPassword(auth, email, password);
      navigate(from, { replace: true });
    } catch (err) {
      // 2. If the user doesn't exist, create an account using all details
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        if (!fullName.trim()) {
          setError('Full Name is required to register a new account.');
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
              type: type || role
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
            avatar_url: avatarUrl,
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
              setError('Incorrect password. Please try again.');
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
        }
      } else {
        console.error(err);
        switch (err.code) {
          case 'auth/invalid-email':
            setError('Please enter a valid email address.');
            break;
          case 'auth/too-many-requests':
            setError('Too many failed attempts. Please try again later.');
            break;
          default:
            setError(err.message);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-login-page">
      <div className="login-card">
        <div className="login-card-header">
          <h1>Welcome</h1>
          <p>{`Sign in or enter details to register for HRM Consultancy ${type ? (type.charAt(0).toUpperCase() + type.slice(1) + ' portal') : 'Portal'}`}</p>
        </div>

        <form className="email-login-form" onSubmit={handleAuthSubmit}>
          
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
                  <span>Photo</span>
                </div>
              )}
            </div>
            <span style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px', fontWeight: '500' }}>
              Upload Profile Picture (New Accounts)
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
            />
          </div>

          <div className="form-input-group">
            <label>Phone Number</label>
            <input
              type="tel"
              placeholder="e.g. +91 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
            <label>Location / City</label>
            <input
              type="text"
              placeholder="e.g. Mumbai, India"
              value={locationField}
              onChange={(e) => setLocationField(e.target.value)}
            />
          </div>

          <div className="form-input-group">
            <label>Professional Bio / Summary</label>
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
            />
          </div>

          <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '10px 0' }} />

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
            <label>Password *</label>
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

          {error && <div className="login-error-msg">{error}</div>}

          <button type="submit" className="login-main-btn" disabled={loading || uploadingAvatar}>
            {loading ? 'Processing...' : 'Continue'}
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
