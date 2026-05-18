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
import PaymentModal from '../components/PaymentModal';
import { useAuth } from '../context/AuthContext';
import './HRExtractor.css';

const HRExtractor = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [progress, setProgress] = useState(0);
  const [localSearch, setLocalSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState('');

  // Sync Google/LinkedIn/Email authenticated user's email automatically
  useEffect(() => {
    if (user?.email) {
      setVerifiedEmail(user.email);
    }
  }, [user]);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [searchesRemaining, setSearchesRemaining] = useState(3);

  // Load from Supabase when verifiedEmail changes
  useEffect(() => {
    const fetchUserCredits = async () => {
      if (!verifiedEmail) return;
      
      try {
        const { data, error } = await supabase
          .from('user_search_credits')
          .select('searches_remaining')
          .eq('email', verifiedEmail.toLowerCase())
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // User does not exist, initialize them with 3 free searches
            const { error: insertError } = await supabase
              .from('user_search_credits')
              .insert([{ email: verifiedEmail.toLowerCase(), searches_remaining: 3, plan_level: 'free' }]);
            
            if (insertError) throw insertError;
            setSearchesRemaining(3);
          } else {
            throw error;
          }
        } else {
          setSearchesRemaining(data.searches_remaining);
        }
      } catch (err) {
        console.error('Error fetching user credits:', err);
        // Fallback to local storage if table doesn't exist
        const saved = localStorage.getItem(`hr_search_count_${verifiedEmail}`);
        setSearchesRemaining(saved !== null ? parseInt(saved, 10) : 3);
      }
    };

    fetchUserCredits();
  }, [verifiedEmail]);

  // Automatically clear the database if the keyword field is emptied
  useEffect(() => {
    if (!keyword.trim()) {
      setLeads([]);
      setErrorMsg('');
    }
  }, [keyword]);

  const handleStartExtraction = async (e) => {
    e?.preventDefault();

    const kw = keyword.trim();
    const loc = location.trim();

    if (!kw) {
      setErrorMsg('Please enter a Keyword/Specialty to search.');
      setLeads([]);
      return;
    }

    if (searchesRemaining <= 0) {
      setShowPaymentModal(true);
      return;
    }

    setExtracting(true);
    setErrorMsg('');
    setProgress(10);
    
    try {
      let query = supabase.from('doctors_data').select('*');

      if (kw) {
        query = query.or(`doctor_name_simple_english.ilike.%${kw}%,qualification_specialty.ilike.%${kw}%`);
      }
      
      if (loc) {
        query = query.ilike('city', `%${loc}%`);
      }

      setProgress(40);
      const { data, error } = await query.limit(100);

      if (error) throw error;

      // Decrement balance in Supabase
      const newBalance = Math.max(0, searchesRemaining - 1);
      try {
        const { error: updateError } = await supabase
          .from('user_search_credits')
          .update({ searches_remaining: newBalance })
          .eq('email', verifiedEmail.toLowerCase());
        
        if (updateError) throw updateError;
        setSearchesRemaining(newBalance);
      } catch (err) {
        console.error('Error updating user credits in DB:', err);
        // Fallback to local storage
        setSearchesRemaining(prev => {
          const fallback = Math.max(0, prev - 1);
          localStorage.setItem(`hr_search_count_${verifiedEmail}`, fallback.toString());
          return fallback;
        });
      }

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
      {!verifiedEmail && (
        <EmailOTP onVerified={(email) => setVerifiedEmail(email)} />
      )}

      <div className={verifiedEmail ? "" : "content-blur"}>
        <div className="hr-tool-header-section">
        <div className="container" style={{ position: 'relative' }}>
          {verifiedEmail && (
            <button 
              onClick={() => { setVerifiedEmail(''); setLeads([]); }}
              style={{ position: 'absolute', top: 0, right: 0, background: 'none', border: '1px solid #bb2a3a', color: '#bb2a3a', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Logout ({verifiedEmail})
            </button>
          )}
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
              <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.9rem', color: '#a0a0b0' }}>
                Free searches remaining: <strong style={{color: '#bb2a3a'}}>{searchesRemaining}</strong> / 3
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
      
      {showPaymentModal && <PaymentModal onClose={() => setShowPaymentModal(false)} />}
    </div>
  );
};

export default HRExtractor;
