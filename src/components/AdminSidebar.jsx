import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AdminSidebar.css';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin/login', { replace: true });
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/services', label: 'Service Submissions', icon: '📋' },
    { path: '/admin/leads', label: 'Leads Extractor', icon: '🧬' },
  ];

  return (
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
        {navItems.map((item) => (
          <a 
            key={item.path}
            href={item.path} 
            className={`admin-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              navigate(item.path);
            }}
          >
            <span className="admin-nav-icon">{item.icon}</span> {item.label}
          </a>
        ))}
        
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
        <button onClick={handleLogout} className="admin-logout-btn">
          🚪 Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
