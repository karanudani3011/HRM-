import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, ChevronLeft, Send, Users, Building } from 'lucide-react';
import './HospitalRegistration.css'; // Reusing layout styles

const HRRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    designation: '',
    mobile: '',
    email: '',
    city: '',
    hiringNeeds: '',
    experience: ''
  });

  const nextStep = () => setStep(2);
  const prevStep = () => setStep(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (agreedToTerms) {
      alert('HR Registration Submitted!');
      navigate('/');
    }
  };

  return (
    <div className="hospital-reg-page">
      <div className="hospital-reg-container">
        <div className="reg-header">
          <h1>HR Professional Portal</h1>
          <p>Hire the best medical talent for your organization</p>
        </div>

        <div className="reg-progress">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">{step > 1 ? <CheckCircle2 size={16} /> : '1'}</div>
            <span>Basic Info</span>
          </div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">{step > 2 ? <CheckCircle2 size={16} /> : '2'}</div>
            <span>Requirements</span>
          </div>
        </div>

        <form className="reg-form-body" onSubmit={handleSubmit}>
          {step === 1 ? (
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Full Name *</label>
                <input type="text" placeholder="Your Name" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Company/Agency Name *</label>
                <input type="text" placeholder="Company Name" value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Designation *</label>
                <input type="text" placeholder="e.g. Talent Acquisition" value={formData.designation} onChange={(e) => setFormData({...formData, designation: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Mobile Number *</label>
                <input type="tel" placeholder="10-digit number" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email ID *</label>
                <input type="email" placeholder="Official Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>
          ) : (
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Current Hiring Requirements *</label>
                <textarea rows="4" placeholder="Describe what roles you are looking to fill" value={formData.hiringNeeds} onChange={(e) => setFormData({...formData, hiringNeeds: e.target.value})}></textarea>
              </div>
              <div className="terms-section full-width mt-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} />
                  <span className="text-sm">I agree to the HRM Consultancy Terms and Conditions for HR Professionals.</span>
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
            <button type="submit" className="btn-submit" onClick={handleSubmit} disabled={!agreedToTerms}>Register HR Portal <Send size={18} /></button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HRRegistration;
