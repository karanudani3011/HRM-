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
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = location.pathname.startsWith('/portal/');
  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (window.performance) {
      const navEntries = window.performance.getEntriesByType('navigation');
      if (navEntries.length > 0 && navEntries[0].type === 'reload') {
        if (location.pathname !== '/' && !location.pathname.startsWith('/portal/') && !location.pathname.startsWith('/admin')) {
          navigate('/', { replace: true });
        }
      }
    }
  }, []);

  return (
    <AuthProvider>
      <div className="app">
        {!isAuthPage && !isAdminPage && <TopBar />}
        {!isAuthPage && !isAdminPage && <Header />}
        <Routes>
          <Route path="/portal/:type" element={<PortalLogin />} />
          <Route path="/portal/doctor/register" element={<DoctorRegistration />} />
          <Route path="/portal/hospital/register" element={<HospitalRegistration />} />
          <Route path="/portal/hr/register" element={<HRRegistration />} />
          <Route path="/portal/hrm-partner/register" element={<Navigate to="/" replace />} />
          <Route path="/portal/linkedin-callback" element={<LinkedInCallback />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/contact" 
            element={
              <ProtectedRoute>
                <ContactUs />
              </ProtectedRoute>
            } 
          />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/about" element={<AboutUs />} />
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
        </Routes>
        {!isAuthPage && !isAdminPage && <Footer />}
      </div>
    </AuthProvider>
  );
}

export default App;
