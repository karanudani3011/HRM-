import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Camera, ShieldCheck, CheckCircle2, Video } from 'lucide-react';
import './DevershRegistration.css';

const DevershRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '', mobile: '', caste: '', dob: '', timeOfBirth: '', placeOfBirth: '',
    height: '', weight: '', address: '', education: '', hospitalName: '', income: '', jobTitle: '',
    fatherDetails: '', motherDetails: '', brotherDetails: '', sisterDetails: '',
    astrologerMatch: 'Yes', partnerExpectations: ''
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [certFile, setCertFile] = useState(null);

  useEffect(() => {
    if (localStorage.getItem('hasDevershProfile')) {
      navigate('/deversh-live');
    }
  }, [navigate]);

  const [habits, setHabits] = useState([]);
  const habitOptions = ['Non-Smoker', 'Non-Drinker', 'Vegetarian', 'Occasionally Non-Veg', 'Fitness Enthusiast'];

  const toggleHabit = (habit) => {
    setHabits(prev => prev.includes(habit) ? prev.filter(h => h !== habit) : [...prev, habit]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, habits };
      const response = await fetch('http://localhost:5000/api/matrimony/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        alert('Profile submitted successfully!');
        localStorage.setItem('hasDevershProfile', 'true');
        navigate('/deversh-live');
      } else {
        alert('Error submitting profile');
      }
    } catch (error) {
      console.error(error);
      alert('Network error');
    }
  };

  const dummyLiveDoctors = [
    { name: 'Dr Priya Sharma - 28', spec: 'Cardiologist • Ahmedabad' },
    { name: 'Dr Neha Patel - 27', spec: 'Dermatologist • Rajkot' },
    { name: 'Dr Ayesha Khan - 28', spec: 'Gynecologist • Jamnagar' },
    { name: 'Dr Riya Mehta - 26', spec: 'Pediatrician • Surat' },
    { name: 'Dr Sneha Desai - 30', spec: 'Physician • Vadodara' }
  ];

  return (
    <div className="deversh-reg-page">
      <div className="deversh-header-bar">
        <div className="logo-section">
          <ShieldCheck size={24} color="#3b82f6" />
          <span className="brand-name">Doctor Matrimonial</span>
        </div>
        <div className="header-actions">
          <span className="live-count"><span className="dot"></span> 50 Doctors Online Now</span>
          <button className="btn-verified"><ShieldCheck size={16} /> Verified</button>
        </div>
      </div>

      <div className="deversh-content-wrapper">
        
        {/* Left Side: Form */}
        <div className="deversh-left-col">
          <div className="form-header">
            <div>
              <h1>Doctor Registration</h1>
              <p>Create your premium matrimony profile... Only for MBBS & above</p>
            </div>
            <span className="powered-by">POWERED BY HRM</span>
          </div>

          <form onSubmit={handleSubmit} className="deversh-form">
            
            <div className="form-section-title"><Camera size={16}/> PHOTO UPLOAD</div>
            <div className="upload-row">
              <label className="upload-box" style={{ cursor: 'pointer' }}>
                <input type="file" hidden accept="image/jpeg, image/png" onChange={e => setPhotoFile(e.target.files[0])} />
                <Upload size={24} color="#94a3b8" />
                <span>{photoFile ? photoFile.name : 'Upload Profile Photo'}</span>
                <small>JPG/PNG, max 5MB, clear visible</small>
              </label>
              <div className="verified-badge-box">
                <ShieldCheck size={28} color="#3b82f6" />
                <div>
                  <strong>Verified badge in 4 hours</strong>
                  <p>Our team checks doctor ID</p>
                </div>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>FULL NAME (AS PER CERTIFICATE)</label>
                <input type="text" placeholder="e.g. Dr. Priya Sharma" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
              </div>
              <div className="form-group">
                <label>MOBILE NUMBER</label>
                <input type="tel" placeholder="+91 90000 00000" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
              </div>
              
              <div className="form-group">
                <label>CASTE / COMMUNITY</label>
                <input type="text" placeholder="e.g. Patel, Brahmin" value={formData.caste} onChange={e => setFormData({...formData, caste: e.target.value})} />
              </div>
              <div className="form-group dob-group">
                <div className="sub-group">
                  <label>DOB</label>
                  <input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                </div>
                <div className="sub-group">
                  <label>TIME OF BIRTH</label>
                  <input type="time" value={formData.timeOfBirth} onChange={e => setFormData({...formData, timeOfBirth: e.target.value})} />
                </div>
                <div className="sub-group">
                  <label>PLACE OF BIRTH</label>
                  <input type="text" placeholder="Rajkot" value={formData.placeOfBirth} onChange={e => setFormData({...formData, placeOfBirth: e.target.value})} />
                </div>
              </div>

              <div className="form-group">
                <label>HEIGHT</label>
                <input type="text" placeholder="5'5&quot; / 165 cm" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} />
              </div>
              <div className="form-group">
                <label>WEIGHT</label>
                <input type="text" placeholder="55 kg" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
              </div>
            </div>

            <div className="form-group full-width mt-15">
              <label>ADDRESS (CURRENT + PERMANENT)</label>
              <input type="text" placeholder="Full address with pincode" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>

            <div className="form-grid-2 mt-15">
              <div className="form-group">
                <label>EDUCATION</label>
                <input type="text" placeholder="e.g. MBBS, MD Cardio" value={formData.education} onChange={e => setFormData({...formData, education: e.target.value})} />
              </div>
              <div className="form-group">
                <label>HOSPITAL / CLINIC NAME</label>
                <input type="text" placeholder="e.g. Apollo Hospital" value={formData.hospitalName} onChange={e => setFormData({...formData, hospitalName: e.target.value})} />
              </div>
              
              <div className="form-group">
                <label>INCOME (ANNUAL)</label>
                <input type="text" placeholder="₹ 18 LPA" value={formData.income} onChange={e => setFormData({...formData, income: e.target.value})} />
              </div>
              <div className="form-group">
                <label>JOB / BUSINESS</label>
                <input type="text" placeholder="Consultant Cardiologist - Full time" value={formData.jobTitle} onChange={e => setFormData({...formData, jobTitle: e.target.value})} />
              </div>
            </div>

            <div className="form-section-title mt-20"><ShieldCheck size={16}/> CERTIFICATE UPLOAD (DOCTOR ID / DEGREE)</div>
            <label className="certificate-upload-box" style={{ cursor: 'pointer', display: 'flex' }}>
              <input type="file" hidden accept=".pdf, image/jpeg, image/png" onChange={e => setCertFile(e.target.files[0])} />
              <Upload size={18} color="#64748b" />
              <span style={{ flex: 1, textAlign: 'left', marginLeft: '10px' }}>{certFile ? certFile.name : 'Upload PDF/JPG'}</span>
              <span className="btn-browse" style={{ pointerEvents: 'none' }}>Browse</span>
            </label>

            <div className="form-section-title mt-20"><CheckCircle2 size={16}/> FAMILY DETAILS</div>
            <div className="form-grid-2">
              <div className="form-group">
                <label>FATHER NAME & OCCUPATION</label>
                <input type="text" placeholder="Ramesh Sharma - Business" value={formData.fatherDetails} onChange={e => setFormData({...formData, fatherDetails: e.target.value})} />
              </div>
              <div className="form-group">
                <label>MOTHER NAME & OCCUPATION</label>
                <input type="text" placeholder="Sudha Sharma - Homemaker" value={formData.motherDetails} onChange={e => setFormData({...formData, motherDetails: e.target.value})} />
              </div>
              <div className="form-group">
                <label>BROTHER DETAILS</label>
                <input type="text" placeholder="1 elder - Dr. in USA" value={formData.brotherDetails} onChange={e => setFormData({...formData, brotherDetails: e.target.value})} />
              </div>
              <div className="form-group">
                <label>SISTER DETAILS</label>
                <input type="text" placeholder="1 younger - Engineer" value={formData.sisterDetails} onChange={e => setFormData({...formData, sisterDetails: e.target.value})} />
              </div>
            </div>

            <div className="form-group full-width mt-15">
              <label>Astrologer Match Required?</label>
              <div className="toggle-buttons">
                <button type="button" className={formData.astrologerMatch === 'Yes' ? 'active' : ''} onClick={() => setFormData({...formData, astrologerMatch: 'Yes'})}>Yes</button>
                <button type="button" className={formData.astrologerMatch === 'No' ? 'active' : ''} onClick={() => setFormData({...formData, astrologerMatch: 'No'})}>No</button>
              </div>
            </div>

            <div className="form-group full-width mt-15">
              <label>Habits</label>
              <div className="habits-list">
                {habitOptions.map(h => (
                  <button type="button" key={h} className={`habit-chip ${habits.includes(h) ? 'active' : ''}`} onClick={() => toggleHabit(h)}>
                    {h}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group full-width mt-15">
              <label>PARTNER EXPECTATIONS</label>
              <textarea placeholder="Looking for doctor partner, age 28-32, Gujarati, family oriented..." rows="3" value={formData.partnerExpectations} onChange={e => setFormData({...formData, partnerExpectations: e.target.value})}></textarea>
            </div>

            <button type="submit" className="btn-submit-profile">Submit Profile - Powered by HRM</button>
            <p className="privacy-text">By submitting you agree to verification & privacy policy of MyHRM.co.in</p>
          </form>
        </div>

        {/* Right Side: Info & Live List */}
        <div className="deversh-right-col">
          
          <div className="why-choose-card">
            <h5>WHY DOCTORS CHOOSE US</h5>
            <h2>Only Doctors.<br/>No spam. Premium matches.</h2>
            <ul className="benefits-list">
              <li><CheckCircle2 size={14}/> 100% MBBS+ verified profiles</li>
              <li><CheckCircle2 size={14}/> Free 2-min video introduction</li>
              <li><CheckCircle2 size={14}/> Family background checked</li>
              <li><CheckCircle2 size={14}/> Hospital & city filters</li>
              <li><CheckCircle2 size={14}/> Paid chat = serious intent only</li>
            </ul>
            <div className="promo-banner">
              <img src="https://images.unsplash.com/photo-1594824436998-d40cead1bf0b?auto=format&fit=crop&w=50&h=50" alt="Doctor" />
              <div>
                <strong>Dr Priya is online now</strong>
                <p>Tap Video Call to connect instantly - FREE</p>
              </div>
              <button className="btn-view">View</button>
            </div>
          </div>

          <div className="live-now-card">
            <h4>LIVE NOW</h4>
            <div className="live-list">
              {dummyLiveDoctors.map((doc, idx) => (
                <div key={idx} className="live-item">
                  <div className="live-item-avatar">
                    <img src={`https://i.pravatar.cc/150?img=${30 + idx}`} alt={doc.name} />
                  </div>
                  <div className="live-item-info">
                    <strong>{doc.name}</strong>
                    <span>{doc.spec}</span>
                  </div>
                  <div className="live-badge-small">ONLINE</div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default DevershRegistration;
