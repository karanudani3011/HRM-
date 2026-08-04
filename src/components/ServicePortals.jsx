import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Users, Building2, HeartPulse, Handshake } from 'lucide-react';
import './ServicePortals.css';

const ServicePortals = () => {
  return (
    <section className="service-portals" id="services">
      <div className="container">
        <div className="section-header">
          <h2>Our <span>Service Portals</span></h2>
          <p>Comprehensive healthcare solutions for every stakeholder</p>
        </div>

        <div className="portals-grid">
          {/* Card 1 */}
          <div className="portal-card-large">
            <div className="icon-box red-bg">
              <Stethoscope size={24} color="white" />
            </div>
            <h3>For Doctors</h3>
            <p>Register your practice, manage patients, video consultations & 5 Cr Finance access</p>
            <Link to="/portal/doctor/register" className="access-link">Access Portal &rarr;</Link>
          </div>

          {/* Card 2 */}
          <div className="portal-card-large">
            <div className="icon-box dark-bg">
              <Users size={24} color="white" />
            </div>
            <h3>For HR Professionals</h3>
            <p>B2B lead extractor, recruitment tools & HRM Partner Clinic registration</p>
            <Link to="/portal/hr/register" className="access-link">Access Portal &rarr;</Link>
          </div>

          {/* Card 3 */}
          <div className="portal-card-large">
            <div className="icon-box dark-bg">
              <Building2 size={24} color="white" />
            </div>
            <h3>For Hospitals</h3>
            <p>HRM Network Partner registration, doctor network & patient management</p>
            <Link to="/portal/hospital/register" className="access-link">Access Portal &rarr;</Link>
          </div>

          {/* Card 4 */}
          <div className="portal-card-large">
            <div className="icon-box red-bg">
              <HeartPulse size={24} color="white" />
            </div>
            <h3>For Patients</h3>
            <p>Find specialists in any city, book video consultations & health records</p>
            <span className="access-link" style={{ opacity: 0.6, cursor: 'not-allowed' }}>Access Portal &rarr;</span>
          </div>

          {/* Card 5 */}
          <div className="portal-card-large hrm-partner-card">
            <div className="icon-box partner-bg">
              <Handshake size={24} color="white" />
            </div>
            <h3>Join as HRM Partner</h3>
            <p>Partner with us to expand healthcare access, grow your network & earn with HRM's partner ecosystem</p>
            <Link to="/portal/hrm-partner/register" className="access-link">Access Portal &rarr;</Link>
          </div>

          {/* Card 6 */}
          <div className="portal-card-large deversh-card" style={{ border: '1px solid #e2e8f0' }}>
            <div className="icon-box" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <Users size={24} color="white" />
            </div>
            <h3>Deversh</h3>
            <p>Register on the exclusive Deversh portal with secure email verification.</p>
            <Link to="/portal/deversh/register" className="access-link">Access Portal &rarr;</Link>
          </div>

        </div>



        <div className="finance-btn-container">
          <button className="finance-btn">Rs 5 Cr Finance - Doctors Only</button>
        </div>
      </div>
    </section>
  );
};

export default ServicePortals;
