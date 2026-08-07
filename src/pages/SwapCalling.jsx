import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { Video, User, Users, RefreshCw, X, ShieldAlert, Crown, ArrowRight, Play } from 'lucide-react';
import './VideoConsultation.css'; // Reusing your existing video styling

const SOCKET_SERVER = 'http://localhost:5000';

const SwapCalling = () => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [matchingStatus, setMatchingStatus] = useState('idle'); // idle, searching, matched, finished
  const [timer, setTimer] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  
  const [myGender, setMyGender] = useState('male');
  const [partnerGenderPref, setPartnerGenderPref] = useState('any');
  
  // Mocking plan for demo. In real app, fetch from user context.
  const [plan, setPlan] = useState('free'); // 'free' or 'premium'

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const newSocket = io(SOCKET_SERVER);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join', {
        userId: user?.email || `guest_${Math.floor(Math.random()*1000)}`,
        role: 'doctor',
        plan: plan,
        blockedUsers: []
      });
    });

    newSocket.on('matched', async (data) => {
      setMatchingStatus('matched');
      setTimer(data.timer);
      
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      peerConnectionRef.current = pc;

      // Add local stream tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          pc.addTrack(track, localStreamRef.current);
        });
      }

      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          newSocket.emit('ice-candidate', { target: data.peerId, candidate: event.candidate });
        }
      };

      if (data.initiator) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        newSocket.emit('offer', { target: data.peerId, offer });
      }
    });

    newSocket.on('offer', async (data) => {
      const pc = peerConnectionRef.current;
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        newSocket.emit('answer', { target: data.sender, answer });
      }
    });

    newSocket.on('answer', async (data) => {
      const pc = peerConnectionRef.current;
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    });

    newSocket.on('ice-candidate', async (data) => {
      const pc = peerConnectionRef.current;
      if (pc) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) {
          console.error("Error adding ice candidate", e);
        }
      }
    });

    newSocket.on('peer_disconnected', () => {
      endCallUI();
    });
    
    newSocket.on('trigger_search', () => {
      startMatchingProcess(newSocket);
    });

    return () => {
      newSocket.disconnect();
      cleanupMedia();
    };
  }, [plan, user]);

  // Timer logic
  useEffect(() => {
    if (matchingStatus === 'matched' && timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [matchingStatus, timer]);

  const handleTimeUp = () => {
    endCallUI();
    if (plan === 'free') {
      setShowPopup(true);
    } else {
      // Premium users skip popup, auto next match?
      // "Premium users skip popup." -> Just go back to idle or auto match.
      handleNextMatch();
    }
  };

  const cleanupMedia = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
  };

  const getMedia = async () => {
    if (!localStreamRef.current) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing media devices", err);
        alert("Camera and microphone access is required.");
        return false;
      }
    }
    return true;
  };

  const startMatchingProcess = async (sock = socket) => {
    const gotMedia = await getMedia();
    if (!gotMedia) return;

    setMatchingStatus('searching');
    sock.emit('start_search');
  };

  const endCallUI = () => {
    setMatchingStatus('idle');
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    if (socket) socket.emit('end_call');
  };

  const handleNextMatch = () => {
    setShowPopup(false);
    endCallUI();
    if (socket) socket.emit('next_match');
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="consultation-page" style={{ height: '100vh', overflow: 'hidden' }}>
      
      {/* Timer & Popup Overlay */}
      {showPopup && (
        <div className="popup-overlay" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="popup-card" style={{ background: 'white', padding: '30px', borderRadius: '12px', textAlign: 'center', maxWidth: '400px' }}>
            <Crown size={48} color="#f59e0b" style={{ margin: '0 auto 15px' }} />
            <h2 style={{ color: '#1e293b', marginBottom: '10px' }}>Time's Up!</h2>
            <p style={{ color: '#475569', marginBottom: '20px' }}>Your free session has ended. Upgrade to Premium for longer calls (200s) and no interruptions.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                onClick={() => { setPlan('premium'); setShowPopup(false); }}
                style={{ padding: '10px 20px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <Crown size={16} /> Upgrade
              </button>
              <button 
                onClick={handleNextMatch}
                style={{ padding: '10px 20px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                Continue Free <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="consultation-container">
        {/* Sidebar Controls */}
        <div className="consultation-sidebar" style={{ width: '300px' }}>
          <div className="sidebar-header">
            <Users size={24} color="#3b82f6" />
            <div>
              <h3>Swap Calling</h3>
              <p className="session-status-badge">Doctor ↔ Doctor</p>
            </div>
          </div>

          <div style={{ padding: '10px 15px', background: plan === 'premium' ? '#fef3c7' : '#f1f5f9', borderRadius: '8px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {plan === 'premium' ? <Crown size={18} color="#d97706" /> : <User size={18} color="#64748b" />}
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: plan === 'premium' ? '#d97706' : '#64748b' }}>
              {plan === 'premium' ? 'Premium Plan' : 'Free Plan'}
            </span>
            <select 
              value={plan} 
              onChange={(e) => setPlan(e.target.value)}
              style={{ marginLeft: 'auto', padding: '2px', fontSize: '12px' }}
            >
              <option value="free">Test: Free</option>
              <option value="premium">Test: Premium</option>
            </select>
          </div>

          {matchingStatus === 'idle' && (
            <div className="sidebar-info-card">
              <h4>Preferences</h4>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>I am:</label>
                <select 
                  value={myGender} 
                  onChange={(e) => setMyGender(e.target.value)}
                  style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px' }}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Looking for:</label>
                <select 
                  value={partnerGenderPref} 
                  onChange={(e) => setPartnerGenderPref(e.target.value)}
                  style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px' }}
                >
                  <option value="any">Any</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <button 
                onClick={() => startMatchingProcess()}
                style={{ width: '100%', padding: '12px', background: '#3b82f6', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Video size={18} /> Start Video Chat
              </button>
            </div>
          )}

          {matchingStatus === 'searching' && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div className="searching-animation" style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: '50%', border: '4px solid #bfdbfe', borderTopColor: '#3b82f6', animation: 'spin 1s linear infinite' }} />
                <Users size={32} color="#3b82f6" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
              </div>
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              
              <p style={{ marginTop: '15px', fontWeight: 'bold', color: '#1e293b' }}>Finding a verified doctor...</p>
              <button 
                onClick={() => { socket.emit('end_call'); setMatchingStatus('idle'); }}
                style={{ width: '100%', padding: '10px', marginTop: '20px', background: '#ef4444', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
              >
                Cancel Search
              </button>
            </div>
          )}

          {matchingStatus === 'matched' && (
            <div className="sidebar-info-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: '#dcfce7', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ color: '#166534', fontWeight: 'bold', marginBottom: '5px' }}>Doctor Connected!</div>
                <div style={{ fontSize: '24px', fontWeight: '900', color: timer <= 10 ? '#ef4444' : '#1e293b' }}>
                  {formatTime(timer)}
                </div>
              </div>
              
              <button 
                onClick={handleNextMatch}
                style={{ width: '100%', padding: '12px', background: '#3b82f6', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <RefreshCw size={18} /> Next Match
              </button>

              <button 
                onClick={endCallUI}
                style={{ width: '100%', padding: '12px', background: '#ef4444', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <X size={18} /> Stop
              </button>
            </div>
          )}

          <div className="sidebar-security-note" style={{ marginTop: 'auto' }}>
            <div className="security-title">
              <ShieldAlert className="security-icon" size={16} />
              <span>Safety Rules</span>
            </div>
            <p style={{ fontSize: '11px' }}>Doctor to Doctor network only. Be professional and respectful. Abuse will result in an immediate permanent ban.</p>
          </div>
        </div>

        {/* Video Area */}
        <div className="video-workspace" style={{ background: '#0f172a', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          
          {matchingStatus === 'idle' && (
            <div style={{ color: 'white', textAlign: 'center', zIndex: 10 }}>
              <Video size={64} style={{ opacity: 0.3, margin: '0 auto 20px' }} />
              <h2>OmeTV for Doctors</h2>
              <p style={{ color: '#94a3b8', maxWidth: '400px', margin: '10px auto' }}>Press Start Video Chat to randomly connect with other verified doctors instantly.</p>
            </div>
          )}

          {matchingStatus === 'searching' && (
            <div style={{ color: 'white', textAlign: 'center', zIndex: 10 }}>
              <RefreshCw size={64} color="#3b82f6" style={{ margin: '0 auto 20px', animation: 'spin 2s linear infinite' }} />
              <h2>Searching...</h2>
              <p style={{ color: '#94a3b8' }}>Please wait while we find your next match.</p>
            </div>
          )}

          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover', 
              display: matchingStatus === 'matched' ? 'block' : 'none' 
            }} 
          />
          
          {/* Local Video - Picture in Picture style */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            width: '200px',
            height: '150px',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '2px solid rgba(255,255,255,0.2)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            display: (matchingStatus === 'matched' || matchingStatus === 'searching') ? 'block' : 'none',
            zIndex: 20
          }}>
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} 
            />
          </div>

        </div>
        
      </div>
    </div>
  );
};

export default SwapCalling;
