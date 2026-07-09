import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { CheckCircle2, ChevronRight, ChevronLeft, Send, Loader2, ShieldCheck } from 'lucide-react';
import emailjs from '@emailjs/browser';
import './DoctorRegistration.css';

const PartnerRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    hospitalName: '',
    licenseNumber: '',
    totalBeds: '',
    icuBeds: '',
    specialties: '',
    contactPerson: '',
    email: '',
    phone: ''
  });

  // OTP Verification States
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [generatedEmailOtp, setGeneratedEmailOtp] = useState(null);
  const [userEmailOtp, setUserEmailOtp] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [sendingEmailOtp, setSendingEmailOtp] = useState(false);

  const handleSendEmailOtp = async () => {
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      alert("Please enter a valid email address first.");
      return;
    }

    setSendingEmailOtp(true);
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedEmailOtp(newOtp);
    console.log("[DEBUG OTP] Sent OTP is:", newOtp);

    const templateParams = {
      to_email: formData.email,
      otp: newOtp,
    };

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
      setEmailOtpSent(true);
      alert("OTP sent to " + formData.email);
    } catch (error) {
      console.error('EmailJS Error:', error);
      // Fallback alert showing OTP so local dev/testing doesn't block users if keys are unset
      setEmailOtpSent(true);
      alert("Verification OTP: " + newOtp + " (Email delivery failed. Verification code provided for testing).");
    } finally {
      setSendingEmailOtp(false);
    }
  };

  const handleVerifyEmailOtp = () => {
    if (userEmailOtp === generatedEmailOtp) {
      setIsEmailVerified(true);
      alert("Email verified successfully!");
    } else {
      alert("Invalid OTP! Please try again.");
    }
  };

  const validate = (currentStep) => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!formData.hospitalName.trim()) newErrors.hospitalName = 'Hospital Name is required';
      if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License Number is required';
      if (!formData.totalBeds.trim()) newErrors.totalBeds = 'Total Beds is required';
      if (formData.totalBeds && isNaN(formData.totalBeds)) newErrors.totalBeds = 'Must be a number';
      if (formData.icuBeds && isNaN(formData.icuBeds)) newErrors.icuBeds = 'Must be a number';
      if (!formData.specialties.trim()) newErrors.specialties = 'Specialties is required';
    } else if (currentStep === 2) {
      if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact Person is required';
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Invalid email address';
      }
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

      if (!isEmailVerified) {
        alert('Please verify your email address via OTP first.');
        return false;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validate(1)) { 
      setStep(2); 
      setErrors({}); 
    }
  };

  const prevStep = () => { 
    setStep(1); 
    setErrors({}); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate(2)) {
      if (!agreedToTerms) { 
        alert("Please agree to the terms and conditions"); 
        return; 
      }
      try {
        await addDoc(collection(db, 'serviceForms'), {
          ...formData,
          formType: 'Partner Registration',
          name: formData.hospitalName,
          createdAt: serverTimestamp(),
        });
        alert('Registration Successful!');
        navigate('/registration-success', { state: { formType: 'Partner Registration' } });
      } catch (err) { 
        alert('Submission failed: ' + err.message); 
      }
    }
  };

  return (
    <div className="doctor-reg-page">
      <div className="doctor-reg-container">
        <div className="reg-header">
          <p className="text-sm font-medium mb-2">Partner with India's most trusted healthcare network</p>
          <h1>HRM Health Partner Registration</h1>
        </div>

        <div className="reg-progress">
          {[1, 2].map(num => (
            <div key={num} className={`progress-step ${step >= num ? 'active' : ''}`}>
              <div className="step-number">{step > num ? <CheckCircle2 size={18} /> : num}</div>
              <span className="step-label">{['Hospital Info', 'Contact Info'][num-1]}</span>
            </div>
          ))}
        </div>

        <form className="reg-form-body" onSubmit={handleSubmit}>
          {step === 1 ? (
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Hospital Name *</label>
                <input 
                  type="text" 
                  className={errors.hospitalName ? 'error' : ''} 
                  placeholder="Enter official hospital name" 
                  value={formData.hospitalName} 
                  onChange={e => setFormData({...formData, hospitalName: e.target.value})} 
                />
                {errors.hospitalName && <span className="error-msg">{errors.hospitalName}</span>}
              </div>

              <div className="form-group">
                <label>License Number *</label>
                <input 
                  type="text" 
                  className={errors.licenseNumber ? 'error' : ''} 
                  placeholder="Enter medical practice license number" 
                  value={formData.licenseNumber} 
                  onChange={e => setFormData({...formData, licenseNumber: e.target.value})} 
                />
                {errors.licenseNumber && <span className="error-msg">{errors.licenseNumber}</span>}
              </div>

              <div className="form-group">
                <label>Total Beds *</label>
                <input 
                  type="number" 
                  className={errors.totalBeds ? 'error' : ''} 
                  placeholder="Total bed capacity" 
                  value={formData.totalBeds} 
                  onChange={e => setFormData({...formData, totalBeds: e.target.value})} 
                />
                {errors.totalBeds && <span className="error-msg">{errors.totalBeds}</span>}
              </div>

              <div className="form-group">
                <label>ICU Beds</label>
                <input 
                  type="number" 
                  className={errors.icuBeds ? 'error' : ''} 
                  placeholder="Number of ICU beds (optional)" 
                  value={formData.icuBeds} 
                  onChange={e => setFormData({...formData, icuBeds: e.target.value})} 
                />
                {errors.icuBeds && <span className="error-msg">{errors.icuBeds}</span>}
              </div>

              <div className="form-group full-width">
                <label>Specialties *</label>
                <input 
                  type="text" 
                  className={errors.specialties ? 'error' : ''} 
                  placeholder="e.g., Cardiology, Orthopedics, Neurology" 
                  value={formData.specialties} 
                  onChange={e => setFormData({...formData, specialties: e.target.value})} 
                />
                {errors.specialties && <span className="error-msg">{errors.specialties}</span>}
              </div>
            </div>
          ) : (
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Contact Person *</label>
                <input 
                  type="text" 
                  className={errors.contactPerson ? 'error' : ''} 
                  placeholder="Enter contact person's full name" 
                  value={formData.contactPerson} 
                  onChange={e => setFormData({...formData, contactPerson: e.target.value})} 
                />
                {errors.contactPerson && <span className="error-msg">{errors.contactPerson}</span>}
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <div className="input-with-action">
                  <input 
                    type="email" 
                    className={errors.email ? 'error' : ''} 
                    placeholder="Enter email ID" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    disabled={isEmailVerified}
                  />
                  {!isEmailVerified ? (
                    <button 
                      type="button" 
                      className="verify-btn" 
                      onClick={handleSendEmailOtp}
                      disabled={sendingEmailOtp}
                    >
                      {sendingEmailOtp ? 'Sending...' : 'Verify Email'}
                    </button>
                  ) : (
                    <div className="verified-badge"><ShieldCheck size={16} /> Verified</div>
                  )}
                </div>
                {emailOtpSent && !isEmailVerified && (
                  <div className="otp-input-small">
                    <input 
                      type="text" 
                      placeholder="Enter 6-digit OTP" 
                      value={userEmailOtp}
                      onChange={(e) => setUserEmailOtp(e.target.value)}
                    />
                    <button type="button" onClick={handleVerifyEmailOtp}>Check</button>
                  </div>
                )}
                {errors.email && <span className="error-msg">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label>Phone *</label>
                <input 
                  type="tel" 
                  className={errors.phone ? 'error' : ''} 
                  placeholder="10-digit mobile number" 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                />
                {errors.phone && <span className="error-msg">{errors.phone}</span>}
              </div>

              <div className="terms-section full-width mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={agreedToTerms} 
                    onChange={e => setAgreedToTerms(e.target.checked)} 
                    className="mt-1" 
                  />
                  <span className="text-sm font-medium">
                    I agree to the HRM Partner Program{' '}
                    <Link to="/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: '600' }}>Terms and Conditions</Link>.
                  </span>
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
            <button type="submit" className="btn-submit ml-auto" onClick={handleSubmit} disabled={!agreedToTerms}>Submit Application <Send size={18} /></button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerRegistration;
