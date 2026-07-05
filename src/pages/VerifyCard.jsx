import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ShieldCheck, ShieldAlert, ArrowRight } from 'lucide-react';
import './VerifyCard.css';

const VerifyCard = () => {
  const { idNo } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState(null);
  const [hospitalName, setHospitalName] = useState(null);
  const [status, setStatus] = useState('not-found'); // 'valid' | 'expired' | 'not-found'

  useEffect(() => {
    const performVerification = async () => {
      if (!idNo) {
        setLoading(false);
        return;
      }

      const cleanId = idNo.replace(/\s+/g, '').toUpperCase();
      try {
        // 1. Fetch from Supabase privilege_cards
        const { data: cardData, error: cardError } = await supabase
          .from('privilege_cards')
          .select('*')
          .eq('id_no', cleanId)
          .maybeSingle();

        if (cardError) throw cardError;

        if (cardData) {
          setCard(cardData);

          // Check expiration date (format MM/YYYY)
          const expireStr = cardData.expire_date;
          if (expireStr) {
            const parts = expireStr.split('/');
            if (parts.length === 2) {
              const expMonth = parseInt(parts[0], 10);
              const expYear = parseInt(parts[1], 10);
              const now = new Date();
              const nowMonth = now.getMonth() + 1;
              const nowYear = now.getFullYear();

              if (nowYear > expYear || (nowYear === expYear && nowMonth > expMonth)) {
                setStatus('expired');
              } else {
                setStatus('valid');
              }
            } else {
              setStatus('valid');
            }
          } else {
            setStatus('valid');
          }

          // 2. Fetch associated hospital/partner name from Firestore adminAccess
          if (db) {
            const q = query(
              collection(db, 'adminAccess'),
              where('cardId', '==', cleanId)
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              const partnerData = querySnapshot.docs[0].data();
              setHospitalName(partnerData.name || partnerData.username);
            }
          }
        } else {
          setStatus('not-found');
        }
      } catch (err) {
        console.error('Verification error:', err);
        setStatus('not-found');
      } finally {
        setLoading(false);
      }
    };

    performVerification();
  }, [idNo]);

  const handleRegisterClick = () => {
    if (card) {
      const cleanId = card.id_no;
      navigate(`/portal/user/register?ref=${cleanId}`);
    }
  };

  return (
    <div className="verify-card-page">
      {/* Dark metallic background decoration */}
      <div className="vc-bg-glow vc-glow-1" />
      <div className="vc-bg-glow vc-glow-2" />

      <div className="verify-card-container">
        {/* Logo */}
        <div className="verify-logo">
          <img src="/logo.jpeg" alt="HRM Logo" className="verify-logo-img" />
        </div>

        <p className="verify-tagline">HRM CONSULTANCY · VOLUTORS CHOICE</p>

        {loading ? (
          <div className="verify-loading">
            <div className="verify-spinner" />
            <p>Verifying HRM Privilege ID Card...</p>
          </div>
        ) : (
          <>
            {status === 'valid' && (
              <>
                <div className="verify-status-badge valid">
                  <ShieldCheck size={18} /> Verified Active Card
                </div>

                {hospitalName && (
                  <div className="verify-hospital-info">
                    <h3>🏥 Official HRM Network Partner</h3>
                    <p>Verified under partner: <strong>{hospitalName}</strong></p>
                  </div>
                )}

                {/* Card Preview */}
                <div className="verify-card-preview">
                  <div className="vc-metal-overlay" />
                  <div className="vc-card-logo-row">
                    <img src="/logo.jpeg" alt="HRM" className="vc-card-logo" />
                  </div>
                  <p className="vc-card-tagline">HRM CONSULTANCY / VOLUTORS CHOICE</p>

                  <div className="vc-detail-list">
                    <div className="vc-detail-row">
                      <span className="vc-dl">Name:</span>
                      <span className="vc-dv">{card.name}</span>
                    </div>
                    {card.city && (
                      <div className="vc-detail-row">
                        <span className="vc-dl">City</span>
                        <span className="vc-dv">{card.city}</span>
                      </div>
                    )}
                    <div className="vc-detail-row">
                      <span className="vc-dl">Card status</span>
                      <span className="vc-dv vc-active">{card.card_status || 'ACTIVE'}</span>
                    </div>
                    {card.mobile && (
                      <div className="vc-detail-row">
                        <span className="vc-dl">Mo.</span>
                        <span className="vc-dv">{card.mobile}</span>
                      </div>
                    )}
                    <div className="vc-detail-row">
                      <span className="vc-dl">HRM ID:</span>
                      <span className="vc-dv">{card.id_no}</span>
                    </div>
                  </div>

                  {card.photo_url && (
                    <div className="vc-card-photo-row">
                      <img src={card.photo_url} alt="Member" className="vc-card-photo" />
                    </div>
                  )}

                  <div className="vc-card-footer">
                    <span>FOR HRM TERMS</span>
                    <span>www.myhrm.co.in</span>
                  </div>
                </div>

                <div className="verify-actions">
                  <button onClick={handleRegisterClick} className="verify-btn-primary">
                    Register with this Code <ArrowRight size={18} />
                  </button>
                  <Link to="/" className="verify-btn-secondary">
                    Visit Main Website
                  </Link>
                </div>
              </>
            )}

            {status === 'expired' && (
              <>
                <div className="verify-status-badge expired">
                  <ShieldAlert size={18} /> Card Expired
                </div>

                <div className="verify-card-details">
                  <div className="verify-detail-row">
                    <span className="verify-detail-label">Card Holder Name</span>
                    <span className="verify-detail-value">{card.name}</span>
                  </div>
                  <div className="verify-detail-row">
                    <span className="verify-detail-label">HRM ID</span>
                    <span className="verify-detail-value">{card.id_no}</span>
                  </div>
                  {card.city && (
                    <div className="verify-detail-row">
                      <span className="verify-detail-label">City</span>
                      <span className="verify-detail-value">{card.city}</span>
                    </div>
                  )}
                  <div className="verify-detail-row">
                    <span className="verify-detail-label">Expired On</span>
                    <span className="verify-detail-value" style={{ color: '#f87171' }}>{card.expire_date}</span>
                  </div>
                </div>

                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '30px', lineHeight: 1.6 }}>
                  This HRM Privilege Card has expired. Please contact support or renew your card.
                </p>

                <div className="verify-actions">
                  <Link to="/contact" className="verify-btn-primary" style={{ textDecoration: 'none' }}>
                    Contact Support
                  </Link>
                  <Link to="/" className="verify-btn-secondary">
                    Visit Main Website
                  </Link>
                </div>
              </>
            )}

            {status === 'not-found' && (
              <>
                <div className="verify-status-badge not-found">
                  <ShieldAlert size={18} /> Unverified Card
                </div>

                <p style={{ color: '#cbd5e1', fontSize: '16px', fontWeight: '500', marginBottom: '10px' }}>
                  Invalid Card ID
                </p>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '30px', lineHeight: 1.6 }}>
                  We could not find any active HRM Privilege ID Card matching the sequence <strong>{idNo}</strong>.
                </p>

                <div className="verify-actions">
                  <Link to="/" className="verify-btn-primary" style={{ textDecoration: 'none' }}>
                    Go to Homepage
                  </Link>
                  <Link to="/contact" className="verify-btn-secondary">
                    Contact Us
                  </Link>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyCard;
