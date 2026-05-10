import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TopBar from './components/TopBar';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import PortalLogin from './pages/PortalLogin';
import ContactUs from './pages/ContactUs';

function App() {
  return (
    <div className="app">
      <TopBar />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/portal/:type" element={<PortalLogin />} />
        <Route path="/contact" element={<ContactUs />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
