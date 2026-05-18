import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { uploadImageToCloudinary } from '../utils/cloudinary';
import { CheckCircle2, ChevronRight, ChevronLeft, Send, Camera, Loader2, ShieldCheck } from 'lucide-react';
import emailjs from '@emailjs/browser';
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
    selfie: null
  });
  const [uploading, setUploading] = useState({});

  // OTP Verification States
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [generatedEmailOtp, setGeneratedEmailOtp] = useState(null);
  const [userEmailOtp, setUserEmailOtp] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [sendingEmailOtp, setSendingEmailOtp] = useState(false);

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
      const file = new File([blob], "partner_selfie.jpg", { type: "image/jpeg" });
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

  const validate = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.partnerName) newErrors.partnerName = 'Required';
      if (!formData.businessType) newErrors.businessType = 'Required';
      if (!formData.contactPerson) newErrors.contactPerson = 'Required';
      if (!formData.mobile) newErrors.mobile = 'Required';
      if (!formData.email) newErrors.email = 'Required';
      
      if (!isEmailVerified) {
        alert('Please verify your email address via OTP first.');
        return false;
      }
    } else if (step === 2) {
      if (!formData.interestReason) newErrors.interestReason = 'Required';
    } else if (step === 3) {
      if (!formData.selfie) { alert("Please capture a live selfie"); return false; }
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
          selfie: formData.selfie,
          createdAt: serverTimestamp(),
        });
        alert('Registration Successful!');
        navigate('/');
      } catch (err) { alert('Submission failed: ' + err.message); }
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
          {[1, 2, 3].map(num => (
            <div key={num} className={`progress-step ${step >= num ? 'active' : ''}`}>
              <div className="step-number">{step > num ? <CheckCircle2 size={18} /> : num}</div>
              <span className="step-label">{['Business', 'Partnership', 'Verify'][num-1]}</span>
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
                <input type="tel" className={errors.mobile ? 'error' : ''} placeholder="10-digit mobile" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
                {errors.mobile && <span className="error-msg">{errors.mobile}</span>}
              </div>
              <div className="form-group">
                <label>Email ID *</label>
                <div className="input-with-action">
                  <input 
                    type="email" 
                    className={errors.email ? 'error' : ''} 
                    placeholder="Business Email" 
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
            </div>
          ) : step === 2 ? (
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
          ) : (
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
              </div>
            </div>
          )}
        </form>

        <div className="reg-form-footer">
          {step > 1 && <button type="button" className="btn-prev" onClick={prevStep}>Back</button>}
          {step < 3 ? (
            <button type="button" className="btn-next ml-auto" onClick={nextStep}>Next <ChevronRight size={18} /></button>
          ) : (
            <button type="submit" className="btn-submit ml-auto" onClick={handleSubmit} disabled={!agreedToTerms || uploading.selfie}>Apply for Partnership <Send size={18} /></button>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default PartnerRegistration;
