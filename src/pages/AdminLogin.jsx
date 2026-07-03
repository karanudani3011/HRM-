import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import './AdminLogin.css';

const AdminLogin = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('adminAuth') === 'true') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Check Super Admin hardcoded credentials
      if (id.trim() === 'admin' && password === 'admin123') {
        localStorage.setItem('adminAuth', 'true');
        localStorage.setItem('adminUsername', 'admin');
        localStorage.setItem('adminName', 'Super Admin');
        localStorage.setItem('adminCardId', '');
        // Super Admin gets all permissions
        localStorage.setItem('adminPermissions', JSON.stringify([
          'dashboard', 'services', 'leads', 'blogs', 'qrStats', 'adminAccess'
        ]));
        
        navigate('/admin/dashboard');
        return;
      }

      // 2. Check Firestore adminAccess collection
      if (db) {
        const q = query(
          collection(db, 'adminAccess'),
          where('username', '==', id.trim()),
          where('password', '==', password)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const adminDoc = querySnapshot.docs[0].data();
          localStorage.setItem('adminAuth', 'true');
          localStorage.setItem('adminUsername', adminDoc.username);
          localStorage.setItem('adminName', adminDoc.name || adminDoc.username);
          localStorage.setItem('adminCardId', (adminDoc.cardId || '').replace(/\s+/g, ''));
          localStorage.setItem('adminPermissions', JSON.stringify(adminDoc.permissions || []));
          
          navigate('/admin/dashboard');
        } else {
          setError('Invalid Admin ID or password. Please check your credentials and try again.');
          setLoading(false);
        }
      } else {
        setError('Database connection error. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during verification. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">

      {/* ── Left Branding Panel ── */}
      <div className="admin-login-panel-left">
        <div className="admin-grid-bg" />

        <div className="admin-brand-logo-wrap">
          <div className="admin-brand-icon">H</div>
          <div>
            <div className="admin-brand-name">HRM Doctors Choice</div>
            <div className="admin-brand-sub">ADMIN CONTROL PANEL</div>
          </div>
        </div>

        <div className="admin-login-hero-text">
          <div className="admin-login-hero-badge">
            <span />
            Secure Administration Portal
          </div>
          <h1>Manage the<br /><em>HRM Platform</em><br />with confidence.</h1>
          <p>
            Access real-time analytics, manage service submissions, user registrations, blog content, and platform settings — all in one secure place.
          </p>
        </div>

        <div className="admin-login-features">
          <div className="admin-feature-row">
            <div className="admin-feature-dot blue" />
            Real-time platform statistics & live user monitoring
          </div>
          <div className="admin-feature-row">
            <div className="admin-feature-dot green" />
            Manage Doctor, Hospital, HR & Partner registrations
          </div>
          <div className="admin-feature-row">
            <div className="admin-feature-dot purple" />
            Blog content management & lead data export tools
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="admin-login-panel-right">
        <div className="admin-form-header">
          <h2>Admin Sign In</h2>
          <p>Enter your credentials to access the control panel</p>
        </div>


        <form className="admin-login-form" onSubmit={handleLogin}>
          <div className="admin-field-group">
            <label htmlFor="adminId">Admin ID</label>
            <input
              id="adminId"
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Enter your admin ID"
              required
              autoComplete="off"
              autoFocus
            />
          </div>

          <div className="admin-field-group">
            <label htmlFor="adminPassword">Password</label>
            <div className="admin-password-wrap">
              <input
                id="adminPassword"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="admin-toggle-pw"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && <div className="admin-login-error">⚠ {error}</div>}

          <button type="submit" className="admin-submit-btn" disabled={loading}>
            {loading ? 'Verifying credentials…' : 'Sign In to Dashboard →'}
          </button>

          <p className="admin-form-footer-note">
            Restricted access · Authorised personnel only
          </p>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
