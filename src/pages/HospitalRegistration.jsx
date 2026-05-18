import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, ChevronLeft, Camera, Upload, Send, ShieldCheck, Loader2, X } from 'lucide-react';
import { uploadImageToCloudinary } from '../utils/cloudinary';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import emailjs from '@emailjs/browser';
import './HospitalRegistration.css';

const HospitalRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState({});
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

  const [uploading, setUploading] = useState({});

  // OTP Verification States
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [generatedEmailOtp, setGeneratedEmailOtp] = useState(null);
  const [userEmailOtp, setUserEmailOtp] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [sendingEmailOtp, setSendingEmailOtp] = useState(false);

  const authLetterRef = useRef(null);
  const logoRef = useRef(null);
  const photosRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    if (cameraActive && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [cameraActive, stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(mediaStream);
      setCameraActive(true);
    } catch (err) { alert("Camera access denied: " + err.message); }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraActive(false);
    }
  };

  const captureSelfie = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      const file = new File([blob], "hospital_selfie.jpg", { type: "image/jpeg" });
      setUploading(prev => ({ ...prev, selfie: true }));
      try {
        const url = await uploadImageToCloudinary(file);
        setFormData(prev => ({ ...prev, selfie: url }));
        stopCamera();
      } catch (error) { alert("Selfie upload failed: " + error.message); } finally {
        setUploading(prev => ({ ...prev, selfie: false }));
      }
    }, 'image/jpeg');
  };

  const handleFileUpload = async (e, field) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setUploading(prev => ({ ...prev, [field]: true }));
    try {
      if (field === 'hospitalPhotos') {
        const uploadPromises = files.slice(0, 5).map(file => uploadImageToCloudinary(file));
        const urls = await Promise.all(uploadPromises);
        setFormData(prev => ({ ...prev, hospitalPhotos: [...prev.hospitalPhotos, ...urls].slice(0, 5) }));
      } else {
        const url = await uploadImageToCloudinary(files[0]);
        setFormData(prev => ({ ...prev, [field]: url }));
      }
    } catch (error) { alert(`Upload failed: ` + error.message); } finally {
      setUploading(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      if (name === 'neededDoctors' || name === 'jobTypes') {
        const updatedList = checked 
          ? [...formData[name], value] 
          : formData[name].filter(item => item !== value);
        setFormData(prev => ({ ...prev, [name]: updatedList }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSendEmailOtp = async () => {
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      alert("Please enter a valid email address first.");
      return;
    }

    setSendingEmailOtp(true);
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedEmailOtp(newOtp);

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
      alert("Failed to send OTP. Check your .env configuration.");
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

  const validateStep = (currentStep) => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!formData.hospitalName) newErrors.hospitalName = 'Required';
      if (!formData.hospitalType) newErrors.hospitalType = 'Required';
      if (!formData.regNumber) newErrors.regNumber = 'Required';
      if (!formData.city) newErrors.city = 'Required';
      if (!formData.pincode) newErrors.pincode = 'Required';
    } else if (currentStep === 2) {
      if (!formData.adminName) newErrors.adminName = 'Required';
      if (!formData.mobile) newErrors.mobile = 'Required';
      if (!formData.email) newErrors.email = 'Required';
      
      if (!isEmailVerified) {
        alert('Please verify your email address via OTP first.');
        return false;
      }
      if (!formData.authLetter) { alert('Please upload Authorization Letter'); return false; }
    } else if (currentStep === 3) {
      if (!formData.selfie) { alert('Please capture a live selfie'); return false; }
    } else if (currentStep === 4) {
      if (formData.neededDoctors.length === 0) { alert('Please select doctors needed'); return false; }
      if (!formData.urgency) newErrors.urgency = 'Required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => { if (validateStep(step)) { setStep(prev => prev + 1); setErrors({}); } };
  const prevStep = () => { setStep(prev => prev - 1); setErrors({}); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (agreedToTerms) {
      try {
        await addDoc(collection(db, 'serviceForms'), {
          ...formData,
          formType: 'Hospital Registration',
          createdAt: serverTimestamp(),
        });
        alert('Hospital Registration Submitted!');
        navigate('/');
      } catch (err) { alert('Submission failed: ' + err.message); }
    }
  };

  return (
    <div className="doctor-reg-page">
      <div className="doctor-reg-container">
        <div className="reg-header">
          <p className="text-sm font-medium mb-2">Join India's most trusted healthcare network</p>
          <h1>Hospital Registration</h1>
        </div>
        
        <div className="reg-progress">
          {[1, 2, 3, 4, 5].map(num => (
            <div key={num} className={`progress-step ${step >= num ? 'active' : ''}`}>
              <div className="step-number">{step > num ? <CheckCircle2 size={16} /> : num}</div>
              <span className="step-label">{['Basic', 'Admin', 'Verify', 'Hiring', 'Submit'][num-1]}</span>
            </div>
          ))}
        </div>

        <form className="reg-form-body" onSubmit={handleSubmit}>
          {step === 1 ? (
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Hospital Name (As per Registration Certificate) *</label>
                <input type="text" name="hospitalName" className={errors.hospitalName ? 'error' : ''} value={formData.hospitalName} onChange={handleInputChange} placeholder="Enter full hospital name" />
                {errors.hospitalName && <span className="error-msg">{errors.hospitalName}</span>}
              </div>
              <div className="form-group">
                <label>Hospital Type *</label>
                <select name="hospitalType" className={errors.hospitalType ? 'error' : ''} value={formData.hospitalType} onChange={handleInputChange}>
                  <option value="">Select Type</option>
                  <option value="Multi-Speciality">Multi-Speciality</option>
                  <option value="Super-Speciality">Super-Speciality</option>
                  <option value="Clinic">Clinic</option>
                </select>
                {errors.hospitalType && <span className="error-msg">{errors.hospitalType}</span>}
              </div>
              <div className="form-group">
                <label>Registration Number *</label>
                <input type="text" name="regNumber" className={errors.regNumber ? 'error' : ''} value={formData.regNumber} onChange={handleInputChange} placeholder="License No." />
                {errors.regNumber && <span className="error-msg">{errors.regNumber}</span>}
              </div>
              <div className="form-group">
                <label>Year of Establishment *</label>
                <input type="number" name="yearOfEstablishment" value={formData.yearOfEstablishment} onChange={handleInputChange} placeholder="YYYY" />
              </div>
              <div className="form-group">
                <label>Bed Capacity *</label>
                <input type="number" name="bedCapacity" value={formData.bedCapacity} onChange={handleInputChange} placeholder="Total beds" />
              </div>
              <div className="form-group">
                <label>City *</label>
                <input type="text" name="city" className={errors.city ? 'error' : ''} value={formData.city} onChange={handleInputChange} />
                {errors.city && <span className="error-msg">{errors.city}</span>}
              </div>
              <div className="form-group">
                <label>State *</label>
                <input type="text" name="state" value={formData.state} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Pincode *</label>
                <input type="text" name="pincode" className={errors.pincode ? 'error' : ''} maxLength="6" value={formData.pincode} onChange={handleInputChange} />
                {errors.pincode && <span className="error-msg">{errors.pincode}</span>}
              </div>
              <div className="form-group">
                <label>Hospital Website</label>
                <input type="url" name="website" value={formData.website} onChange={handleInputChange} placeholder="https://..." />
              </div>
              <div className="form-group full-width">
                <label>Hospital Address *</label>
                <textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="Full address" rows="3"></textarea>
              </div>
            </div>
          ) : step === 2 ? (
            <div className="form-grid">
              <div className="form-group"><label>HR/Admin Name *</label><input type="text" name="adminName" className={errors.adminName ? 'error' : ''} value={formData.adminName} onChange={handleInputChange} />{errors.adminName && <span className="error-msg">{errors.adminName}</span>}</div>
              <div className="form-group"><label>Designation *</label><input type="text" name="designation" value={formData.designation} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Mobile Number *</label><input type="tel" name="mobile" maxLength="10" className={errors.mobile ? 'error' : ''} value={formData.mobile} onChange={handleInputChange} />{errors.mobile && <span className="error-msg">{errors.mobile}</span>}</div>
              <div className="form-group"><label>WhatsApp Number</label><input type="tel" name="whatsapp" maxLength="10" value={formData.whatsapp} onChange={handleInputChange} /></div>
              <div className="form-group">
                <label>Email ID *</label>
                <div className="input-with-action">
                  <input 
                    type="email" 
                    name="email"
                    className={errors.email ? 'error' : ''} 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    disabled={isEmailVerified}
                  />
                  {!isEmailVerified ? (
                    <button 
                      type="button" 
                      className="verify-btn" 
                      onClick={handleSendEmailOtp}
                      disabled={sendingEmailOtp}
                    >
                      {sendingEmailOtp ? '...' : 'Verify OTP'}
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
              <div className="form-group full-width">
                <label>Upload HR ID Card / Auth Letter *</label>
                <input type="file" ref={authLetterRef} onChange={(e) => handleFileUpload(e, 'authLetter')} className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                <div className={`file-upload-box ${formData.authLetter ? 'success' : ''}`} onClick={() => authLetterRef.current.click()}>
                  {uploading.authLetter ? <Loader2 className="animate-spin" /> : formData.authLetter ? "Uploaded ✓" : "Click to upload Auth Letter"}
                </div>
              </div>
            </div>
          ) : step === 3 ? (
            <div className="verification-step">
              <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#1e293b' }}>Live Selfie Verification 📸</h3>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <div className={`camera-preview-box ${formData.selfie ? 'has-image' : ''}`}>
                  {!formData.selfie && !cameraActive && <Camera size={48} color="#94a3b8" />}
                  {cameraActive && <video ref={videoRef} autoPlay playsInline className="video-element mirror" />}
                  {formData.selfie && !cameraActive && <img src={formData.selfie} alt="Selfie" className="preview-image" />}
                </div>
                
                <div className="camera-controls">
                  {!cameraActive && !formData.selfie && (
                    <button type="button" onClick={startCamera} className="btn-camera start">
                      Start Camera
                    </button>
                  )}
                  
                  {cameraActive && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="button" onClick={captureSelfie} className="btn-camera capture" disabled={uploading.selfie}>
                        {uploading.selfie ? <Loader2 className="animate-spin" /> : 'Capture Photo'}
                      </button>
                      <button type="button" onClick={stopCamera} className="btn-camera cancel">
                        Cancel
                      </button>
                    </div>
                  )}
                  
                  {formData.selfie && !cameraActive && (
                    <button type="button" onClick={() => { setFormData(prev => ({...prev, selfie: null})); startCamera(); }} className="btn-camera retake">
                      Retake Selfie
                    </button>
                  )}
                </div>

                <div className="mt-8 w-full">
                  <label className="block mb-2 font-medium">Upload Hospital Logo</label>
                  <input type="file" ref={logoRef} onChange={(e) => handleFileUpload(e, 'logo')} className="hidden" accept="image/*" />
                  <div className={`file-upload-box ${formData.logo ? 'success' : ''}`} onClick={() => logoRef.current.click()}>
                    {uploading.logo ? <Loader2 className="animate-spin" /> : formData.logo ? "Logo Uploaded ✓" : "Click to upload Logo"}
                  </div>
                </div>
              </div>
            </div>
          ) : step === 4 ? (
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Doctors Needed *</label>
                <div className="checkbox-group mt-2">
                  {['MS Obs & Gynae', 'MD Medicine', 'MD Anesthesia', 'MS Ortho', 'Pediatrics', 'Radiology', 'Pathology'].map(doc => (
                    <label key={doc} className="checkbox-item">
                      <input type="checkbox" name="neededDoctors" value={doc} checked={formData.neededDoctors.includes(doc)} onChange={handleInputChange} />
                      {doc}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group full-width">
                <label>Job Types *</label>
                <div className="checkbox-group mt-2">
                  {['Full-Time', 'Part-Time', 'Visiting', 'Locum'].map(type => (
                    <label key={type} className="checkbox-item">
                      <input type="checkbox" name="jobTypes" value={type} checked={formData.jobTypes.includes(type)} onChange={handleInputChange} />
                      {type}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group"><label>Experience Range *</label><select name="expRange" value={formData.expRange} onChange={handleInputChange}><option value="">Select Range</option><option value="Fresher">Fresher</option><option value="0-3 Yr">0-3 Yr</option><option value="3-8 Yr">3-8 Yr</option><option value="8+ Yr">8+ Yr</option></select></div>
              <div className="form-group"><label>Salary Range</label><input type="text" name="salaryRange" value={formData.salaryRange} onChange={handleInputChange} placeholder="Ex: 50k - 80k" /></div>
              <div className="form-group"><label>Joining Urgency *</label><select name="urgency" className={errors.urgency ? 'error' : ''} value={formData.urgency} onChange={handleInputChange}><option value="">Select Urgency</option><option value="Immediate">Immediate</option><option value="Within 15 Days">Within 15 Days</option><option value="1 Month">1 Month</option></select>{errors.urgency && <span className="error-msg">{errors.urgency}</span>}</div>
              <div className="form-group full-width"><label>Facility Highlights</label><textarea name="facilityHighlights" value={formData.facilityHighlights} onChange={handleInputChange} placeholder="OT, ICU, NICU, etc." rows="3"></textarea></div>
              <div className="form-group full-width">
                <label>Hospital Photos (Optional)</label>
                <input type="file" multiple ref={photosRef} onChange={(e) => handleFileUpload(e, 'hospitalPhotos')} className="hidden" accept="image/*" />
                <div className="file-upload-box" onClick={() => photosRef.current.click()}>
                  {uploading.hospitalPhotos ? <Loader2 className="animate-spin" /> : formData.hospitalPhotos.length > 0 ? `${formData.hospitalPhotos.length} Photos Uploaded ✓` : "Upload Hospital Photos"}
                </div>
              </div>
            </div>
          ) : (
            <div className="form-grid">
              <div className="form-group full-width">
                <label>GST Number (Optional)</label>
                <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleInputChange} placeholder="GSTIN" />
              </div>
              <div className="form-group full-width">
                <label>Selection Plan</label>
                <select name="plan" value={formData.plan} onChange={handleInputChange}>
                  {['Free', 'Premium', 'Enterprise'].map(p => (
                    <option key={p} value={p}>{p} Plan</option>
                  ))}
                </select>
              </div>
              <div className="terms-section full-width mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="mt-1" />
                  <span className="text-sm font-medium">I authorize HRM Consultancy to verify my hospital details. All provided information is correct.</span>
                </label>
              </div>
            </div>
          )}
        </form>

        <div className="reg-form-footer">
          {step > 1 && <button type="button" className="btn-prev" onClick={prevStep}>Back</button>}
          {step < 5 ? (
            <button type="button" className="btn-next ml-auto" onClick={nextStep}>Next <ChevronRight size={18} /></button>
          ) : (
            <button type="submit" className="btn-submit ml-auto" onClick={handleSubmit} disabled={!agreedToTerms}>Register Hospital <Send size={18} /></button>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default HospitalRegistration;
