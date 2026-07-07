import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { QRCodeCanvas } from 'qrcode.react';
import CardScanner from '../components/CardScanner';
import { supabase } from '../lib/supabase';
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

  // Role-based state
  const [permissions, setPermissions] = useState([]);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminCardId, setAdminCardId] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Sub-Admin Management state
  const [accounts, setAccounts] = useState([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newPermissions, setNewPermissions] = useState({
    dashboard: false,
    services: false,
    leads: false,
    blogs: false,
    qrStats: false,
    adminAccess: false,
    scanner: false
  });

  // QR Stats state
  const [qrUsers, setQrUsers] = useState([]);
  const [copied, setCopied] = useState(false);

  // Card Activation / Renew state
  const [privilegeCards, setPrivilegeCards] = useState([]);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [cardSearch, setCardSearch] = useState('');

  const fetchPrivilegeCards = async () => {
    setCardsLoading(true);
    try {
      const { data, error } = await supabase
        .from('privilege_cards')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setPrivilegeCards(data || []);
    } catch (err) {
      console.error('Error fetching privilege cards:', err);
    } finally {
      setCardsLoading(false);
    }
  };

  const handleActivateCard = async (cardId) => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const joinDate = `${month}/${year}`;
    const expireDate = `${month}/${year + 1}`;

    try {
      const { error } = await supabase
        .from('privilege_cards')
        .update({ 
          card_status: 'ACTIVE',
          join_date: joinDate,
          expire_date: expireDate
        })
        .eq('id_no', cardId);

      if (error) throw error;
      alert(`Card ${cardId} activated successfully! Valid until ${expireDate}`);
      fetchPrivilegeCards();
    } catch (err) {
      console.error('Failed to activate card:', err);
      alert('Error activating card: ' + err.message);
    }
  };

  const handleDeactivateCard = async (cardId) => {
    try {
      const { error } = await supabase
        .from('privilege_cards')
        .update({ card_status: 'INACTIVE' })
        .eq('id_no', cardId);

      if (error) throw error;
      alert(`Card ${cardId} deactivated!`);
      fetchPrivilegeCards();
    } catch (err) {
      console.error('Failed to deactivate card:', err);
      alert('Error deactivating card: ' + err.message);
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm(`Are you sure you want to delete card ${cardId}?`)) return;
    try {
      const { error } = await supabase
        .from('privilege_cards')
        .delete()
        .eq('id_no', cardId);

      if (error) throw error;
      alert(`Card ${cardId} deleted!`);
      fetchPrivilegeCards();
    } catch (err) {
      console.error('Failed to delete card:', err);
      alert('Error deleting card: ' + err.message);
    }
  };

  /* ── Auth guard & Permissions init ── */
  useEffect(() => {
    if (localStorage.getItem('adminAuth') !== 'true') {
      navigate('/admin/login', { replace: true });
      return;
    }

    const perms = JSON.parse(localStorage.getItem('adminPermissions') || '[]');
    setPermissions(perms);
    setAdminUsername(localStorage.getItem('adminUsername') || '');
    setAdminName(localStorage.getItem('adminName') || '');
    const cid = localStorage.getItem('adminCardId') || '';
    setAdminCardId(cid);

    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab') || 'overview';
    
    if (tab === 'overview' && !perms.includes('dashboard')) {
      if (perms.includes('qrStats')) {
        navigate('/admin/dashboard?tab=qr-stats', { replace: true });
        setActiveTab('qr-stats');
      } else if (perms.includes('services')) {
        navigate('/admin/services', { replace: true });
      } else if (perms.includes('leads')) {
        navigate('/admin/leads', { replace: true });
      } else if (perms.includes('blogs')) {
        navigate('/admin/blogs', { replace: true });
      } else if (perms.includes('adminAccess')) {
        navigate('/admin/dashboard?tab=accounts', { replace: true });
        setActiveTab('accounts');
      } else if (perms.includes('scanner')) {
        navigate('/admin/dashboard?tab=scanner', { replace: true });
        setActiveTab('scanner');
      } else {
        localStorage.removeItem('adminAuth');
        navigate('/admin/login', { replace: true });
      }
    } else {
      setActiveTab(tab);
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

  /* ── Fetch privilege cards when activation tab is active ── */
  useEffect(() => {
    if (activeTab === 'activation') {
      fetchPrivilegeCards();
    }
  }, [activeTab]);

  /* ── Real-time Firestore stats ── */
  useEffect(() => {
    if (!db || !permissions.includes('dashboard')) return;
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
  }, [permissions]);

  /* ── Sub-Admin Accounts Realtime subscription ── */
  useEffect(() => {
    if (!db || !permissions.includes('adminAccess')) return;
    const unsub = onSnapshot(collection(db, 'adminAccess'), (snap) => {
      const list = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setAccounts(list);
    });
    return () => unsub();
  }, [permissions]);

  /* ── QR Stats Realtime subscription ── */
  useEffect(() => {
    if (!db || !permissions.includes('qrStats') || !adminCardId) return;
    const cleanCardId = adminCardId.replace(/\s+/g, '').toUpperCase();
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      const list = [];
      snap.forEach((doc) => {
        const data = doc.data();
        if (data.referredByCardId && data.referredByCardId.replace(/\s+/g, '').toUpperCase() === cleanCardId) {
          list.push({ id: doc.id, ...data });
        }
      });
      setQrUsers(list);
    }, (err) => {
      console.error('QR Stats snapshot error:', err);
    });
    return () => unsub();
  }, [permissions, adminCardId]);

  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) {
      alert('Username and Password are required');
      return;
    }
    
    const permsArray = Object.keys(newPermissions).filter(key => newPermissions[key]);
    
    try {
      await addDoc(collection(db, 'adminAccess'), {
        username: newUsername.trim(),
        password: newPassword.trim(),
        name: newDisplayName.trim(),
        permissions: permsArray,
        createdAt: new Date()
      });
      
      setNewUsername('');
      setNewPassword('');
      setNewDisplayName('');
      setNewPermissions({
        dashboard: false,
        services: false,
        leads: false,
        blogs: false,
        qrStats: false,
        adminAccess: false,
        scanner: false
      });
      alert('Sub-Admin account created successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to add account: ' + err.message);
    }
  };

  const handleDeleteAccount = async (docId) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await deleteDoc(doc(db, 'adminAccess', docId));
      } catch (err) {
        console.error(err);
        alert('Failed to delete account: ' + err.message);
      }
    }
  };

  const handleExportCSV = () => {
    if (qrUsers.length === 0) {
      alert('No data to export.');
      return;
    }
    
    const headers = ['Email', 'Role/Type', 'Referred By Card ID'];
    const rows = qrUsers.map(u => [
      u.email,
      u.type || 'user',
      u.referredByCardId
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${adminName.replace(/\s+/g, '_')}_QR_Registrations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminCardId');
    localStorage.removeItem('adminPermissions');
    navigate('/admin/login', { replace: true });
  };

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // Helper – Super Admin has all permissions; sub-admins only what's in their array
  const hasPermission = (key) => permissions.includes(key);

  return (
    <div className="admin-dashboard-layout">

      {/* ══ SIDEBAR ══ */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo-img-wrap">
            <img src="/logo.jpeg" alt="HRM" className="admin-sidebar-brand-logo" />
          </div>
          <div>
            <div className="admin-sidebar-title">HRM Admin</div>
            <div className="admin-sidebar-subtitle">Control Panel</div>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <div className="admin-nav-section-label">Main</div>

          {hasPermission('dashboard') && (
            <Link to="/admin/dashboard" className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              <IconDashboard /> Overview
            </Link>
          )}
          {hasPermission('services') && (
            <a href="/admin/services" className="admin-nav-item">
              <IconClipboard /> Service Submissions
            </a>
          )}

          <div className="admin-nav-divider" />
          <div className="admin-nav-section-label">Manage</div>

          {hasPermission('leads') && (
            <a href="/admin/leads" className="admin-nav-item">
              <IconUsers /> Users & Leads
            </a>
          )}
          {hasPermission('blogs') && (
            <a href="/admin/blogs" className="admin-nav-item">
              <IconEdit /> Blog Manager
            </a>
          )}
          {hasPermission('qrStats') && (
            <Link to="/admin/dashboard?tab=qr-stats" className={`admin-nav-item ${activeTab === 'qr-stats' ? 'active' : ''}`} onClick={() => setActiveTab('qr-stats')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
              </svg>
              QR Stats
            </Link>
          )}
          {hasPermission('adminAccess') && (
            <Link to="/admin/dashboard?tab=accounts" className={`admin-nav-item ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Admin Access
            </Link>
          )}
          {hasPermission('scanner') && (
            <Link to="/admin/dashboard?tab=scanner" className={`admin-nav-item ${activeTab === 'scanner' ? 'active' : ''}`} onClick={() => setActiveTab('scanner')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon">
                <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
              </svg>
              Card Scanner
            </Link>
          )}
          {hasPermission('dashboard') && (
            <Link to="/admin/dashboard?tab=activation" className={`admin-nav-item ${activeTab === 'activation' ? 'active' : ''}`} onClick={() => setActiveTab('activation')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              Card Activation / Renew
            </Link>
          )}
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
            <h1>{activeTab === 'overview' ? 'Overview' : activeTab === 'accounts' ? 'Admin Access' : activeTab === 'scanner' ? 'Card Scanner' : activeTab === 'activation' ? 'Card Activation & Renewals' : 'QR Registration Stats'}</h1>
            <p>HRM Doctors Choice — Admin Panel ({adminName})</p>
          </div>
          <div className="admin-topbar-right">
            <div className="admin-live-badge">
              <div className="admin-live-dot" /> Live
            </div>
            <span className="admin-topbar-time">{currentTime}</span>
            <div className="admin-topbar-avatar">{adminName.charAt(0).toUpperCase()}</div>
          </div>
        </header>

        <div className="admin-content-area">

          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && hasPermission('dashboard') && (
            <>
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
                  {hasPermission('services') && (
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
                  )}

                  {hasPermission('leads') && (
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
                  )}

                  {hasPermission('blogs') && (
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
                  )}

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
            </>
          )}

          {/* 2. ADMIN ACCESS MANAGEMENT TAB */}
          {activeTab === 'accounts' && hasPermission('adminAccess') && (
            <div className="admin-accounts-layout">
              {/* Form card */}
              <div className="admin-form-card">
                <h3 className="admin-form-title">Create Sub-Admin Account</h3>
                <form onSubmit={handleAddAccount} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="admin-input-group">
                    <label>Username / Admin ID *</label>
                    <input 
                      type="text" 
                      className="admin-text-input" 
                      placeholder="e.g. apollo_hospital" 
                      value={newUsername} 
                      onChange={e => setNewUsername(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="admin-input-group">
                    <label>Password *</label>
                    <input 
                      type="password" 
                      className="admin-text-input" 
                      placeholder="Enter password" 
                      value={newPassword} 
                      onChange={e => setNewPassword(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="admin-input-group">
                    <label>Display Name</label>
                    <input 
                      type="text" 
                      className="admin-text-input" 
                      placeholder="e.g. Apollo Hospital" 
                      value={newDisplayName} 
                      onChange={e => setNewDisplayName(e.target.value)} 
                    />
                  </div>
                  <div className="admin-input-group">
                    <label>Permissions Access</label>
                    <div className="admin-checkbox-list">
                      {Object.keys(newPermissions).map(key => (
                        <label key={key} className="admin-checkbox-item">
                          <input 
                            type="checkbox" 
                            checked={newPermissions[key]} 
                            onChange={e => setNewPermissions({...newPermissions, [key]: e.target.checked})} 
                          />
                          <span>{key === 'dashboard' ? 'Dashboard / Overview' : key === 'qrStats' ? 'QR Registration Stats' : key === 'adminAccess' ? 'Admin Access Manager' : key === 'scanner' ? 'Card Scanner (Hospital)' : key.charAt(0).toUpperCase() + key.slice(1)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <button type="submit" className="admin-submit-btn">Create Account</button>
                </form>
              </div>

              {/* Table card */}
              <div className="admin-table-card">
                <h3 className="admin-form-title" style={{ marginBottom: '16px' }}>Manage Sub-Admin Accounts</h3>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Display Name</th>
                      <th>Username</th>
                      <th>Permissions</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map(acc => (
                      <tr key={acc.id}>
                        <td><strong>{acc.name || 'Unnamed'}</strong></td>
                        <td>{acc.username}</td>
                        <td>
                          {(acc.permissions || []).map(p => (
                            <span key={p} className="admin-perm-badge">{p}</span>
                          ))}
                        </td>
                        <td>
                          <button onClick={() => handleDeleteAccount(acc.id)} className="admin-delete-btn" title="Delete Account">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {accounts.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--ad-text-3)' }}>
                          No sub-admin accounts configured.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. QR REGISTRATION STATS TAB */}
          {activeTab === 'qr-stats' && hasPermission('qrStats') && (
            <div className="qr-stats-layout">
              {/* Sidebar stats/QR display */}
              <div className="qr-stats-sidebar">
                <h3 className="admin-form-title">Your QR Codes</h3>
                
                {adminCardId ? (
                  <>
                    {/* Dark metallic card preview */}
                    <div className="admin-id-card-mini">
                      <div className="admin-id-card-mini-metal" />
                      <div className="admin-id-mini-logo-row">
                        <img src="/logo.png" alt="HRM" className="admin-id-mini-logo" />
                      </div>
                      <p className="admin-id-mini-tagline">HRM CONSULTANCY · VOLUTORS CHOICE</p>
                      <div className="admin-id-mini-qr">
                        <div style={{ background: '#fff', padding: 8, borderRadius: 6, display: 'inline-block' }}>
                          <QRCodeCanvas 
                            value={`https://myhrm.co.in/verify/${adminCardId}`} 
                            size={100} 
                            level="H"
                          />
                        </div>
                      </div>
                      <div className="admin-id-mini-detail">
                        <span className="admin-id-mini-label">HRM ID:</span>
                        <span className="admin-id-mini-value">{adminCardId}</span>
                      </div>
                      <div className="admin-id-mini-detail">
                        <span className="admin-id-mini-label">Name:</span>
                        <span className="admin-id-mini-value">{adminName}</span>
                      </div>
                      <div className="admin-id-mini-footer">www.myhrm.co.in</div>
                    </div>

                    <p style={{ fontSize: '11px', color: 'var(--ad-text-3)', margin: 0, textAlign: 'center' }}>
                      Verification QR linked to Card ID: <code style={{ color: '#e74c3c' }}>{adminCardId}</code>
                    </p>

                    <div className="admin-nav-divider" style={{ width: '100%', margin: '10px 0' }} />

                    <div className="qr-info-box">
                      <label style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--ad-text-3)' }}>
                        Direct Registration Link
                      </label>
                      <div className="qr-link-copy">
                        <input 
                          type="text" 
                          readOnly 
                          value={`https://myhrm.co.in/portal/user/register?ref=${adminCardId}`} 
                        />
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`https://myhrm.co.in/portal/user/register?ref=${adminCardId}`);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }} 
                          className="qr-copy-btn"
                        >
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--ad-text-3)', margin: '4px 0 0 0' }}>
                        Share this link or print a QR code with this URL to track direct registrations.
                      </p>
                    </div>
                  </>
                ) : (
                  <p style={{ color: 'var(--ad-text-3)', fontSize: '13px' }}>
                    No Privilege ID Card is linked to this account. Contact Super Admin to link a Card ID.
                  </p>
                )}
              </div>

              {/* Stats Table */}
              <div className="admin-table-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 className="admin-form-title" style={{ margin: 0 }}>QR Code Registrations</h3>
                    <p style={{ fontSize: '12px', color: 'var(--ad-text-3)', margin: '4px 0 0 0' }}>
                      Registered members tracked via your privilege card QR code.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ background: 'var(--ad-accent-dim)', color: '#e74c3c', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '700' }}>
                      Total: {qrUsers.length}
                    </div>
                    <button onClick={handleExportCSV} className="admin-submit-btn" style={{ padding: '8px 16px', fontSize: '12.5px' }}>
                      Export Leads (CSV)
                    </button>
                  </div>
                </div>

                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Account Type</th>
                      <th>Tracking ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qrUsers.map(user => (
                      <tr key={user.id}>
                        <td><strong>{user.email}</strong></td>
                        <td>
                          <span className="admin-perm-badge" style={{ background: 'rgba(231, 76, 60, 0.15)', color: '#e74c3c' }}>
                            {user.type || 'user'}
                          </span>
                        </td>
                        <td><code>{user.referredByCardId}</code></td>
                      </tr>
                    ))}
                    {qrUsers.length === 0 && (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center', padding: '36px', color: 'var(--ad-text-3)' }}>
                          No users registered using your QR code yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. SCANNER TAB */}
          {activeTab === 'scanner' && hasPermission('scanner') && (
            <div className="admin-scanner-layout" style={{ height: '100%' }}>
              <CardScanner />
            </div>
          )}

          {/* 5. CARD ACTIVATION / RENEWAL TAB */}
          {activeTab === 'activation' && hasPermission('dashboard') && (
            <div className="activation-tab-layout">
              {/* Stats Panel */}
              <div className="admin-stats-grid" style={{ marginBottom: '24px' }}>
                <div className="admin-stat-card red">
                  <div className="admin-stat-label">Total Cards</div>
                  <div className="admin-stat-value">{privilegeCards.length}</div>
                  <div className="admin-stat-sub">Generated privilege cards</div>
                </div>
                <div className="admin-stat-card amber">
                  <div className="admin-stat-label">Pending Approval</div>
                  <div className="admin-stat-value" style={{ color: '#f39c12' }}>
                    {privilegeCards.filter(c => c.card_status === 'PENDING_ACTIVATION').length}
                  </div>
                  <div className="admin-stat-sub">Reactivation / renewal requests</div>
                </div>
                <div className="admin-stat-card green">
                  <div className="admin-stat-label">Active Cards</div>
                  <div className="admin-stat-value" style={{ color: '#2ecc71' }}>
                    {privilegeCards.filter(c => c.card_status === 'ACTIVE').length}
                  </div>
                  <div className="admin-stat-sub">Active members</div>
                </div>
              </div>

              {/* Privilege Cards Table */}
              <div className="admin-table-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 className="admin-form-title" style={{ margin: 0 }}>Privilege ID Cards Management</h3>
                    <p style={{ fontSize: '12px', color: 'var(--ad-text-3)', margin: '4px 0 0 0' }}>
                      Activate, renew, deactivate, or delete user privilege cards.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      placeholder="Search ID, Name or City..." 
                      value={cardSearch} 
                      onChange={e => setCardSearch(e.target.value)}
                      className="admin-text-input"
                      style={{ padding: '8px 12px', width: '220px', fontSize: '13px' }}
                    />
                    <button onClick={fetchPrivilegeCards} className="admin-submit-btn" style={{ padding: '8px 16px', fontSize: '12.5px' }}>
                      Refresh
                    </button>
                  </div>
                </div>

                {cardsLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--ad-text-3)' }}>
                    Loading cards data...
                  </div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Photo</th>
                        <th>Name / Contact</th>
                        <th>HRM ID</th>
                        <th>Location</th>
                        <th>Dates</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {privilegeCards
                        .filter(card => {
                          const s = cardSearch.toLowerCase();
                          return (
                            (card.name && card.name.toLowerCase().includes(s)) ||
                            (card.id_no && card.id_no.toLowerCase().includes(s)) ||
                            (card.city && card.city.toLowerCase().includes(s)) ||
                            (card.mobile && card.mobile.includes(s))
                          );
                        })
                        .map(card => (
                          <tr key={card.id}>
                            <td>
                              {card.photo_url ? (
                                <img 
                                  src={card.photo_url} 
                                  alt="" 
                                  style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover', border: '1px solid var(--ad-border)' }} 
                                />
                              ) : (
                                <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#888' }}>
                                  No Photo
                                </div>
                              )}
                            </td>
                            <td>
                              <strong>{card.name}</strong>
                              <div style={{ fontSize: '11px', color: 'var(--ad-text-3)', marginTop: '2px' }}>{card.mobile || 'No Mobile'}</div>
                            </td>
                            <td><code>{card.id_no}</code></td>
                            <td>{card.city || '—'}</td>
                            <td>
                              <div style={{ fontSize: '12px' }}>Join: {card.join_date}</div>
                              <div style={{ fontSize: '11px', color: 'var(--ad-text-3)', marginTop: '2px' }}>Exp: {card.expire_date}</div>
                            </td>
                            <td>
                              {card.card_status === 'ACTIVE' && (
                                <span className="admin-perm-badge" style={{ background: 'rgba(46, 204, 113, 0.15)', color: '#2ecc71' }}>
                                  ACTIVE
                                </span>
                              )}
                              {card.card_status === 'PENDING_ACTIVATION' && (
                                <span className="admin-perm-badge" style={{ background: 'rgba(243, 156, 18, 0.15)', color: '#f39c12', animation: 'pulse 2s infinite' }}>
                                  PENDING APPROVAL
                                </span>
                              )}
                              {(card.card_status === 'INACTIVE' || !card.card_status) && (
                                <span className="admin-perm-badge" style={{ background: 'rgba(149, 165, 166, 0.15)', color: '#95a5a6' }}>
                                  INACTIVE
                                </span>
                              )}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                {card.card_status !== 'ACTIVE' ? (
                                  <button 
                                    onClick={() => handleActivateCard(card.id_no)} 
                                    className="admin-submit-btn" 
                                    style={{ padding: '4px 8px', fontSize: '11px', background: '#2ecc71', borderColor: '#2ecc71' }}
                                  >
                                    Approve / Activate
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => handleActivateCard(card.id_no)} 
                                    className="admin-submit-btn" 
                                    style={{ padding: '4px 8px', fontSize: '11px', background: '#3498db', borderColor: '#3498db' }}
                                  >
                                    Renew (1 Yr)
                                  </button>
                                )}
                                
                                {card.card_status === 'ACTIVE' && (
                                  <button 
                                    onClick={() => handleDeactivateCard(card.id_no)} 
                                    className="admin-delete-btn" 
                                    style={{ padding: '4px 8px', fontSize: '11px', background: '#e67e22', color: '#fff' }}
                                  >
                                    Deactivate
                                  </button>
                                )}
                                
                                <button 
                                  onClick={() => handleDeleteCard(card.id_no)} 
                                  className="admin-delete-btn" 
                                  style={{ padding: '4px 8px', fontSize: '11px' }}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      {privilegeCards.length === 0 && (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--ad-text-3)' }}>
                            No privilege cards found in database.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
