import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Play, MapPin, Award, Video } from 'lucide-react';
import io from 'socket.io-client';
import './DevershLiveGrid.css';

const socket = io('http://localhost:5000');

const DevershLiveGrid = () => {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);

  const fetchDoctors = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/doctors/online');
      if (response.ok) {
        const data = await response.json();
        // filter online only
        setDoctors(data.filter(d => d.online));
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  useEffect(() => {
    fetchDoctors();

    socket.on('doctor_list_updated', () => {
      fetchDoctors();
    });

    return () => {
      socket.off('doctor_list_updated');
    };
  }, []);

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
        {doctors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', width: '100%', color: '#64748b' }}>
            No online doctors currently available. Waiting for doctors to join...
          </div>
        ) : doctors.map((doc, index) => (
          <div key={doc._id || index} className="live-card">
            <img src={doc.photo || "https://images.unsplash.com/photo-1594824436998-d40cead1bf0b?auto=format&fit=crop&w=400&h=500"} alt={doc.name} className="card-bg" />
            <div className="card-overlay">
              <div className="card-top">
                <div className="status-badges">
                  <span className="badge-live">LIVE</span>
                  {doc.premium && <span className="badge-hd" style={{ background: '#f59e0b', color: '#fff' }}>PRO</span>}
                </div>
                <div className="status-dot"></div>
              </div>

              <button className="play-btn">
                <Play size={24} color="#0f172a" fill="#0f172a" />
              </button>

              <div className="card-bottom">
                <h3>{doc.name} {doc.verified && <ShieldCheck size={14} color="#06b6d4" title="Verified Badge" />}</h3>
                <div className="doc-info">
                  <Award size={12} /> {doc.specialization} • {doc.age}y
                </div>
                <div className="doc-info">
                  <MapPin size={12} /> {doc.city} • {doc.hospital}
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
