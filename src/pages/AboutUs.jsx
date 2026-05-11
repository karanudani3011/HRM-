import React from 'react';
import './AboutUs.css';

const AboutUs = () => {
  return (
    <div className="about-container">
      <div className="about-hero">
        <div className="container">
          <h1>About HRM Doctors Choice</h1>
          <p>Connecting Healthcare Professionals across India.</p>
        </div>
      </div>

      <div className="container about-content">
        <section className="about-section">
          <h2>Who We Are</h2>
          <p>
            The <strong>HRM DOCTORS PORTAL™</strong> is owned and operated by <strong>HRM CONSULTANCY DOCTORS CHOICE™</strong>, based in Rajkot, Gujarat. We are a premier platform dedicated to bridging the gap between highly qualified medical practitioners and top-tier healthcare institutions across the country.
          </p>
          <p>
            By leveraging modern technology, we ensure that the healthcare industry has access to verified, registered doctors, facilitating both hospital placements and telemedicine services.
          </p>
        </section>

        <div className="about-cards">
          <div className="about-card">
            <div className="card-icon">🎯</div>
            <h3>Our Mission</h3>
            <p>To empower healthcare professionals with seamless career opportunities and provide patients with reliable, accessible medical care through compliance-driven technological solutions.</p>
          </div>
          <div className="about-card">
            <div className="card-icon">👁️</div>
            <h3>Our Vision</h3>
            <p>To become India's most trusted digital healthcare intermediary, revolutionizing hospital staffing and telemedicine while strictly adhering to government guidelines.</p>
          </div>
          <div className="about-card">
            <div className="card-icon">💎</div>
            <h3>Core Values</h3>
            <p>Integrity, Innovation, and Security. We prioritize data protection, authentic medical practice, and transparent hospital-doctor connections without middle-men.</p>
          </div>
        </div>

        <section className="about-section">
          <h2>Our Technology & Security</h2>
          <p>
            Security and authenticity are the cornerstones of our portal. We integrate the <strong>“JanParichay” Single Sign-On service</strong> provided by the National Informatics Centre (NIC), Government of India, for robust identity verification. 
          </p>
          <p>
            Our rigorous e-KYC process involves DigiLocker verification for medical degrees and AI-powered live selfie matching to ensure that only certified practitioners (MBBS/BDS/BAMS/BHMS/MD/MS/DM/MCh) can join our network. We are fully compliant with the <strong>Telemedicine Practice Guidelines 2020</strong> and the <strong>DPDP Act 2023</strong>.
          </p>
        </section>

        <section className="about-section">
          <h2>Why Choose Us?</h2>
          <ul className="benefits-list">
            <li><strong>0% Commission:</strong> Doctors enjoy direct hospital connections and retain 100% of their patient fees.</li>
            <li><strong>Verified Network:</strong> We combat medical fraud by strictly verifying NMC/CCIM/CCH licenses.</li>
            <li><strong>Secure Data:</strong> Your data is protected using AES-256 encryption on secure servers.</li>
            <li><strong>Lifetime Listing:</strong> A simple, one-time fee provides lifetime access to our health partner network.</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;
