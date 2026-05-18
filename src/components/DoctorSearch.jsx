import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, MapPin, Stethoscope, Phone, Mail, Award, Globe, Navigation, Building2, ShieldCheck, ChevronRight } from 'lucide-react';
import './DoctorSearch.css';

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
      let query = supabase.from('doctors_data').select('*');

      if (kw) {
        query = query.or(`doctor_name_simple_english.ilike.%${kw}%,qualification_specialty.ilike.%${kw}%`);
      }
      
      if (loc) {
        query = query.ilike('city', `%${loc}%`);
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
      <div className="container">
        <div className="section-header">
          <h2>Find Your <span>Doctor Anywhere</span></h2>
          <p>Instantly connect with India's top specialists, hospitals, and diagnostic centers</p>
        </div>

        <div className="main-search-card">
          <form className="unified-search-form" onSubmit={handleSearch}>
            <div className="search-field">
              <div className="field-icon-wrapper">
                <Search size={20} className="red-icon" />
              </div>
              <div className="field-content">
                <label>Keyword/Specialty</label>
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
              <div className="btn-spinner" style={{borderColor: '#bb2a3a', borderTopColor: 'transparent', width: '40px', height: '40px'}}></div>
              <p>Scanning HRM Healthcare Network...</p>
            </div>
          ) : hasSearched && doctors.length === 0 ? (
            <div className="no-results-state">
              <Building2 size={64} className="red-icon" style={{opacity: 0.2}} />
              <h3>No matched providers found</h3>
              <p>Try searching for a different city or specialty like "Cardiology".</p>
            </div>
          ) : (
            <div className="doctor-grid-modern">
              {doctors.map((doc) => (
                <div key={doc.id} className="modern-doc-card">
                  <div className="card-top">
                    <div className="doc-avatar-box">
                      {doc.doctor_name_simple_english?.charAt(0)}
                    </div>
                    <div className="doc-prime-info">
                      <h3>Dr. {doc.doctor_name_simple_english}</h3>
                      <span className="spec-tag">{doc.qualification_specialty}</span>
                    </div>
                  </div>
                  
                  <div className="card-mid">
                    <div className="info-row">
                      <Award size={14} className="red-icon" />
                      <span>{doc.qualification_specialty || 'Verified Specialist'}</span>
                    </div>
                    <div className="info-row">
                      <MapPin size={14} className="red-icon" />
                      <span>{doc.city}, {doc.state || 'India'}</span>
                    </div>
                  </div>

                  <div className="card-bottom">
                    <div className="contact-summary">
                      <span><Phone size={12} /> {doc.phone_numbers}</span>
                      <span><Mail size={12} /> {doc.email || 'Contact on Phone'}</span>
                    </div>
                    <button className="modern-book-btn" onClick={() => window.location.href = '/contact'}>
                      Profile
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
              <Globe size={24} className="red-icon" />
              <h4>Pan-India Network</h4>
              <p>Access doctors across 100+ cities</p>
            </div>
            <div className="feat-item">
              <ShieldCheck size={24} className="red-icon" />
              <h4>Verified Database</h4>
              <p>100% Medical Reg verified</p>
            </div>
            <div className="feat-item">
              <Stethoscope size={24} className="red-icon" />
              <h4>Instant Booking</h4>
              <p>Book consultations in seconds</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default DoctorSearch;
