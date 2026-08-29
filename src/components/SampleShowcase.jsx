import React, { useState, useRef, useEffect } from 'react';
import './SampleShowcase.css';
import clinicImg from '../assets/premium_clinic.png';
import qrPartner from '../assets/qr_hrm_partner.png';
import qrTerms from '../assets/qr_terms.png';
import { CheckCircle, FileText, LayoutDashboard, Upload, Download, Edit3, Camera, Mail, RefreshCw, ShieldCheck } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const SampleShowcase = () => {
  // Check if user has already submitted a card (persisted across sessions)
  const savedCardData = localStorage.getItem('hrmCardSubmitted');
  const savedCard = savedCardData ? JSON.parse(savedCardData) : null;

  const [showForm, setShowForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(!!savedCard);
  const [photoPreview, setPhotoPreview] = useState(savedCard?.photoPreview || null);
  const fileInputRef = useRef(null);

  // Email OTP states
  const [emailInput, setEmailInput] = useState(savedCard?.formData?.email || '');
  const [otpStep, setOtpStep] = useState('idle'); // 'idle' | 'sending' | 'verify' | 'verified'
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [otpValue, setOtpValue] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const [isDownloading, setIsDownloading] = useState(false);

  const generateUniqueCardId = () => {
    // Generate a truly unique card ID using timestamp + random — prevents duplicate IDs across users/devices
    const ts = Date.now().toString(36).toUpperCase().slice(-5);
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `HRM${ts}${rand}`;
  };

  const generateInitialData = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return {
      name: 'LAURA DOE',
      city: 'Rajkot',
      mobile: '',
      cardStatus: 'PENDING',
      idNo: generateUniqueCardId(),
      expireDate: `${month}/${year + 1}`,
      joinDate: `${month}/${year}`,
      cardName: ''
    };
  };

  const [formData, setFormData] = useState(savedCard?.formData || generateInitialData());
  const cardRef = useRef(null);

  useEffect(() => {
    const syncCardData = async () => {
      if (savedCard && savedCard.formData && savedCard.formData.idNo) {
        try {
          const { data, error } = await supabase
            .from('privilege_cards')
            .select('*')
            .eq('id_no', savedCard.formData.idNo.replace(/\s+/g, ''))
            .maybeSingle();

          if (error) {
            console.error('Error syncing card status:', error);
            return;
          }

          if (data) {
            const updatedFormData = {
              name: data.name || savedCard.formData.name,
              city: data.city || savedCard.formData.city,
              mobile: data.mobile || savedCard.formData.mobile,
              cardStatus: data.card_status || savedCard.formData.cardStatus,
              idNo: data.id_no || savedCard.formData.idNo,
              joinDate: data.join_date || savedCard.formData.joinDate,
              expireDate: data.expire_date || savedCard.formData.expireDate,
              cardName: data.card_name || savedCard.formData.cardName || ''
            };

            setFormData(updatedFormData);

            if (data.photo_url) {
              setPhotoPreview(data.photo_url);
            }

            if (data.email) {
              setEmailInput(data.email);
              setEmailVerified(true);
              setOtpStep('verified');
            }

            localStorage.setItem('hrmCardSubmitted', JSON.stringify({
              formData: updatedFormData,
              photoPreview: data.photo_url || data.photo_url
            }));
          }
        } catch (err) {
          console.error('Failed to sync card data:', err);
        }
      }
    };

    syncCardData();
  }, []);

  // Fetch accepted network partners from Firestore
  const [acceptedPartners, setAcceptedPartners] = useState([]);
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'serviceForms'), where('formType', '==', 'Partner Registration'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const partners = [];
      snapshot.forEach((document) => {
        const data = document.data();
        if (data.isAccepted) {
          partners.push(data.hospitalName || data.name || data.contactPerson);
        }
      });
      setAcceptedPartners(partners);
    });
    return () => unsubscribe();
  }, []);

  const staticPartners = [
    "Vedant Multispeciality Hospital",
    "Pulse+ Multi Speciality",
    "Dev Multi Speciality",
    "Unicare",
    "Shiv Multi Speciality",
    "Plexus",
    "Olympus SuperSpeciality"
  ];

  const allPartners = [...staticPartners, ...acceptedPartners];

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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  // ── Email OTP helpers ──
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!emailInput || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
      alert('Please enter a valid email address.');
      return;
    }
    setOtpLoading(true);
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    try {
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
      await emailjs.send(serviceId, templateId, { to_email: emailInput, otp: newOtp }, publicKey);
      setOtpStep('verify');
    } catch (err) {
      console.error('EmailJS Error:', err);
      alert('Failed to send OTP. Please check your email and try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otpValue === generatedOtp) {
      setEmailVerified(true);
      setOtpStep('verified');
      setFormData(prev => ({ ...prev, email: emailInput }));
    } else {
      alert('Invalid OTP. Please try again.');
      setOtpValue('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailVerified) {
      alert('Please verify your email before submitting.');
      return;
    }

    // Attempt DB insert FIRST — only mark submitted if it succeeds
    try {
      const { error } = await supabase
        .from('privilege_cards')
        .insert([{
          name: formData.name,
          role: 'user',
          id_no: formData.idNo.replace(/\s+/g, ''),
          join_date: formData.joinDate,
          expire_date: formData.expireDate,
          city: formData.city,
          mobile: formData.mobile,
          email: emailInput,
          card_status: 'PENDING_ACTIVATION',
          photo_url: photoPreview || '',
          card_name: formData.cardName || ''
        }]);

      if (error) {
        // Duplicate ID conflict or other DB error
        console.error('Error saving to privilege_cards in Supabase:', error);
        if (error.code === '23505') {
          // Unique constraint violation — regenerate ID and try once more
          const newId = generateUniqueCardId();
          const updatedFormData = { ...formData, idNo: newId };
          setFormData(updatedFormData);
          const { error: retryError } = await supabase
            .from('privilege_cards')
            .insert([{
              name: updatedFormData.name,
              role: 'user',
              id_no: newId,
              join_date: updatedFormData.joinDate,
              expire_date: updatedFormData.expireDate,
              city: updatedFormData.city,
              mobile: updatedFormData.mobile,
              email: emailInput,
              card_status: 'PENDING_ACTIVATION',
              photo_url: photoPreview || '',
              card_name: updatedFormData.cardName || ''
            }]);
          if (retryError) {
            alert('Submission failed due to a conflict error. Please try again.');
            return;
          }
          // Retry succeeded — save updated form data
          const savedData = { formData: { ...updatedFormData, email: emailInput }, photoPreview };
          localStorage.setItem('hrmCardSubmitted', JSON.stringify(savedData));
        } else {
          alert('Submission failed: ' + error.message + '. Please try again.');
          return;
        }
      } else {
        console.log('Successfully saved privilege card to Supabase');
        // Persist submitted state only after successful insert
        localStorage.setItem('hrmCardSubmitted', JSON.stringify({
          formData: { ...formData, email: emailInput },
          photoPreview: photoPreview
        }));
      }

      // Mark as submitted in UI only after successful DB save
      setFormSubmitted(true);
      setShowForm(false);
    } catch (err) {
      console.error('Failed to save card:', err);
      alert('Network error. Please check your connection and try again.');
    }
  };

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      const element = cardRef.current;
      const opt = {
        margin: [0.1, 0.15],
        filename: `HRM_Card_${(formData.name || 'User').replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 3,
          useCORS: true,
          allowTaint: true,
          scrollX: 0,
          scrollY: 0,
          windowWidth: 700,
          windowHeight: 480
        },
        jsPDF: {
          unit: 'in',
          format: [8.2, 6.0],
          orientation: 'landscape'
        },
        pagebreak: { mode: 'avoid-all' }
      };
      html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
          setIsDownloading(false);
        })
        .catch(err => {
          console.error(err);
          setIsDownloading(false);
        });
    }, 150);
  };


  return (
    <section className="sample-showcase" id="samples">
      <div className="container">
        <div className="section-header">
          <h2>HRM <span>Privilege Info</span></h2>
          <p>Preview your personalized HRM Privilege Info &amp; Partner Clinic Experience</p>
        </div>

        {/* Network Partner Hospitals Ticker */}
        <div className="hospital-ticker-wrapper">
          <div className="hospital-ticker-label">Network Partner :</div>
          <div className="hospital-ticker-content">
            <div className="hospital-ticker-track">
              {allPartners.map((partner, idx) => (
                <React.Fragment key={idx}>
                  <span>{idx + 1}. {partner}</span>
                  <span className="ticker-bullet">•</span>
                </React.Fragment>
              ))}

              {/* Duplicated set for seamless infinite loop */}
              {allPartners.map((partner, idx) => (
                <React.Fragment key={`dup-${idx}`}>
                  <span>{idx + 1}. {partner}</span>
                  <span className="ticker-bullet">•</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="samples-grid">
          {/* Sample 1: ID Card */}
          <div className="sample-item id-card-section">
            <h3 className="sample-title">
              <LayoutDashboard size={18} className="red-icon" /> HRM Privilege Info
            </h3>

            <div className="id-card-interactive-wrapper">

              {/* ID CARD VISUAL */}
              <div className={`id-card-preview ${isDownloading ? 'pdf-download-mode' : ''}`} ref={cardRef}>
                <div className="id-cards-container">

                  {/* ── FRONT SIDE ── */}
                  <div className="vertical-id-card front-card">
                    {/* Brushed metal overlay */}
                    <div className="metal-overlay" />

                    {/* Top: Custom Title replacing HRM Logo */}
                    <div className="idc-top">
                      <div className="idc-logo-text">
                        {formData.cardName || 'HRM'}
                      </div>
                      <p className="idc-tagline">PRIVILEGE INFO</p>
                    </div>

                    {/* Person Details */}
                    <div className="idc-details">
                      <div className="idc-detail-row">
                        <span className="idc-label">Name:</span>
                        <span className="idc-value">{formData.name}</span>
                      </div>
                      <div className="idc-detail-row">
                        <span className="idc-label">City</span>
                        <span className="idc-value">{formData.city}</span>
                      </div>
                      <div className="idc-detail-row">
                        <span className="idc-label">Card status:</span>
                        <span className="idc-value" style={{ color: formData.cardStatus === 'ACTIVE' ? '#4ade80' : '#f39c12', fontWeight: 'bold' }}>
                          {formData.cardStatus === 'ACTIVE' ? 'ACTIVE' : 'PENDING'}
                        </span>
                      </div>
                      <div className="idc-detail-row">
                        <span className="idc-label">Mo.</span>
                        <span className="idc-value">{formData.mobile}</span>
                      </div>
                      <div className="idc-detail-row">
                        <span className="idc-label">HRM ID:</span>
                        <span className="idc-value">{formData.idNo}</span>
                      </div>
                      <div className="idc-detail-row">
                        <span className="idc-label">Join Date</span>
                        <span className="idc-value">{formData.joinDate}</span>
                      </div>
                      <div className="idc-detail-row">
                        <span className="idc-label">Expire Date</span>
                        <span className="idc-value">{formData.expireDate}</span>
                      </div>
                    </div>

                    {/* Photo & QR Section */}
                    <div className="idc-photo-qr-section">
                      <div className="idc-photo-frame">
                        {photoPreview ? (
                          <img src={photoPreview} alt="Member" className="idc-photo-img" />
                        ) : (
                          <div className="idc-photo-placeholder">
                            <Camera size={24} color="#888" />
                          </div>
                        )}
                      </div>

                      <div className="idc-qr-frame">
                        <QRCodeSVG
                          value={`https://myhrm.co.in/verify/${formData.idNo}`}
                          size={70}
                          level="H"
                          includeMargin={true}
                        />
                      </div>
                    </div>

                    {/* Bottom */}
                    <div className="idc-bottom">
                      <div className="idc-terms-label">POWERED BY HRM</div>
                      <div className="idc-terms-big">POWERED BY HRM</div>
                      <div className="idc-website">www.myhrm.co.in</div>
                    </div>
                  </div>

                  {/* ── BACK SIDE ── */}
                  <div className="vertical-id-card back-card">
                    <div className="metal-overlay" />

                    <div className="back-top" style={{ padding: '12px 16px 0' }}>
                      <div className="back-hrm-title" style={{ fontSize: '14px' }}>HRM</div>
                    </div>

                    <div className="back-terms-content">
                      <div className="terms-heading">Member Terms & Conditions</div>
                      <div className="terms-text">
                        1. <strong>Private Membership:</strong> HRM PRIVILEGE CARD is a Private Membership Program operated by HRM Consultancy.<br />
                        2. <strong>Membership Fee:</strong> The Membership Fee is ₹500 (plus applicable GST, if applicable) and is payable only to HRM Consultancy through authorized payment channels.<br />
                        3. <strong>Validity:</strong> The Card is valid for the period mentioned in the Member Account or on the Card from the date of activation.<br />
                        4. <strong>Not an Insurance Product:</strong> This Card is not a health insurance policy, mediclaim policy, TPA service, cashless card or financial product.<br />
                        5. <strong>Eligible Benefits:</strong> Benefits are available only at participating Network Partner are subject to the applicable policies and these Terms & Conditions.
                      </div>
                    </div>

                    <div className="back-partner-label" style={{ marginTop: 'auto', fontSize: '7.5px' }}>FOR HRM NETWORK PARTNER INFO</div>

                    <div className="back-qr-stack" style={{ padding: '4px 20px 0', flex: 'none', marginBottom: '4px' }}>
                      <div className="back-qr-item" style={{ padding: '4px' }}>
                        <QRCodeSVG
                          value={`https://myhrm.co.in/verify/${formData.idNo}`}
                          size={55}
                          level="H"
                          includeMargin={true}
                        />
                      </div>
                    </div>

                    <div className="back-terms-label" style={{ padding: '0 12px 10px', fontSize: '6px', lineHeight: '1.2' }}>
                      PARTNER LIST<br />& BENIFITS UPDATES&HELPLINE INFO
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

                    <div className="form-row">
                      <div className="form-group">
                        <label>Full Name *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="FULL NAME IN CAPS" required />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Hospital Name *</label>
                        <input type="text" name="cardName" value={formData.cardName} onChange={handleInputChange} placeholder="Name to display in place of logo (e.g. HRM or Hospital Name)" required />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>City *</label>
                        <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="e.g. Rajkot" required />
                      </div>
                      <div className="form-group">
                        <label>Mobile No. *</label>
                        <input type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange} placeholder="10-digit number" required />
                      </div>
                    </div>

                    {/* ── Email + OTP Verification ── */}
                    <div className="form-group full-width">
                      <label>
                        Email Address *
                        {emailVerified && (
                          <span style={{ marginLeft: '8px', color: '#16a34a', fontSize: '12px', fontWeight: '600' }}>
                            <ShieldCheck size={13} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
                            Verified
                          </span>
                        )}
                      </label>

                      {otpStep === 'idle' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="email"
                            value={emailInput}
                            onChange={e => setEmailInput(e.target.value)}
                            placeholder="your@email.com"
                            required
                            style={{ flex: 1 }}
                            disabled={emailVerified}
                          />
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={otpLoading || emailVerified}
                            style={{ whiteSpace: 'nowrap', padding: '8px 14px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            {otpLoading ? <RefreshCw size={14} className="spin" /> : <Mail size={14} />}
                            {otpLoading ? 'Sending...' : 'Send OTP'}
                          </button>
                        </div>
                      )}

                      {otpStep === 'verify' && (
                        <div>
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                            <input
                              type="text"
                              value={emailInput}
                              readOnly
                              style={{ flex: 1, background: '#1a2234', color: '#9ca3af', borderColor: '#374151' }}
                            />
                            <button
                              type="button"
                              onClick={() => { setOtpStep('idle'); setOtpValue(''); }}
                              style={{ padding: '8px 12px', background: '#374151', color: '#9ca3af', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                            >
                              Change
                            </button>
                          </div>
                          <div style={{ background: '#0f172a', border: '1px solid #1e3a5f', borderRadius: '8px', padding: '12px', marginTop: '6px' }}>
                            <p style={{ fontSize: '12px', color: '#60a5fa', margin: '0 0 8px 0' }}>📨 OTP sent to <strong>{emailInput}</strong>. Enter the 6-digit code:</p>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input
                                type="text"
                                value={otpValue}
                                onChange={e => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="0 0 0 0 0 0"
                                maxLength={6}
                                autoFocus
                                style={{ flex: 1, textAlign: 'center', fontSize: '22px', letterSpacing: '8px', fontWeight: '700', padding: '10px' }}
                              />
                              <button
                                type="button"
                                onClick={handleVerifyOtp}
                                style={{ padding: '8px 14px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' }}
                              >
                                Verify
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {otpStep === 'verified' && (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            type="email"
                            value={emailInput}
                            readOnly
                            style={{ flex: 1, background: '#052e16', borderColor: '#16a34a', color: '#86efac' }}
                          />
                          <span style={{ color: '#16a34a', fontWeight: '700', fontSize: '13px', whiteSpace: 'nowrap' }}>✓ Verified</span>
                        </div>
                      )}
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>HRM ID No.</label>
                        <input type="text" name="idNo" value={formData.idNo} onChange={handleInputChange} readOnly className="readonly-input" required />
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

                    <div className="form-group full-width">
                      <label>Member Photo</label>
                      <div className="photo-upload-area" onClick={() => fileInputRef.current?.click()}>
                        {photoPreview ? (
                          <img src={photoPreview} alt="Preview" className="photo-preview-thumb" />
                        ) : (
                          <span><Upload size={16} /> Upload Photo (optional)</span>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handlePhotoChange}
                      />
                    </div>

                    <button
                      type="submit"
                      className="action-btn success-btn"
                      disabled={!emailVerified}
                      style={{ opacity: emailVerified ? 1 : 0.5, cursor: emailVerified ? 'pointer' : 'not-allowed' }}
                    >
                      {emailVerified ? 'Generate ID Card' : 'Verify Email to Continue'}
                    </button>
                  </form>
                )}

                {formSubmitted && (
                  <div className="submitted-actions">
                    {formData.cardStatus === 'ACTIVE' ? (
                      <div className="submitted-message" style={{ textAlign: 'center', padding: '10px 0', color: '#16a34a', fontWeight: '600', fontSize: '14px' }}>
                        <CheckCircle size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                        Your HRM Privilege Card is ACTIVE!
                      </div>
                    ) : (
                      <div className="submitted-message" style={{ textAlign: 'center', padding: '10px 0', color: '#f39c12', fontWeight: '600', fontSize: '14px' }}>
                        <RefreshCw size={18} className="spin" style={{ verticalAlign: 'middle', marginRight: '6px', display: 'inline-block' }} />
                        Your card is submitted. Admin approval is pending.
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', width: '100%' }}>
                      <button className="action-btn download-btn-new" onClick={handleDownload}>
                        <Download size={18} /> Download ID Card PDF
                      </button>
                      <button
                        type="button"
                        className="action-btn"
                        onClick={() => {
                          localStorage.removeItem('hrmCardSubmitted');
                          // Generate a fresh unique card ID on reset to avoid conflicts
                          const freshData = generateInitialData();
                          setFormData(freshData);
                          setPhotoPreview(null);
                          setEmailInput('');
                          setEmailVerified(false);
                          setOtpStep('idle');
                          setOtpValue('');
                          setFormSubmitted(false);
                          setShowForm(true);
                        }}
                        style={{ background: '#475569', color: '#fff', border: 'none', cursor: 'pointer', padding: '10px', borderRadius: '6px', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        Reset Form & Re-submit Card
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sample 2: HRM Health Partner Clinic */}
          <div className="sample-item">
            <h3 className="sample-title">
              <LayoutDashboard size={18} className="red-icon" /> HRM Network Partner Clinic Sample
            </h3>
            <div className="clinic-sample-wrapper">
              <img src={clinicImg} alt="HRM Premium Clinic" className="clinic-image" />

              <div className="clinic-details">
                <h4>Premium HRM Branded Clinic Experience</h4>
                <ul className="feature-list">
                  <li>
                    <CheckCircle size={16} className="red-icon" />
                    <span>Professional doctors with "HRM NETWORK PARTNER" branded backdrop</span>
                  </li>
                  <li>
                    <CheckCircle size={16} className="red-icon" />
                    <span>Premium consultation rooms featuring "HRM" wall branding</span>
                  </li>
                  <li>
                    <CheckCircle size={16} className="red-icon" />
                    <span>Standardized patient experience across all partner locations</span>
                  </li>
                </ul>
                <div className="sample-note">
                  <FileText size={16} className="red-icon" /> See how your clinic will look as an HRM Health Partner
                  <span>HEALTH PARTNER SAMPLE AVAILABLE AS PER REQUEST</span>
                </div>
              </div>

              <Link to="/portal/hrm-partner/register" className="register-btn" style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>
                Register as Health Partner
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default SampleShowcase;
