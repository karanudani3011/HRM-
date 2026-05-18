import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [totalUsers, setTotalUsers] = useState('...');
  const [newRegs, setNewRegs] = useState('...');
  const [activeSessions, setActiveSessions] = useState('...');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuth') === 'true';
    if (!isAuthenticated) {
      navigate('/admin/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!db) return;

    // Real-time listener for live user stats
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const total = snapshot.size;
      setTotalUsers(total);

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      let recentCount = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.createdAt) {
          const d = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
          if (d >= sevenDaysAgo) recentCount++;
        }
      });
      setNewRegs(recentCount);

      const simulatedActive = total === 0 ? 0 : Math.floor(total * 0.1) + Math.floor(Math.random() * 5) + 1;
      setActiveSessions(simulatedActive);
    }, (err) => {
      console.error('Snapshot error:', err);
      setTotalUsers(0);
      setNewRegs(0);
      setActiveSessions(0);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin/login', { replace: true });
  };

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="admin-dashboard-layout">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo">H</div>
          <div>
            <div className="admin-sidebar-title">HRM Admin</div>
            <div className="admin-sidebar-subtitle">Control Panel</div>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <div className="admin-nav-section-label">Main</div>
          <a href="/admin/dashboard" className="admin-nav-item active">
            <span className="admin-nav-icon">📊</span> Dashboard
          </a>
          <a href="/admin/services" className="admin-nav-item">
            <span className="admin-nav-icon">📋</span> Service Submissions
          </a>
          <div className="admin-nav-section-label">Manage</div>
          <a href="/admin/leads" className="admin-nav-item">
            <span className="admin-nav-icon">👥</span> Users
          </a>
          <a href="/admin/blogs" className="admin-nav-item">
            <span className="admin-nav-icon">📝</span> Blog Manager
          </a>
          <a href="#" className="admin-nav-item">
            <span className="admin-nav-icon">⚙️</span> Settings
          </a>
        </nav>

        <div className="admin-sidebar-footer">
          <button onClick={() => window.open('/', '_blank')} className="admin-visit-btn">
            🌐 Visit Website
          </button>
          <button onClick={handleLogout} className="admin-logout-btn">
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="admin-main-content">
        {/* Topbar */}
        <header className="admin-topbar">
          <h1>Overview</h1>
          <div className="admin-topbar-right">
            <span className="admin-topbar-badge">● Live</span>
            <span className="admin-topbar-time">{currentTime}</span>
          </div>
        </header>

        <div className="admin-content-area">

          {/* Welcome Card */}
          <div className="admin-welcome-card">
            <div>
              <h2>Welcome back, Admin! 👋</h2>
              <p>Here's what's happening with the HRM portal today.</p>
              <div className="admin-welcome-date">{today}</div>
            </div>
          </div>

          {/* Stats */}
          <div className="admin-section-title">Platform Statistics</div>
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <span className="admin-stat-icon">👤</span>
              <div className="admin-stat-title">Total Users</div>
              <div className="admin-stat-value">{totalUsers}</div>
              <div className="admin-stat-sub">Registered on platform</div>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-icon">🆕</span>
              <div className="admin-stat-title">New Registrations</div>
              <div className="admin-stat-value">{newRegs}</div>
              <div className="admin-stat-sub">In the last 7 days</div>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-icon">⚡</span>
              <div className="admin-stat-title">Active Sessions</div>
              <div className="admin-stat-value">{activeSessions}</div>
              <div className="admin-stat-sub">Estimated live users</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="admin-section-title">Quick Actions</div>
          <div className="admin-quick-actions">
            <a href="/admin/services" className="admin-action-card">
              <div className="admin-action-icon blue">📋</div>
              <div className="admin-action-text">
                <h4>Service Submissions</h4>
                <p>View & export client data</p>
              </div>
            </a>
            <a href="/admin/leads" className="admin-action-card">
              <div className="admin-action-icon green">👥</div>
              <div className="admin-action-text">
                <h4>Manage Users</h4>
                <p>View registered users</p>
              </div>
            </a>
            <a href="/" target="_blank" className="admin-action-card">
              <div className="admin-action-icon purple">🌐</div>
              <div className="admin-action-text">
                <h4>Visit Website</h4>
                <p>Open the public portal</p>
              </div>
            </a>
            <a href="#" className="admin-action-card">
              <div className="admin-action-icon amber">⚙️</div>
              <div className="admin-action-text">
                <h4>Settings</h4>
                <p>Configure portal settings</p>
              </div>
            </a>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
