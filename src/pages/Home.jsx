import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Briefcase, 
  FileText, 
  Upload, 
  Edit, 
  X, 
  Compass, 
  Search, 
  Award, 
  ShieldCheck,
  CheckCircle,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { uploadImageToCloudinary } from '../utils/cloudinary';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  // Profile states
  const [profile, setProfile] = useState(null);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState('');
  const [searchCredits, setSearchCredits] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    role: 'user',
    location: '',
    bio: '',
    avatarUrl: ''
  });

  // Fetch Profile & Search Credits on mount/user change
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.email) {
        setCheckingProfile(false);
        return;
      }

      try {
        // Fetch profile
        const { data: profileData, error: profileErr } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('email', user.email.toLowerCase())
          .maybeSingle();

        if (profileErr) {
          console.error('Error fetching profile from Supabase:', profileErr);
        }

        if (profileData) {
          setProfile(profileData);
          
          // Pre-fill form data
          setFormData({
            fullName: profileData.full_name || '',
            phone: profileData.phone || '',
            role: profileData.role || 'user',
            location: profileData.location || '',
            bio: profileData.bio || '',
            avatarUrl: profileData.avatar_url || ''
          });

          // Fetch search credits
          const { data: creditsData } = await supabase
            .from('user_search_credits')
            .select('*')
            .eq('email', user.email.toLowerCase())
            .maybeSingle();

          if (creditsData) {
            setSearchCredits(creditsData);
          }
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setCheckingProfile(false);
      }
    };

    fetchProfileData();
  }, [user]);

  // Sync form data if profile is fetched or updated
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || '',
        phone: profile.phone || '',
        role: profile.role || 'user',
        location: profile.location || '',
        bio: profile.bio || '',
        avatarUrl: profile.avatar_url || ''
      });
    }
  }, [profile]);

  // Handle image upload to Cloudinary
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Invalid file format. Please select an image file.');
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('File size too large. Please select an image smaller than 5MB.');
      return;
    }

    setUploadingAvatar(true);
    try {
      const url = await uploadImageToCloudinary(file);
      setFormData(prev => ({ ...prev, avatarUrl: url }));
    } catch (err) {
      console.error('Avatar upload failed:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Submit profile creation
  const handleCreateProfile = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setError('Full Name is required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const newProfile = {
        email: user.email.toLowerCase(),
        full_name: formData.fullName.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        location: formData.location.trim(),
        bio: formData.bio.trim(),
        avatar_url: formData.avatarUrl,
        updated_at: new Date().toISOString()
      };

      const { data, error: insertErr } = await supabase
        .from('user_profiles')
        .insert([newProfile])
        .select()
        .single();

      if (insertErr) throw insertErr;

      setProfile(data);
      setEditMode(false);
      window.dispatchEvent(new Event('profileUpdated'));
      
      // Auto-fetch search credits if not present
      const { data: creditsData } = await supabase
        .from('user_search_credits')
        .select('*')
        .eq('email', user.email.toLowerCase())
        .maybeSingle();

      if (creditsData) {
        setSearchCredits(creditsData);
      }
    } catch (err) {
      console.error('Error creating profile in Supabase:', err);
      setError(err.message || 'Failed to create profile. Ensure the user_profiles table is setup in Supabase.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setError('Full Name is required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const updatedData = {
        full_name: formData.fullName.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        location: formData.location.trim(),
        bio: formData.bio.trim(),
        avatar_url: formData.avatarUrl,
        updated_at: new Date().toISOString()
      };

      const { data, error: updateErr } = await supabase
        .from('user_profiles')
        .update(updatedData)
        .eq('email', user.email.toLowerCase())
        .select()
        .single();

      if (updateErr) throw updateErr;

      setProfile(data);
      setEditMode(false);
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (checkingProfile) {
    return (
      <div className="dashboard-wrapper">
        <div className="full-page-loading">
          <div className="glowing-ring"></div>
          <p style={{ color: 'var(--text-gray)', fontSize: '15px', fontWeight: '500' }}>
            Fetching dashboard data...
          </p>
        </div>
      </div>
    );
  }

  // Render Profile Setup Form (if no profile exists)
  if (!profile) {
    return (
      <div className="dashboard-wrapper">
        <div className="dashboard-container">
          <div className="profile-setup-card">
            <div className="profile-setup-header">
              <h2>Complete Your Profile</h2>
              <p>Set up your HRM account to access premium network services</p>
            </div>

            <div className="avatar-upload-section">
              <div 
                className={`avatar-uploader-circle ${formData.avatarUrl ? 'has-image' : ''}`}
                onClick={triggerFileInput}
              >
                {uploadingAvatar ? (
                  <div className="spinner" style={{ borderTopColor: 'var(--primary-red)' }}></div>
                ) : formData.avatarUrl ? (
                  <>
                    <img src={formData.avatarUrl} alt="Avatar Preview" className="avatar-preview-img" />
                    <div className="avatar-upload-overlay">
                      <Upload size={16} />
                      <span>Change</span>
                    </div>
                  </>
                ) : (
                  <div className="avatar-upload-placeholder">
                    <Upload size={24} style={{ color: 'var(--primary-red)' }} />
                    <span>Upload Image</span>
                  </div>
                )}
              </div>
              <div className="avatar-upload-label">
                Profile Photo (Supported: JPG, PNG)
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarUpload} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />
            </div>

            {error && <div className="profile-error-msg">{error}</div>}

            <form onSubmit={handleCreateProfile} className="profile-form">
              <div className="form-row-two">
                <div className="profile-form-group">
                  <label>Full Name *</label>
                  <input 
                    type="text" 
                    placeholder="Enter your full name" 
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    required
                  />
                </div>
                <div className="profile-form-group">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="e.g. +91 9876543210" 
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-row-two">
                <div className="profile-form-group">
                  <label>Professional Role *</label>
                  <select 
                    value={formData.role} 
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    required
                  >
                    <option value="user">General User / Patient</option>
                    <option value="doctor">Medical Specialist / Doctor</option>
                    <option value="hr">HR Professional / Employer</option>
                    <option value="hospital">Hospital Administrator</option>
                    <option value="partner">HRM Network Partner</option>
                  </select>
                </div>
                <div className="profile-form-group">
                  <label>Location / City</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Mumbai, India" 
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </div>

              <div className="profile-form-group">
                <label>Professional Bio / Summary</label>
                <textarea 
                  placeholder="Describe your credentials, role, or healthcare requirements..."
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                />
              </div>

              <button 
                type="submit" 
                className="profile-submit-btn" 
                disabled={submitting || uploadingAvatar}
              >
                {submitting ? (
                  <>
                    <div className="spinner"></div> Creating Profile...
                  </>
                ) : (
                  'Create User Profile'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Render Dashboard
  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        
        {editMode ? (
          /* EDIT PROFILE VIEW */
          <div className="edit-profile-card-wrapper">
            <div className="edit-profile-header">
              <h3>Edit Profile Details</h3>
              <button className="btn-close-edit" onClick={() => setEditMode(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="avatar-upload-section">
              <div 
                className={`avatar-uploader-circle ${formData.avatarUrl ? 'has-image' : ''}`}
                onClick={triggerFileInput}
              >
                {uploadingAvatar ? (
                  <div className="spinner" style={{ borderTopColor: 'var(--primary-red)' }}></div>
                ) : formData.avatarUrl ? (
                  <>
                    <img src={formData.avatarUrl} alt="Avatar" className="avatar-preview-img" />
                    <div className="avatar-upload-overlay">
                      <Upload size={16} />
                      <span>Update</span>
                    </div>
                  </>
                ) : (
                  <div className="avatar-upload-placeholder">
                    <Upload size={24} style={{ color: 'var(--primary-red)' }} />
                    <span>Upload Image</span>
                  </div>
                )}
              </div>
              <div className="avatar-upload-label">
                Click circle to change profile picture
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarUpload} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />
            </div>

            {error && <div className="profile-error-msg">{error}</div>}

            <form onSubmit={handleUpdateProfile} className="profile-form">
              <div className="form-row-two">
                <div className="profile-form-group">
                  <label>Full Name *</label>
                  <input 
                    type="text" 
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    required
                  />
                </div>
                <div className="profile-form-group">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-row-two">
                <div className="profile-form-group">
                  <label>Professional Role *</label>
                  <select 
                    value={formData.role} 
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    required
                  >
                    <option value="user">General User / Patient</option>
                    <option value="doctor">Medical Specialist / Doctor</option>
                    <option value="hr">HR Professional / Employer</option>
                    <option value="hospital">Hospital Administrator</option>
                    <option value="partner">HRM Network Partner</option>
                  </select>
                </div>
                <div className="profile-form-group">
                  <label>Location / City</label>
                  <input 
                    type="text" 
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </div>

              <div className="profile-form-group">
                <label>Professional Bio / Summary</label>
                <textarea 
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                />
              </div>

              <div className="edit-form-actions">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => {
                    // Reset details and close
                    setFormData({
                      fullName: profile.full_name || '',
                      phone: profile.phone || '',
                      role: profile.role || 'user',
                      location: profile.location || '',
                      bio: profile.bio || '',
                      avatarUrl: profile.avatar_url || ''
                    });
                    setEditMode(false);
                  }}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-save" 
                  disabled={submitting || uploadingAvatar}
                >
                  {submitting ? (
                    <>
                      <div className="spinner"></div> Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* STANDARD DASHBOARD VIEW */
          <div className="dashboard-grid">
            
            {/* LEFT PROFILE CARD */}
            <div className="dashboard-profile-card">
              <div className="profile-card-banner"></div>
              
              <div className="profile-card-avatar-wrapper">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile avatar" className="profile-card-avatar" />
                ) : (
                  <div className="profile-card-avatar-fallback">
                    {profile.full_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="profile-card-role-badge">{profile.role}</span>
              </div>

              <div className="profile-card-body">
                <h3>{profile.full_name}</h3>
                <div className="profile-card-email">{profile.email}</div>
                
                <button className="btn-edit-profile" onClick={() => setEditMode(true)}>
                  <Edit size={14} /> Edit Profile
                </button>

                <div className="profile-card-divider"></div>

                <div className="profile-card-meta">
                  {profile.location && (
                    <div className="profile-meta-item">
                      <MapPin size={15} />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.phone && (
                    <div className="profile-meta-item">
                      <Phone size={15} />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  <div className="profile-meta-item">
                    <Briefcase size={15} />
                    <span style={{ textTransform: 'capitalize' }}>{profile.role} Profile</span>
                  </div>
                </div>

                {profile.bio && (
                  <div className="profile-card-bio">
                    {profile.bio}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT DASHBOARD CONTENT */}
            <div className="dashboard-main-content">
              
              {/* WELCOME BANNER */}
              <div className="dashboard-welcome-banner">
                <h2>Welcome Back, {profile.full_name.split(' ')[0]}!</h2>
                <p>Manage your professional medical network account, search credits, and integrations here.</p>
              </div>

              {/* SEARCH CREDITS SUMMARY (Integrated directly with Supabase) */}
              {searchCredits && (
                <div className="dashboard-welcome-banner" style={{ borderLeft: '4px solid var(--primary-red)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <TrendingUp size={16} style={{ color: 'var(--primary-red)' }} />
                        Search License Status
                      </h4>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-gray)' }}>
                        Current Tier: <strong style={{ textTransform: 'uppercase', color: 'var(--primary-red)' }}>{searchCredits.plan_level}</strong>
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary-red)' }}>
                        {searchCredits.searches_remaining}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-gray)', marginLeft: '6px' }}>
                        Queries Left
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* QUICK ACTIONS */}
              <div>
                <h3 className="dashboard-section-title">
                  <Compass size={16} style={{ color: 'var(--primary-red)' }} /> Quick Services
                </h3>
                
                <div className="quick-actions-grid">
                  <Link to="/find-doctor" className="action-card-link">
                    <div className="action-card-icon-box red-theme">
                      <Search size={20} />
                    </div>
                    <h4>Find Doctor</h4>
                    <p>Search India's medical registries and specialist doctors instantly.</p>
                  </Link>

                  <Link to="/hr-extractor" className="action-card-link">
                    <div className="action-card-icon-box red-theme">
                      <UserCheck size={20} />
                    </div>
                    <h4>HR Extractor</h4>
                    <p>Verify potential candidates and search HR directories.</p>
                  </Link>

                  <Link to="/blog" className="action-card-link">
                    <div className="action-card-icon-box red-theme">
                      <FileText size={20} />
                    </div>
                    <h4>Network Blog</h4>
                    <p>Explore articles, stories, and blogs from HRM health experts.</p>
                  </Link>

                  <Link to="/contact" className="action-card-link">
                    <div className="action-card-icon-box red-theme">
                      <Phone size={20} />
                    </div>
                    <h4>Direct Support</h4>
                    <p>Get in touch with HRM support consultants and specialists.</p>
                  </Link>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Home;
