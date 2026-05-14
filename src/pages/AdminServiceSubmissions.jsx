import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot, orderBy, query, doc, deleteDoc } from 'firebase/firestore';
import { Trash2, Eye, Download, Info } from 'lucide-react';
import './AdminDashboard.css';
import './AdminServiceSubmissions.css';

const AdminServiceSubmissions = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selectedSub, setSelectedSub] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const formTypes = ['All', 'Doctor Registration', 'Hospital Registration', 'HR Registration', 'Partner Registration', 'Contact Inquiry'];

  const filtered = filter === 'All' ? submissions : submissions.filter(s => s.formType === filter);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'serviceForms', id));
      } catch (err) {
        alert('Error deleting submission: ' + err.message);
      }
    }
  };

  const isImageUrl = (key, value) => {
    if (!value || typeof value !== 'string') return false;
    const k = key.toLowerCase();
    const isImageField = k.includes('photo') || k.includes('logo') || k.includes('selfie') || k.includes('letter') || k.includes('certificate') || k.includes('url');
    return isImageField && (value.startsWith('http') || value.startsWith('https'));
  };

  const downloadPDF = () => {
    if (filtered.length === 0) { alert('No data to export'); return; }
    const newWin = window.open('', '_blank');
    
    let reportContent = '';
    filtered.forEach((sub, idx) => {
      reportContent += `
        <div class="submission-block" style="page-break-after: always; margin-bottom: 30px; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px;">
          <h3 style="color: #1e3a5f; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
            Submission #${idx + 1}: ${sub.formType || 'Registration'}
          </h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            ${Object.entries(sub).map(([key, value]) => {
              if (key === 'id' || key === 'createdAt') return '';
              if (typeof value === 'object' && value !== null) {
                if (Array.isArray(value)) value = value.join(', ');
                else value = JSON.stringify(value);
              }
              // Clean up keys for display
              const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              
              let displayContent = value || '—';
              if (isImageUrl(key, value)) {
                displayContent = `<img src="${value}" style="max-width: 200px; max-height: 150px; border-radius: 4px; display: block; margin-top: 5px;" />`;
              }

              return `
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #f3f4f6; font-weight: 600; width: 30%; color: #4b5563;">${label}</td>
                  <td style="padding: 8px; border-bottom: 1px solid #f3f4f6; color: #111827;">${displayContent}</td>
                </tr>
              `;
            }).join('')}
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #4b5563;">Submitted At</td>
              <td style="padding: 8px; border-bottom: 1px solid #f3f4f6; color: #111827;">${formatDate(sub.createdAt)}</td>
            </tr>
          </table>
        </div>
      `;
    });

    newWin.document.write(`
      <html><head><title>Detailed HRM Service Report</title>
      <style>
        body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; line-height: 1.5; }
        h2 { color: #1e3a5f; margin-bottom: 10px; font-size: 24px; }
        .header { margin-bottom: 30px; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 20px; }
        .submission-block { background: white; }
      </style>
      </head><body>
      <div class="header">
        <h2>HRM Detailed Service Submissions Report</h2>
        <p style="color: #666;">Generated on ${new Date().toLocaleString('en-IN')}</p>
      </div>
      ${reportContent}
      </body></html>
    `);
    newWin.document.close();
    setTimeout(() => { newWin.print(); }, 500);
  };

  const getBadgeClass = (type) => {
    if (!type) return '';
    if (type.includes('Doctor')) return 'badge badge-doctor';
    if (type.includes('Hospital')) return 'badge badge-hospital';
    if (type.includes('HR')) return 'badge badge-hr';
    if (type.includes('Partner')) return 'badge badge-partner';
    if (type.includes('Contact')) return 'badge badge-contact';
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
            <button className="admin-download-btn" onClick={downloadPDF}>
              <Download size={18} /> Download PDF
            </button>
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
                    <th>Actions</th>
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
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="admin-view-btn" 
                            title="View Details"
                            onClick={() => { setSelectedSub(sub); setIsModalOpen(true); }}
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            className="admin-delete-btn" 
                            title="Delete Submission"
                            onClick={() => handleDelete(sub.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Details Modal */}
          {isModalOpen && selectedSub && (
            <div className="admin-modal-overlay">
              <div className="admin-modal-content">
                <div className="admin-modal-header">
                  <h3>Full Submission Details</h3>
                  <button onClick={() => setIsModalOpen(false)}>×</button>
                </div>
                <div className="admin-modal-body">
                  <div className="detail-type-badge">
                    <span className={getBadgeClass(selectedSub.formType)}>
                      {selectedSub.formType}
                    </span>
                  </div>
                  <table className="details-display-table">
                    <tbody>
                      {Object.entries(selectedSub).map(([key, value]) => {
                        if (key === 'id' || key === 'createdAt') return null;
                        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                        let displayValue = value;
                        if (Array.isArray(value)) displayValue = value.join(', ');
                        if (typeof value === 'boolean') displayValue = value ? 'Yes' : 'No';
                        if (
                          key.toLowerCase().includes('photo') || 
                          key.toLowerCase().includes('logo') || 
                          key.toLowerCase().includes('selfie') || 
                          key.toLowerCase().includes('letter') || 
                          key.toLowerCase().includes('certificate') ||
                          key.toLowerCase().includes('url')
                        ) {
                          if (value && typeof value === 'string' && (value.startsWith('http') || value.startsWith('https'))) {
                            displayValue = (
                              <div className="admin-img-preview-container">
                                <img src={value} alt={label} className="admin-detail-img" />
                                <a href={value} target="_blank" rel="noreferrer" className="img-link">
                                  🔍 View Full Size
                                </a>
                              </div>
                            );
                          }
                        }
                        return (
                          <tr key={key}>
                            <td className="label-td">{label}</td>
                            <td className="value-td">{displayValue || '—'}</td>
                          </tr>
                        );
                      })}
                      <tr>
                        <td className="label-td">Submitted At</td>
                        <td className="value-td">{formatDate(selectedSub.createdAt)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="admin-modal-footer">
                  <button onClick={() => setIsModalOpen(false)}>Close</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminServiceSubmissions;
