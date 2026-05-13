import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, ChevronLeft, Camera, Upload, Send, ShieldCheck, Loader2, X } from 'lucide-react';
import { uploadImageToCloudinary } from '../utils/cloudinary';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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

  const authLetterRef = useRef(null);
  const logoRef = useRef(null);
  const photosRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
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
      const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
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
    const file = e.target.files[0];
    if (!file) return;
    setUploading(prev => ({ ...prev, [field]: true }));
    try {
      const url = await uploadImageToCloudinary(file);
      if (field === 'hospitalPhotos') {
        setFormData(prev => ({ ...prev, hospitalPhotos: [...prev.hospitalPhotos, url].slice(0, 5) }));
      } else {
        setFormData(prev => ({ ...prev, [field]: url }));
      }
    } catch (error) { alert(`Upload failed: ` + error.message); } finally {
      setUploading(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && (name === 'neededDoctors' || name === 'jobTypes')) {
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
      if (!formData.city) newErrors.city = 'Required';
    } else if (currentStep === 2) {
      if (!formData.adminName) newErrors.adminName = 'Required';
      if (!formData.mobile) newErrors.mobile = 'Required';
      if (!formData.email) newErrors.email = 'Required';
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
      } catch (err) { alert('Submission failed'); }
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
                <label>City *</label>
                <input type="text" name="city" className={errors.city ? 'error' : ''} value={formData.city} onChange={handleInputChange} />
                {errors.city && <span className="error-msg">{errors.city}</span>}
              </div>
              <div className="form-group">
                <label>Pincode *</label>
                <input type="text" name="pincode" maxLength="6" value={formData.pincode} onChange={handleInputChange} />
              </div>
              <div className="form-group full-width">
                <label>Hospital Address *</label>
                <textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="Full address" rows="3"></textarea>
              </div>
            </div>
          ) : step === 2 ? (
            <div className="form-grid">
              <div className="form-group"><label>Admin Name *</label><input type="text" name="adminName" className={errors.adminName ? 'error' : ''} value={formData.adminName} onChange={handleInputChange} />{errors.adminName && <span className="error-msg">{errors.adminName}</span>}</div>
              <div className="form-group">
                <label>Mobile Number *</label>
                <div className="input-with-action">
                  <input type="tel" name="mobile" maxLength="10" className={errors.mobile ? 'error' : ''} value={formData.mobile} onChange={handleInputChange} />
                  <button type="button" className="verify-btn">Verify OTP</button>
                </div>
                {errors.mobile && <span className="error-msg">{errors.mobile}</span>}
              </div>
              <div className="form-group">
                <label>Email ID *</label>
                <div className="input-with-action">
                  <input type="email" name="email" className={errors.email ? 'error' : ''} value={formData.email} onChange={handleInputChange} />
                  <button type="button" className="verify-btn">Verify OTP</button>
                </div>
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
              <h3 className="text-center mb-6">Live Selfie Verification 📸</h3>
              <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
                <div className="relative w-64 h-48 bg-black rounded-xl overflow-hidden shadow-2xl border-2 border-blue-500">
                  {!formData.selfie && !cameraActive && <div className="w-full h-full flex items-center justify-center text-gray-500"><Camera size={48} /></div>}
                  {cameraActive && <video ref={videoRef} autoPlay playsInline onClick={captureSelfie} className="w-full h-full object-cover mirror cursor-pointer" />}
                  {formData.selfie && !cameraActive && <img src={formData.selfie} className="w-full h-full object-cover" alt="Selfie" />}
                </div>
                <div className="flex flex-col gap-3">
                  {!cameraActive && !formData.selfie && <button type="button" onClick={startCamera} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Start Camera</button>}
                  {cameraActive && (
                    <>
                      <button type="button" onClick={captureSelfie} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2">
                        {uploading.selfie ? <Loader2 className="animate-spin" /> : <><Camera size={20} /> Capture Photo</>}
                      </button>
                      <button type="button" onClick={stopCamera} className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold">Cancel</button>
                    </>
                  )}
                  {formData.selfie && <button type="button" onClick={() => { setFormData(prev => ({...prev, selfie: null})); startCamera(); }} className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold">Retake Selfie</button>}
                </div>
              </div>
            </div>
          ) : step === 4 ? (
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Doctors Needed *</label>
                <div className="checkbox-group mt-2">
                  {['MS Obs & Gynae', 'MD Medicine', 'MD Anesthesia', 'MS Ortho'].map(doc => (
                    <label key={doc} className="checkbox-item">
                      <input type="checkbox" name="neededDoctors" value={doc} checked={formData.neededDoctors.includes(doc)} onChange={handleInputChange} />
                      {doc}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Joining Urgency *</label>
                <select name="urgency" className={errors.urgency ? 'error' : ''} value={formData.urgency} onChange={handleInputChange}>
                  <option value="">Select Urgency</option>
                  <option value="Immediate">Immediate</option>
                  <option value="15 Days">15 Days</option>
                </select>
                {errors.urgency && <span className="error-msg">{errors.urgency}</span>}
              </div>
              <div className="form-group full-width">
                <label>Facility Highlights</label>
                <textarea name="facilityHighlights" value={formData.facilityHighlights} onChange={handleInputChange} placeholder="OT, ICU, NICU, etc." rows="3"></textarea>
              </div>
            </div>
          ) : (
            <div className="terms-section p-4 bg-blue-50 rounded-lg border border-blue-100">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="mt-1" />
                <span className="text-sm font-medium">I authorize HRM Consultancy to verify my hospital details. All provided information is correct.</span>
              </label>
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
