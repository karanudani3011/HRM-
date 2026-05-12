import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, ChevronLeft, Camera, Upload, Send, ShieldCheck } from 'lucide-react';
import './HospitalRegistration.css';

const HospitalRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Basic Details
    hospitalName: '',
    hospitalType: '',
    regNumber: '',
    yearOfEstablishment: '',
    bedCapacity: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    website: '',
    // Step 2: Contact Person
    adminName: '',
    designation: '',
    mobile: '',
    email: '',
    whatsapp: '',
    authLetter: null,
    // Step 3: Verification
    selfie: null,
    logo: null,
    // Step 4: Hiring
    neededDoctors: [],
    jobTypes: [],
    expRange: '',
    salaryRange: '',
    urgency: '',
    facilityHighlights: '',
    hospitalPhotos: [],
    // Step 5: Consent
    gstNumber: '',
    plan: 'Free'
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && name !== 'terms') {
      const currentList = [...formData[name]];
      if (checked) {
        setFormData(prev => ({ ...prev, [name]: [...currentList, value] }));
      } else {
        setFormData(prev => ({ ...prev, [name]: currentList.filter(item => item !== value) }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateStep = (currentStep) => {
    let newErrors = {};
    if (currentStep === 1) {
      if (!formData.hospitalName) newErrors.hospitalName = 'Required';
      if (!formData.hospitalType) newErrors.hospitalType = 'Required';
      if (!formData.regNumber) newErrors.regNumber = 'Required';
      if (!formData.yearOfEstablishment) newErrors.yearOfEstablishment = 'Required';
      if (!formData.bedCapacity) newErrors.bedCapacity = 'Required';
      if (!formData.address) newErrors.address = 'Required';
      if (!formData.city) newErrors.city = 'Required';
      if (!formData.state) newErrors.state = 'Required';
      if (!formData.pincode || formData.pincode.length !== 6) newErrors.pincode = 'Enter 6-digit pincode';
    } else if (currentStep === 2) {
      if (!formData.adminName) newErrors.adminName = 'Required';
      if (!formData.designation) newErrors.designation = 'Required';
      if (!formData.mobile || formData.mobile.length !== 10) newErrors.mobile = 'Enter 10-digit mobile';
      if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter valid email';
    } else if (currentStep === 4) {
      if (formData.neededDoctors.length === 0) newErrors.neededDoctors = 'Select at least one';
      if (formData.jobTypes.length === 0) newErrors.jobTypes = 'Select at least one';
      if (!formData.expRange) newErrors.expRange = 'Required';
      if (!formData.salaryRange) newErrors.salaryRange = 'Required';
      if (!formData.urgency) newErrors.urgency = 'Required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep(prev => prev + 1);
  };

  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (agreedToTerms) {
      console.log('Hospital Registration Data:', formData);
      alert('Hospital Registration Submitted! Our team will verify your details.');
      navigate('/');
    }
  };

  return (
    <div className="hospital-reg-page">
      <div className="hospital-reg-container">
        <div className="reg-header">
          <h1>Hospital Registration Portal</h1>
          <p>Register your facility to access India's top medical talent</p>
        </div>

        <div className="reg-progress">
          {[1, 2, 3, 4, 5].map(num => (
            <div key={num} className={`progress-step ${step >= num ? 'active' : ''}`}>
              <div className="step-number">{step > num ? <CheckCircle2 size={16} /> : num}</div>
              <span>{['Basic', 'Admin', 'Verify', 'Hiring', 'Submit'][num-1]}</span>
            </div>
          ))}
        </div>

        <form className="reg-form-body" onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="form-step-content">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Hospital Name (As per Registration Certificate) *</label>
                  <input type="text" name="hospitalName" value={formData.hospitalName} onChange={handleInputChange} placeholder="Enter full hospital name" />
                  {errors.hospitalName && <span className="error-msg">{errors.hospitalName}</span>}
                </div>
                <div className="form-group">
                  <label>Hospital Type *</label>
                  <select name="hospitalType" value={formData.hospitalType} onChange={handleInputChange}>
                    <option value="">Select Type</option>
                    <option value="Multi-Speciality">Multi-Speciality</option>
                    <option value="Super-Speciality">Super-Speciality</option>
                    <option value="Nursing Home">Nursing Home</option>
                    <option value="Clinic">Clinic</option>
                    <option value="Trust">Trust</option>
                    <option value="Government">Government</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Registration Number *</label>
                  <input type="text" name="regNumber" value={formData.regNumber} onChange={handleInputChange} placeholder="Govt/State License No." />
                </div>
                <div className="form-group">
                  <label>Year of Establishment *</label>
                  <input type="number" name="yearOfEstablishment" value={formData.yearOfEstablishment} onChange={handleInputChange} placeholder="YYYY" />
                </div>
                <div className="form-group">
                  <label>Total Bed Capacity *</label>
                  <input type="number" name="bedCapacity" value={formData.bedCapacity} onChange={handleInputChange} placeholder="Ex: 100" />
                </div>
                <div className="form-group full-width">
                  <label>Hospital Address *</label>
                  <textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="Full address with landmark" rows="3"></textarea>
                </div>
                <div className="form-group">
                  <label>City *</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="e.g. Rajkot" />
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <select name="state" value={formData.state} onChange={handleInputChange}>
                    <option value="">Select State</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Karnataka">Karnataka</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Pincode *</label>
                  <input type="text" name="pincode" maxLength="6" value={formData.pincode} onChange={handleInputChange} placeholder="6-digit" />
                </div>
                <div className="form-group">
                  <label>Hospital Website</label>
                  <input type="url" name="website" value={formData.website} onChange={handleInputChange} placeholder="https://..." />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-step-content">
              <div className="form-grid">
                <div className="form-group">
                  <label>HR/Admin Full Name *</label>
                  <input type="text" name="adminName" value={formData.adminName} onChange={handleInputChange} placeholder="Authorized person" />
                </div>
                <div className="form-group">
                  <label>Designation *</label>
                  <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} placeholder="e.g. HR Manager" />
                </div>
                <div className="form-group">
                  <label>Mobile Number (OTP Verification) *</label>
                  <input type="tel" name="mobile" maxLength="10" value={formData.mobile} onChange={handleInputChange} placeholder="10-digit number" />
                </div>
                <div className="form-group">
                  <label>Email ID (OTP Verification) *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Official email" />
                </div>
                <div className="form-group">
                  <label>WhatsApp Number</label>
                  <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} placeholder="Optional" />
                </div>
                <div className="form-group full-width">
                  <label>Upload HR ID Card / Auth Letter *</label>
                  <div className="file-upload-box">
                    <Upload className="mx-auto mb-2 text-gray-400" />
                    <p>Click to upload or drag and drop</p>
                    <span className="text-xs text-gray-500">PDF, JPG, PNG (Max 5MB)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step-content text-center">
              <h3 className="mb-4 font-bold text-lg">Mandatory Live Selfie Verification 📸</h3>
              <div className="camera-preview mx-auto" style={{ maxWidth: '400px' }}>
                <Camera size={48} className="opacity-20" />
                <span className="absolute">Camera View Placeholder</span>
              </div>
              <button type="button" className="bg-blue-600 text-white px-6 py-2 rounded-full mb-6 font-semibold">Capture Live Selfie</button>
              
              <div className="form-group text-left mt-8">
                <label>Upload Hospital Logo</label>
                <div className="file-upload-box">
                  <Upload className="mx-auto mb-2 text-gray-400" />
                  <p>Upload Logo (Optional)</p>
                  <span className="text-xs text-gray-500">Max 2MB</span>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="form-step-content">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Type of Doctors Needed *</label>
                  <div className="checkbox-group mt-2">
                    {['MS Obs & Gynae', 'MD Medicine', 'DM Cardiology', 'MCh Neuro', 'MD Anesthesia', 'MD Radiology', 'MS Ortho'].map(doc => (
                      <label key={doc} className="checkbox-item">
                        <input type="checkbox" name="neededDoctors" value={doc} onChange={handleInputChange} />
                        {doc}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>Job Type *</label>
                  <div className="checkbox-group mt-2">
                    {['Full-Time', 'Part-Time', 'Visiting', 'Locum', 'DNB Faculty'].map(job => (
                      <label key={job} className="checkbox-item">
                        <input type="checkbox" name="jobTypes" value={job} onChange={handleInputChange} />
                        {job}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Preferred Experience Range *</label>
                  <select name="expRange" value={formData.expRange} onChange={handleInputChange}>
                    <option value="">Select Range</option>
                    <option value="Fresher 0-3 Yr">Fresher 0-3 Yr</option>
                    <option value="3-8 Yr">3-8 Yr</option>
                    <option value="8-15 Yr">8-15 Yr</option>
                    <option value="15+ Yr">15+ Yr</option>
                    <option value="Any">Any</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Salary Range Offering *</label>
                  <select name="salaryRange" value={formData.salaryRange} onChange={handleInputChange}>
                    <option value="">Select Range</option>
                    <option value="2-5 Lakh">2-5 Lakh</option>
                    <option value="5-10 Lakh">5-10 Lakh</option>
                    <option value="10-15 Lakh">10-15 Lakh</option>
                    <option value="15+ Lakh">15+ Lakh</option>
                    <option value="Revenue Sharing">Revenue Sharing</option>
                    <option value="Negotiable">Negotiable</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Joining Urgency *</label>
                  <select name="urgency" value={formData.urgency} onChange={handleInputChange}>
                    <option value="">Select Urgency</option>
                    <option value="Immediate">Immediate</option>
                    <option value="Within 15 Days">Within 15 Days</option>
                    <option value="Within 30 Days">Within 30 Days</option>
                    <option value="Within 60 Days">Within 60 Days</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Facility Highlights (OT, ICU, NICU, etc.)</label>
                  <textarea name="facilityHighlights" value={formData.facilityHighlights} onChange={handleInputChange} placeholder="Describe features to attract doctors" rows="3"></textarea>
                </div>
                <div className="form-group full-width">
                  <label>Upload Hospital Photos (Max 5)</label>
                  <div className="file-upload-box">
                    <Upload className="mx-auto mb-2 text-gray-400" />
                    <p>Click to upload hospital images</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="form-step-content">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>GST Number (Optional)</label>
                  <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleInputChange} placeholder="For invoicing if paid plan" />
                </div>
                <div className="form-group full-width">
                  <label>Plan Selection *</label>
                  <div className="plan-cards mt-2">
                    {['Free Listing', 'Premium 999/Month', 'Enterprise'].map(p => (
                      <div key={p} className={`plan-card ${formData.plan === p ? 'active' : ''}`} onClick={() => setFormData(prev => ({ ...prev, plan: p }))}>
                        <div className="font-bold">{p}</div>
                        <div className="text-xs text-gray-500">{p === 'Free Listing' ? 'Basic visibility' : 'Priority matching'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="terms-section mt-8">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="mt-1" 
                    checked={agreedToTerms} 
                    onChange={(e) => setAgreedToTerms(e.target.checked)} 
                  />
                  <span className="text-sm text-gray-700 leading-relaxed">
                    <strong>Terms Agreement:</strong> I confirm I am authorized to hire for this hospital. All details provided are true to the best of my knowledge. HRM Consultancy is authorized to verify these documents.
                  </span>
                </label>
              </div>
            </div>
          )}
        </form>

        <div className="reg-form-footer">
          {step > 1 && (
            <button type="button" className="btn-prev" onClick={prevStep}>
              <div className="flex items-center gap-2"><ChevronLeft size={18} /> Previous</div>
            </button>
          )}
          
          {step < 5 ? (
            <button type="button" className="btn-next" onClick={nextStep}>
              <div className="flex items-center gap-2">Next <ChevronRight size={18} /></div>
            </button>
          ) : (
            <button 
              type="submit" 
              className="btn-submit" 
              onClick={handleSubmit}
              disabled={!agreedToTerms}
            >
              <div className="flex items-center gap-2">Register Hospital & Start Hiring <Send size={18} /></div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HospitalRegistration;
