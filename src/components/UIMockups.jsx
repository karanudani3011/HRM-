import React, { useState, useEffect } from 'react';
import './UIMockups.css';
import { Search, MapPin, Briefcase, Database, Download, CheckCircle2, AlertCircle, Stethoscope, Navigation, Building2, Globe, ShieldCheck, ChevronRight, Award, Phone, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';
import PaymentModal from './PaymentModal';
import { useAuth } from '../context/AuthContext';

const maskPhoneNumber = (phone) => {
  if (!phone) return '—';
  const str = String(phone).trim();
  if (str.length <= 5) return 'xxxxx';
  return str.slice(0, -5) + 'xxxxx';
};

const UIMockups = () => {
  // --- HR Extractor Logic ---
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [leads, setLeads] = useState([]);
  const [extracting, setExtracting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [localSearch, setLocalSearch] = useState('');

  const { user } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [searchesRemaining, setSearchesRemaining] = useState(3);

  // Load search limit from Supabase when user.email changes
  useEffect(() => {
    const fetchUserCredits = async () => {
      if (!user?.email) {
        // Fallback to local storage or default 3 for guest users
        const localCount = localStorage.getItem('hr_search_count_guest');
        if (localCount !== null) {
          setSearchesRemaining(parseInt(localCount) || 0);
        } else {
          setSearchesRemaining(3);
        }
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('user_search_credits')
          .select('searches_remaining')
          .eq('email', user.email.toLowerCase())
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // Initialize in Supabase if missing
            await supabase
              .from('user_search_credits')
              .insert([{ email: user.email.toLowerCase(), searches_remaining: 3, plan_level: 'free' }]);
            setSearchesRemaining(3);
          } else {
            throw error;
          }
        } else {
          setSearchesRemaining(data.searches_remaining);
        }
      } catch (err) {
        console.error('Error fetching user credits on home:', err);
      }
    };

    fetchUserCredits();
  }, [user]);

  // Automatically clear HR Extractor database if keyword is emptied
  useEffect(() => {
    if (!keyword.trim()) {
      setLeads([]);
    }
  }, [keyword]);

  const handleStartExtraction = async () => {
    const kw = keyword.trim();
    const loc = location.trim();

    if (!kw) {
      alert('Please enter a Keyword/Specialty to search.');
      setLeads([]);
      return;
    }

    if (searchesRemaining <= 0) {
      setShowPaymentModal(true);
      return;
    }

    setExtracting(true);
    try {
      let query = supabase.from('hrm_contacts').select('*');
      
      if (kw) {
        query = query.or(`name.ilike.%${kw}%,role.ilike.%${kw}%`);
      }
      
      if (loc) {
        query = query.ilike('location_or_note', `%${loc}%`);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      
      // Decrement searches remaining
      const newBalance = Math.max(0, searchesRemaining - 1);
      
      if (user?.email) {
        try {
          const { error: updateError } = await supabase
            .from('user_search_credits')
            .update({ searches_remaining: newBalance })
            .eq('email', user.email.toLowerCase());
          
          if (updateError) throw updateError;
          setSearchesRemaining(newBalance);
        } catch (err) {
          console.error('Error updating credits in DB:', err);
          setSearchesRemaining(newBalance);
        }
      } else {
        // Guest user local storage fallback
        localStorage.setItem('hr_search_count_guest', newBalance.toString());
        setSearchesRemaining(newBalance);
      }
      
      setLeads(data || []);
    } catch (err) {
      console.error('Full Extraction Error:', err);
      alert(`Extraction failed: ${err.message || 'Check your internet or Supabase configuration.'}`);
    } finally {
      setExtracting(false);
    }
  };

  const handleExport = () => {
    if (leads.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(leads.map(l => ({
      'Name': l.name, 'Specialty': l.role, 'Email': '—', 'Phone': l.phone, 'City': l.location_or_note || '—', 'Verified': isVerified ? 'Yes' : 'No'
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    XLSX.writeFile(workbook, `HRM_Leads_${Date.now()}.xlsx`);
  };

  const filteredLeads = leads.filter(l => 
    l.name?.toLowerCase().includes(localSearch.toLowerCase()) ||
    l.role?.toLowerCase().includes(localSearch.toLowerCase())
  );

  // --- Doctor Search Logic ---
  const [docKeyword, setDocKeyword] = useState('');
  const [docLocation, setDocLocation] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [docLoading, setDocLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Automatically clear Doctor Search results if keyword is emptied
  useEffect(() => {
    if (!docKeyword.trim()) {
      setDoctors([]);
      setHasSearched(false);
    }
  }, [docKeyword]);

  const handleDocSearch = async (e) => {
    e?.preventDefault();
    
    const kw = docKeyword.trim();
    const loc = docLocation.trim();

    if (!kw) {
      alert('Please enter a Keyword/Specialty to search.');
      setDoctors([]);
      setHasSearched(false);
      return;
    }

    setDocLoading(true);
    setHasSearched(true);
    try {
      let query = supabase.from('hrm_contacts').select('*');
      
      // Flexible matching using the CORRECT column names
      if (kw) {
        query = query.or(`name.ilike.%${kw}%,role.ilike.%${kw}%`);
      }
      
      if (loc) {
        query = query.ilike('location_or_note', `%${loc}%`);
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;
      setDoctors(data || []);
    } catch (err) {
      console.error('Doctor Search Error:', err);
    } finally {
      setDocLoading(false);
    }
  };

  return (
    <section className="ui-mockups">
      <div className="container">
        
        {/* Real Tool 1: HR B2B Leads Extractor */}
        <div className="mockup-section" id="hr-tools">
          <div className="section-header">
            <h2>HR <span>B2B Leads Extractor</span></h2>
            <p>Powerful lead generation for healthcare recruitment</p>
          </div>
          
          <div className="mockup-card">
            <div className="mockup-form">
              <div className="input-group">
                <label>Keyword/Specialty</label>
                <input 
                  className="input-box-active" 
                  placeholder="e.g., Cardiology, Hospitals, Diagnostic Center"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>City / Location</label>
                <input 
                  className="input-box-active" 
                  placeholder="e.g., Mumbai, Delhi, Bangalore"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Experience Range</label>
                <select 
                  className="input-box-active"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  style={{ cursor: 'pointer' }}
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
            
            <div className="mockup-alert" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span><strong>Premium Feature:</strong> Auto-verify contact numbers & email IDs before export.</span>
              <label className="hr-switch-small" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                <input type="checkbox" checked={false} disabled />
                <span className="hr-slider-small"></span>
              </label>
            </div>
            
            <div className="mockup-actions">
              <button className="action-btn red-btn" onClick={handleStartExtraction} disabled={extracting}>
                <Search size={16}/> {extracting ? 'EXTRACTING...' : 'START EXTRACTION'}
              </button>
              <button className="action-btn dark-btn" onClick={handleExport} disabled={leads.length === 0}>
                <Download size={16}/> EXPORT CSV
              </button>
            </div>
            <div style={{ textAlign: 'center', marginBottom: '16px', fontSize: '0.9rem', color: '#a0a0b0' }}>
              Free searches remaining: <strong style={{color: '#bb2a3a'}}>{searchesRemaining}</strong> / 3
            </div>
            
            <div className="mockup-table-container">
              <div className="table-header">
                <h3>Master Lead Database</h3>
                <div className="search-small-active">
                  <input 
                    type="text" 
                    placeholder="Search leads..." 
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                  />
                </div>
              </div>
              <table className="mockup-table">
                <thead>
                  <tr>
                    <th>Company/Name</th>
                    <th>Location</th>
                    <th>Specialty</th>
                    <th>Contact</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No data. Enter keyword & click Start Extraction.</td></tr>
                  ) : (
                    filteredLeads.map(l => (
                      <tr key={l.row_id || l.id}>
                        <td><strong>{l.name}</strong></td>
                        <td>{l.location_or_note || '—'}</td>
                        <td>{l.role}</td>
                        <td>{maskPhoneNumber(l.phone)}</td>
                        <td style={{ color: isVerified ? '#059669' : '#f59e0b', fontWeight: 'bold' }}>{isVerified ? 'Verified' : 'Pending'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Real Tool 2: Find Your Doctor Anywhere */}
        <div className="mockup-section" id="find-doctor">
          <div className="section-header">
            <h2>Find Your <span>Doctor Anywhere</span></h2>
            <p>Book video consultations with top specialists in any city</p>
          </div>
          
          <div className="mockup-card">
            <form className="mockup-form-3col" onSubmit={handleDocSearch}>
              <div className="input-group">
                <label>Keyword</label>
                <input 
                  className="input-box-active" 
                  placeholder="Cardiology, etc."
                  value={docKeyword}
                  onChange={(e) => setDocKeyword(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Location</label>
                <input 
                  className="input-box-active" 
                  placeholder="Mumbai, etc."
                  value={docLocation}
                  onChange={(e) => setDocLocation(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Action</label>
                <button type="submit" className="search-inline-btn" disabled={docLoading}>
                  {docLoading ? '...' : <><Search size={16} /> SEARCH</>}
                </button>
              </div>
            </form>
            
            <div className="doctor-results">
              {doctors.length === 0 && hasSearched ? (
                <div style={{ padding: '40px', textAlign: 'center', width: '100%' }}>No doctors found for this search.</div>
              ) : doctors.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', width: '100%', opacity: 0.5 }}>Search results will appear here.</div>
              ) : (
                doctors.map(doc => (
                  <div key={doc.row_id || doc.id} className="doc-card">
                    <div className="doc-info">
                      <div className="doc-avatar-small">{doc.name?.charAt(0)}</div>
                      <div>
                        <h4>{doc.name?.startsWith('Dr') ? doc.name : `Dr. ${doc.name}`}</h4>
                        <p>{doc.role || 'Practitioner'} - {doc.location_or_note || 'India'}</p>
                      </div>
                    </div>
                    <div className="doc-status">Verified</div>
                    <button 
                      className="book-btn" 
                      onClick={() => {
                        alert("🔒 Premium Consultation Locked\n\nDirect doctor consultation booking is locked. Please contact our premium support desk or upgrade your plan to consult with specialists.");
                      }}
                    >
                      Consult
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Mockup 3: Global Career Hub (Keeping static as requested) */}
        <div className="mockup-section">
          <div className="section-header">
            <h2>Global <span>Career Hub</span></h2>
            <p>Healthcare opportunities worldwide</p>
          </div>
          
          <div className="mockup-card">
            <div className="table-header">
              <h3>Latest Opportunities</h3>
              <div className="search-small">Search jobs...</div>
            </div>
            <div className="mockup-table-container">
              <table className="mockup-table">
                <thead>
                  <tr>
                    <th>Position</th>
                    <th>Hospital</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Apply</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Senior Cardiologist</td>
                    <td>Jupiter Hospitals</td>
                    <td>Mumbai</td>
                    <td><span className="badge green">Full Time</span></td>
                    <td className="action-link">Apply Now</td>
                  </tr>
                  <tr>
                    <td>HR Manager</td>
                    <td>Fortis Healthcare</td>
                    <td>Delhi</td>
                    <td><span className="badge blue">Remote</span></td>
                    <td className="action-link">Apply Now</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
      
      {showPaymentModal && <PaymentModal onClose={() => setShowPaymentModal(false)} />}
    </section>
  );
};

export default UIMockups;
