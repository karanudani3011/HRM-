import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import './AdminDashboard.css';
import './AdminServiceSubmissions.css';

const AdminServiceSubmissions = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuth') === 'true';
    if (!isAuthenticated) navigate('/admin/login', { replace: true });
  }, [navigate]);

  useEffect(() => {
    // Real-time listener — updates instantly when a new form is submitted
    const q = query(collection(db, 'serviceForms'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = [];
      snap.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setSubmissions(data);
      setLoading(false);
    }, (err) => {
      console.error('Snapshot error:', err);
      setLoading(false);
    });

    // Cleanup listener when component unmounts
    return () => unsubscribe();
  }, []);

  const formTypes = ['All', 'Doctor Registration', 'Hospital Registration', 'HR Registration', 'Partner Registration'];

  const filtered = filter === 'All' ? submissions : submissions.filter(s => s.formType === filter);

  const downloadPDF = () => {
    const table = document.getElementById('service-table');
    if (!table) { alert('No data to export'); return; }
    const newWin = window.open('', '_blank');
    newWin.document.write(`
      <html><head><title>HRM Service Submissions</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h2 { color: #1e3a5f; margin-bottom: 4px; }
        p { color: #666; font-size: 13px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { background: #1e3a5f; color: white; padding: 10px 12px; text-align: left; }
        td { padding: 9px 12px; border-bottom: 1px solid #e5e7eb; }
        tr:nth-child(even) td { background: #f9fafb; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
        .badge-doctor { background: #dbeafe; color: #1d4ed8; }
        .badge-hospital { background: #dcfce7; color: #15803d; }
        .badge-hr { background: #fef9c3; color: #854d0e; }
        .badge-partner { background: #f3e8ff; color: #7c3aed; }
      </style>
      </head><body>
      <h2>HRM Service Form Submissions</h2>
      <p>Exported on ${new Date().toLocaleString('en-IN')}</p>
      ${table.outerHTML}
      </body></html>
    `);
    newWin.document.close();
    newWin.print();
  };

  const getBadgeClass = (type) => {
    if (!type) return '';
    if (type.includes('Doctor')) return 'badge badge-doctor';
    if (type.includes('Hospital')) return 'badge badge-hospital';
    if (type.includes('HR')) return 'badge badge-hr';
    if (type.includes('Partner')) return 'badge badge-partner';
    return 'badge';
  };

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="admin-dashboard-layout">
      {/* Sidebar */}
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
          <a href="/admin/services" className="admin-nav-item active">
            <span className="admin-nav-icon">📋</span> Service Submissions
          </a>
          <div className="admin-nav-section-label">Manage</div>
          <a href="#" className="admin-nav-item">
            <span className="admin-nav-icon">👥</span> Users
          </a>
          <a href="#" className="admin-nav-item">
            <span className="admin-nav-icon">⚙️</span> Settings
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

      {/* Main */}
      <main className="admin-main-content">
        <header className="admin-topbar">
          <h1>Service Submissions</h1>
          <div className="admin-topbar-right">
            <span className="admin-topbar-badge">● {filtered.length} Records</span>
            <button className="admin-download-btn" onClick={downloadPDF}>⬇ Download PDF</button>
          </div>
        </header>

        <div className="admin-content-area">

          {/* Filter tabs */}
          <div className="admin-filter-tabs">
            {formTypes.map(t => (
              <button
                key={t}
                className={`admin-filter-tab ${filter === t ? 'active' : ''}`}
                onClick={() => setFilter(t)}
              >
                {t}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="admin-service-loading">⏳ Loading submissions...</div>
          ) : filtered.length === 0 ? (
            <div className="admin-empty-state">
              <div className="admin-empty-icon">📭</div>
              <h3>No Submissions Yet</h3>
              <p>When clients fill out registration forms, their data will appear here.</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table id="service-table" className="admin-service-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Form Type</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>City</th>
                    <th>Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((sub, idx) => (
                    <tr key={sub.id}>
                      <td>{idx + 1}</td>
                      <td>
                        <span className={getBadgeClass(sub.formType)}>
                          {sub.formType || '—'}
                        </span>
                      </td>
                      <td>{sub.name || sub.fullName || sub.hospitalName || sub.contactPerson || '—'}</td>
                      <td>{sub.email || '—'}</td>
                      <td>{sub.mobile || '—'}</td>
                      <td>{sub.city || sub.currentCity || '—'}</td>
                      <td>{formatDate(sub.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminServiceSubmissions;
