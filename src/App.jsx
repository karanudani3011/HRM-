import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import TopBar from './components/TopBar';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import PortalLogin from './pages/PortalLogin';
import ContactUs from './pages/ContactUs';
import LinkedInCallback from './pages/LinkedInCallback';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname.startsWith('/portal/');

  return (
    <AuthProvider>
      <div className="app">
        {!isAuthPage && <TopBar />}
        {!isAuthPage && <Header />}
        <Routes>
          <Route path="/portal/:type" element={<PortalLogin />} />
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
        </Routes>
        {!isAuthPage && <Footer />}
      </div>
    </AuthProvider>
  );
}

export default App;
