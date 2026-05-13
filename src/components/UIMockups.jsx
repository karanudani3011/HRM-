import React from 'react';
import './UIMockups.css';
import { Search, MapPin, Briefcase } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const UIMockups = () => {
  return (
    <section className="ui-mockups">
      <div className="container">
        
        {/* Mockup 1: HR B2B Leads Extractor */}
        <div className="mockup-section" id="hr-tools">
          <div className="section-header">
            <h2>HR <span>B2B Leads Extractor</span></h2>
            <p>Powerful lead generation for healthcare recruitment</p>
          </div>
          
          <div className="mockup-card">
            <div className="mockup-form">
              <div className="input-group">
                <label>Keyword/Specialty</label>
                <div className="input-box">e.g., Cardiology, Hospitals, Diagnostic Center</div>
              </div>
              <div className="input-group">
                <label>City / Location</label>
                <div className="input-box">e.g., Mumbai, Delhi, Bangalore</div>
              </div>
            </div>
            
            <div className="mockup-alert">
              <strong>Premium Feature:</strong> Auto-verify contact numbers & email IDs before export.
            </div>
            
            <div className="mockup-actions">
              <button className="action-btn red-btn"><Search size={16}/> START EXTRACTION</button>
              <button className="action-btn dark-btn">EXPORT CSV</button>
            </div>
            
            <div className="mockup-table-container">
              <div className="table-header">
                <h3>Master Lead Database</h3>
                <div className="search-small">Search leads...</div>
              </div>
              <table className="mockup-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Location</th>
                    <th>Specialty</th>
                    <th>Contact</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Apollo Hospitals</td>
                    <td>Mumbai</td>
                    <td>Multi-Specialty</td>
                    <td>+91 98234 xxxxx</td>
                    <td className="action-link">Initiate Call</td>
                  </tr>
                  <tr>
                    <td>Fortis Healthcare</td>
                    <td>Delhi</td>
                    <td>Cardiology</td>
                    <td>+91 98765 xxxxx</td>
                    <td className="action-link">Initiate Call</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Mockup 2: Find Your Doctor Anywhere */}
        <div className="mockup-section" id="find-doctor">
          <div className="section-header">
            <h2>Find Your <span>Doctor Anywhere</span></h2>
            <p>Book video consultations with top specialists in any city</p>
          </div>
          
          <div className="mockup-card">
            <div className="mockup-form-3col">
              <div className="input-group">
                <label>City</label>
                <div className="input-box">Any city in India</div>
              </div>
              <div className="input-group">
                <label>Specialty</label>
                <div className="input-box">Any Specialty</div>
              </div>
              <div className="input-group">
                <label>Experience</label>
                <select className="input-box" style={{ width: '100%', cursor: 'pointer' }} defaultValue="">
                  <option value="" disabled hidden>Any Experience</option>
                  <option value="0-5">0-5 yr</option>
                  <option value="5-10">5-10yr</option>
                  <option value="10-15">10-15yr</option>
                  <option value="15-20">15-20yr</option>
                  <option value="20-25">20-25yr</option>
                  <option value="above-25">above 25</option>
                </select>
              </div>
            </div>
            
            <button className="search-full-btn"><Search size={16} /> SEARCH DOCTORS</button>
            
            <div className="doctor-results">
              <div className="doc-card">
                <div className="doc-info">
                  <div className="doc-avatar"></div>
                  <div>
                    <h4>Dr. Priya Sharma</h4>
                    <p>Cardiologist - 15 Years</p>
                  </div>
                </div>
                <div className="doc-status">Available on Request</div>
                <button className="book-btn">Book Video Consult</button>
              </div>
              
              <div className="doc-card">
                <div className="doc-info">
                  <div className="doc-avatar"></div>
                  <div>
                    <h4>Dr. Amit Patel</h4>
                    <p>Dermatologist - 8 Years</p>
                  </div>
                </div>
                <div className="doc-status">Available on Request</div>
                <button className="book-btn">Book Video Consult</button>
              </div>
              
              <div className="doc-card">
                <div className="doc-info">
                  <div className="doc-avatar"></div>
                  <div>
                    <h4>Dr. Sarah Khan</h4>
                    <p>Pediatrician - 12 Years</p>
                  </div>
                </div>
                <div className="doc-status">Available on Request</div>
                <button className="book-btn">Book Video Consult</button>
              </div>
            </div>
          </div>
        </div>

        {/* Mockup 3: Global Career Hub */}
        <div className="mockup-section">
          <div className="section-header">
            <h2>Global <span>Career Hub</span></h2>
            <p>Healthcare opportunities worldwide</p>
          </div>
          
          <div className="mockup-card">
            <div className="table-header">
              <h3>Latest Opportunities</h3>
              <div className="search-small">Search jobs...</div>
            </div>
            <div className="mockup-table-container">
              <table className="mockup-table">
                <thead>
                  <tr>
                    <th>Position</th>
                    <th>Hospital</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Apply</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Senior Cardiologist</td>
                    <td>Jupiter Hospitals</td>
                    <td>Mumbai</td>
                    <td><span className="badge green">Full Time</span></td>
                    <td className="action-link">Apply Now</td>
                  </tr>
                  <tr>
                    <td>HR Manager</td>
                    <td>Fortis Healthcare</td>
                    <td>Delhi</td>
                    <td><span className="badge blue">Remote</span></td>
                    <td className="action-link">Apply Now</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default UIMockups;
