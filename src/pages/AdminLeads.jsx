import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import './AdminLeads.css';

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
          <a href="/admin/dashboard" className="admin-nav-item">
            <span className="admin-nav-icon">📊</span> Dashboard
          </a>
          <a href="/admin/services" className="admin-nav-item">
            <span className="admin-nav-icon">📋</span> Service Submissions
          </a>
          <div className="admin-nav-section-label">Manage</div>
          <a href="/admin/leads" className="admin-nav-item active">
            <span className="admin-nav-icon">👥</span> Users
          </a>
          <a href="/admin/blogs" className="admin-nav-item">
            <span className="admin-nav-icon">📝</span> Blog Manager
          </a>
        </nav>

        <div className="admin-sidebar-footer">
          <button onClick={() => window.open('/', '_blank')} className="admin-visit-btn">
            🌐 Visit Website
          </button>
          <button onClick={() => { localStorage.removeItem('adminAuth'); navigate('/admin/login'); }} className="admin-logout-btn">
            🚪 Logout
          </button>
        </div>
      </aside>

      <main className="admin-main-content">
        <header className="admin-topbar">
          <div className="topbar-left">
            <h1>HR B2B Leads Extractor</h1>
            <p className="topbar-subtitle">Database Intelligence & Recruitment Tool</p>
          </div>
          <div className="admin-topbar-right">
            <span className="admin-topbar-badge">● System Ready</span>
            <span className="admin-topbar-time">{currentTime}</span>
          </div>
        </header>

        <div className="admin-content-area">
          {/* Credit Manager Section */}
          <div className="extractor-control-panel" style={{ marginBottom: '24px', border: '1px solid #1e293b' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6' }}>
              💳 User Search Credit Manager
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '16px' }}>
              Lookup users by their verified OTP email address to upgrade their search limit after receiving UPI manual payment screenshots.
            </p>
            
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '16px' }}>
              <div className="extractor-input-group" style={{ flex: 1, minWidth: '250px', marginBottom: 0 }}>
                <label style={{ color: '#cbd5e1', fontWeight: '500', marginBottom: '6px', display: 'block' }}>Lookup User by Email</label>
                <input 
                  type="email" 
                  placeholder="Enter user email..." 
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  style={{ background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '10px', borderRadius: '6px', width: '100%' }}
                />
              </div>
              <button 
                onClick={handleLookupUser} 
                disabled={creditLoading}
                style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', height: '40px', fontWeight: 'bold' }}
              >
                {creditLoading ? 'Searching...' : 'Lookup User'}
              </button>
            </div>

            {foundUser && (
              <form onSubmit={handleUpdateCredits} style={{ borderTop: '1px solid #334155', paddingTop: '16px', marginTop: '16px' }}>
                <div style={{ background: '#1e293b', padding: '12px', borderRadius: '6px', marginBottom: '16px', borderLeft: '4px solid #3b82f6' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '0.95rem' }}>
                    <strong>User:</strong> <span style={{ color: '#3b82f6' }}>{foundUser.email}</span> 
                    {foundUser.isNew && <span style={{ color: '#f59e0b', fontSize: '0.8rem', marginLeft: '8px', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>New User</span>}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.95rem' }}>
                    <strong>Current Balance:</strong> <span style={{ color: '#10b981', fontWeight: 'bold' }}>{foundUser.searches_remaining}</span> searches 
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem', marginLeft: '8px' }}>({foundUser.plan_level.toUpperCase()} Plan)</span>
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <div className="extractor-input-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
                    <label style={{ color: '#cbd5e1', fontWeight: '500', marginBottom: '6px', display: 'block' }}>Select Plan to Add Searches</label>
                    <select 
                      value={planLevel} 
                      onChange={(e) => setPlanLevel(e.target.value)}
                      style={{ background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '10px', borderRadius: '6px', width: '100%', cursor: 'pointer' }}
                    >
                      <option value="bronze">Bronze Plan (+5 Searches)</option>
                      <option value="silver">Silver Plan (+10 Searches)</option>
                      <option value="gold">Gold Plan (+20 Searches)</option>
                      <option value="custom">Custom Amount</option>
                    </select>
                  </div>

                  {planLevel === 'custom' && (
                    <div className="extractor-input-group" style={{ width: '150px', marginBottom: 0 }}>
                      <label style={{ color: '#cbd5e1', fontWeight: '500', marginBottom: '6px', display: 'block' }}>Custom Searches</label>
                      <input 
                        type="number" 
                        min="1"
                        placeholder="e.g. 50"
                        value={customSearches}
                        onChange={(e) => setCustomSearches(e.target.value)}
                        style={{ background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '10px', borderRadius: '6px', width: '100%' }}
                        required
                      />
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={creditLoading}
                    style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', height: '40px', fontWeight: 'bold' }}
                  >
                    {creditLoading ? 'Processing...' : 'Apply Plan / Add Credits'}
                  </button>
                </div>
              </form>
            )}

            {creditMessage && (
              <div style={{ marginTop: '16px', padding: '12px', borderRadius: '6px', background: creditMessage.startsWith('Error') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: creditMessage.startsWith('Error') ? '#ef4444' : '#10b981', border: creditMessage.startsWith('Error') ? '1px solid #ef4444' : '1px solid #10b981', fontSize: '0.9rem' }}>
                {creditMessage}
              </div>
            )}
          </div>

          {/* Active User Search Limits Table */}
          <div className="extractor-control-panel" style={{ marginBottom: '24px', border: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
                👥 Active User Search Limits ({allUserCredits.length})
              </h2>
              <button 
                onClick={fetchAllUserCredits} 
                disabled={listLoading}
                style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                🔄 Refresh List
              </button>
            </div>

            {listLoading ? (
              <div style={{ color: '#94a3b8', padding: '20px', textAlign: 'center' }}>Loading registered users...</div>
            ) : allUserCredits.length === 0 ? (
              <div style={{ color: '#94a3b8', padding: '20px', textAlign: 'center' }}>No search tracking records found in database.</div>
            ) : (
              <div className="admin-table-wrapper" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <table className="admin-service-table">
                  <thead>
                    <tr>
                      <th>User Email</th>
                      <th>Searches Remaining</th>
                      <th>Plan Level</th>
                      <th>Last Updated</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUserCredits.map((u) => (
                      <tr key={u.id} style={{ cursor: 'pointer' }} onClick={() => { setSearchEmail(u.email); setFoundUser(u); setCreditMessage(''); }}>
                        <td><strong style={{ color: '#cbd5e1' }}>{u.email}</strong></td>
                        <td>
                          <span style={{ 
                            color: u.searches_remaining === 0 ? '#ef4444' : '#10b981', 
                            fontWeight: 'bold', 
                            background: u.searches_remaining === 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            padding: '2px 8px',
                            borderRadius: '4px'
                          }}>
                            {u.searches_remaining} left
                          </span>
                        </td>
                        <td>
                          <span style={{ 
                            fontSize: '0.8rem', 
                            padding: '2px 6px', 
                            borderRadius: '4px',
                            background: u.plan_level === 'free' ? '#334155' : u.plan_level === 'bronze' ? '#b45309' : u.plan_level === 'silver' ? '#475569' : '#ca8a04',
                            color: '#fff',
                            textTransform: 'uppercase',
                            fontWeight: 'bold'
                          }}>
                            {u.plan_level}
                          </span>
                        </td>
                        <td>
                          <small style={{ color: '#94a3b8' }}>
                            {new Date(u.updated_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </small>
                        </td>
                        <td>
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation();
                              setSearchEmail(u.email); 
                              setFoundUser(u); 
                              setCreditMessage('');
                            }}
                            style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}
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
