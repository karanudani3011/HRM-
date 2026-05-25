import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import './AdminLeads.css';

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


const AdminLeads = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState('');

  // Credit Manager State
  const [searchEmail, setSearchEmail] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [creditLoading, setCreditLoading] = useState(false);
  const [planLevel, setPlanLevel] = useState('bronze');
  const [customSearches, setCustomSearches] = useState('');
  const [creditMessage, setCreditMessage] = useState('');

  // All registered credit users
  const [allUserCredits, setAllUserCredits] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  const fetchAllUserCredits = async () => {
    setListLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_search_credits')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      setAllUserCredits(data || []);
    } catch (err) {
      console.error('Error fetching all user credits:', err);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUserCredits();
  }, []);

  // Search User's credits
  const handleLookupUser = async () => {
    if (!searchEmail.trim()) {
      alert('Please enter an email address to lookup');
      return;
    }
    setCreditLoading(true);
    setCreditMessage('');
    try {
      const { data, error } = await supabase
        .from('user_search_credits')
        .select('*')
        .eq('email', searchEmail.trim().toLowerCase())
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // User not found
          setFoundUser({ email: searchEmail.trim().toLowerCase(), searches_remaining: 0, plan_level: 'none', isNew: true });
        } else {
          throw error;
        }
      } else {
        setFoundUser(data);
      }
    } catch (err) {
      console.error(err);
      setCreditMessage('Error: ' + err.message);
    } finally {
      setCreditLoading(false);
    }
  };

  // Update or Insert credits
  const handleUpdateCredits = async (e) => {
    e.preventDefault();
    if (!foundUser) return;

    setCreditLoading(true);
    setCreditMessage('');
    
    let additionalSearches = 0;
    if (planLevel === 'bronze') additionalSearches = 5;
    else if (planLevel === 'silver') additionalSearches = 10;
    else if (planLevel === 'gold') additionalSearches = 20;
    else if (planLevel === 'custom') additionalSearches = parseInt(customSearches) || 0;

    const newSearches = (foundUser.searches_remaining || 0) + additionalSearches;
    const finalPlan = planLevel === 'custom' ? 'custom' : planLevel;

    try {
      let error;
      if (foundUser.isNew) {
        // Insert
        const res = await supabase.from('user_search_credits').insert([
          { email: foundUser.email, searches_remaining: newSearches, plan_level: finalPlan }
        ]);
        error = res.error;
      } else {
        // Update
        const res = await supabase.from('user_search_credits')
          .update({ searches_remaining: newSearches, plan_level: finalPlan, updated_at: new Date() })
          .eq('email', foundUser.email);
        error = res.error;
      }

      if (error) throw error;

      setCreditMessage(`Success! Upgraded ${foundUser.email} to ${finalPlan.toUpperCase()} (+${additionalSearches} searches). Total searches: ${newSearches}`);
      setFoundUser({ ...foundUser, searches_remaining: newSearches, plan_level: finalPlan, isNew: false });
      fetchAllUserCredits();
    } catch (err) {
      console.error(err);
      setCreditMessage('Error: ' + err.message);
    } finally {
      setCreditLoading(false);
    }
  };

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuth') === 'true';
    if (!isAuthenticated) navigate('/admin/login', { replace: true });
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



  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin/login', { replace: true });
  };

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

          <a href="/admin/dashboard" className="admin-nav-item">
            <IconDashboard /> Overview
          </a>
          <a href="/admin/services" className="admin-nav-item">
            <IconClipboard /> Service Submissions
          </a>

          <div className="admin-nav-divider" />
          <div className="admin-nav-section-label">Manage</div>

          <a href="/admin/leads" className="admin-nav-item active">
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

      <main className="admin-main-content">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <h1>Users & Leads</h1>
            <p>Search credit management & dashboard metrics</p>
          </div>
          <div className="admin-topbar-right">
            <div className="admin-live-badge">
              <div className="admin-live-dot" /> System Active
            </div>
            <span className="admin-topbar-time">{currentTime}</span>
            <div className="admin-topbar-avatar">A</div>
          </div>
        </header>

        <div className="admin-content-area">
          {/* Credit Manager Section */}
          <div className="extractor-control-panel">
            <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: '#f0f0f0' }}>
              💳 User Search Credit Manager
            </h2>
            <p style={{ color: '#8a8a8e', fontSize: '13px', marginBottom: '16px', lineHeight: '1.4' }}>
              Lookup users by their verified OTP email address to upgrade their search limit after receiving UPI manual payment screenshots.
            </p>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '16px' }}>
              <div className="extractor-input-group" style={{ flex: 1, minWidth: '240px' }}>
                <label>Lookup User by Email</label>
                <div className="input-with-icon">
                  <input 
                    type="email" 
                    placeholder="Enter user email..." 
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                  />
                </div>
              </div>
              <button 
                onClick={handleLookupUser} 
                disabled={creditLoading}
                className="btn-start-extraction"
                style={{ flex: 'none', height: '46px', padding: '0 20px' }}
              >
                {creditLoading ? 'Searching...' : 'Lookup User'}
              </button>
            </div>

            {foundUser && (
              <form onSubmit={handleUpdateCredits} style={{ borderTop: '1px solid #2a2a2c', paddingTop: '16px', marginTop: '16px' }}>
                <div style={{ background: '#1c1c1e', padding: '14px', borderRadius: '8px', marginBottom: '16px', borderLeft: '3px solid #c0392b', borderTop: '1px solid #2a2a2c', borderRight: '1px solid #2a2a2c', borderBottom: '1px solid #2a2a2c' }}>
                  <p style={{ margin: '0 0 6px 0', fontSize: '13.5px', color: '#f0f0f0' }}>
                    <strong>User:</strong> <span style={{ color: '#e07070', fontWeight: '600', marginLeft: '6px' }}>{foundUser.email}</span> 
                    {foundUser.isNew && <span style={{ color: '#fbbf24', fontSize: '11px', marginLeft: '10px', background: 'rgba(180, 83, 9, 0.12)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(180, 83, 9, 0.25)', fontWeight: '600' }}>NEW USER RECORD</span>}
                  </p>
                  <p style={{ margin: 0, fontSize: '13.5px', color: '#f0f0f0' }}>
                    <strong>Current Balance:</strong> <span style={{ color: '#4ade80', fontWeight: '700', marginLeft: '6px' }}>{foundUser.searches_remaining}</span> searches 
                    <span style={{ color: '#8a8a8e', fontSize: '12px', marginLeft: '10px' }}>({foundUser.plan_level.toUpperCase()} Plan)</span>
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <div className="extractor-input-group" style={{ flex: 1, minWidth: '200px' }}>
                    <label>Select Plan to Add Searches</label>
                    <select 
                      value={planLevel} 
                      onChange={(e) => setPlanLevel(e.target.value)}
                      style={{ background: '#1c1c1e', border: '1px solid #2a2a2c', color: '#f0f0f0', padding: '11px 14px', borderRadius: '8px', width: '100%', cursor: 'pointer', fontSize: '13.5px', outline: 'none' }}
                    >
                      <option value="bronze">Bronze Plan (+5 Searches)</option>
                      <option value="silver">Silver Plan (+10 Searches)</option>
                      <option value="gold">Gold Plan (+20 Searches)</option>
                      <option value="custom">Custom Amount</option>
                    </select>
                  </div>

                  {planLevel === 'custom' && (
                    <div className="extractor-input-group" style={{ width: '140px' }}>
                      <label>Custom Searches</label>
                      <div className="input-with-icon">
                        <input 
                          type="number" 
                          min="1"
                          placeholder="e.g. 50"
                          value={customSearches}
                          onChange={(e) => setCustomSearches(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={creditLoading}
                    className="btn-export-csv"
                    style={{ flex: 'none', height: '46px', padding: '0 20px' }}
                  >
                    {creditLoading ? 'Processing...' : 'Apply Plan / Add Credits'}
                  </button>
                </div>
              </form>
            )}

            {creditMessage && (
              <div style={{ 
                marginTop: '16px', 
                padding: '12px', 
                borderRadius: '8px', 
                background: creditMessage.startsWith('Error') ? 'rgba(192, 57, 43, 0.08)' : 'rgba(22, 163, 74, 0.08)', 
                color: creditMessage.startsWith('Error') ? '#e74c3c' : '#4ade80', 
                border: creditMessage.startsWith('Error') ? '1px solid rgba(192, 57, 43, 0.2)' : '1px solid rgba(22, 163, 74, 0.2)', 
                fontSize: '13px' 
              }}>
                {creditMessage}
              </div>
            )}
          </div>

          {/* Active User Search Limits Table */}
          <div className="extractor-control-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#f0f0f0' }}>
                👥 Active User Search Limits
              </h2>
              <button 
                onClick={fetchAllUserCredits} 
                disabled={listLoading}
                style={{ background: '#1c1c1e', color: '#8a8a8e', border: '1px solid #2a2a2c', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', transition: 'all 0.15s' }}
                onMouseEnter={(e) => { e.target.style.background = '#222224'; e.target.style.color = '#f0f0f0'; }}
                onMouseLeave={(e) => { e.target.style.background = '#1c1c1e'; e.target.style.color = '#8a8a8e'; }}
              >
                {listLoading ? 'Refreshing...' : 'Refresh List'}
              </button>
            </div>

            {listLoading ? (
              <div className="admin-service-loading">⏳ Loading registered users...</div>
            ) : allUserCredits.length === 0 ? (
              <div className="admin-empty-state">
                <div className="admin-empty-icon">👥</div>
                <h3>No Records Found</h3>
                <p>No search tracking records found in the database.</p>
              </div>
            ) : (
              <div className="admin-table-wrapper" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table className="admin-service-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40%' }}>User Email</th>
                      <th>Searches Remaining</th>
                      <th>Plan Level</th>
                      <th>Last Updated</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUserCredits.map((u) => (
                      <tr key={u.id} style={{ cursor: 'pointer' }} onClick={() => { setSearchEmail(u.email); setFoundUser(u); setCreditMessage(''); }}>
                        <td><strong style={{ color: '#f0f0f0' }}>{u.email}</strong></td>
                        <td>
                          <span style={{ 
                            color: u.searches_remaining === 0 ? '#e74c3c' : '#4ade80', 
                            fontWeight: '600', 
                            background: u.searches_remaining === 0 ? 'rgba(192, 57, 43, 0.08)' : 'rgba(22, 163, 74, 0.08)',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: u.searches_remaining === 0 ? '1px solid rgba(192, 57, 43, 0.15)' : '1px solid rgba(22, 163, 74, 0.15)',
                            fontSize: '12px'
                          }}>
                            {u.searches_remaining} left
                          </span>
                        </td>
                        <td>
                          <span style={{ 
                            fontSize: '11px', 
                            padding: '3px 8px', 
                            borderRadius: '6px',
                            background: u.plan_level === 'free' ? 'rgba(255,255,255,0.04)' : u.plan_level === 'bronze' ? 'rgba(180, 83, 9, 0.12)' : u.plan_level === 'silver' ? 'rgba(100, 116, 139, 0.12)' : 'rgba(192, 57, 43, 0.12)',
                            color: u.plan_level === 'free' ? '#8a8a8e' : u.plan_level === 'bronze' ? '#fbbf24' : u.plan_level === 'silver' ? '#94a3b8' : '#e07070',
                            border: u.plan_level === 'free' ? '1px solid #2a2a2c' : u.plan_level === 'bronze' ? '1px solid rgba(180, 83, 9, 0.25)' : u.plan_level === 'silver' ? '1px solid rgba(100, 116, 139, 0.25)' : '1px solid rgba(192, 57, 43, 0.25)',
                            textTransform: 'uppercase',
                            fontWeight: '700',
                            letterSpacing: '0.2px'
                          }}>
                            {u.plan_level}
                          </span>
                        </td>
                        <td>
                          <span style={{ color: '#5a5a5e', fontSize: '12.5px' }}>
                            {new Date(u.updated_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation();
                              setSearchEmail(u.email); 
                              setFoundUser(u); 
                              setCreditMessage('');
                            }}
                            className="admin-view-btn"
                            style={{ display: 'inline-flex', width: 'auto', padding: '0 12px', height: '32px', fontSize: '12px' }}
                          >
                            ⚡ Select
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLeads;
