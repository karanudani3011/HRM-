import React, { useState, useRef } from 'react';
import './SampleShowcase.css';
import clinicImg from '../assets/premium_clinic.png';
import { CheckCircle, FileText, LayoutDashboard, HeartPulse, Upload, Download, Edit3 } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const SampleShowcase = () => {
  const [showForm, setShowForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const generateInitialData = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    
    // Read the current sequential ID from localStorage, default to 1001
    const currentSequence = parseInt(localStorage.getItem('hrmCardSequence') || '1001', 10);
    
    return {
      name: 'Laura Doe',
      idNo: `HRM8484 ${currentSequence}`,
      expireDate: `${month}/${year + 1}`,
      joinDate: `${month}/${year}`,
      photo: null
    };
  };

  const [formData, setFormData] = useState(generateInitialData());

  const cardRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'joinDate') {
      let newExpire = formData.expireDate;
      const parts = value.split('/');
      if (parts.length === 2 && parts[1].length === 4) {
        newExpire = `${parts[0]}/${parseInt(parts[1], 10) + 1}`;
      }
      setFormData(prev => ({ ...prev, [name]: value, expireDate: newExpire }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, photo: url }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setShowForm(false);
    
    // Increment the sequence for the next card
    const currentSequence = parseInt(localStorage.getItem('hrmCardSequence') || '1001', 10);
    localStorage.setItem('hrmCardSequence', (currentSequence + 1).toString());
  };

  const handleDownload = () => {
    const element = cardRef.current;
    const opt = {
      margin: 0.5,
      filename: 'HRM_ID_Card.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 3, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <section className="sample-showcase" id="samples">
      <div className="container">
        <div className="section-header">
          <h2>HRM <span>ID Card Showcase</span></h2>
          <p>Preview your personalized HRM Privilege ID Card & Partner Clinic Experience</p>
        </div>

        <div className="samples-grid">
          {/* Sample 1: ID Card */}
          <div className="sample-item id-card-section">
            <h3 className="sample-title">
              <LayoutDashboard size={18} className="red-icon" /> HRM Privilege ID Card
            </h3>
            
            <div className="id-card-interactive-wrapper">
              
              {/* ID CARD VISUAL */}
              <div className="id-card-preview" ref={cardRef}>
                <div className="id-cards-container">
                  {/* FRONT SIDE */}
                  <div className="vertical-id-card front-card">
                    <div className="card-bg-pattern"></div>
                    <div className="id-card-top">
                      <div className="id-brand-logo">
                        <img src="/logo.jpeg" alt="HRM Logo" className="id-brand-logo-img" />
                      </div>
                    </div>
                    
                    <div className="id-photo-container">
                      <div className="id-photo-border">
                        {formData.photo ? (
                          <img src={formData.photo} alt="Profile" className="id-photo-img" />
                        ) : (
                          <div className="id-photo-placeholder">
                            <Upload size={32} color="#ccc" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="id-person-details">
                      <h2 className="person-name">{formData.name}</h2>
                    </div>
                    
                    <div className="id-validity-bar">
                      <span>Expire: {formData.expireDate}</span>
                      <span>Join: {formData.joinDate}</span>
                    </div>
                    
                    <div className="id-card-bottom">
                      <h2 className="card-type-title">ID CARD</h2>
                      <div className="id-number">
                        Id No. : {formData.idNo}
                      </div>
                      <div className="card-website">
                        www.myhrm.co.in
                      </div>
                    </div>
                  </div>

                  {/* BACK SIDE */}
                  <div className="vertical-id-card back-card back-card-terms-only">
                    <div className="card-bg-pattern"></div>
                    
                    <div className="id-terms">
                      <h4>TERMS AND CONDITIONS:</h4>
                      <p>
                        This card is the property of HRM Clinic. If found, please return to the nearest HRM facility. Not transferable. Subject to all terms and conditions of the HRM Privilege Program.
                      </p>
                    </div>


                  </div>
                </div>
              </div>

              {/* ACTION CONTROLS */}
              <div className="id-card-controls">
                {!showForm && !formSubmitted && (
                  <button className="action-btn primary-btn" onClick={() => setShowForm(true)}>
                    <Edit3 size={18} /> Fill Details to Create Card
                  </button>
                )}

                {showForm && !formSubmitted && (
                  <form className="id-details-form" onSubmit={handleSubmit}>
                    <h4>Enter Card Details</h4>
                    
                    <div className="form-group">
                      <label>Photo</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handlePhotoUpload}
                        className="file-input"
                      />
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>ID No.</label>
                        <input type="text" name="idNo" value={formData.idNo} onChange={handleInputChange} required />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Join Date</label>
                        <input type="text" name="joinDate" value={formData.joinDate} readOnly className="readonly-input" />
                      </div>
                      <div className="form-group">
                        <label>Expire Date</label>
                        <input type="text" name="expireDate" value={formData.expireDate} readOnly className="readonly-input" />
                      </div>
                    </div>

                    <button type="submit" className="action-btn success-btn">Generate ID Card</button>
                  </form>
                )}

                {formSubmitted && (
                  <div className="submitted-actions">
                    <button className="action-btn secondary-btn" onClick={() => { setFormSubmitted(false); setShowForm(true); }}>
                      <Edit3 size={18} /> Edit Details
                    </button>
                    <button className="action-btn download-btn-new" onClick={handleDownload}>
                      <Download size={18} /> Download ID Card PDF
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sample 2: Clinic */}
          <div className="sample-item">
            <h3 className="sample-title"><LayoutDashboard size={18} className="red-icon" /> HRM Partner Clinic Experience</h3>
            <div className="clinic-sample-wrapper">
              <img src={clinicImg} alt="HRM Premium Clinic" className="clinic-image" />
              
              <div className="clinic-details">
                <h4>Premium HRM Branded Clinic Experience</h4>
                <ul className="feature-list">
                  <li>
                    <CheckCircle size={16} className="red-icon" />
                    <span>Professional doctors with "HRM HEALTH PARTNER" branded backdrop</span>
                  </li>
                  <li>
                    <CheckCircle size={16} className="red-icon" />
                    <span>Premium consultation rooms featuring "HRM DOCTORS CHOICE" wall branding</span>
                  </li>
                  <li>
                    <CheckCircle size={16} className="red-icon" />
                    <span>Standardized patient experience across all partner locations</span>
                  </li>
                </ul>
                <div className="sample-note">
                  <FileText size={16} className="red-icon" /> See how your clinic will look as an HRM Network Partner
                  <span>PARTNER CLINIC SAMPLE AVAILABLE AS PER REQUEST</span>
                </div>
              </div>
              
              <button className="register-btn">Register as Network Partner</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SampleShowcase;
