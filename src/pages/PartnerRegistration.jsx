import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, ChevronLeft, Send } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './DoctorRegistration.css';

const PartnerRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    partnerName: '',
    businessType: '',
    contactPerson: '',
    mobile: '',
    email: '',
    interestReason: '',
  });

  const validate = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.partnerName) newErrors.partnerName = 'Required';
      if (!formData.businessType) newErrors.businessType = 'Required';
      if (!formData.contactPerson) newErrors.contactPerson = 'Required';
      if (!formData.mobile) newErrors.mobile = 'Required';
      if (!formData.email) newErrors.email = 'Required';
    } else if (step === 2) {
      if (!formData.interestReason) newErrors.interestReason = 'Required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validate()) { setStep(prev => prev + 1); setErrors({}); }
  };

  const prevStep = () => { setStep(prev => prev - 1); setErrors({}); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      if (!agreedToTerms) { alert("Please agree to the terms"); return; }
      try {
        await addDoc(collection(db, 'serviceForms'), {
          ...formData,
          formType: 'Partner Registration',
          name: formData.partnerName,
          createdAt: serverTimestamp(),
        });
        alert('Registration Successful!');
        navigate('/');
      } catch (err) { alert('Submission failed'); }
    }
  };

  return (
    <div className="doctor-reg-page">
      <div className="doctor-reg-container">
        <div className="reg-header">
          <p className="text-sm font-medium mb-2">Join India's most trusted healthcare network</p>
          <h1>HRM Partner Program</h1>
        </div>

        <div className="reg-progress">
          {[1, 2].map(num => (
            <div key={num} className={`progress-step ${step >= num ? 'active' : ''}`}>
              <div className="step-number">{step > num ? <CheckCircle2 size={18} /> : num}</div>
              <span className="step-label">{['Business', 'Partnership'][num-1]}</span>
            </div>
          ))}
        </div>

        <form className="reg-form-body" onSubmit={handleSubmit}>
          {step === 1 ? (
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Business / Entity Name *</label>
                <input type="text" className={errors.partnerName ? 'error' : ''} placeholder="Name of your clinic/business" value={formData.partnerName} onChange={e => setFormData({...formData, partnerName: e.target.value})} />
                {errors.partnerName && <span className="error-msg">{errors.partnerName}</span>}
              </div>
              <div className="form-group">
                <label>Type of Business *</label>
                <select className={errors.businessType ? 'error' : ''} value={formData.businessType} onChange={e => setFormData({...formData, businessType: e.target.value})}>
                  <option value="">Select Type</option>
                  <option value="Clinic">Clinic</option>
                  <option value="Diagnostic Center">Diagnostic Center</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Healthcare Provider">Healthcare Provider</option>
                </select>
                {errors.businessType && <span className="error-msg">{errors.businessType}</span>}
              </div>
              <div className="form-group">
                <label>Contact Person *</label>
                <input type="text" className={errors.contactPerson ? 'error' : ''} placeholder="Full Name" value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} />
                {errors.contactPerson && <span className="error-msg">{errors.contactPerson}</span>}
              </div>
              <div className="form-group">
                <label>Mobile Number *</label>
                <div className="input-with-action">
                  <input type="tel" className={errors.mobile ? 'error' : ''} placeholder="10-digit mobile" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
                  <button type="button" className="verify-btn">Verify OTP</button>
                </div>
                {errors.mobile && <span className="error-msg">{errors.mobile}</span>}
              </div>
              <div className="form-group">
                <label>Email ID *</label>
                <div className="input-with-action">
                  <input type="email" className={errors.email ? 'error' : ''} placeholder="Business Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  <button type="button" className="verify-btn">Verify OTP</button>
                </div>
                {errors.email && <span className="error-msg">{errors.email}</span>}
              </div>
            </div>
          ) : (
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Why do you want to partner with HRM? *</label>
                <textarea className={errors.interestReason ? 'error' : ''} placeholder="Briefly describe your interest" value={formData.interestReason} onChange={e => setFormData({...formData, interestReason: e.target.value})} rows="4" />
                {errors.interestReason && <span className="error-msg">{errors.interestReason}</span>}
              </div>
              <div className="terms-section full-width mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} className="mt-1" />
                  <span className="text-sm font-medium">I agree to the HRM Partner Program Terms and Conditions.</span>
                </label>
              </div>
            </div>
          )}
        </form>

        <div className="reg-form-footer">
          {step > 1 && <button type="button" className="btn-prev" onClick={prevStep}>Back</button>}
          {step < 2 ? (
            <button type="button" className="btn-next ml-auto" onClick={nextStep}>Next <ChevronRight size={18} /></button>
          ) : (
            <button type="submit" className="btn-submit ml-auto" onClick={handleSubmit} disabled={!agreedToTerms}>Apply for Partnership <Send size={18} /></button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerRegistration;
