import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { supabase } from '../lib/supabase';
import PaymentModal from './PaymentModal';
import './Header.css';

const Header = () => {
  const { user, hasRegistered, setHasRegistered } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isPremiumDir, setIsPremiumDir] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Fetch avatar and name from Supabase user_profiles
  useEffect(() => {
    const fetchHeaderProfile = async () => {
      if (!user?.email) {
        setProfile(null);
        return;
      }
      try {
        const { data } = await supabase
          .from('user_profiles')
          .select('avatar_url, full_name')
          .eq('email', user.email.toLowerCase())
          .maybeSingle();

        if (data) {
          setProfile(data);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error('Error fetching profile for header:', err);
      }
    };

    fetchHeaderProfile();
  }, [user]);

  // Check if user has paid for Premium Directory
  useEffect(() => {
    const checkPremiumPlan = async () => {
      if (!user?.email) { setIsPremiumDir(false); return; }
      try {
        const { data } = await supabase
          .from('user_search_credits')
          .select('plan_level')
          .eq('email', user.email.toLowerCase())
          .maybeSingle();
        setIsPremiumDir(data?.plan_level === 'premium_dir');
      } catch (err) {
        console.error('Error checking premium plan:', err);
      }
    };
    checkPremiumPlan();
  }, [user]);

  // Listen to profile updates from the Home dashboard to dynamically refresh the avatar
  useEffect(() => {
    const handleProfileUpdate = () => {
      if (user?.email) {
        supabase
          .from('user_profiles')
          .select('avatar_url, full_name')
          .eq('email', user.email.toLowerCase())
          .maybeSingle()
          .then(({ data }) => {
            if (data) setProfile(data);
          });
      }
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [user]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handlePremiumClick = () => {
    closeMenu();
    if (isPremiumDir) {
      navigate('/services/directory');
    } else {
      setShowPremiumModal(true);
    }
  };

  const handleLogout = async () => {
    try {
      if (user?.email) {
        localStorage.removeItem(`hasRegisteredService_${user.email.toLowerCase()}`);
      }
      await signOut(auth);
      setHasRegistered(false);
      closeMenu();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <header className="header">
      <div className="container header-container">
        <Link to="/" className="logo-section" style={{ textDecoration: 'none' }}>
          <img src="/logo.jpeg" alt="HRM Consultancy Logo" className="brand-logo" />
          <div className="logo-text">
            <h1>HRM Doctors Choice</h1>
            <p>Premium Healthcare Network</p>
          </div>
        </Link>
        <button className="mobile-toggle" onClick={toggleMenu} aria-label="Toggle Menu">
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        <div className={`nav-overlay ${isMenuOpen ? 'active' : ''}`} onClick={closeMenu}></div>

        <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <ul>
            <li><Link to="/blog" onClick={closeMenu}>Blog</Link></li>
            {!hasRegistered && <li><Link to="/services" onClick={closeMenu}>Services</Link></li>}
            <li><Link to="/samples" onClick={closeMenu}>Samples</Link></li>
            <li><Link to="/hr-extractor" onClick={closeMenu}>HR Tools</Link></li>
            <li><Link to="/find-doctor" onClick={closeMenu}>Find Doctor</Link></li>
            <li><Link to="/developers" onClick={closeMenu}>Developers</Link></li>
            <li>
              <button
                onClick={handlePremiumClick}
                style={{
                  color: isPremiumDir ? '#16a34a' : '#4f46e5',
                  fontWeight: '700',
                  background: isPremiumDir
                    ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)'
                    : 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: isPremiumDir
                    ? '1px solid rgba(22,163,74,0.3)'
                    : '1px solid rgba(79,70,229,0.25)',
                  fontSize: '13px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  lineHeight: '1.5',
                }}
              >
                {isPremiumDir ? '✓ Premium' : 'Premium'}
              </button>
            </li>
          </ul>
          <div className="nav-actions">
            <Link to="/contact" className="btn-contact" onClick={closeMenu}>Contact Us</Link>
            {user && (
              <div className="header-user-badge">
                <Link to="/" className="header-avatar-link" onClick={closeMenu} title="Go to Dashboard">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" className="header-avatar" />
                  ) : (
                    <div className="header-avatar-fallback">
                      {(profile?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>
                <button onClick={handleLogout} className="btn-logout">Logout</button>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Premium Directory Payment Modal */}
      {showPremiumModal && (
        <PaymentModal
          mode="premium"
          onClose={() => {
            setShowPremiumModal(false);
            // Re-check plan after modal closes (in case admin just upgraded them)
            if (user?.email) {
              supabase
                .from('user_search_credits')
                .select('plan_level')
                .eq('email', user.email.toLowerCase())
                .maybeSingle()
                .then(({ data }) => setIsPremiumDir(data?.plan_level === 'premium_dir'));
            }
          }}
        />
      )}
    </header>
  );
};

export default Header;
