import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('adminAuth') === 'true') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (id === 'admin' && password === 'admin123') {
        localStorage.setItem('adminAuth', 'true');
        navigate('/admin/dashboard');
      } else {
        setError('Invalid admin ID or password. Please try again.');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h2>Admin Portal</h2>
        <p className="admin-login-subtitle">Sign in to manage the HRM platform</p>
        {error && <div className="admin-error-message">⚠ {error}</div>}
        <form onSubmit={handleLogin}>
          <div className="admin-form-group">
            <label htmlFor="adminId">Admin ID</label>
            <input
              type="text"
              id="adminId"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Enter admin ID"
              required
              autoComplete="off"
            />
          </div>
          <div className="admin-form-group">
            <label htmlFor="adminPassword">Password</label>
            <input
              type="password"
              id="adminPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? 'Signing in...' : '→  Login to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
