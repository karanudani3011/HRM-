import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Search, ChevronDown, FileText, X, ExternalLink,
  Stethoscope, Building2, Users, ArrowLeft
} from 'lucide-react';
import './ServicesDirectory.css';

const ServicesDirectory = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Doctor Registration');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const getTableName = (category) => {
    if (category === 'Doctor Registration') return 'doctors_registration';
    if (category === 'HR Registration') return 'hr_registration';
    if (category === 'Hospital Registration') return 'hospitals_registration';
    return '';
  };

  const mapToUi = (item, category) => {
    if (category === 'Doctor Registration') {
      return {
        id: item.id,
        formType: 'Doctor Registration',
        fullName: item.full_name,
        email: item.email,
        mobile: item.mobile,
        dob: item.dob,
        gender: item.gender,
        currentCity: item.current_city,
        willingToRelocate: item.willing_to_relocate,
        highestQualification: item.highest_qualification,
        superSpeciality: item.super_speciality,
        yearOfPassing: item.year_of_passing,
        college: item.college,
        regNo: item.reg_no,
        regState: item.reg_state,
        totalExperience: item.total_experience,
        authLetter: item.auth_letter_url,
        selfie: item.selfie_url,
        createdAt: item.created_at
      };
    } else if (category === 'HR Registration') {
      return {
        id: item.id,
        formType: 'HR Registration',
        fullName: item.full_name,
        email: item.email,
        mobile: item.mobile,
        companyName: item.company_name,
        designation: item.designation,
        hiringNeeds: item.hiring_needs,
        selfie: item.selfie_url,
        createdAt: item.created_at
      };
    } else {
      return {
        id: item.id,
        formType: 'Hospital Registration',
        hospitalName: item.hospital_name,
        hospitalType: item.hospital_type,
        regNumber: item.reg_number,
        yearOfEstablishment: item.year_of_establishment,
        bedCapacity: item.bed_capacity,
        address: item.address,
        city: item.city,
        state: item.state,
        pincode: item.pincode,
        website: item.website,
        adminName: item.admin_name,
        designation: item.designation,
        mobile: item.mobile,
        email: item.email,
        whatsapp: item.whatsapp,
        authLetter: item.auth_letter_url,
        selfie: item.selfie_url,
        logo: item.logo_url,
        neededDoctors: item.needed_doctors,
        jobTypes: item.job_types,
        expRange: item.exp_range,
        salaryRange: item.salary_range,
        urgency: item.urgency,
        facilityHighlights: item.facility_highlights,
        hospitalPhotos: item.hospital_photos,
        gstNumber: item.gst_number,
        plan: item.plan,
        createdAt: item.created_at
      };
    }
  };

  const buildSupabasePayload = (item) => {
    if (item.formType === 'Doctor Registration') {
      return {
        full_name: item.fullName || item.name || 'Unnamed',
        mobile: item.mobile || '',
        email: item.email,
        dob: item.dob || null,
        gender: item.gender || null,
        current_city: item.currentCity || item.city || '',
        willing_to_relocate: item.willingToRelocate || 'No',
        highest_qualification: item.highestQualification || '',
        super_speciality: item.superSpeciality || '',
        year_of_passing: parseInt(item.yearOfPassing) || null,
        college: item.college || '',
        reg_no: item.regNo || '',
        reg_state: item.regState || '',
        total_experience: parseInt(item.totalExperience) || 0,
        auth_letter_url: item.authLetter || item.authLetterUrl || '',
        selfie_url: item.selfie || ''
      };
    } else if (item.formType === 'HR Registration') {
      return {
        full_name: item.fullName || item.name || 'Unnamed',
        company_name: item.companyName || '',
        designation: item.designation || '',
        mobile: item.mobile || '',
        email: item.email,
        hiring_needs: item.hiringNeeds || '',
        selfie_url: item.selfie || ''
      };
    } else {
      return {
        hospital_name: item.hospitalName || '',
        hospital_type: item.hospitalType || '',
        reg_number: item.regNumber || '',
        year_of_establishment: parseInt(item.yearOfEstablishment) || null,
        bed_capacity: parseInt(item.bedCapacity) || null,
        address: item.address || '',
        city: item.city || '',
        state: item.state || '',
        pincode: item.pincode || '',
        website: item.website || '',
        admin_name: item.adminName || '',
        designation: item.designation || '',
        mobile: item.mobile || '',
        email: item.email,
        whatsapp: item.whatsapp || '',
        auth_letter_url: item.authLetter || item.authLetterUrl || '',
        selfie_url: item.selfie || '',
        logo_url: item.logo || '',
        needed_doctors: item.neededDoctors || [],
        job_types: item.jobTypes || [],
        exp_range: item.expRange || '',
        salary_range: item.salaryRange || '',
        urgency: item.urgency || '',
        facility_highlights: item.facilityHighlights || '',
        hospital_photos: item.hospitalPhotos || [],
        gst_number: item.gstNumber || '',
        plan: item.plan || 'Free'
      };
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const table = getTableName(selectedCategory);
      if (!table) { setLoading(false); return; }

      try {
        // Step 1: Try fetching from Supabase first
        const { data: supaData, error: supaErr } = await supabase
          .from(table)
          .select('*')
          .order('created_at', { ascending: false });

        if (!supaErr && supaData && supaData.length > 0) {
          // Data already in Supabase — just map and display
          setSubmissions(supaData.map(item => mapToUi(item, selectedCategory)));
          setLoading(false);
          return;
        }

        // Step 2: Supabase is empty — fall back to Firestore and sync
        console.log('Supabase empty, syncing from Firestore...');
        const q = query(
          collection(db, 'serviceForms'),
          orderBy('createdAt', 'desc')
        );

        const snap = await new Promise((resolve, reject) => {
          const unsub = onSnapshot(q, (s) => { unsub(); resolve(s); }, reject);
        });

        const firestoreDocs = [];
        snap.forEach(doc => {
          const d = { id: doc.id, ...doc.data() };
          if (d.formType === selectedCategory) firestoreDocs.push(d);
        });

        // Step 3: Upsert each Firestore record into Supabase
        for (const item of firestoreDocs) {
          if (!item.email) continue;
          const { data: existing } = await supabase
            .from(table)
            .select('id')
            .eq('email', item.email)
            .maybeSingle();

          if (!existing) {
            const payload = buildSupabasePayload(item);
            const { error: insertErr } = await supabase.from(table).insert([payload]);
            if (insertErr) console.error('Sync insert error:', insertErr);
          }
        }

        // Step 4: Re-fetch from Supabase after sync
        const { data: freshData, error: freshErr } = await supabase
          .from(table)
          .select('*')
          .order('created_at', { ascending: false });

        if (!freshErr && freshData) {
          setSubmissions(freshData.map(item => mapToUi(item, selectedCategory)));
        } else {
          // Final fallback — display directly from Firestore data
          setSubmissions(firestoreDocs);
        }
      } catch (err) {
        console.error('Data load error:', err);
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedCategory]);

  const filteredData = submissions.filter(item => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (item.fullName || item.name || item.hospitalName || '').toLowerCase().includes(q) ||
      (item.email || '').toLowerCase().includes(q) ||
      (item.currentCity || item.city || '').toLowerCase().includes(q) ||
      (item.college || '').toLowerCase().includes(q) ||
      (item.superSpeciality || '').toLowerCase().includes(q) ||
      (item.companyName || '').toLowerCase().includes(q);
    return matchesSearch;
  });

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  };

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const renderModalRows = (item) => {
    const rows = [];
    rows.push(
      <tr key="email"><td className="label">Email</td><td className="value">{item.email || '—'}</td></tr>,
      <tr key="mobile"><td className="label">Mobile</td><td className="value">{item.mobile || '—'}</td></tr>
    );

    const city = item.currentCity || item.city;
    if (city) rows.push(
      <tr key="city"><td className="label">City / Location</td><td className="value">{city}</td></tr>
    );

    if (item.formType?.includes('Doctor')) {
      rows.push(
        <tr key="qual"><td className="label">Qualifications</td><td className="value">{item.highestQualification} ({item.superSpeciality})</td></tr>,
        <tr key="coll"><td className="label">College / University</td><td className="value">{item.college}</td></tr>,
        <tr key="yop"><td className="label">Passing Year</td><td className="value">{item.yearOfPassing}</td></tr>,
        <tr key="reg"><td className="label">Reg. Number</td><td className="value">{item.regNo} ({item.regState})</td></tr>,
        <tr key="exp"><td className="label">Total Experience</td><td className="value">{item.totalExperience} Years</td></tr>,
        <tr key="reloc"><td className="label">Willing to Relocate?</td><td className="value">{item.willingToRelocate || 'No'}</td></tr>,
        <tr key="dob"><td className="label">Date of Birth</td><td className="value">{item.dob || '—'}</td></tr>,
        <tr key="gender"><td className="label">Gender</td><td className="value">{item.gender || '—'}</td></tr>
      );
    }

    if (item.formType?.includes('HR')) {
      rows.push(
        <tr key="company"><td className="label">Company / Agency</td><td className="value">{item.companyName || '—'}</td></tr>,
        <tr key="designation"><td className="label">Designation</td><td className="value">{item.designation || '—'}</td></tr>,
        <tr key="hiring"><td className="label">Hiring Requirements</td><td className="value" style={{ lineHeight: '1.5' }}>{item.hiringNeeds || '—'}</td></tr>
      );
    }

    if (item.formType?.includes('Hospital')) {
      rows.push(
        <tr key="htype"><td className="label">Hospital Type</td><td className="value">{item.hospitalType || '—'}</td></tr>,
        <tr key="year"><td className="label">Establishment Year</td><td className="value">{item.yearOfEstablishment || '—'}</td></tr>,
        <tr key="regn"><td className="label">Licence / Reg No.</td><td className="value">{item.regNumber || '—'}</td></tr>,
        <tr key="bed"><td className="label">Bed Capacity</td><td className="value">{item.bedCapacity ? `${item.bedCapacity} Beds` : '—'}</td></tr>,
        <tr key="addr"><td className="label">Hospital Address</td><td className="value">{[item.address, item.state, item.pincode].filter(Boolean).join(', ')}</td></tr>,
        <tr key="admin"><td className="label">Admin Contact</td><td className="value">{item.adminName} {item.designation ? `(${item.designation})` : ''}</td></tr>
      );
      if (item.website) rows.push(
        <tr key="web">
          <td className="label">Website</td>
          <td className="value">
            <a href={item.website} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              {item.website} <ExternalLink size={12} />
            </a>
          </td>
        </tr>
      );
      if (item.gstNumber) rows.push(
        <tr key="gst"><td className="label">GST Number</td><td className="value">{item.gstNumber}</td></tr>
      );
      rows.push(
        <tr key="urgency"><td className="label">Urgency</td><td className="value">{item.urgency || 'Normal'}</td></tr>,
        <tr key="plan">
          <td className="label">Plan</td>
          <td className="value">
            <span style={{ background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '700' }}>
              {item.plan || 'Free'}
            </span>
          </td>
        </tr>
      );
    }

    rows.push(
      <tr key="date"><td className="label">Submitted On</td><td className="value">{formatDate(item.createdAt)}</td></tr>
    );

    return rows;
  };

  return (
    <div style={{ paddingTop: '60px', paddingBottom: '80px', backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 120px)' }}>
      <div className="services-dashboard">

        {/* Back Link */}
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-start' }}>
          <Link to="/services" className="back-link">
            <ArrowLeft size={16} /> Back to Services
          </Link>
        </div>

        {/* Page Header */}
        <header className="dashboard-header">
          <h1>Registered <span>Portals Directory</span></h1>
          <p>
            Explore and review real-time submissions of Doctors, HR Professionals,
            and Hospital Partners registered on our platform.
          </p>
        </header>

        {/* Controls: Dropdown + Search */}
        <section className="dashboard-controls">
          <div className="control-left">
            <label htmlFor="category-select">Show Registrations:</label>
            <div className="custom-select-wrapper">
              <select
                id="category-select"
                className="custom-select"
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setSearchQuery(''); }}
              >
                <option value="Doctor Registration">🩺 Medical Professionals (Doctors)</option>
                <option value="HR Registration">💼 HR &amp; Talent Professionals</option>
                <option value="Hospital Registration">🏢 Healthcare Facilities (Hospitals)</option>
              </select>
              <ChevronDown size={18} className="custom-select-icon" />
            </div>
          </div>

          <div className="control-right">
            <div className="search-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Search by name, city, college or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search size={18} className="search-icon" />
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="dashboard-stats">
          <div className="stat-badge">Category: <span>{selectedCategory.replace(' Registration', 's')}</span></div>
          <div className="stat-badge">Total Found: <span>{filteredData.length}</span></div>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="loading-wrapper">
            <div className="loader-spinner"></div>
            <p>Fetching database registrations...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="empty-wrapper">
            <div className="empty-icon">📂</div>
            <h3>No registrations found</h3>
            <p>We couldn't find any submissions matching your filter or search.</p>
          </div>
        ) : (
          <div className="cards-grid">
            {filteredData.map((item) => {
              const displayName = item.fullName || item.name || item.hospitalName || 'Unnamed';
              const location = item.currentCity || item.city || '—';
              const hasPic = !!(item.selfie || item.logo);

              return (
                <article key={item.id} className="registration-card">
                  <div className="card-profile-section">
                    <div className="profile-avatar-wrapper">
                      {hasPic ? (
                        <img
                          src={item.selfie || item.logo}
                          alt={displayName}
                          className="profile-avatar"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <span className="profile-initials">{getInitials(displayName)}</span>
                      )}
                    </div>
                    <div className="profile-info">
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span 
                          className={
                            item.formType?.includes('Doctor') ? 'badge-doctor' :
                            item.formType?.includes('HR') ? 'badge-hr' : 'badge-hospital'
                          }
                          style={{ 
                            padding: '3px 8px', 
                            fontSize: '10px', 
                            fontWeight: 700, 
                            borderRadius: '12px', 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.05em' 
                          }}
                        >
                          {item.formType?.replace(' Registration', '')}
                        </span>
                        <span 
                          style={{ 
                            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', 
                            color: '#fff', 
                            padding: '3px 8px', 
                            fontSize: '10px', 
                            fontWeight: 700, 
                            borderRadius: '12px', 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.05em',
                            boxShadow: '0 2px 4px rgba(245, 158, 11, 0.2)'
                          }}
                        >
                          ★ PREMIUM
                        </span>
                      </div>
                      <h3 style={{ marginTop: 0, lineHeight: 1.2 }}>{displayName}</h3>
                      <span className="sub-title">
                        {item.formType?.includes('Doctor') && `${item.highestQualification || 'MD/MS'} · ${item.superSpeciality || 'General'}`}
                        {item.formType?.includes('HR') && `${item.designation || 'HR Manager'} @ ${item.companyName || 'Corporate'}`}
                        {item.formType?.includes('Hospital') && (item.hospitalType || 'Multi-Speciality')}
                      </span>
                    </div>
                  </div>

                  <div className="card-body-section">
                    <div className="info-item">
                      <span className="label">Email</span>
                      <span className="value">{item.email}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Mobile</span>
                      <span className="value">{item.mobile}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Location</span>
                      <span className="value">{location}</span>
                    </div>

                    {item.formType?.includes('Doctor') && (
                      <>
                        <div className="info-item">
                          <span className="label">Experience</span>
                          <span className="value">{item.totalExperience} Yrs</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Relocation</span>
                          <span className="value">{item.willingToRelocate || 'No'}</span>
                        </div>
                      </>
                    )}

                    {item.formType?.includes('HR') && (
                      <div className="info-textarea-item">
                        <span className="label">Talent Requirements</span>
                        <div className="value">{item.hiringNeeds || 'No specific requirements.'}</div>
                      </div>
                    )}

                    {item.formType?.includes('Hospital') && (
                      <>
                        <div className="info-item">
                          <span className="label">Bed Capacity</span>
                          <span className="value">{item.bedCapacity ? `${item.bedCapacity} Beds` : '—'}</span>
                        </div>
                        <div className="info-textarea-item">
                          <span className="label">Hiring Doctors</span>
                          <div className="tags-list">
                            {Array.isArray(item.neededDoctors) && item.neededDoctors.length > 0
                              ? item.neededDoctors.map((doc, i) => <span key={i} className="tag-badge">{doc}</span>)
                              : <span className="tag-badge">None Specified</span>
                            }
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="card-footer-action">
                    <button className="view-details-btn" onClick={() => setSelectedItem(item)}>
                      <FileText size={15} /> View Full Profile
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Details Modal */}
        {selectedItem && (
          <div className="details-modal-overlay" onClick={() => setSelectedItem(null)}>
            <div className="details-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="details-modal-header">
                <h3>
                  {selectedItem.formType?.includes('Doctor') && <Stethoscope size={20} color="#3b82f6" />}
                  {selectedItem.formType?.includes('HR') && <Users size={20} color="#b45309" />}
                  {selectedItem.formType?.includes('Hospital') && <Building2 size={20} color="#15803d" />}
                  &nbsp;{selectedItem.fullName || selectedItem.name || selectedItem.hospitalName}
                </h3>
                <button className="modal-close-btn" onClick={() => setSelectedItem(null)}>
                  <X size={18} />
                </button>
              </div>

              <div className="details-modal-body">
                <div className="modal-grid-cols">
                  <div className="modal-left-column">
                    <div className="modal-selfie-box">
                      <img
                        src={selectedItem.selfie || selectedItem.logo || 'https://placehold.co/180x180?text=No+Photo'}
                        alt="Profile"
                        className="modal-selfie-img"
                        onError={(e) => { e.target.src = 'https://placehold.co/180x180?text=No+Photo'; }}
                      />
                    </div>
                    <span className="modal-selfie-label">
                      {selectedItem.selfie ? '📸 Live Selfie' : '🏢 Facility Logo'}
                    </span>
                  </div>

                  <div className="modal-right-column">
                    <table className="modal-info-table">
                      <tbody>
                        {renderModalRows(selectedItem)}
                      </tbody>
                    </table>
                  </div>
                </div>

                {(selectedItem.authLetter || selectedItem.authLetterUrl ||
                  (Array.isArray(selectedItem.hospitalPhotos) && selectedItem.hospitalPhotos.length > 0)) && (
                  <div className="document-previews">
                    <h4>Attachments &amp; Documents</h4>
                    <div className="preview-grid">
                      {(selectedItem.authLetter || selectedItem.authLetterUrl) && (
                        <div className="doc-preview-card">
                          <img
                            src={selectedItem.authLetter || selectedItem.authLetterUrl}
                            alt="Certificate"
                            className="doc-preview-img"
                            onError={(e) => { e.target.src = 'https://placehold.co/150?text=Doc'; }}
                          />
                          <span>Authorization Document</span>
                          <a
                            href={selectedItem.authLetter || selectedItem.authLetterUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="view-link"
                          >
                            Open File
                          </a>
                        </div>
                      )}
                      {Array.isArray(selectedItem.hospitalPhotos) && selectedItem.hospitalPhotos.map((photo, i) => (
                        <div key={i} className="doc-preview-card">
                          <img
                            src={photo}
                            alt={`Hospital Photo ${i + 1}`}
                            className="doc-preview-img"
                            onError={(e) => { e.target.src = 'https://placehold.co/150?text=Photo'; }}
                          />
                          <span>Facility Photo #{i + 1}</span>
                          <a href={photo} target="_blank" rel="noopener noreferrer" className="view-link">Open File</a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="details-modal-footer">
                <button className="modal-close-action-btn" onClick={() => setSelectedItem(null)}>
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ServicesDirectory;
