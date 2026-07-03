import React from 'react';
import './SampleShowcase.css';
import clinicImg from '../assets/premium_clinic.png';
import { CheckCircle, FileText, LayoutDashboard } from 'lucide-react';

const SampleShowcase = () => {
  return (
    <section className="sample-showcase" id="samples">
      <div className="container">
        <div className="section-header">
          <h2>HRM <span>Sample Showcase</span></h2>
          <p>Preview your HRM Privilege Card & Partner Clinic Experience</p>
        </div>

        <div className="samples-grid">
          {/* Sample 1: ID Card */}
          <div className="sample-item">
            <h3 className="sample-title"><LayoutDashboard size={18} className="red-icon" /> HRM Privilege Card</h3>
            <div className="id-card-wrapper">
              <div className="id-card">
                <div className="id-card-header">
                  <div className="id-logo">
                    <span className="hrm-text">HRM</span>
                    <span className="hrm-sub">HRM CONSULTANCY-DOCTORS CHOICE</span>
                  </div>
                  <div className="qr-placeholder"></div>
                </div>
                
                <div className="id-card-body">
                  <div className="id-field">
                    <label>PATIENT NAME</label>
                    <div className="val">RAJESH KUMAR</div>
                  </div>
                  <div className="id-field">
                    <label>MEMBERSHIP ID</label>
                    <div className="val">HRM 2024 9876 5432</div>
                  </div>
                  <div className="id-field">
                    <label>BLOOD GROUP</label>
                    <div className="val">O+</div>
                  </div>
                  <div className="id-field">
                    <label>VALID THRU</label>
                    <div className="val">12/28</div>
                  </div>
                </div>
                
                <div className="id-card-footer">
                  <div className="sim-chip"></div>
                  <div className="emergency-text">
                    <label>Emergency Helpline</label>
                    <div>9879450072</div>
                  </div>
                </div>

                <div className="id-card-banner">
                  PRIVILEGE CARD SAMPLE AVAILABLE AS PER REQUEST
                </div>
              </div>
              <button className="download-btn">
                <FileText size={16} /> Download Sample Privilege Card PDF
              </button>
            </div>
          </div>

          {/* Sample 2: Clinic */}
          <div className="sample-item">
            <h3 className="sample-title"><LayoutDashboard size={18} className="red-icon" /> HRM Partner Clinic Experience</h3>
            <div className="clinic-sample-wrapper">
              <img src={clinicImg} alt="HRM Premium Clinic" className="clinic-image" />
              
              <div className="clinic-details">
                <h4>Premium HRM Branded Clinic Experience</h4>
                <ul className="feature-list">
                  <li>
                    <CheckCircle size={16} className="red-icon" />
                    <span>Professional doctors with "HRM HEALTH PARTNER" branded backdrop</span>
                  </li>
                  <li>
                    <CheckCircle size={16} className="red-icon" />
                    <span>Premium consultation rooms featuring "HRM DOCTORS CHOICE" wall branding</span>
                  </li>
                  <li>
                    <CheckCircle size={16} className="red-icon" />
                    <span>Standardized patient experience across all partner locations</span>
                  </li>
                </ul>
                <div className="sample-note">
                  <FileText size={16} className="red-icon" /> See how your clinic will look as an HRM Network Partner
                  <span>PARTNER CLINIC SAMPLE AVAILABLE AS PER REQUEST</span>
                </div>
              </div>
              
              <button className="register-btn">Register as Network Partner</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SampleShowcase;
