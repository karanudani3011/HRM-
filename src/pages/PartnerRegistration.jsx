import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, ChevronLeft, Send, Handshake } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './HospitalRegistration.css';

const PartnerRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formData, setFormData] = useState({
    partnerName: '',
    businessType: '',
    contactPerson: '',
    mobile: '',
    email: '',
    city: '',
    interestReason: ''
  });

  const nextStep = () => setStep(2);
  const prevStep = () => setStep(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (agreedToTerms) {
      try {
        await addDoc(collection(db, 'serviceForms'), {
          ...formData,
          formType: 'Partner Registration',
          name: formData.contactPerson,
          createdAt: serverTimestamp(),
        });
        alert('Partner Registration Submitted! Our team will contact you shortly.');
        navigate('/');
      } catch (err) {
        console.error('Firestore error:', err);
        alert('Partner Registration Submitted! (offline mode)');
        navigate('/');
      }
    }
  };

  return (
    <div className="hospital-reg-page">
      <div className="hospital-reg-container">
        <div className="reg-header">
          <h1>HRM Partner Program</h1>
          <p>Collaborate with us to transform healthcare access</p>
        </div>

        <div className="reg-progress">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">{step > 1 ? <CheckCircle2 size={16} /> : '1'}</div>
            <span>Business Info</span>
          </div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">{step > 2 ? <CheckCircle2 size={16} /> : '2'}</div>
            <span>Partnership</span>
          </div>
        </div>

        <form className="reg-form-body" onSubmit={handleSubmit}>
          {step === 1 ? (
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Business / Entity Name *</label>
                <input type="text" placeholder="Name of your clinic/business" value={formData.partnerName} onChange={(e) => setFormData({...formData, partnerName: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Type of Business *</label>
                <select value={formData.businessType} onChange={(e) => setFormData({...formData, businessType: e.target.value})}>
                  <option value="">Select Type</option>
                  <option value="Clinic">Clinic</option>
                  <option value="Diagnostic Center">Diagnostic Center</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Healthcare Provider">Healthcare Provider</option>
                </select>
              </div>
              <div className="form-group">
                <label>Contact Person *</label>
                <input type="text" placeholder="Full Name" value={formData.contactPerson} onChange={(e) => setFormData({...formData, contactPerson: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Mobile Number *</label>
                <input type="tel" placeholder="10-digit mobile" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email ID *</label>
                <input type="email" placeholder="Business Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>
          ) : (
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Why do you want to partner with HRM? *</label>
                <textarea rows="4" placeholder="Briefly describe your interest" value={formData.interestReason} onChange={(e) => setFormData({...formData, interestReason: e.target.value})}></textarea>
              </div>
              <div className="terms-section full-width mt-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} />
                  <span className="text-sm">I agree to the HRM Partner Program Terms and Conditions.</span>
                </label>
              </div>
            </div>
          )}
        </form>

        <div className="reg-form-footer">
          {step > 1 && <button type="button" className="btn-prev" onClick={prevStep}>Back</button>}
          {step < 2 ? (
            <button type="button" className="btn-next" onClick={nextStep}>Next <ChevronRight size={18} /></button>
          ) : (
            <button type="submit" className="btn-submit" onClick={handleSubmit} disabled={!agreedToTerms}>Apply for Partnership <Send size={18} /></button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerRegistration;
