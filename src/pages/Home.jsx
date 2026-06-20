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
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { uploadImageToCloudinary } from '../utils/cloudinary';
import { useAuth } from '../context/AuthContext';
import PostCarousel from '../components/PostCarousel';
import PaymentModal from '../components/PaymentModal';
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

  // User's own registration details
  const [userRegistration, setUserRegistration] = useState(null);

  // Feed states for real-time posts
  const [feedPosts, setFeedPosts] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState(new Set());

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

        // Fetch user registration details from Firestore
        if (db && user?.email) {
          const q = query(
            collection(db, 'serviceForms'),
            where('email', '==', user.email)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const docReg = querySnapshot.docs.find(d => d.data().formType === 'Doctor Registration');
            if (docReg) {
              setUserRegistration(docReg.data());
            } else {
              setUserRegistration(querySnapshot.docs[0].data());
            }
          } else {
            setUserRegistration(null);
          }
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

  // Fetch real-time posts feed from Firestore
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(15));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = [];
      snapshot.forEach((document) => {
        postsData.push({ id: document.id, ...document.data() });
      });
      setFeedPosts(postsData);
      setFeedLoading(false);
    }, (error) => {
      console.error("Error listening to feed posts:", error);
      setFeedLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
  
  // Toggle local post likes
  const handleToggleLike = (postId) => {
    setLikedPosts(prev => {
      const newLikes = new Set(prev);
      if (newLikes.has(postId)) {
        newLikes.delete(postId);
      } else {
        newLikes.add(postId);
      }
      return newLikes;
    });
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
          <div className="linkedin-layout">
            
            {/* LEFT COLUMN */}
            <div className="linkedin-left-col">
              
              {/* PROFILE CARD */}
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

                    {userRegistration && (
                      <>
                        <div className="profile-card-divider" style={{ margin: '12px 0 6px 0', width: '100%' }}></div>
                        <div className="profile-meta-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px', width: '100%' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-gray)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>License Status</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-dark)' }}>
                            <Award size={14} style={{ color: 'var(--primary-red)' }} />
                            <span>No: <strong>{userRegistration.regNo || '—'}</strong></span>
                          </div>
                          {userRegistration.regState && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-dark)' }}>
                              <MapPin size={14} style={{ color: 'var(--primary-red)' }} />
                              <span>State: {userRegistration.regState}</span>
                            </div>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'green', fontWeight: '600' }}>
                            <ShieldCheck size={14} color="green" />
                            <span>Status: Verified</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {profile.bio && (
                    <div className="profile-card-bio">
                      {profile.bio}
                    </div>
                  )}
                </div>
              </div>

              {/* QUICK SERVICES */}
              <div className="linkedin-left-card quick-services-card">
                <h4>Quick Services</h4>
                <div className="quick-services-list">
                  <Link to="/find-doctor" className="quick-service-item">
                    <div className="quick-service-icon-box">
                      <Search size={16} />
                    </div>
                    <span>Find Doctor</span>
                  </Link>

                  <Link to="/hr-extractor" className="quick-service-item">
                    <div className="quick-service-icon-box">
                      <UserCheck size={16} />
                    </div>
                    <span>HR Extractor</span>
                  </Link>

                  <Link to="/blog" className="quick-service-item">
                    <div className="quick-service-icon-box">
                      <FileText size={16} />
                    </div>
                    <span>Network Blog</span>
                  </Link>

                  <Link to="/contact" className="quick-service-item">
                    <div className="quick-service-icon-box">
                      <Phone size={16} />
                    </div>
                    <span>Direct Support</span>
                  </Link>
                </div>
              </div>

            </div>

            {/* MIDDLE FEED COLUMN */}
            <div className="linkedin-middle-col">
              
              {/* START A POST */}
              <div className="linkedin-start-post-card">
                <div className="start-post-upper">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile avatar" className="post-avatar-small" />
                  ) : (
                    <div className="post-avatar-small-fallback">
                      {profile.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <Link to="/blog" className="start-post-trigger">
                    Start a post
                  </Link>
                </div>
                <div className="start-post-lower">
                  <Link to="/blog" className="post-type-btn">
                    <span className="post-type-icon" style={{ color: '#378fe9' }}>📷</span> Photo
                  </Link>
                  <Link to="/blog" className="post-type-btn">
                    <span className="post-type-icon" style={{ color: '#5f9b41' }}>🎥</span> Video
                  </Link>
                  <Link to="/blog" className="post-type-btn">
                    <span className="post-type-icon" style={{ color: '#e06847' }}>📝</span> Write article
                  </Link>
                </div>
              </div>

              {/* FEED POSTS */}
              <div className="linkedin-feed-posts">
                {feedLoading ? (
                  <div className="feed-loading-placeholder">
                    <div className="spinner"></div> Loading feed...
                  </div>
                ) : feedPosts.length === 0 ? (
                  <div className="feed-empty-state">
                    <h3>No Posts Yet</h3>
                    <p>Be the first one in the HRM network to start a post!</p>
                    <Link to="/blog" className="btn-write-first">Write Article</Link>
                  </div>
                ) : (
                  feedPosts.map((post) => {
                    const isLiked = likedPosts.has(post.id);
                    return (
                      <div key={post.id} className="linkedin-post-card">
                        <div className="post-card-header">
                          <div className="post-card-author-avatar">
                            {post.authorAvatarUrl ? (
                              <img src={post.authorAvatarUrl} alt={post.authorName} />
                            ) : (
                              <div className="avatar-fallback-small">
                                {(post.authorName || 'H').charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="post-card-author-info">
                            <h4>{post.authorName || 'HRM Network Member'}</h4>
                            <span>
                              {post.category || 'Medical Update'} • {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString('en-IN', {day:'2-digit', month:'short'}) : 'Just now'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="post-card-content">
                          <h3>{post.title}</h3>
                          <p>{post.excerpt || post.content}</p>
                        </div>
                        
                        {post.imageUrl && (
                          <div className="post-card-image-box">
                            <img src={post.imageUrl} alt={post.title} />
                          </div>
                        )}
                        
                        <div className="post-card-footer">
                          <button 
                            className={`post-action-btn ${isLiked ? 'liked' : ''}`}
                            onClick={() => handleToggleLike(post.id)}
                          >
                            <span className="action-icon">{isLiked ? '❤️' : '👍'}</span>
                            <span>{isLiked ? 'Liked' : 'Like'}</span>
                          </button>
                          <button 
                            className="post-action-btn"
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/blog`);
                              alert('Link copied to clipboard!');
                            }}
                          >
                            <span className="action-icon">🔗</span>
                            <span>Share</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>

            {/* RIGHT COLUMN */}
            <div className="linkedin-right-col">
              
              <div className="linkedin-right-card news-card">
                <div className="news-card-header">
                  <h4>HRM Network News</h4>
                  <span className="info-icon">ℹ️</span>
                </div>
                <ul className="news-list">
                  <li>
                    <span className="news-dot"></span>
                    <div className="news-content">
                      <h5>Top medical specialists joining in Rajkot</h5>
                      <span>1h ago • 3,240 readers</span>
                    </div>
                  </li>
                  <li>
                    <span className="news-dot"></span>
                    <div className="news-content">
                      <h5>US Medical Council updates guidelines</h5>
                      <span>4h ago • 1,850 readers</span>
                    </div>
                  </li>
                  <li>
                    <span className="news-dot"></span>
                    <div className="news-content">
                      <h5>Healthcare staffing demand surges</h5>
                      <span>21h ago • 9,450 readers</span>
                    </div>
                  </li>
                  <li>
                    <span className="news-dot"></span>
                    <div className="news-content">
                      <h5>Vaidik Pandya likes this update</h5>
                      <span>1d ago • 5,120 readers</span>
                    </div>
                  </li>
                </ul>
              </div>



            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Home;
