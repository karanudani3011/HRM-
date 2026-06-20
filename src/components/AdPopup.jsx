import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [phase, setPhase]         = useState('idle');  // 'idle' | 'show' | 'gap' | 'done'
  const [adIndex, setAdIndex]     = useState(0);
  const [countdown, setCountdown] = useState(AD_DURATION);
  const [closing, setClosing]     = useState(false);

  // ── Two SEPARATE refs to prevent timer conflicts ─────────────────
  const tickRef = useRef(null);   // countdown setInterval
  const gapRef  = useRef(null);   // inter-ad gap setTimeout

  const clearAll = () => {
    if (tickRef.current) { clearInterval(tickRef.current);  tickRef.current = null; }
    if (gapRef.current)  { clearTimeout(gapRef.current);    gapRef.current  = null; }
  };

  const startAd = useCallback((index) => {
    if (index >= ADS.length) { setPhase('done'); return; }
    clearAll();
    setAdIndex(index);
    setCountdown(AD_DURATION);
    setClosing(false);
    setPhase('show');
  }, []);

  // ── Trigger ad sequence on login ─────────────────────────────────
  useEffect(() => {
    if (user?.uid) {
      gapRef.current = setTimeout(() => startAd(0), 800);
    } else {
      clearAll();
      setPhase('idle');
    }
    return () => clearAll();
  }, [user?.uid, startAd]);

  // ── Countdown ticker (only while an ad is visible) ───────────────
  useEffect(() => {
    if (phase !== 'show') return;

    tickRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Let closeAd handle the transition — stop interval here
          clearInterval(tickRef.current);
          tickRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
    };
  }, [phase, adIndex]);

  // ── When countdown reaches 0, auto-advance ───────────────────────
  useEffect(() => {
    if (countdown === 0 && phase === 'show') {
      closeAd(adIndex);
    }
  }, [countdown]);

  const closeAd = useCallback((index) => {
    // Stop countdown
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }

    setClosing(true);

    // After closing animation (550ms), either gap → next ad or finish
    setTimeout(() => {
      if (index + 1 < ADS.length) {
        setPhase('gap');
        // Use gapRef (separate from tickRef!) to schedule next ad
        gapRef.current = setTimeout(() => startAd(index + 1), AD_GAP * 1000);
      } else {
        setPhase('done');
      }
    }, 550);
  }, [startAd]);

  // ── Nothing to render ────────────────────────────────────────────
  if (!user || phase === 'done' || phase === 'gap' || phase === 'idle') return null;

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
            <span
              key={i}
              className={`adp-dot ${i === adIndex ? 'adp-dot-active' : i < adIndex ? 'adp-dot-done' : ''}`}
            />
          ))}
        </div>

      </div>
    </div>
  );
};

export default AdPopup;
