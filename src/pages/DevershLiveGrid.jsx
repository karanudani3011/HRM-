import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Play, MapPin, Award, Video } from 'lucide-react';
import './DevershLiveGrid.css';

const DevershLiveGrid = () => {
  const navigate = useNavigate();

  const doctors = [
    { name: 'Dr Priya Sharma', spec: 'Cardiologist', age: '28y', loc: 'Ahmedabad', hosp: 'Apollo', img: 'https://images.unsplash.com/photo-1594824436998-d40cead1bf0b?auto=format&fit=crop&w=400&h=500' },
    { name: 'Dr Neha Patel', spec: 'Dermatologist', age: '27y', loc: 'Rajkot', hosp: 'Sterling', img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&h=500' },
    { name: 'Dr Ayesha Khan', spec: 'Gynecologist', age: '29y', loc: 'Jamnagar', hosp: 'GG Hospital', img: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&w=400&h=500' },
    { name: 'Dr Riya Mehta', spec: 'Pediatrician', age: '26y', loc: 'Surat', hosp: 'Sunshine', img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&h=500' },
    { name: 'Dr Sneha Desai', spec: 'Physician', age: '30y', loc: 'Vadodara', hosp: 'Zydus', img: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=400&h=500' },
    { name: 'Dr Arjun Singh', spec: 'Orthopedic', age: '30y', loc: 'Rajkot', hosp: 'Wockhardt', img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&h=500' },
    { name: 'Dr Rohan Joshi', spec: 'Neurologist', age: '31y', loc: 'Ahmedabad', hosp: 'SAL', img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&h=500' },
    { name: 'Dr Karan Malhotra', spec: 'Dentist', age: '29y', loc: 'Jamnagar', hosp: 'Grace', img: 'https://images.unsplash.com/photo-1550525811-e5869dd03032?auto=format&fit=crop&w=400&h=500' },
    { name: 'Dr Vivek Rao', spec: 'Surgeon', age: '32y', loc: 'Surat', hosp: 'Kiran', img: 'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&w=400&h=500' },
    { name: 'Dr Aman Pandya', spec: 'Psychiatrist', age: '28y', loc: 'Rajkot', hosp: 'MindCare', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=500' },
  ];

  const handleConnect = () => {
    navigate('/swap-call');
  };

  return (
    <div className="deversh-grid-page">
      <div className="grid-header">
        <div className="header-tags">
          <span className="tag-red"><span className="dot"></span> RANDOM VIDEO CHAT</span>
          <span className="tag-gray">FREE Video, PAID Text</span>
        </div>
        <h1>Connect instantly with <span>verified doctors</span></h1>
        <p>Premium 1:1 video preview. Video is free for 2 minutes. Chat & contact unlock with Interest.</p>
        
        <div className="header-filters">
          <span className="filter-badge">Avg wait: <strong>12 sec</strong></span>
          <span className="filter-badge-verified"><ShieldCheck size={14} color="#eab308"/> Verified only</span>
        </div>
      </div>

      <div className="live-grid-container">
        {doctors.map((doc, index) => (
          <div key={index} className="live-card">
            <img src={doc.img} alt={doc.name} className="card-bg" />
            <div className="card-overlay">
              <div className="card-top">
                <div className="status-badges">
                  <span className="badge-live">LIVE</span>
                  <span className="badge-hd">HD</span>
                </div>
                <div className="status-dot"></div>
              </div>

              <button className="play-btn">
                <Play size={24} color="#0f172a" fill="#0f172a" />
              </button>

              <div className="card-bottom">
                <h3>{doc.name} <ShieldCheck size={14} color="#06b6d4" /></h3>
                <div className="doc-info">
                  <Award size={12} /> {doc.spec} • {doc.age}
                </div>
                <div className="doc-info">
                  <MapPin size={12} /> {doc.loc} • {doc.hosp}
                </div>
                <button className="btn-connect" onClick={handleConnect}>
                  <Video size={16} /> Connect Video <span className="free-tag">FREE</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DevershLiveGrid;
