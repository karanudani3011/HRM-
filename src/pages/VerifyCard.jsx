import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ShieldCheck, ShieldAlert, ArrowRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import './VerifyCard.css';

const VerifyCard = () => {
  const { idNo } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState(null);
  const [hospitalName, setHospitalName] = useState(null);
  const [status, setStatus] = useState('not-found'); // 'valid' | 'expired' | 'not-found'
  const [requestSent, setRequestSent] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);

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

          // Force inactive/expired visual if card_status is explicitly set to INACTIVE or PENDING_ACTIVATION
          if (cardData.card_status === 'INACTIVE' || cardData.card_status === 'PENDING_ACTIVATION' || cardData.card_status === 'PENDING') {
            setStatus('expired');
          } else {
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

          // Log this public/native phone scan to the database
          try {
            await supabase.from('card_scans').insert([{
              card_id: cleanId,
              patient_name: cardData.name,
              hospital_username: 'Public Scan',
              hospital_name: 'Phone Camera / Web',
              status: cardData.card_status === 'INACTIVE' || cardData.card_status === 'PENDING_ACTIVATION' || cardData.card_status === 'PENDING' ? 'expired' : 'valid'
            }]);
          } catch (logErr) {
            console.error('Failed to log public scan:', logErr);
          }
        } else {
          setStatus('not-found');
          
          // Log failed public scan
          try {
            await supabase.from('card_scans').insert([{
              card_id: cleanId,
              patient_name: 'Unknown',
              hospital_username: 'Public Scan',
              hospital_name: 'Phone Camera / Web',
              status: 'not-found'
            }]);
          } catch (logErr) {}
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

  const handleRequestActivation = async () => {
    if (!card) return;
    setRequestLoading(true);
    try {
      const { error } = await supabase
        .from('privilege_cards')
        .update({ card_status: 'PENDING_ACTIVATION' })
        .eq('id_no', card.id_no);

      if (error) throw error;
      
      setRequestSent(true);
      setCard(prev => ({ ...prev, card_status: 'PENDING_ACTIVATION' }));
    } catch (err) {
      console.error('Failed to submit activation request:', err);
      alert('Failed to submit request. Please try again or contact support.');
    } finally {
      setRequestLoading(false);
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
          <img src="/logo.png" alt="HRM Logo" className="verify-logo-img" />
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
                    <div className="vc-card-logo-text">{card.card_name || 'HRM'}</div>
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

                  <div className="vc-photo-qr-section">
                    <div className="vc-card-photo-row">
                      {card.photo_url ? (
                        <img src={card.photo_url} alt="Member" className="vc-card-photo" />
                      ) : (
                        <div className="vc-photo-placeholder" />
                      )}
                    </div>
                    <div className="vc-qr-frame">
                      <QRCodeSVG 
                        value={card.id_no} 
                        size={54} 
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                  </div>

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
                  <ShieldAlert size={18} /> Card Inactive / Expired
                </div>

                {/* Card Preview with Inactive label */}
                <div className="verify-card-preview" style={{ opacity: 0.8, filter: 'grayscale(0.2)' }}>
                  <div className="vc-metal-overlay" />
                  <div className="vc-card-logo-row">
                    <div className="vc-card-logo-text">{card.card_name || 'HRM'}</div>
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

                  <div className="vc-photo-qr-section">
                    <div className="vc-card-photo-row">
                      {card.photo_url ? (
                        <img src={card.photo_url} alt="Member" className="vc-card-photo" />
                      ) : (
                        <div className="vc-photo-placeholder" />
                      )}
                    </div>
                    <div className="vc-qr-frame">
                      <QRCodeSVG 
                        value={card.id_no} 
                        size={54} 
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                  </div>

                  <div className="vc-card-footer">
                    <span>FOR HRM TERMS</span>
                    <span>www.myhrm.co.in</span>
                  </div>
                </div>

                {/* Renewal Payment Section */}
                <div className="renewal-payment-box" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '20px', borderRadius: '16px', marginBottom: '24px', textAlign: 'center' }}>
                  <h4 style={{ color: '#f87171', margin: '0 0 8px 0', fontSize: '16px' }}>💳 Scan to Reactivate / Renew</h4>
                  <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                    This card is inactive or has expired. Scan the UPI QR code to pay your renewal fee, then submit the activation request.
                  </p>
                  
                  <div className="payment-qr-wrapper" style={{ background: '#fff', padding: '12px', borderRadius: '12px', display: 'inline-block', marginBottom: '12px' }}>
                    <QRCodeSVG 
                      value={`upi://pay?pa=hrmconsultancy@okaxis&pn=HRM%20Consultancy&am=100&cu=INR`} 
                      size={150}
                      level="M"
                    />
                  </div>
                  
                  <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 12px 0' }}>
                    UPI ID: <strong style={{ color: '#fff' }}>hrmconsultancy@okaxis</strong>
                  </p>

                  <div>
                    {card.card_status === 'PENDING_ACTIVATION' || requestSent ? (
                      <div className="request-sent-badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>
                        ⏳ Approval Pending (Admin is verifying)
                      </div>
                    ) : (
                      <button 
                        onClick={handleRequestActivation} 
                        disabled={requestLoading} 
                        className="verify-btn-primary"
                        style={{ width: '100%', cursor: 'pointer' }}
                      >
                        {requestLoading ? 'Submitting Request...' : 'Send Activation / Renewal Request'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="verify-actions">
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
