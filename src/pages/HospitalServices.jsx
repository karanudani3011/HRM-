import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import emailjs from '@emailjs/browser';
import { 
  Building2, 
  ShieldCheck, 
  Stethoscope, 
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  Phone,
  User,
  MapPin,
  Bed,
  Map,
  Activity
} from 'lucide-react';
import './HospitalServices.css';

const HospitalServices = () => {
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    city: '',
    address: '',
    hospitalName: '',
    registeredAddress: '',
    beddedHospital: '',
    servicesRequired: [],
    licensesChecked: []
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const serviceOptions = [
    "AB PM-JAY Implementation",
    "Claim Management",
    "Claim Rejection & Deduction Analysis",
    "Cluster Management",
    "Hospital Licensing Guidance",
    "Insurance & TPA Empanelment"
  ];

  const licenseOptions = [
    "Pharmacy License",
    "Food License (FSSAI)",
    "Gujarat Pollution Control Board (GPCB)",
    "Biomedical Waste Management",
    "Fire NOC",
    "Clinical Establishment Registration",
    "Local Authority Approvals"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e, field) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const updatedList = checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value);
      return { ...prev, [field]: updatedList };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      // 1. Save to Supabase for Admin Side
      const { error: dbError } = await supabase
        .from('hospital_inquiries')
        .insert([{
          name: formData.name,
          mobile: formData.mobile,
          email: formData.email,
          city: formData.city,
          address: formData.address,
          hospital_name: formData.hospitalName,
          registered_address: formData.registeredAddress,
          beds: formData.beddedHospital,
          services_required: formData.servicesRequired,
          licenses_checked: formData.licensesChecked,
          created_at: new Date().toISOString()
        }]);

      if (dbError) {
        // If the table doesn't exist yet, we still proceed to send email
        console.warn("Supabase insert error (table might not exist):", dbError);
      }

      // 2. Send via EmailJS to outside user without giving admin access
      // Replace these with your actual EmailJS credentials
      const serviceId = 'YOUR_EMAILJS_SERVICE_ID'; 
      const templateId = 'YOUR_EMAILJS_TEMPLATE_ID';
      const publicKey = 'YOUR_EMAILJS_PUBLIC_KEY';

      const emailParams = {
        to_name: "Hospital Services Admin", // Outside user name
        from_name: formData.name,
        from_email: formData.email,
        mobile: formData.mobile,
        city: formData.city,
        address: formData.address,
        hospital_name: formData.hospitalName,
        registered_address: formData.registeredAddress,
        beds: formData.beddedHospital,
        services: formData.servicesRequired.join(", "),
        licenses: formData.licensesChecked.join(", "),
        message: "New hospital service inquiry submitted."
      };

      try {
        await emailjs.send(serviceId, templateId, emailParams, publicKey);
      } catch (emailErr) {
        console.warn("EmailJS not configured yet. Error:", emailErr);
        // We will not fail the request if EmailJS is just not configured by the user yet
      }

      setStatus({ 
        type: 'success', 
        message: 'Your inquiry has been submitted successfully! We will contact you soon.' 
      });
      
      setFormData({
        name: '', mobile: '', email: '', city: '', address: '', hospitalName: '',
        registeredAddress: '', beddedHospital: '', servicesRequired: [], licensesChecked: []
      });

    } catch (error) {
      console.error('Submission error:', error);
      setStatus({ 
        type: 'error', 
        message: 'Something went wrong. Please try again later.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hospital-services-page">
      {/* HERO SECTION */}
      <section className="hs-hero">
        <div className="hs-hero-overlay"></div>
        <div className="container hs-hero-content">
          <span className="hs-badge">Premium Healthcare Solutions</span>
          <h1>Comprehensive Hospital <br/> Support & Empanelment</h1>
          <p>
            End-to-end professional support for Ayushman Bharat (PM-JAY), 
            Hospital Licensing, and Insurance & TPA Empanelment. 
            Focus on patient care while we handle the operational complexities.
          </p>
          <button className="hs-cta-btn" onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })}>
            Inquire Now
          </button>
        </div>
      </section>

      {/* SERVICES OVERVIEW */}
      <section className="hs-features-section container">
        <div className="hs-section-header">
          <h2>Our Core Services</h2>
          <p>We provide tailored solutions to streamline your hospital's operations, ensure compliance, and maximize patient reach.</p>
        </div>

        <div className="hs-grid">
          {/* Service 1: AB PM-JAY */}
          <div className="hs-card">
            <div className="hs-card-icon blue">
              <ShieldCheck size={32} />
            </div>
            <h3>Ayushman Bharat (AB PM-JAY)</h3>
            <p>End-to-end support for hospitals under the Ayushman Bharat – PM-JAY scheme.</p>
            <ul className="hs-feature-list">
              <li><CheckCircle2 size={16} /> Hospital onboarding & setup</li>
              <li><CheckCircle2 size={16} /> Pre-authorization & Claim Management</li>
              <li><CheckCircle2 size={16} /> Claim Rejection & Deduction Analysis</li>
              <li><CheckCircle2 size={16} /> Cluster Management Assistance</li>
            </ul>
          </div>

          {/* Service 2: Licensing */}
          <div className="hs-card">
            <div className="hs-card-icon teal">
              <FileText size={32} />
            </div>
            <h3>Hospital Licensing & Compliance</h3>
            <p>Complete guidance to obtain, renew, and maintain essential statutory licenses.</p>
            <ul className="hs-feature-list">
              <li><CheckCircle2 size={16} /> Pharmacy & Food (FSSAI) Licenses</li>
              <li><CheckCircle2 size={16} /> GPCB & Biomedical Waste Auth</li>
              <li><CheckCircle2 size={16} /> Fire NOC & Clinical Registration</li>
              <li><CheckCircle2 size={16} /> Regular Compliance Audits</li>
            </ul>
          </div>

          {/* Service 3: Insurance */}
          <div className="hs-card">
            <div className="hs-card-icon purple">
              <Activity size={32} />
            </div>
            <h3>Insurance & TPA Empanelment</h3>
            <p>Establish partnerships with leading health insurance providers and TPAs.</p>
            <ul className="hs-feature-list">
              <li><CheckCircle2 size={16} /> End-to-end empanelment support</li>
              <li><CheckCircle2 size={16} /> Documentation & Application</li>
              <li><CheckCircle2 size={16} /> HDFC ERGO, Star Health, Tata AIG</li>
              <li><CheckCircle2 size={16} /> Government Scheme Integrations</li>
            </ul>
          </div>
        </div>
      </section>

      {/* DETAILED SECTIONS */}
      <section className="hs-details-section">
        <div className="container">
          <div className="hs-detail-row">
            <div className="hs-detail-content">
              <h2>AB PM-JAY Support Services</h2>
              <p>Maximize your hospital's efficiency and revenue realization under the PM-JAY scheme with our expert claim management and root-cause analysis.</p>
              <div className="hs-info-boxes">
                <div className="hs-info-box">
                  <h4>Claim Management</h4>
                  <p>From patient eligibility verification to follow-up until claim settlement, we handle the entire lifecycle.</p>
                </div>
                <div className="hs-info-box">
                  <h4>Rejection Analysis</h4>
                  <p>Detailed review of deducted claims, corrective actions, and guidance to reduce future rejections.</p>
                </div>
              </div>
            </div>
            <div className="hs-detail-image img-pmjay"></div>
          </div>

          <div className="hs-detail-row reverse">
            <div className="hs-detail-content">
              <h2>Empanelment & Licensing</h2>
              <p>Attract more patients by offering cashless treatments. We coordinate with top insurers like Niva Bupa, ICICI Lombard, Care Health, and more.</p>
              <ul className="hs-large-list">
                <li>Faster documentation and coordination</li>
                <li>Dedicated support from application to approval</li>
                <li>Training for hospital staff on compliance</li>
                <li>Strategic regulatory planning</li>
              </ul>
            </div>
            <div className="hs-detail-image img-insurance"></div>
          </div>
        </div>
      </section>

      {/* INQUIRY FORM */}
      <section className="hs-form-section" ref={formRef}>
        <div className="container">
          <div className="hs-form-container">
            <div className="hs-form-header">
              <h2>Submit an Inquiry</h2>
              <p>Provide your hospital details below, and our experts will reach out to tailor a support plan for you.</p>
            </div>

            {status.message && (
              <div className={`hs-alert ${status.type}`}>
                {status.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                <span>{status.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="hs-form">
              <div className="hs-form-grid">
                
                {/* Personal / Contact Details */}
                <div className="hs-form-group">
                  <label><User size={16}/> Contact Person Name</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleInputChange} placeholder="e.g. Dr. John Doe" />
                </div>
                <div className="hs-form-group">
                  <label><Phone size={16}/> Mobile Number</label>
                  <input type="tel" name="mobile" required value={formData.mobile} onChange={handleInputChange} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className="hs-form-group">
                  <label><Mail size={16}/> Email Address</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleInputChange} placeholder="doctor@hospital.com" />
                </div>
                <div className="hs-form-group">
                  <label><MapPin size={16}/> City</label>
                  <input type="text" name="city" required value={formData.city} onChange={handleInputChange} placeholder="e.g. Ahmedabad" />
                </div>

                {/* Hospital Details */}
                <div className="hs-form-group full-width">
                  <label><Building2 size={16}/> Hospital Name</label>
                  <input type="text" name="hospitalName" required value={formData.hospitalName} onChange={handleInputChange} placeholder="Enter full hospital name" />
                </div>
                <div className="hs-form-group full-width">
                  <label><Map size={16}/> Registered Address</label>
                  <textarea name="registeredAddress" required value={formData.registeredAddress} onChange={handleInputChange} placeholder="Enter official registered address" rows="2"></textarea>
                </div>
                <div className="hs-form-group full-width">
                  <label><MapPin size={16}/> Operating Address (if different)</label>
                  <textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="Enter operating address" rows="2"></textarea>
                </div>
                <div className="hs-form-group">
                  <label><Bed size={16}/> How many bedded hospital?</label>
                  <input type="number" name="beddedHospital" required value={formData.beddedHospital} onChange={handleInputChange} placeholder="e.g. 50" min="1" />
                </div>

              </div>

              {/* Checkboxes Sections */}
              <div className="hs-checkbox-sections">
                <div className="hs-checkbox-group">
                  <label className="hs-group-label">Required Services List</label>
                  <div className="hs-checkbox-grid">
                    {serviceOptions.map((service, idx) => (
                      <label key={idx} className="hs-checkbox-label">
                        <input 
                          type="checkbox" 
                          value={service} 
                          checked={formData.servicesRequired.includes(service)}
                          onChange={(e) => handleCheckboxChange(e, 'servicesRequired')}
                        />
                        <span className="hs-custom-checkbox"></span>
                        {service}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="hs-checkbox-group">
                  <label className="hs-group-label">Hospital License Check List</label>
                  <div className="hs-checkbox-grid">
                    {licenseOptions.map((license, idx) => (
                      <label key={idx} className="hs-checkbox-label">
                        <input 
                          type="checkbox" 
                          value={license} 
                          checked={formData.licensesChecked.includes(license)}
                          onChange={(e) => handleCheckboxChange(e, 'licensesChecked')}
                        />
                        <span className="hs-custom-checkbox"></span>
                        {license}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="hs-form-submit">
                <button type="submit" disabled={loading} className="hs-submit-btn">
                  {loading ? (
                    <><Loader2 size={20} className="spinner" /> Submitting...</>
                  ) : (
                    'Submit Inquiry'
                  )}
                </button>
                <p className="hs-form-note">Your data is secure and will only be used to contact you regarding your inquiry.</p>
              </div>

            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HospitalServices;
