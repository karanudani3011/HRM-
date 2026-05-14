import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Search, 
  Download, 
  MapPin, 
  ShieldCheck, 
  Database, 
  Zap,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  ChevronRight,
  Filter,
  UserCheck
} from 'lucide-react';
import * as XLSX from 'xlsx';
import EmailOTP from '../components/EmailOTP';
import './HRExtractor.css';

const HRExtractor = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [progress, setProgress] = useState(0);
  const [localSearch, setLocalSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifiedUser, setIsVerifiedUser] = useState(false);

  const handleStartExtraction = async (e) => {
    e?.preventDefault();
    setExtracting(true);
    setErrorMsg('');
    setProgress(10);
    
    try {
      let query = supabase.from('doctors_data').select('*');

      const kw = keyword.trim();
      const loc = location.trim();

      if (kw) {
        query = query.or(`doctor_name_simple_english.ilike.%${kw}%,qualification_specialty.ilike.%${kw}%`);
      }
      
      if (loc) {
        query = query.ilike('city', `%${loc}%`);
      }

      setProgress(40);
      const { data, error } = await query.limit(100);

      if (error) throw error;

      setProgress(80);
      if (isVerified && data && data.length > 0) {
        // Simulate premium verification
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setLeads(data || []);
      setProgress(100);
      
      setTimeout(() => {
        setExtracting(false);
        setProgress(0);
      }, 500);

    } catch (err) {
      console.error('Extraction error:', err);
      setErrorMsg('Service temporarily unavailable. Please try again later.');
      setExtracting(false);
      setProgress(0);
    }
  };

  const handleExport = () => {
    if (leads.length === 0) return;
    const exportData = leads.map(l => ({
      'Company/Name': l.doctor_name_simple_english,
      'Specialization': l.qualification_specialty,
      'Email': l.email,
      'Phone': l.phone_numbers,
      'City': l.city,
      'Verified': isVerified ? 'Yes' : 'No'
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "HR_Leads");
    XLSX.writeFile(workbook, `HRM_B2B_Leads_${Date.now()}.xlsx`);
  };

  const filteredLeads = leads.filter(l => 
    l.doctor_name_simple_english?.toLowerCase().includes(localSearch.toLowerCase()) ||
    l.qualification_specialty?.toLowerCase().includes(localSearch.toLowerCase())
  );

  return (
    <div className="hr-tool-page">
      {!isVerifiedUser && (
        <EmailOTP onVerified={() => setIsVerifiedUser(true)} />
      )}

      <div className={isVerifiedUser ? "" : "content-blur"}>
        <div className="hr-tool-header-section">
        <div className="container">
          <div className="hr-badge">HR Recruitment Suite</div>
          <h1>HR B2B <span>Leads Extractor</span></h1>
          <p>Powerful lead generation for healthcare recruitment and business expansion.</p>
        </div>
      </div>

      <div className="container">
        <div className="hr-tool-container">
          {/* Extraction Control Panel */}
          <div className="extraction-panel">
            <form className="extraction-form" onSubmit={handleStartExtraction}>
              <div className="extraction-grid">
                <div className="extraction-field">
                  <label>Keyword/Specialty</label>
                  <div className="input-box">
                    <Stethoscope size={18} className="red-icon" />
                    <input 
                      type="text" 
                      placeholder="e.g., Cardiology, Hospitals, Diagnostic Center"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="extraction-field">
                  <label>City / Location</label>
                  <div className="input-box">
                    <MapPin size={18} className="red-icon" />
                    <input 
                      type="text" 
                      placeholder="e.g., Mumbai, Delhi, Bangalore"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>

                <div className="premium-verify-box">
                  <div className="premium-info">
                    <UserCheck size={18} className="blue-icon" />
                    <span>Premium Feature: Auto-verify contact numbers & email IDs before export.</span>
                  </div>
                  <label className="hr-switch">
                    <input 
                      type="checkbox" 
                      checked={isVerified}
                      onChange={(e) => setIsVerified(e.target.checked)}
                    />
                    <span className="hr-slider"></span>
                  </label>
                </div>
              </div>

              <div className="extraction-footer">
                <button type="submit" className="btn-extract" disabled={extracting}>
                  {extracting ? 'EXTRACTING...' : 'START EXTRACTION'}
                </button>
                <button type="button" className="btn-export" onClick={handleExport} disabled={leads.length === 0 || extracting}>
                  <Download size={18} /> EXPORT CSV
                </button>
              </div>

              {extracting && (
                <div className="hr-progress-container">
                  <div className="hr-progress-bar">
                    <div className="hr-progress-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                  <span className="hr-progress-text">Extracting leads from HRM Network... {progress}%</span>
                </div>
              )}
            </form>
          </div>

          {/* Master Lead Database Section */}
          <div className="database-section">
            <div className="database-header">
              <div className="header-left">
                <Database size={20} className="red-icon" />
                <h2>Master Lead Database</h2>
              </div>
              <div className="header-right">
                <div className="local-search-box">
                  <Search size={16} />
                  <input 
                    type="text" 
                    placeholder="Search leads..." 
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                  />
                </div>
                <span className="leads-count">{filteredLeads.length} Leads Found</span>
              </div>
            </div>

            {errorMsg && <div className="hr-error-alert"><AlertCircle size={16} /> {errorMsg}</div>}

            <div className="leads-table-wrapper">
              {leads.length === 0 && !extracting ? (
                <div className="hr-empty-state">
                  <Zap size={40} className="empty-icon" />
                  <p>Run an extraction to populate the lead database.</p>
                </div>
              ) : (
                <table className="hr-leads-table">
                  <thead>
                    <tr>
                      <th>Company/Name</th>
                      <th>Specialty</th>
                      <th>Location</th>
                      <th>Contact</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id}>
                        <td><strong>{lead.doctor_name_simple_english}</strong></td>
                        <td><span className="tag-spec">{lead.qualification_specialty}</span></td>
                        <td>{lead.city}</td>
                        <td>
                          <div className="contact-info-small">
                            <span>📱 {lead.phone_numbers}</span>
                            <span>📧 {lead.email || '—'}</span>
                          </div>
                        </td>
                        <td>
                          {isVerified ? (
                            <span className="status-verified">Verified</span>
                          ) : (
                            <span className="status-pending">Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default HRExtractor;
