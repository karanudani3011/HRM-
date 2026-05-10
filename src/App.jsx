import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import TopBar from './components/TopBar';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import PortalLogin from './pages/PortalLogin';
import ContactUs from './pages/ContactUs';
import AuthPage from './pages/AuthPage';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: '#f5f8fc'
      }}>
        <div className="loader">Loading...</div>
      </div>
    );
  }

  const isAuthPage = location.pathname === '/portal-secure-login';

  return (
    <div className="app">
      {!isAuthPage && <TopBar />}
      {!isAuthPage && <Header user={user} />}
      
      <Routes>
        {/* Protected Routes: Redirect to /portal-secure-login if not logged in */}
        <Route path="/" element={user ? <Home /> : <Navigate to="/portal-secure-login" />} />
        <Route path="/portal/:type" element={user ? <PortalLogin /> : <Navigate to="/portal-secure-login" />} />
        <Route path="/contact" element={user ? <ContactUs /> : <Navigate to="/portal-secure-login" />} />
        
        {/* Auth Route: Redirect to / if already logged in */}
        <Route path="/portal-secure-login" element={!user ? <AuthPage /> : <Navigate to="/" />} />
      </Routes>

      {!isAuthPage && <Footer />}
    </div>
  );
}

export default App;
