import React, { useState, useEffect, useRef } from 'react';
import './AdPopup.css';

import { useAuth } from '../context/AuthContext';

const AD_DURATION = 10;   // seconds each ad is visible
const AD_GAP      = 10;   // seconds between ads

const ADS = [
  {
    id: 'ad-advocate',
    src: '/advocate-ad.png',
    alt: 'We Are Hiring Advocate – HRM Consultancy',
    link: 'tel:+919879450072',
    title: 'HRM Consultancy – Hiring Advocate',
  },
  {
    id: 'ad-astrology',
    src: '/astrology-ad.jpg',
    alt: 'Workspace Astrology – Niravbhai Pandya, Rajkot',
    link: 'https://wa.me/919537441596',
    title: 'Workspace Astrology',
  },
  {
    id: 'ad-developer',
    src: '/developer-ad.jpg',
    alt: 'Building Digital Experiences – Karan Udani & Jeel Dave',
    link: 'tel:+918488889194',
    title: 'Professional Web & App Development',
  },
];

const AdPopup = () => {
  const { user } = useAuth();
  const [phase, setPhase]         = useState('gap');   // 'show' | 'gap' | 'done'
  const [adIndex, setAdIndex]     = useState(0);
  const [countdown, setCountdown] = useState(AD_DURATION);
  const [closing, setClosing]     = useState(false);
  const timerRef = useRef(null);

  // ── Main sequencer triggered on login ───────────────────────────
  useEffect(() => {
    if (user?.uid) {
      // Small initial delay before first ad
      const boot = setTimeout(() => startAd(0), 800);
      return () => clearTimeout(boot);
    } else {
      setPhase('gap');
    }
  }, [user?.uid]);

  const startAd = (index) => {
    if (index >= ADS.length) { setPhase('done'); return; }
    setAdIndex(index);
    setCountdown(AD_DURATION);
    setClosing(false);
    setPhase('show');
  };

  const closeAd = (index) => {
    setClosing(true);
    timerRef.current && clearInterval(timerRef.current);
    setTimeout(() => {
      setPhase('gap');
      // After gap, show next ad
      if (index + 1 < ADS.length) {
        timerRef.current = setTimeout(() => startAd(index + 1), AD_GAP * 1000);
      } else {
        setPhase('done');
      }
    }, 550);
  };

  // ── Countdown ticker while ad is visible ─────────────────────
  useEffect(() => {
    if (phase !== 'show') return;

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          closeAd(adIndex);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [phase, adIndex]);

  // ── Nothing to render ────────────────────────────────────────
  if (!user || phase === 'done' || phase === 'gap') return null;

  const ad       = ADS[adIndex];
  const progress = ((AD_DURATION - countdown) / AD_DURATION) * 100;

  return (
    <div className="adp-overlay" id="ad-overlay">
      <div className={`adp-modal ${closing ? 'adp-closing' : 'adp-opening'}`} id={ad.id}>

        {/* Top bar */}
        <div className="adp-topbar">
          <span className="adp-label">📢 Advertisement</span>
          <div className="adp-controls">
            {/* Circular countdown */}
            <div className="adp-ring-wrap">
              <svg viewBox="0 0 36 36" className="adp-ring-svg">
                <circle className="adp-ring-bg"   cx="18" cy="18" r="15.9" />
                <circle
                  className="adp-ring-fill"
                  cx="18" cy="18" r="15.9"
                  strokeDasharray={`${progress}, 100`}
                />
              </svg>
              <span className="adp-ring-num">{countdown}</span>
            </div>
            <button
              className="adp-close-btn"
              onClick={() => closeAd(adIndex)}
              id={`close-${ad.id}`}
              aria-label="Close ad"
            >✕</button>
          </div>
        </div>

        {/* Ad image */}
        <a
          href={ad.link}
          className="adp-img-link"
          title={ad.title}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={ad.src}
            alt={ad.alt}
            className="adp-poster"
          />
        </a>

        {/* Progress bar */}
        <div className="adp-progress-track">
          <div className="adp-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Ad counter dots */}
        <div className="adp-dots">
          {ADS.map((_, i) => (
            <span key={i} className={`adp-dot ${i === adIndex ? 'adp-dot-active' : i < adIndex ? 'adp-dot-done' : ''}`} />
          ))}
        </div>

      </div>
    </div>
  );
};

export default AdPopup;
