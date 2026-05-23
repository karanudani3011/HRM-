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
  UserCheck,
  Briefcase
} from 'lucide-react';
import * as XLSX from 'xlsx';
import EmailOTP from '../components/EmailOTP';
import PaymentModal from '../components/PaymentModal';
import { useAuth } from '../context/AuthContext';
import './HRExtractor.css';

const maskPhoneNumber = (phone) => {
  if (!phone) return '—';
  const str = String(phone).trim();
  if (str.length <= 5) return 'xxxxx';
  return str.slice(0, -5) + 'xxxxx';
};

const getFirstName = (name) => {
  if (!name) return '—';
  const parts = String(name).trim().split(/\s+/);
  // If name starts with "Dr" or "Dr.", keep prefix + first name
  if (parts.length > 1 && /^dr\.?$/i.test(parts[0])) {
    return parts.slice(0, 2).join(' ');
  }
  return parts[0];
};

const matchExperience = (expString, range) => {
  if (!range) return true;
  if (!expString) return false;

  const match = expString.match(/(\d+)/);
  if (!match) return false;
  const years = parseInt(match[1], 10);

  const [minStr, maxStr] = range.split('-');
  const min = parseInt(minStr, 10);
  const max = parseInt(maxStr, 10);

  return years >= min && years <= max;
};

