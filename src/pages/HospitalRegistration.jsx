import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, ChevronLeft, Camera, Upload, Send, ShieldCheck, Loader2, X } from 'lucide-react';
import { uploadImageToCloudinary } from '../utils/cloudinary';
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
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraActive(true);
    } catch (err) {
      alert("Camera access denied or not available: " + err.message);
    }
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
      } catch (error) {
        alert("Selfie upload failed: " + error.message);
      } finally {
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
        setFormData(prev => ({ 
          ...prev, 
          hospitalPhotos: [...prev.hospitalPhotos, url].slice(0, 5) 
        }));
      } else {
        setFormData(prev => ({ ...prev, [field]: url }));
      }
    } catch (error) {
      alert(`Upload failed for ${field}: ` + error.message);
    } finally {
      setUploading(prev => ({ ...prev, [field]: false }));
    }
  };

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      hospitalPhotos: prev.hospitalPhotos.filter((_, i) => i !== index)
    }));
  };

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
                  <input 
                    type="file" 
                    ref={authLetterRef}
                    onChange={(e) => handleFileUpload(e, 'authLetter')}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <div 
                    className={`file-upload-box ${formData.authLetter ? 'success' : ''}`}
                    onClick={() => authLetterRef.current.click()}
                  >
                    {uploading.authLetter ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="animate-spin mb-2 text-blue-500" />
                        <p>Uploading...</p>
                      </div>
                    ) : formData.authLetter ? (
                      <div className="flex flex-col items-center">
                        <CheckCircle2 className="mb-2 text-green-500" />
                        <p className="text-green-600 font-medium">Auth Letter Uploaded!</p>
                        <span className="text-xs text-gray-500">Click to change</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto mb-2 text-gray-400" />
                        <p>Click to upload or drag and drop</p>
                        <span className="text-xs text-gray-500">PDF, JPG, PNG (Max 5MB)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step-content text-center">
              <h3 className="mb-4 font-bold text-lg">Mandatory Live Selfie Verification 📸</h3>
              
              <div className="camera-section mx-auto" style={{ maxWidth: '400px' }}>
                <div className="camera-preview-container relative bg-black rounded-xl overflow-hidden shadow-2xl aspect-video flex items-center justify-center">
                  {!formData.selfie && !cameraActive && (
                    <div className="flex flex-col items-center gap-4">
                      <Camera size={48} className="text-gray-600 animate-pulse" />
                      <button 
                        type="button" 
                        onClick={startCamera}
                        className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Enable Camera
                      </button>
                    </div>
                  )}

                  {cameraActive && (
                    <>
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        className="w-full h-full object-cover mirror"
                      />
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                        <button 
                          type="button" 
                          onClick={captureSelfie}
                          className="bg-white text-blue-600 p-4 rounded-full shadow-lg hover:scale-110 transition-transform"
                          disabled={uploading.selfie}
                        >
                          {uploading.selfie ? <Loader2 className="animate-spin" /> : <Camera size={24} />}
                        </button>
                        <button 
                          type="button" 
                          onClick={stopCamera}
                          className="bg-red-500 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform"
                        >
                          <X size={24} />
                        </button>
                      </div>
                    </>
                  )}

                  {formData.selfie && !cameraActive && (
                    <div className="relative w-full h-full">
                      <img src={formData.selfie} alt="Selfie Preview" className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow">
                        <CheckCircle2 size={20} />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => { setFormData(prev => ({ ...prev, selfie: null })); startCamera(); }}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur text-gray-800 px-4 py-2 rounded-full text-sm font-bold shadow-lg"
                      >
                        Retake Selfie
                      </button>
                    </div>
                  )}
                </div>
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="form-group text-left mt-10">
                <label>Upload Hospital Logo</label>
                <input 
                  type="file" 
                  ref={logoRef}
                  onChange={(e) => handleFileUpload(e, 'logo')}
                  className="hidden"
                  accept="image/*"
                />
                <div 
                  className={`file-upload-box ${formData.logo ? 'success' : ''}`}
                  onClick={() => logoRef.current.click()}
                >
                  {uploading.logo ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="animate-spin mb-2 text-blue-500" />
                      <p>Uploading...</p>
                    </div>
                  ) : formData.logo ? (
                    <div className="flex flex-col items-center">
                      <img src={formData.logo} alt="Hospital Logo" className="h-16 w-16 object-contain mb-2" />
                      <p className="text-green-600 font-medium">Logo Uploaded!</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto mb-2 text-gray-400" />
                      <p>Upload Logo (Optional)</p>
                      <span className="text-xs text-gray-500">Max 2MB</span>
                    </>
                  )}
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
                  <input 
                    type="file" 
                    ref={photosRef}
                    onChange={(e) => handleFileUpload(e, 'hospitalPhotos')}
                    className="hidden"
                    accept="image/*"
                    disabled={formData.hospitalPhotos.length >= 5}
                  />
                  <div className="photos-upload-container">
                    <div className="photos-grid mb-4">
                      {formData.hospitalPhotos.map((url, index) => (
                        <div key={index} className="photo-preview-item relative">
                          <img src={url} alt={`Hospital ${index}`} className="w-full h-24 object-cover rounded-lg" />
                          <button 
                            type="button" 
                            onClick={(e) => { e.stopPropagation(); removePhoto(index); }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      {formData.hospitalPhotos.length < 5 && (
                        <div 
                          className={`file-upload-box mini ${uploading.hospitalPhotos ? 'uploading' : ''}`}
                          onClick={() => photosRef.current.click()}
                        >
                          {uploading.hospitalPhotos ? (
                            <Loader2 className="animate-spin text-blue-500" />
                          ) : (
                            <Upload className="text-gray-400" />
                          )}
                        </div>
                      )}
                    </div>
                    {formData.hospitalPhotos.length === 0 && !uploading.hospitalPhotos && (
                      <p className="text-sm text-gray-500 text-center">No photos uploaded yet</p>
                    )}
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
