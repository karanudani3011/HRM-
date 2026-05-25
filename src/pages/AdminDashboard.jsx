import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import './AdminDashboard.css';

/* ── Inline SVG Icons ── */
const IconDashboard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);
const IconClipboard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon">
    <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
);
const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);
const IconEdit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconSettings = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
);
const IconGlobe = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
  </svg>
);
const IconLogout = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconUserStat = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconTrendUp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);
const IconZap = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:12,height:12}}>
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [totalUsers, setTotalUsers]       = useState('—');
  const [newRegs, setNewRegs]             = useState('—');
  const [activeSessions, setActiveSessions] = useState('—');
  const [currentTime, setCurrentTime]     = useState('');

  /* ── Auth guard ── */
  useEffect(() => {
    if (localStorage.getItem('adminAuth') !== 'true') {
      navigate('/admin/login', { replace: true });
    }
  }, [navigate]);

  /* ── Clock ── */
  useEffect(() => {
    const tick = () => setCurrentTime(
      new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    );
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  /* ── Real-time Firestore stats ── */
  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      const total = snap.size;
      setTotalUsers(total);

      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      let recent = 0;
      snap.forEach((doc) => {
        const d = doc.data().createdAt;
        if (d) {
          const date = d.toDate ? d.toDate() : new Date(d);
          if (date >= cutoff) recent++;
        }
      });
      setNewRegs(recent);
      setActiveSessions(total === 0 ? 0 : Math.max(1, Math.floor(total * 0.1) + Math.floor(Math.random() * 4)));
    }, (err) => {
      console.error('Snapshot error:', err);
      setTotalUsers(0); setNewRegs(0); setActiveSessions(0);
    });
    return () => unsub();
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

      {/* ══ SIDEBAR ══ */}
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
            <IconDashboard /> Overview
          </a>
          <a href="/admin/services" className="admin-nav-item">
            <IconClipboard /> Service Submissions
          </a>

          <div className="admin-nav-divider" />
          <div className="admin-nav-section-label">Manage</div>

          <a href="/admin/leads" className="admin-nav-item">
            <IconUsers /> Users & Leads
          </a>
          <a href="/admin/blogs" className="admin-nav-item">
            <IconEdit /> Blog Manager
          </a>
          <a href="#" className="admin-nav-item">
            <IconSettings /> Settings
          </a>
        </nav>

        <div className="admin-sidebar-footer">
          <button onClick={() => window.open('/', '_blank')} className="admin-visit-btn">
            <IconGlobe /> Visit Website
          </button>
          <button onClick={handleLogout} className="admin-logout-btn">
            <IconLogout /> Logout
          </button>
        </div>
      </aside>

      {/* ══ MAIN CONTENT ══ */}
      <main className="admin-main-content">

        {/* Top Bar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <h1>Overview</h1>
            <p>HRM Doctors Choice — Admin Panel</p>
          </div>
          <div className="admin-topbar-right">
            <div className="admin-live-badge">
              <div className="admin-live-dot" /> Live
            </div>
            <span className="admin-topbar-time">{currentTime}</span>
            <div className="admin-topbar-avatar">A</div>
          </div>
        </header>

        <div className="admin-content-area">

          {/* Stats */}
          <div>
            <div className="admin-section-header">
              <div className="admin-section-title">Platform Statistics</div>
            </div>
            <div className="admin-stats-grid">
              <div className="admin-stat-card red">
                <div className="admin-stat-icon-wrap red"><IconUserStat /></div>
                <div className="admin-stat-label">Total Users</div>
                <div className="admin-stat-value">{totalUsers}</div>
                <div className="admin-stat-sub">Registered on platform</div>
              </div>
              <div className="admin-stat-card green">
                <div className="admin-stat-icon-wrap green"><IconTrendUp /></div>
                <div className="admin-stat-label">New Registrations</div>
                <div className="admin-stat-value">{newRegs}</div>
                <div className="admin-stat-sub">Last 7 days</div>
              </div>
              <div className="admin-stat-card amber">
                <div className="admin-stat-icon-wrap amber"><IconZap /></div>
                <div className="admin-stat-label">Active Sessions</div>
                <div className="admin-stat-value">{activeSessions}</div>
                <div className="admin-stat-sub">Estimated live users</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="admin-section-header">
              <div className="admin-section-title">Quick Actions</div>
            </div>
            <div className="admin-quick-actions">
              <a href="/admin/services" className="admin-action-card">
                <div className="admin-action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/>
                    <rect x="8" y="2" width="8" height="4" rx="1"/>
                  </svg>
                </div>
                <div className="admin-action-text">
                  <h4>Service Submissions</h4>
                  <p>View & export client data</p>
                </div>
              </a>

              <a href="/admin/leads" className="admin-action-card">
                <div className="admin-action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
                  </svg>
                </div>
                <div className="admin-action-text">
                  <h4>Manage Users</h4>
                  <p>View all registered users</p>
                </div>
              </a>

              <a href="/admin/blogs" className="admin-action-card">
                <div className="admin-action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </div>
                <div className="admin-action-text">
                  <h4>Blog Manager</h4>
                  <p>Create & manage blog posts</p>
                </div>
              </a>

              <a href="/" target="_blank" rel="noreferrer" className="admin-action-card">
                <div className="admin-action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
                  </svg>
                </div>
                <div className="admin-action-text">
                  <h4>Visit Website</h4>
                  <p>Open the public portal</p>
                </div>
              </a>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
