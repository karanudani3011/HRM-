import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ShieldCheck, ShieldAlert, ArrowRight, Loader2 } from 'lucide-react';
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
      <div className="verify-card-container">
        <div className="verify-logo">
          <img src="/logo.jpeg" alt="HRM Logo" className="verify-logo-img" />
        </div>

        {loading ? (
          <div className="verify-loading">
            <div className="verify-spinner"></div>
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
                    <h3>🏥 Official Hospital Partner</h3>
                    <p>This card belongs to or is verified under our premium partner, <strong>{hospitalName}</strong>.</p>
                  </div>
                )}

                <div className="verify-card-details">
                  <div className="verify-detail-row">
                    <span className="verify-detail-label">Card Holder Name</span>
                    <span className="verify-detail-value">{card.name}</span>
                  </div>
                  <div className="verify-detail-row">
                    <span className="verify-detail-label">ID Number</span>
                    <span className="verify-detail-value">{card.id_no}</span>
                  </div>
                  <div className="verify-detail-row">
                    <span className="verify-detail-label">Registration Date</span>
                    <span className="verify-detail-value">{card.join_date}</span>
                  </div>
                  <div className="verify-detail-row">
                    <span className="verify-detail-label">Valid Up To</span>
                    <span className="verify-detail-value">{card.expire_date}</span>
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
                    <span className="verify-detail-label">ID Number</span>
                    <span className="verify-detail-value">{card.id_no}</span>
                  </div>
                  <div className="verify-detail-row">
                    <span className="verify-detail-label">Expired On</span>
                    <span className="verify-detail-value" style={{ color: '#f87171' }}>{card.expire_date}</span>
                  </div>
                </div>

                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '30px', lineHeight: 1.6 }}>
                  This HRM Privilege Card has expired. Please contact support or renew the card details.
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
