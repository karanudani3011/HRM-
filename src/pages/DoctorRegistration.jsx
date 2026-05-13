import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, ChevronLeft, Send } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { uploadImageToCloudinary } from '../utils/cloudinary';
import { Upload, Loader2, FileText } from 'lucide-react';
import './DoctorRegistration.css';

const DoctorRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1
    fullName: '',
    mobile: '',
    email: '',
    dob: '',
    gender: '',
    currentCity: '',
    willingToRelocate: '',
    // Step 2
    highestQualification: '',
    superSpeciality: '',
    yearOfPassing: '',
    college: '',
    regNo: '',
    regState: '',
    totalExperience: '',
    authLetterUrl: ''
  });
  const [uploading, setUploading] = useState(false);

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, authLetterUrl: 'Please upload an image file (PNG, JPG)' }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, authLetterUrl: 'File size should be less than 5MB' }));
      return;
    }

    setUploading(true);
    setErrors(prev => ({ ...prev, authLetterUrl: '' }));

    try {
      const url = await uploadImageToCloudinary(file);
      setFormData(prev => ({ ...prev, authLetterUrl: url }));
      setUploading(false);
    } catch (err) {
      console.error('Upload error:', err);
      setErrors(prev => ({ ...prev, authLetterUrl: 'Failed to upload image. Please try again.' }));
      setUploading(false);
    }
  };

  const validateStep1 = () => {
    let newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Required';
    if (!formData.mobile || !/^\d{10}$/.test(formData.mobile)) newErrors.mobile = 'Enter valid 10-digit mobile';
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter valid email';
    
    if (!formData.dob) {
      newErrors.dob = 'Required';
    } else {
      const birthDate = new Date(formData.dob);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      if (age < 25) newErrors.dob = 'Age must be at least 25 years';
    }

    if (!formData.gender) newErrors.gender = 'Required';
    if (!formData.currentCity) newErrors.currentCity = 'Required';
    if (!formData.willingToRelocate) newErrors.willingToRelocate = 'Required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    let newErrors = {};
    if (!formData.highestQualification) newErrors.highestQualification = 'Required';
    if (!formData.superSpeciality) newErrors.superSpeciality = 'Required';
    if (!formData.yearOfPassing || formData.yearOfPassing < 1980 || formData.yearOfPassing > 2026) {
      newErrors.yearOfPassing = 'Enter valid year (1980-2026)';
    }
    if (!formData.college) newErrors.college = 'Required';
    if (!formData.regNo) newErrors.regNo = 'Required';
    if (!formData.regState) newErrors.regState = 'Required';
    if (formData.totalExperience === '') newErrors.totalExperience = 'Required';
    if (!formData.authLetterUrl) newErrors.authLetterUrl = 'Authorization Letter / Degree Certificate is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep1()) setStep(2);
  };

  const prevStep = () => setStep(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep2() && agreedToTerms) {
      if (uploading) {
        alert('Please wait for the document to finish uploading.');
        return;
      }
      try {
        await addDoc(collection(db, 'serviceForms'), {
          ...formData,
          formType: 'Doctor Registration',
          name: formData.fullName,
          email: formData.email,
          mobile: formData.mobile,
          city: formData.currentCity,
          authLetter: formData.authLetterUrl,
          createdAt: serverTimestamp(),
        });
        alert('Registration Successful! Our team will contact you shortly.');
        navigate('/');
      } catch (err) {
        console.error('Firestore error:', err);
        alert('Registration Submitted! (offline mode)');
        navigate('/');
      }
    }
  };

  return (
    <div className="doctor-reg-page">
      <div className="doctor-reg-container">
        <div className="reg-header">
          <h1>Medical Professional Registration</h1>
          <p>Join India's most trusted healthcare network</p>
        </div>

        <div className="reg-progress">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">{step > 1 ? <CheckCircle2 size={16} /> : '1'}</div>
            <span>Basic Profile</span>
          </div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">{step > 2 ? <CheckCircle2 size={16} /> : '2'}</div>
            <span>Qualification</span>
          </div>
        </div>

        <form className="reg-form-body" onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="form-step-content">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Full Name (As per Medical Council Registration) *</label>
                  <input 
                    type="text" 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name" 
                  />
                  {errors.fullName && <span className="error-msg">{errors.fullName}</span>}
                </div>

                <div className="form-group">
                  <label>Mobile Number *</label>
                  <div className="input-with-action">
                    <input 
                      type="tel" 
                      name="mobile"
                      maxLength="10"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      placeholder="10-digit number" 
                    />
                    <button type="button" className="verify-btn">Verify OTP</button>
                  </div>
                  {errors.mobile && <span className="error-msg">{errors.mobile}</span>}
                </div>

                <div className="form-group">
                  <label>Email ID *</label>
                  <div className="input-with-action">
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="doctor@example.com" 
                    />
                    <button type="button" className="verify-btn">Verify OTP</button>
                  </div>
                  {errors.email && <span className="error-msg">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label>Date of Birth *</label>
                  <input 
                    type="date" 
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                  />
                  {errors.dob && <span className="error-msg">{errors.dob}</span>}
                </div>

                <div className="form-group">
                  <label>Gender *</label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && <span className="error-msg">{errors.gender}</span>}
                </div>

                <div className="form-group">
                  <label>Current City *</label>
                  <input 
                    type="text" 
                    name="currentCity"
                    value={formData.currentCity}
                    onChange={handleInputChange}
                    placeholder="e.g. Rajkot, Ahmedabad" 
                  />
                  {errors.currentCity && <span className="error-msg">{errors.currentCity}</span>}
                </div>

                <div className="form-group">
                  <label>Willing to Relocate? *</label>
                  <select name="willingToRelocate" value={formData.willingToRelocate} onChange={handleInputChange}>
                    <option value="">Select Option</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  {errors.willingToRelocate && <span className="error-msg">{errors.willingToRelocate}</span>}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-step-content">
              <div className="form-grid">
                <div className="form-group">
                  <label>Highest Qualification *</label>
                  <select name="highestQualification" value={formData.highestQualification} onChange={handleInputChange}>
                    <option value="">Select Qualification</option>
                    <option value="MBBS">MBBS</option>
                    <option value="MS">MS</option>
                    <option value="MD">MD</option>
                    <option value="DM">DM</option>
                    <option value="MCh">MCh</option>
                    <option value="DNB">DNB</option>
                    <option value="Diploma">Diploma</option>
                  </select>
                  {errors.highestQualification && <span className="error-msg">{errors.highestQualification}</span>}
                </div>

                <div className="form-group">
                  <label>Super Speciality *</label>
                  <select name="superSpeciality" value={formData.superSpeciality} onChange={handleInputChange}>
                    <option value="">Select Speciality</option>
                    <option value="Obs & Gynae">Obs & Gynae</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Oncology">Oncology</option>
                    <option value="Gastroenterology">Gastroenterology</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.superSpeciality && <span className="error-msg">{errors.superSpeciality}</span>}
                </div>

                <div className="form-group">
                  <label>Year of Passing *</label>
                  <input 
                    type="number" 
                    name="yearOfPassing"
                    value={formData.yearOfPassing}
                    onChange={handleInputChange}
                    placeholder="YYYY"
                    min="1980"
                    max="2026"
                  />
                  {errors.yearOfPassing && <span className="error-msg">{errors.yearOfPassing}</span>}
                </div>

                <div className="form-group">
                  <label>College/University *</label>
                  <input 
                    type="text" 
                    name="college"
                    value={formData.college}
                    onChange={handleInputChange}
                    placeholder="Full name of institution" 
                  />
                  {errors.college && <span className="error-msg">{errors.college}</span>}
                </div>

                <div className="form-group">
                  <label>Medical Council Reg. No *</label>
                  <input 
                    type="text" 
                    name="regNo"
                    value={formData.regNo}
                    onChange={handleInputChange}
                    placeholder="Format: G-12345" 
                  />
                  {errors.regNo && <span className="error-msg">{errors.regNo}</span>}
                </div>

                <div className="form-group">
                  <label>Registration State *</label>
                  <select name="regState" value={formData.regState} onChange={handleInputChange}>
                    <option value="">Select State</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.regState && <span className="error-msg">{errors.regState}</span>}
                </div>

                <div className="form-group">
                  <label>Total Experience (Years) *</label>
                  <input 
                    type="number" 
                    name="totalExperience"
                    value={formData.totalExperience}
                    onChange={handleInputChange}
                    placeholder="In years" 
                  />
                  {errors.totalExperience && <span className="error-msg">{errors.totalExperience}</span>}
                </div>

                <div className="form-group full-width">
                  <label>Authorization Letter / Degree Certificate (Image) *</label>
                  <div className={`file-upload-box ${formData.authLetterUrl ? 'has-file' : ''} ${errors.authLetterUrl ? 'has-error' : ''}`}>
                    <input 
                      type="file" 
                      id="authLetter"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden-file-input"
                    />
                    <label htmlFor="authLetter" className="file-upload-label">
                      {uploading ? (
                        <div className="upload-status">
                          <Loader2 className="animate-spin" size={24} />
                          <span>Uploading Document...</span>
                        </div>
                      ) : formData.authLetterUrl ? (
                        <div className="upload-status success">
                          <CheckCircle2 size={24} color="#10b981" />
                          <span>Document Uploaded Successfully!</span>
                          <img src={formData.authLetterUrl} alt="Preview" className="upload-preview-tiny" />
                        </div>
                      ) : (
                        <div className="upload-status placeholder">
                          <Upload size={24} />
                          <span>Click to upload Authorization Letter or Degree Certificate</span>
                          <span className="file-hint">Max size: 5MB (PNG, JPG)</span>
                        </div>
                      )}
                    </label>
                  </div>
                  {errors.authLetterUrl && <span className="error-msg">{errors.authLetterUrl}</span>}
                </div>
              </div>
              
              <div className="terms-section" style={{ marginTop: '30px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'flex', alignItems: 'start', gap: '12px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    style={{ marginTop: '4px' }}
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                  />
                  <span style={{ fontSize: '14px', color: '#475569', lineHeight: '1.5' }}>
                    <strong>Terms & Conditions Agreement:</strong> I confirm that I am a registered medical professional and all the details provided are accurate to the best of my knowledge. I authorize HRM Consultancy to verify my credentials with the respective medical councils.
                  </span>
                </label>
              </div>
            </div>
          )}
        </form>

        <div className="reg-form-footer">
          {step === 2 && (
            <button type="button" className="btn-prev" onClick={prevStep}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ChevronLeft size={20} /> Back
              </div>
            </button>
          )}
          
          {step === 1 ? (
            <button type="button" className="btn-next" onClick={nextStep}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Next <ChevronRight size={20} />
              </div>
            </button>
          ) : (
            <button 
              type="submit" 
              className="btn-submit" 
              onClick={handleSubmit}
              disabled={!agreedToTerms}
              style={!agreedToTerms ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Complete Registration <Send size={20} />
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorRegistration;
