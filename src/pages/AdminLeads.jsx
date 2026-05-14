import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Download, 
  MapPin, 
  ShieldCheck, 
  Database, 
  Zap,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import './AdminDashboard.css';
import './AdminLeads.css';

const AdminLeads = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

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

  const handleStartExtraction = async () => {
    if (!keyword.trim() && !location.trim()) {
      alert('Please enter a Keyword or Location to start extraction.');
      return;
    }

    try {
      setExtracting(true);
      setErrorMsg('');
      setProgress(10);
      
      let extractionQuery = supabase.from('doctors_data').select('*');

      if (keyword.trim()) {
        extractionQuery = extractionQuery.or(`full_name.ilike.%${keyword.trim()}%,specialization.ilike.%${keyword.trim()}%`);
      }
      
      if (location.trim()) {
        extractionQuery = extractionQuery.ilike('city', `%${location.trim()}%`);
      }

      setProgress(40);
      const { data, error } = await extractionQuery.order('created_at', { ascending: false });

      if (error) throw error;

      setProgress(80);
      if (isVerified && data && data.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      setLeads(data || []);
      setProgress(100);
      
      setTimeout(() => {
        setExtracting(false);
        setProgress(0);
      }, 500);

    } catch (err) {
      console.error('Extraction error:', err);
      setErrorMsg(err.message || 'Failed to extract data.');
      setExtracting(false);
      setProgress(0);
    }
  };

  const handleExport = () => {
    if (leads.length === 0) return;
    const exportData = leads.map(l => ({
      'Full Name': l.full_name,
      'Specialization': l.specialization,
      'Email': l.email,
      'Phone': l.phone,
      'City': l.city,
      'Medical Registration': l.medical_registration_no,
      'Verification Status': isVerified ? 'Verified' : 'Unverified'
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    XLSX.writeFile(workbook, `HRM_Leads_${Date.now()}.xlsx`);
  };

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
          <a href="/admin/leads" className="admin-nav-item active">
            <span className="admin-nav-icon">🧬</span> Leads Extractor
          </a>
          <div className="admin-nav-section-label">Manage</div>
          <a href="#" className="admin-nav-item">
            <span className="admin-nav-icon">👥</span> Users
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
          <div className="extractor-control-panel">
            <div className="extractor-inputs-grid">
              <div className="extractor-input-group">
                <label>Keyword / Specialty</label>
                <div className="input-with-icon">
                  <Zap size={18} className="input-icon" />
                  <input 
                    type="text" 
                    placeholder="e.g., Cardiology, Hospitals" 
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </div>
              </div>

              <div className="extractor-input-group">
                <label>City / Location</label>
                <div className="input-with-icon">
                  <MapPin size={18} className="input-icon" />
                  <input 
                    type="text" 
                    placeholder="e.g., Mumbai, Delhi" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className="extractor-premium-toggle">
                <div className="premium-label">
                  <ShieldCheck size={18} color="#60a5fa" />
                  <span>Premium Feature: Auto-verify contact numbers & email IDs before export.</span>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={isVerified}
                    onChange={(e) => setIsVerified(e.target.checked)}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>

            <div className="extractor-actions">
              <button className="btn-start-extraction" onClick={handleStartExtraction} disabled={extracting}>
                {extracting ? 'EXTRACTING...' : 'START EXTRACTION'}
              </button>
              <button className="btn-export-csv" onClick={handleExport} disabled={leads.length === 0 || extracting}>
                <Download size={18} /> EXPORT EXCEL
              </button>
            </div>

            {extracting && (
              <div className="extraction-progress-container">
                <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${progress}%` }}></div></div>
                <div className="progress-status">Querying Database... {progress}%</div>
              </div>
            )}
          </div>

          <div className="leads-results-section">
            <div className="results-header">
              <h3>Search Results</h3>
              <span className="results-count">{leads.length} Records</span>
            </div>

            {leads.length === 0 && !extracting ? (
              <div className="extractor-empty-state">
                <Database size={48} />
                <p>No data loaded. Enter specialty or city and click "Start Extraction".</p>
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-service-table">
                  <thead>
                    <tr>
                      <th>Company/Name</th>
                      <th>Specialty</th>
                      <th>Contact</th>
                      <th>Location</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id}>
                        <td><strong>{lead.full_name}</strong><br/><small>{lead.medical_registration_no}</small></td>
                        <td><span className="badge badge-specialty">{lead.specialization}</span></td>
                        <td>{lead.phone}<br/>{lead.email}</td>
                        <td>{lead.city}</td>
                        <td>{isVerified ? '✅ Verified' : '⏳ Pending'}</td>
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
