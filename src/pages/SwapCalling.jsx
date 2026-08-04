import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Video, User, Users, RefreshCw, X, ShieldAlert } from 'lucide-react';
import './VideoConsultation.css'; // Reusing your existing video styling

const SwapCalling = () => {
  const { user } = useAuth();
  const [matchingStatus, setMatchingStatus] = useState('idle'); // idle, searching, matched
  const [partnerGenderPref, setPartnerGenderPref] = useState('any'); // male, female, any
  const [myGender, setMyGender] = useState('male');
  
  const [jitsiRoomId, setJitsiRoomId] = useState(null);
  const [jitsiLoaded, setJitsiLoaded] = useState(false);
  const jitsiContainerRef = useRef(null);
  const apiRef = useRef(null);
  const waitingDocRef = useRef(null);

  // Load Jitsi API
  useEffect(() => {
    const scriptId = 'jitsi-external-api-script';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = () => setJitsiLoaded(true);
      document.body.appendChild(script);
    } else {
      setJitsiLoaded(true);
    }

    return () => {
      leaveMatch();
    };
  }, []);

  // Initialize Jitsi when matched
  useEffect(() => {
    if (!jitsiLoaded || !jitsiRoomId) return;

    const timeout = setTimeout(() => {
      try {
        const domain = 'meet.jit.si';
        const options = {
          roomName: `HRM_Swap_${jitsiRoomId}`,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName: user?.email ? user.email.split('@')[0] : 'Stranger',
          },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: false,
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              'microphone', 'camera', 'chat', 'hangup', 'tileview'
            ],
          }
        };

        apiRef.current = new window.JitsiMeetExternalAPI(domain, options);
        
        apiRef.current.addEventListener('videoConferenceLeft', () => {
          handleNext();
        });
      } catch (err) {
        console.error('Jitsi error:', err);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [jitsiLoaded, jitsiRoomId]);

  const cleanupWaitingDoc = async () => {
    if (waitingDocRef.current) {
      try {
        await deleteDoc(doc(db, 'waiting_room', waitingDocRef.current));
      } catch (err) {
        console.error("Error cleaning up:", err);
      }
      waitingDocRef.current = null;
    }
  };

  const leaveMatch = () => {
    if (apiRef.current) {
      apiRef.current.dispose();
      apiRef.current = null;
    }
    setJitsiRoomId(null);
    setMatchingStatus('idle');
    cleanupWaitingDoc();
  };

  const startMatching = async () => {
    setMatchingStatus('searching');
    setJitsiRoomId(null);
    if (apiRef.current) apiRef.current.dispose();

    try {
      const waitingRef = collection(db, 'waiting_room');
      // Look for someone waiting whose preference matches our gender, or they don't care.
      // Also their gender must match our preference, unless we don't care.
      
      let q = query(waitingRef, where('status', '==', 'waiting'));
      const snapshot = await getDocs(q);

      let foundMatch = null;

      for (const d of snapshot.docs) {
        const data = d.data();
        const theirGender = data.gender;
        const theyWant = data.lookingFor;
        
        const genderMatchesMe = (partnerGenderPref === 'any' || partnerGenderPref === theirGender);
        const genderMatchesThem = (theyWant === 'any' || theyWant === myGender);
        
        if (genderMatchesMe && genderMatchesThem) {
          foundMatch = d;
          break;
        }
      }

      if (foundMatch) {
        // We found someone! Pair up.
        const newRoomId = 'room-' + Math.random().toString(36).substring(7);
        
        await updateDoc(doc(db, 'waiting_room', foundMatch.id), {
          status: 'matched',
          roomId: newRoomId
        });
        
        setMatchingStatus('matched');
        setJitsiRoomId(newRoomId);
      } else {
        // Nobody found, let's wait
        const docRef = await addDoc(waitingRef, {
          userId: user?.email || 'guest',
          gender: myGender,
          lookingFor: partnerGenderPref,
          status: 'waiting',
          roomId: null,
          timestamp: new Date()
        });
        
        waitingDocRef.current = docRef.id;

        // Listen for someone to match with us
        const unsub = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists() && docSnap.data().status === 'matched') {
            setJitsiRoomId(docSnap.data().roomId);
            setMatchingStatus('matched');
            cleanupWaitingDoc();
            unsub();
          }
        });
      }

    } catch (err) {
      console.error("Matchmaking error:", err);
      setMatchingStatus('idle');
      alert("Error connecting to matching server.");
    }
  };

  const handleNext = () => {
    leaveMatch();
    startMatching(); // Start looking for next person immediately
  };

  return (
    <div className="consultation-page" style={{ height: '100vh', overflow: 'hidden' }}>
      <div className="consultation-container">
        
        {/* Sidebar Controls */}
        <div className="consultation-sidebar" style={{ width: '300px' }}>
          <div className="sidebar-header">
            <Users size={24} color="#3b82f6" />
            <div>
              <h3>Swap Calling</h3>
              <p className="session-status-badge">Random Chat</p>
            </div>
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
                onClick={startMatching}
                style={{ width: '100%', padding: '12px', background: '#3b82f6', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Video size={18} /> Start Video Chat
              </button>
            </div>
          )}

          {matchingStatus === 'searching' && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <RefreshCw className="spin" size={32} color="#3b82f6" style={{ margin: '0 auto', display: 'block' }} />
              <p style={{ marginTop: '15px', fontWeight: 'bold' }}>Looking for a random stranger...</p>
              <button 
                onClick={leaveMatch}
                style={{ width: '100%', padding: '10px', marginTop: '20px', background: '#ef4444', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
              >
                Cancel Search
              </button>
            </div>
          )}

          {matchingStatus === 'matched' && (
            <div className="sidebar-info-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: '#dcfce7', padding: '10px', borderRadius: '8px', color: '#166534', fontWeight: 'bold', textAlign: 'center' }}>
                Stranger Connected!
              </div>
              
              <button 
                onClick={handleNext}
                style={{ width: '100%', padding: '12px', background: '#f59e0b', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <RefreshCw size={18} /> Next Stranger
              </button>

              <button 
                onClick={leaveMatch}
                style={{ width: '100%', padding: '12px', background: '#ef4444', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <X size={18} /> End Call
              </button>
            </div>
          )}

          <div className="sidebar-security-note" style={{ marginTop: 'auto' }}>
            <div className="security-title">
              <ShieldAlert className="security-icon" size={16} />
              <span>Safety Rules</span>
            </div>
            <p style={{ fontSize: '11px' }}>Be polite and respectful. Nudity, harassment, and illegal behavior will result in an immediate ban.</p>
          </div>
        </div>

        {/* Video Area */}
        <div className="video-workspace" style={{ background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {matchingStatus === 'idle' && (
            <div style={{ color: 'white', textAlign: 'center' }}>
              <Video size={64} style={{ opacity: 0.5, margin: '0 auto 20px' }} />
              <h2>Ready to Swap Call?</h2>
              <p>Set your preferences and click Start to match with strangers instantly.</p>
            </div>
          )}
          
          {matchingStatus === 'searching' && (
            <div style={{ color: 'white', textAlign: 'center' }}>
              <RefreshCw className="spin" size={48} style={{ opacity: 0.7, margin: '0 auto 20px' }} />
              <h2>Searching...</h2>
              <p>Connecting you to the next available user...</p>
            </div>
          )}

          <div 
            id="jitsi-container" 
            ref={jitsiContainerRef} 
            className={`jitsi-video-frame-box ${matchingStatus === 'matched' ? 'ready' : 'hidden'}`}
            style={{ display: matchingStatus === 'matched' ? 'block' : 'none' }}
          />
        </div>
        
      </div>
    </div>
  );
};

export default SwapCalling;
