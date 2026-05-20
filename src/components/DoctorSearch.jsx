import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, MapPin, Stethoscope, Phone, Mail, Award, Globe, Navigation, Building2, ShieldCheck, ChevronRight } from 'lucide-react';
import './DoctorSearch.css';

const maskPhoneNumber = (phone) => {
  if (!phone) return '—';
  const str = String(phone).trim();
  if (str.length <= 5) return 'xxxxx';
  return str.slice(0, -5) + 'xxxxx';
};

const DoctorSearch = () => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Automatically clear the database if the keyword field is emptied
  useEffect(() => {
    if (!keyword.trim()) {
      setDoctors([]);
      setHasSearched(false);
    }
  }, [keyword]);

  const handleSearch = async (e) => {
    e?.preventDefault();

    const kw = keyword.trim();
    const loc = location.trim();

    if (!kw) {
      alert('Please enter a Keyword/Specialty to search.');
      setDoctors([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      let query = supabase.from('hrm_contacts').select('*');

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
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="doctor-search-section" id="find-doctor">
      {/* Premium Decorative Glow Spheres */}
      <div className="bg-blur-sphere sphere-1"></div>
      <div className="bg-blur-sphere sphere-2"></div>
      <div className="bg-blur-sphere sphere-3"></div>

      <div className="container">
        <div className="section-header">
          <span className="section-badge">✨ Premium Healthcare Network</span>
          <h2>Find Your <span className="gradient-text">Doctor Anywhere</span></h2>
          <p>Instantly connect with India's top specialists, hospitals, and diagnostic centers</p>
        </div>

        <div className="main-search-card">
          <form className="unified-search-form" onSubmit={handleSearch}>
            <div className="search-field">
              <div className="field-icon-wrapper">
                <Search size={20} className="red-icon" />
              </div>
              <div className="field-content">
                <label>Keyword / Specialty</label>
                <input 
                  type="text" 
                  placeholder="Cardiology, Hospitals, Diagnostic Center..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
            </div>

            <div className="search-divider"></div>

            <div className="search-field">
              <div className="field-icon-wrapper">
                <MapPin size={20} className="red-icon" />
              </div>
              <div className="field-content">
                <label>City / Location</label>
                <input 
                  type="text" 
                  placeholder="Mumbai, Delhi, Bangalore..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="main-search-btn" disabled={loading}>
              {loading ? (
                <div className="btn-spinner"></div>
              ) : (
                <>START SEARCH <ChevronRight size={18} /></>
              )}
            </button>
          </form>
        </div>

        <div className="search-results-area">
          {loading ? (
            <div className="search-loading-state">
              <div className="loading-glowing-ring"></div>
              <p>Scanning HRM Healthcare Network...</p>
            </div>
          ) : hasSearched && doctors.length === 0 ? (
            <div className="no-results-state">
              <div className="no-results-icon-box">
                <Building2 size={48} className="red-icon" />
              </div>
              <h3>No matched providers found</h3>
              <p>Try searching for a different city or specialty like "Cardiology".</p>
            </div>
          ) : (
            <div className="doctor-grid-modern">
              {doctors.map((doc, idx) => (
                <div key={doc.row_id || doc.id} className="modern-doc-card">
                  <div className="card-top">
                    {/* Dynamic gradient-colored avatar based on index */}
                    <div className={`doc-avatar-box avatar-grad-${(idx % 4) + 1}`}>
                      {doc.name?.charAt(0)}
                    </div>
                    <div className="doc-prime-info">
                      <h3 className="doc-name">
                        {doc.name?.startsWith('Dr') ? doc.name : `Dr. ${doc.name}`}
                        <ShieldCheck className="verified-badge-icon" size={16} title="Verified Practitioner" />
                      </h3>
                      <span className="spec-tag">{doc.role || 'General Practitioner'}</span>
                    </div>
                  </div>
                  
                  <div className="card-mid">
                    <div className="info-row">
                      <Award size={14} className="red-icon" />
                      <span>{doc.role || 'Verified Specialist'}</span>
                    </div>
                    <div className="info-row">
                      <MapPin size={14} className="red-icon" />
                      <span>{doc.location_or_note || 'India'}</span>
                    </div>
                  </div>

                  <div className="card-bottom">
                    <div className="contact-summary">
                      <a href={`tel:${maskPhoneNumber(doc.phone)}`} className="contact-link phone-link" title="Call Doctor">
                        <Phone size={12} /> {maskPhoneNumber(doc.phone)}
                      </a>
                      {doc.email ? (
                        <a href={`mailto:${doc.email}`} className="contact-link email-link" title="Email Doctor">
                          <Mail size={12} /> {doc.email}
                        </a>
                      ) : (
                        <span className="contact-link no-email">
                          <Mail size={12} /> Contact via Phone
                        </span>
                      )}
                    </div>
                    <button 
                      className="modern-book-btn" 
                      onClick={() => {
                        alert("🔒 Premium Consultation Locked\n\nDirect doctor consultation booking is locked. Please contact our premium support desk or upgrade your plan to consult with specialists.");
                      }}
                    >
                      Consult Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!hasSearched && (
          <div className="search-features-grid">
            <div className="feat-item">
              <div className="feat-icon-box">
                <Globe size={24} className="red-icon" />
              </div>
              <h4>Pan-India Network</h4>
              <p>Access verified doctors across 100+ cities</p>
            </div>
            <div className="feat-item">
              <div className="feat-icon-box">
                <ShieldCheck size={24} className="red-icon" />
              </div>
              <h4>Verified Database</h4>
              <p>100% Medical Registration verified providers</p>
            </div>
            <div className="feat-item">
              <div className="feat-icon-box">
                <Stethoscope size={24} className="red-icon" />
              </div>
              <h4>Instant Booking</h4>
              <p>Schedule your online consultations in seconds</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default DoctorSearch;
