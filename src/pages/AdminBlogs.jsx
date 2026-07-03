import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot, orderBy, query, doc, deleteDoc } from 'firebase/firestore';
import { Trash2, User, Calendar, ExternalLink } from 'lucide-react';
import './AdminDashboard.css';
import './AdminBlogs.css';

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


const AdminBlogs = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState('');

  const [permissions, setPermissions] = useState([]);
  const [adminName, setAdminName] = useState('');

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuth') === 'true';
    if (!isAuthenticated) {
      navigate('/admin/login', { replace: true });
      return;
    }

    const perms = JSON.parse(localStorage.getItem('adminPermissions') || '[]');
    setPermissions(perms);
    setAdminName(localStorage.getItem('adminName') || 'Admin');

    if (!perms.includes('blogs')) {
      alert('Access Denied: You do not have permission to view Blog Manager.');
      navigate('/admin/dashboard', { replace: true });
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

    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = [];
      snap.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setPosts(data);
      setLoading(false);
    }, (err) => {
      console.error('Firestore blog snap error:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (postId) => {
    if (window.confirm("Are you sure you want to delete this blog post? This action is permanent and cannot be undone.")) {
      try {
        await deleteDoc(doc(db, 'posts', postId));
        alert("Blog post successfully deleted.");
      } catch (err) {
        alert("Error deleting post: " + err.message);
      }
    }
  };

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminCardId');
    localStorage.removeItem('adminPermissions');
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

          {permissions.includes('dashboard') && (
            <Link to="/admin/dashboard" className="admin-nav-item">
              <IconDashboard /> Overview
            </Link>
          )}
          {permissions.includes('services') && (
            <a href="/admin/services" className="admin-nav-item">
              <IconClipboard /> Service Submissions
            </a>
          )}

          <div className="admin-nav-divider" />
          <div className="admin-nav-section-label">Manage</div>

          {permissions.includes('leads') && (
            <a href="/admin/leads" className="admin-nav-item">
              <IconUsers /> Users & Leads
            </a>
          )}
          {permissions.includes('blogs') && (
            <a href="/admin/blogs" className="admin-nav-item active">
              <IconEdit /> Blog Manager
            </a>
          )}
          {permissions.includes('qrStats') && (
            <Link to="/admin/dashboard?tab=qr-stats" className="admin-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
              </svg>
              QR Stats
            </Link>
          )}
          {permissions.includes('adminAccess') && (
            <Link to="/admin/dashboard?tab=accounts" className="admin-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Admin Access
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

      {/* Main Content */}
      <main className="admin-main-content">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <h1>Blog Management</h1>
            <p>Moderate postings to maintain community guidelines</p>
          </div>
          <div className="admin-topbar-right">
            <div className="admin-records-badge">
              <span>{posts.length}</span> Posts
            </div>
            <span className="admin-topbar-time">{currentTime}</span>
            <div className="admin-topbar-avatar">A</div>
          </div>
        </header>

        <div className="admin-content-area">

          <div className="admin-section-title">Active Blog Posts ({posts.length})</div>

          {loading ? (
            <div className="admin-blogs-loading">⏳ Loading community posts...</div>
          ) : posts.length === 0 ? (
            <div className="admin-empty-state">
              <div className="admin-empty-icon">📭</div>
              <h3>No Blog Posts Found</h3>
              <p>When users upload blog posts, they will show up here for moderation.</p>
              <button onClick={() => window.open('/blog', '_blank')} className="admin-visit-btn" style={{ width: 'auto', marginTop: '16px', display: 'inline-flex' }}>
                ✍️ Write First Post
              </button>
            </div>
          ) : (
            <div className="admin-blogs-grid">
              {posts.map((post) => (
                <div key={post.id} className="admin-blog-card">
                  <div 
                    className="admin-blog-image" 
                    style={{ backgroundImage: `url(${post.imageUrl || '/placeholder-blog.jpg'})` }}
                  >
                    <span className="admin-blog-cat-badge">{post.category || 'General'}</span>
                  </div>
                  <div className="admin-blog-body">
                    <h3 className="admin-blog-title">{post.title}</h3>
                    <p className="admin-blog-excerpt">{post.excerpt || 'No summary provided.'}</p>
                    
                    <div className="admin-blog-meta-info">
                      <span className="meta-item"><User size={14} /> {post.author || 'Anonymous'}</span>
                      <span className="meta-item"><Calendar size={14} /> {formatDate(post.createdAt)}</span>
                    </div>

                    {post.externalUrl && (
                      <p style={{ margin: '0 0 16px 0', fontSize: '0.825rem', color: '#60a5fa', wordBreak: 'break-all' }}>
                        🔗 <strong>Reference URL:</strong> <a href={post.externalUrl} target="_blank" rel="noreferrer" style={{ color: '#93c5fd', textDecoration: 'underline', fontWeight: '500' }}>{post.externalUrl}</a>
                      </p>
                    )}

                    <div className="admin-blog-actions">
                      <button 
                        onClick={() => window.open(`/blog#${post.id}`, '_blank')} 
                        className="btn-action-view"
                        title="View on Website"
                      >
                        <ExternalLink size={16} /> View
                      </button>
                      <button 
                        onClick={() => handleDelete(post.id)} 
                        className="btn-action-delete"
                        title="Delete Post"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminBlogs;
