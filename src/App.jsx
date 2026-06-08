import React, { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import TopBar from './components/TopBar';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import PortalLogin from './pages/PortalLogin';
import ContactUs from './pages/ContactUs';
import LinkedInCallback from './pages/LinkedInCallback';
import TermsConditions from './pages/TermsConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AboutUs from './pages/AboutUs';
import Blog from './pages/Blog';
import DoctorRegistration from './pages/DoctorRegistration';
import HospitalRegistration from './pages/HospitalRegistration';
import HRRegistration from './pages/HRRegistration';
import PartnerRegistration from './pages/PartnerRegistration';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminServiceSubmissions from './pages/AdminServiceSubmissions';
import AdminLeads from './pages/AdminLeads';
import HRExtractor from './pages/HRExtractor';
import AdminBlogs from './pages/AdminBlogs';
import Services from './pages/Services';
import Samples from './pages/Samples';
import FindDoctor from './pages/FindDoctor';
import VideoConsultation from './pages/VideoConsultation';
import DeveloperPage from './pages/DeveloperPage';
import RegistrationSuccess from './pages/RegistrationSuccess';
import ResetPassword from './pages/ResetPassword';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasRegistered } = useAuth();

  const isAuthPage = location.pathname.startsWith('/portal/');
  const isAdminPage = location.pathname.startsWith('/admin');
  const isConsultPage = location.pathname.startsWith('/consultation/');
  const isSuccessPage = location.pathname === '/registration-success';
  const isResetPage = location.pathname === '/reset-password';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Redirect registered users away from /services (they've already registered)
  useEffect(() => {
    if (hasRegistered && location.pathname === '/services') {
      navigate('/find-doctor', { replace: true });
    }
  }, [location.pathname, hasRegistered, navigate]);

  return (
    <div className="app">
      {!isAuthPage && !isAdminPage && !isConsultPage && !isSuccessPage && !isResetPage && <TopBar />}
      {!isAuthPage && !isAdminPage && !isConsultPage && !isSuccessPage && !isResetPage && <Header />}
      <Routes>
        <Route path="/portal/:type" element={<PortalLogin />} />
        <Route path="/portal/doctor/register" element={<DoctorRegistration />} />
        <Route path="/portal/hospital/register" element={<HospitalRegistration />} />
        <Route path="/portal/hr/register" element={<HRRegistration />} />
        <Route path="/portal/hrm-partner/register" element={<Navigate to="/" replace />} />
        <Route path="/portal/linkedin-callback" element={<LinkedInCallback />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/contact" element={<ProtectedRoute><ContactUs /></ProtectedRoute>} />
        <Route path="/terms" element={<TermsConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/developers" element={<DeveloperPage />} />
        <Route path="/registration-success" element={<ProtectedRoute><RegistrationSuccess /></ProtectedRoute>} />
        <Route path="/blog" element={<ProtectedRoute><Blog /></ProtectedRoute>} />
        <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
        <Route path="/samples" element={<ProtectedRoute><Samples /></ProtectedRoute>} />
        <Route path="/find-doctor" element={<ProtectedRoute><FindDoctor /></ProtectedRoute>} />
        <Route path="/admin/services" element={<AdminServiceSubmissions />} />
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/leads" element={<AdminLeads />} />
        <Route path="/admin/blogs" element={<AdminBlogs />} />
        <Route path="/hr-extractor" element={<ProtectedRoute><HRExtractor /></ProtectedRoute>} />
        <Route path="/consultation/:roomId" element={<ProtectedRoute><VideoConsultation /></ProtectedRoute>} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
      {!isAuthPage && !isAdminPage && !isConsultPage && !isSuccessPage && !isResetPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