const HRExtractor = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('candidates'); // Only candidates/job seekers
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
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
      setErrorMsg(activeTab === 'doctors' ? 'Please enter a Keyword/Specialty to search.' : 'Please enter a Speciality/Department/Designation.');
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
      let query;
      if (activeTab === 'doctors') {
        query = supabase.from('hrm_contacts').select('*');
        if (kw) {
          query = query.or(`name.ilike.%${kw}%,role.ilike.%${kw}%`);
        }
        if (loc) {
          query = query.ilike('location_or_note', `%${loc}%`);
        }
      } else {
        query = supabase.from('candidates').select('*');
        if (kw) {
          query = query.or(`Name.ilike.%${kw}%,Speciality.ilike.%${kw}%,Department.ilike.%${kw}%,Qualification.ilike.%${kw}%,Current Designation.ilike.%${kw}%,Applied For.ilike.%${kw}%`);
        }
        if (loc) {
          query = query.ilike('Location', `%${loc}%`);
        }
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

      if (activeTab === 'candidates' && experience) {
        const filtered = (data || []).filter(c => matchExperience(c.Experience, experience));
        setLeads(filtered);
      } else {
        setLeads(data || []);
      }
      
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
    let exportData;
    if (activeTab === 'doctors') {
      exportData = leads.map(l => ({
        'Company/Name': l.name,
        'Specialization': l.role,
        'Email': '—',
        'Phone': l.phone,
        'City': l.location_or_note || '—',
        'Verified': isVerified ? 'Yes' : 'No'
      }));
    } else {
      exportData = leads.map(l => ({
        'Candidate Name': l.Name,
        'Speciality': l.Speciality,
        'Department': l.Department,
        'Qualification': l.Qualification,
        'Experience': l.Experience,
        'Current Job': l["Current Job"],
        'Current Designation': l["Current Designation"],
        'Contact Number': l["Contact Number"],
        'Applied For': l["Applied For"],
        'Source': l.Source,
        'Date': l.Date,
        'Location': l.Location,
        'Verified': isVerified ? 'Yes' : 'No'
      }));
    }
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, activeTab === 'doctors' ? "HR_Leads_Doctors" : "HR_Leads_Candidates");
    XLSX.writeFile(workbook, `HRM_B2B_${activeTab === 'doctors' ? 'Doctors' : 'Candidates'}_Leads_${Date.now()}.xlsx`);
  };

  const filteredLeads = leads.filter(l => {
    if (activeTab === 'doctors') {
      return (
        l.name?.toLowerCase().includes(localSearch.toLowerCase()) ||
        l.role?.toLowerCase().includes(localSearch.toLowerCase())
      );
    } else {
      return (
        l.Name?.toLowerCase().includes(localSearch.toLowerCase()) ||
        l.Speciality?.toLowerCase().includes(localSearch.toLowerCase()) ||
        l.Department?.toLowerCase().includes(localSearch.toLowerCase()) ||
        l.Qualification?.toLowerCase().includes(localSearch.toLowerCase()) ||
        (l["Current Job"] && l["Current Job"].toLowerCase().includes(localSearch.toLowerCase())) ||
        (l.Location && l.Location.toLowerCase().includes(localSearch.toLowerCase()))
      );
    }
  });

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
            <p>Powerful lead generation for healthcare recruitment and business expansion and ✨ Premium Healthcare Network</p>
          </div>
        </div>

        <div className="container">
          <div className="hr-tool-container">
            {/* Extraction Control Panel */}
            <div className="extraction-panel">
              <div className="tab-info-header">
                <h3>Find Candidates Intake Data</h3>
                <p>Instantly search & filter from premium healthcare talent, doctors, and specialists</p>
              </div>

              <form className="extraction-form" onSubmit={handleStartExtraction}>
                <div className="extraction-grid">
                  <div className="extraction-field">
                    <label>{activeTab === 'doctors' ? 'Keyword / Specialty' : 'Keyword / Specialty'}</label>
                    <div className="input-box">
                      <Stethoscope size={18} className="red-icon" />
                      <input 
                        type="text" 
                        placeholder={activeTab === 'doctors' ? "Cardiology, Hospitals, Diagnostic Center..." : "Anesthesia, Pediatrics, Pathology..."}
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="extraction-field">
                    <label>{activeTab === 'doctors' ? 'City / Location' : 'City / Location'}</label>
                    <div className="input-box">
                      <MapPin size={18} className="red-icon" />
                      <input 
                        type="text" 
                        placeholder={activeTab === 'doctors' ? "Mumbai, Delhi, Bangalore..." : "Mumbai, Delhi, Bangalore..."}
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="extraction-field">
                    <label>Experience Range</label>
                    <div className="input-box">
                      <Briefcase size={18} className="red-icon" />
                      <select 
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          width: '100%',
                          fontSize: '15px',
                          outline: 'none',
                          color: '#374151',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="">Select Experience...</option>
                        <option value="0-5">0-5 Year</option>
                        <option value="5-10">5-10 Year</option>
                        <option value="10-15">10-15 Year</option>
                        <option value="15-20">15-20 Year</option>
                        <option value="20-25">20-25 Year</option>
                        <option value="25-30">25-30 Year</option>
                      </select>
                    </div>
                  </div>

                  <div className="premium-verify-box">
                    <div className="premium-info">
                      <UserCheck size={18} className="blue-icon" />
                      <span>Premium Feature: Auto-verify contact numbers & email IDs before export.</span>
                    </div>
                    <label className="hr-switch" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                      <input 
                        type="checkbox" 
                        checked={false}
                        disabled
                      />
                      <span className="hr-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="extraction-footer">
                  <button type="submit" className="btn-extract" disabled={extracting}>
                    {extracting ? 'EXTRACTING...' : 'START SEARCH'}
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
                    {activeTab === 'doctors' ? (
                      <>
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
                            <tr key={lead.row_id || lead.id}>
                              <td><strong>{getFirstName(lead.name)}</strong></td>
                              <td><span className="tag-spec">{lead.role || 'General Practitioner'}</span></td>
                              <td>{lead.location_or_note || 'India'}</td>
                              <td>
                                <div className="contact-info-small">
                                  <span>📱 {maskPhoneNumber(lead.phone)}</span>
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
                      </>
                    ) : (
                      <>
                        <thead>
                          <tr>
                            <th>Candidate Name</th>
                            <th>Speciality / Dept</th>
                            <th>Exp & Qual</th>
                            <th>Current Job & Designation</th>
                            <th>Applied For & Source</th>
                            <th>Contact</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredLeads.map((lead) => (
                            <tr key={lead.id}>
                              <td>
                                <strong>{getFirstName(lead.Name)}</strong>
                                {lead.Location && (
                                  <span className="tag-loc" style={{ display: 'block', fontSize: '11px', color: '#475569', marginTop: '2px', fontWeight: '600' }}>
                                    📍 {lead.Location}
                                  </span>
                                )}
                                <span className="tag-date" style={{ display: 'block', fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                                  📅 {lead.Date || '—'}
                                </span>
                              </td>
                              <td>
                                <span className="tag-spec">{lead.Speciality || lead.Department || '—'}</span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <span className="tag-exp" style={{ fontSize: '11px', fontWeight: 'bold', color: '#bb2a3a' }}>
                                    💼 {lead.Experience || '—'}
                                  </span>
                                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                                    🎓 {lead.Qualification || '—'}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <strong style={{ fontSize: '13px', color: '#1e293b' }}>{lead["Current Job"] || '—'}</strong>
                                  <span style={{ fontSize: '12px', color: '#64748b' }}>{lead["Current Designation"] || '—'}</span>
                                </div>
                              </td>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <span style={{ fontSize: '13px', color: '#334155' }}>📋 {lead["Applied For"] || '—'}</span>
                                  <span className="tag-source" style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', alignSelf: 'flex-start', fontWeight: '600' }}>
                                    {lead.Source || 'ZOHO'}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <div className="contact-info-small">
                                  <span>📱 {maskPhoneNumber(lead["Contact Number"])}</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </>
                    )}
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
