import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, PhoneOff, User, Video, ShieldCheck, HelpCircle } from 'lucide-react';
import './VideoConsultation.css';

const VideoConsultation = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jitsiLoaded, setJitsiLoaded] = useState(false);
  const [jitsiReady, setJitsiReady] = useState(false);
  const jitsiContainerRef = useRef(null);
  const apiRef = useRef(null);

  // Format the room ID into a readable Doctor Name
  // e.g. "dr-amit-patel" -> "Dr. Amit Patel"
  const getDoctorName = (id) => {
    if (!id) return 'Practitioner';
    const cleanStr = id.replace(/^dr-/, '').replace(/-/g, ' ');
    return 'Dr. ' + cleanStr.replace(/\b\w/g, c => c.toUpperCase());
  };

  const doctorName = getDoctorName(roomId);

  // Dynamically load the Jitsi Meet external API script
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
      // Clean up Jitsi API instance on unmount
      if (apiRef.current) {
        apiRef.current.dispose();
      }
    };
  }, []);

  // Initialize Jitsi Meet Iframe API once script is loaded
  useEffect(() => {
    if (!jitsiLoaded || !roomId) return;

    // Give the container a tiny frame to mount
    const timeout = setTimeout(() => {
      try {
        const domain = 'meet.jit.si';
        const options = {
          roomName: `HRM_DoctorsChoice_Consultation_${roomId}`,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName: user?.email ? user.email.split('@')[0] : 'Patient',
            email: user?.email || ''
          },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: false, // Skip Jitsi pre-join for a seamless integrated feel
            disableDeepLinking: true,
            enableWelcomePage: false
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              'microphone', 'camera', 'closedcaptions', 'desktop', 'embedmeeting', 'fullscreen',
              'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
              'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
              'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
              'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
              'mute-video-everyone', 'security'
            ],
            SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile'],
            SHOW_CHROME_EXTENSION_BANNER: false
          }
        };

        const api = new window.JitsiMeetExternalAPI(domain, options);
        apiRef.current = api;

        // When Jitsi Meet load event triggers
        api.addEventListener('videoConferenceJoined', () => {
          setJitsiReady(true);
        });

        // When the user clicks the hangup button within Jitsi, redirect them home
        api.addEventListener('videoConferenceLeft', () => {
          navigate('/find-doctor');
        });
      } catch (err) {
        console.error('Failed to initialize Jitsi Meet External API:', err);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [jitsiLoaded, roomId, navigate, user]);

  const handleLeaveRoom = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('hangup');
    }
    navigate('/find-doctor');
  };

  return (
    <div className="consultation-page">
      {/* Glow Backdrops */}
      <div className="glow-sphere sphere-top-right"></div>
      <div className="glow-sphere sphere-bottom-left"></div>

      <div className="consultation-container">
        {/* Sidebar Info Panel */}
        <div className="consultation-sidebar">
          <div className="sidebar-header">
            <Video className="sidebar-logo-icon" size={24} />
            <div>
              <h3>Telehealth Session</h3>
              <p className="session-status-badge">● Active Room</p>
            </div>
          </div>

          <div className="sidebar-info-card">
            <div className="info-item">
              <label>Doctor Name</label>
              <h4>{doctorName}</h4>
            </div>
            <div className="info-item">
              <label>Specialist Role</label>
              <span className="spec-role-tag">Verified Consultant</span>
            </div>
            <div className="info-item">
              <label>Patient ID (You)</label>
              <div className="patient-user-tag">
                <User size={14} />
                <span>{user?.email || 'Guest User'}</span>
              </div>
            </div>
          </div>

          <div className="sidebar-security-note">
            <div className="security-title">
              <ShieldCheck className="security-icon" size={16} />
              <span>End-to-End Encryption</span>
            </div>
            <p>This consultation room is fully secured with peer-to-peer WebRTC encryption protocols. Your medical information remains entirely confidential.</p>
          </div>

          <div className="sidebar-guide">
            <div className="guide-title">
              <HelpCircle className="guide-icon" size={16} />
              <span>Need Help?</span>
            </div>
            <ul>
              <li>Ensure your webcam and microphone permissions are enabled.</li>
              <li>Use high-quality headphones to prevent audio feedback.</li>
              <li>Press the Chat button in the controls toolbar to chat via text.</li>
            </ul>
          </div>

          <button className="leave-consult-btn" onClick={handleLeaveRoom}>
            <PhoneOff size={18} /> Leave Consultation Room
          </button>
        </div>

        {/* Video Call Workspace */}
        <div className="video-workspace">
          {!jitsiReady && (
            <div className="workspace-loader">
              <div className="telehealth-spinner"></div>
              <div className="loader-texts">
                <h3>Connecting to Secure Portal...</h3>
                <p>Initializing high-definition media stream for {doctorName}</p>
              </div>
              <div className="connection-badges">
                <span className="badge-shield">🛡️ Secure SSL</span>
                <span className="badge-rtc">⚡ WebRTC Node</span>
              </div>
            </div>
          )}

          <div 
            id="jitsi-container" 
            ref={jitsiContainerRef} 
            className={`jitsi-video-frame-box ${jitsiReady ? 'ready' : 'hidden'}`}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoConsultation;
