import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, ChevronLeft, Send } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './DoctorRegistration.css';

const HRRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    designation: '',
    mobile: '',
    email: '',
    hiringNeeds: '',
  });

  const validate = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.fullName) newErrors.fullName = 'Required';
      if (!formData.companyName) newErrors.companyName = 'Required';
      if (!formData.designation) newErrors.designation = 'Required';
      if (!formData.mobile) newErrors.mobile = 'Required';
      if (!formData.email) newErrors.email = 'Required';
    } else if (step === 2) {
      if (!formData.hiringNeeds) newErrors.hiringNeeds = 'Required';
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
          formType: 'HR Registration',
          name: formData.fullName,
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
          <h1>HR Professional Portal</h1>
        </div>

        <div className="reg-progress">
          {[1, 2].map(num => (
            <div key={num} className={`progress-step ${step >= num ? 'active' : ''}`}>
              <div className="step-number">{step > num ? <CheckCircle2 size={16} /> : num}</div>
              <span className="step-label">{['Basic Info', 'Requirements'][num-1]}</span>
            </div>
          ))}
        </div>

        <form className="reg-form-body" onSubmit={handleSubmit}>
          {step === 1 ? (
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Full Name *</label>
                <input type="text" className={errors.fullName ? 'error' : ''} placeholder="Your Name" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                {errors.fullName && <span className="error-msg">{errors.fullName}</span>}
              </div>
              <div className="form-group">
                <label>Company/Agency Name *</label>
                <input type="text" className={errors.companyName ? 'error' : ''} placeholder="Company Name" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                {errors.companyName && <span className="error-msg">{errors.companyName}</span>}
              </div>
              <div className="form-group">
                <label>Designation *</label>
                <input type="text" className={errors.designation ? 'error' : ''} placeholder="e.g. Talent Acquisition" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} />
                {errors.designation && <span className="error-msg">{errors.designation}</span>}
              </div>
              <div className="form-group">
                <label>Mobile Number *</label>
                <div className="input-with-action">
                  <input type="tel" className={errors.mobile ? 'error' : ''} placeholder="10-digit number" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
                  <button type="button" className="verify-btn">Verify OTP</button>
                </div>
                {errors.mobile && <span className="error-msg">{errors.mobile}</span>}
              </div>
              <div className="form-group">
                <label>Email ID *</label>
                <div className="input-with-action">
                  <input type="email" className={errors.email ? 'error' : ''} placeholder="Official Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  <button type="button" className="verify-btn">Verify OTP</button>
                </div>
                {errors.email && <span className="error-msg">{errors.email}</span>}
              </div>
            </div>
          ) : (
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Current Hiring Requirements *</label>
                <textarea className={errors.hiringNeeds ? 'error' : ''} placeholder="Describe roles you are looking to fill" value={formData.hiringNeeds} onChange={e => setFormData({...formData, hiringNeeds: e.target.value})} rows="4" />
                {errors.hiringNeeds && <span className="error-msg">{errors.hiringNeeds}</span>}
              </div>
              <div className="terms-section full-width mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} className="mt-1" />
                  <span className="text-sm font-medium">I agree to the HRM Consultancy Terms for HR Professionals.</span>
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
            <button type="submit" className="btn-submit ml-auto" onClick={handleSubmit} disabled={!agreedToTerms}>Register HR Portal <Send size={18} /></button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HRRegistration;
