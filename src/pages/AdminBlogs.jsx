import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot, orderBy, query, doc, deleteDoc } from 'firebase/firestore';
import { Trash2, User, Calendar, ExternalLink } from 'lucide-react';
import './AdminDashboard.css';
import './AdminBlogs.css';

const AdminBlogs = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState('');

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
          <a href="/admin/services" className="admin-nav-item">
            <span className="admin-nav-icon">📋</span> Service Submissions
          </a>
          <div className="admin-nav-section-label">Manage</div>
          <a href="/admin/leads" className="admin-nav-item">
            <span className="admin-nav-icon">👥</span> Users
          </a>
          <a href="/admin/blogs" className="admin-nav-item active">
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

      {/* Main Content */}
      <main className="admin-main-content">
        <header className="admin-topbar">
          <h1>Blog Management</h1>
          <div className="admin-topbar-right">
            <span className="admin-topbar-badge">● {posts.length} Posts</span>
            <span className="admin-topbar-time">{currentTime}</span>
          </div>
        </header>

        <div className="admin-content-area">
          <div className="admin-welcome-card" style={{ background: 'linear-gradient(135deg, #111827 0%, #1e1b4b 100%)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
            <div>
              <h2>Blog Management Hub 📝</h2>
              <p>Moderate user postings, read, and delete blogs to maintain community standard guidelines.</p>
            </div>
          </div>

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

                    <div className="admin-blog-actions">
                      <button 
                        onClick={() => window.open('/blog', '_blank')} 
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
