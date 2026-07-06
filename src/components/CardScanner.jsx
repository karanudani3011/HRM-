import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '../lib/supabase';
import { ShieldCheck, ShieldAlert, User, Calendar, CreditCard, Loader2 } from 'lucide-react';
import './CardScanner.css';

const CardScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [status, setStatus] = useState(null); // 'valid' | 'expired' | 'not-found'
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(onScanSuccess, onScanFailure);
    scannerRef.current = scanner;

    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
  }, []);

  const fetchPatientData = async (cardId) => {
    setLoading(true);
    setStatus(null);
    setPatientData(null);
    try {
      const cleanId = cardId.replace(/\s+/g, '').toUpperCase();
      const { data: cardData, error: cardError } = await supabase
        .from('privilege_cards')
        .select('*')
        .eq('id_no', cleanId)
        .maybeSingle();

      if (cardError) throw cardError;

      if (cardData) {
        setPatientData(cardData);
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
      } else {
        setStatus('not-found');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setStatus('not-found');
    } finally {
      setLoading(false);
    }
  };

  const onScanSuccess = (decodedText, decodedResult) => {
    // If the scanner hasn't cleared or we already have a result, don't re-scan immediately
    if (loading) return;

    // Handle URLs or raw IDs
    let cardId = decodedText;
    const match = decodedText.match(/verify\/([A-Za-z0-9]+)/);
    if (match && match[1]) {
      cardId = match[1];
    }
    
    setScanResult(cardId);
    
    // Pause the scanner to prevent multiple scans
    if (scannerRef.current) {
        scannerRef.current.pause(true);
    }

    fetchPatientData(cardId);
  };

  const onScanFailure = (error) => {
    // handle scan failure, usually better to ignore and keep scanning
    // console.warn(`Code scan error = ${error}`);
  };

  const handleReset = () => {
    setScanResult(null);
    setPatientData(null);
    setStatus(null);
    if (scannerRef.current) {
        scannerRef.current.resume();
    }
  };

  return (
    <div className="card-scanner-container">
      <h2 className="card-scanner-title">Patient Privilege Card Scanner</h2>
      <p className="card-scanner-subtitle">Scan the QR code on the patient's HRM Privilege Card to verify their details and validity.</p>
      
      <div className="card-scanner-layout">
        {/* Scanner Area */}
        <div className="scanner-section">
            <div id="qr-reader" className="qr-reader-box"></div>
            {scanResult && (
                <button onClick={handleReset} className="scanner-reset-btn">
                    Scan Another Card
                </button>
            )}
        </div>

        {/* Results Area */}
        <div className="results-section">
            {loading ? (
                <div className="results-loading">
                    <Loader2 className="spinning" size={48} color="#3498db" />
                    <p>Verifying Card Data...</p>
                </div>
            ) : status ? (
                <div className="results-card">
                    {status === 'valid' && (
                        <div className="status-banner valid">
                            <ShieldCheck size={24} /> 
                            <span>Verified Active Card</span>
                        </div>
                    )}
                    {status === 'expired' && (
                        <div className="status-banner expired">
                            <ShieldAlert size={24} /> 
                            <span>Card Expired</span>
                        </div>
                    )}
                    {status === 'not-found' && (
                        <div className="status-banner not-found">
                            <ShieldAlert size={24} /> 
                            <span>Unverified or Invalid Card</span>
                        </div>
                    )}

                    {patientData && (
                        <div className="patient-details">
                            <div className="detail-item">
                                <div className="detail-icon"><User size={18} /></div>
                                <div className="detail-text">
                                    <label>Patient Name</label>
                                    <p>{patientData.name}</p>
                                </div>
                            </div>
                            <div className="detail-item">
                                <div className="detail-icon"><CreditCard size={18} /></div>
                                <div className="detail-text">
                                    <label>Card ID Number</label>
                                    <p>{patientData.id_no}</p>
                                </div>
                            </div>
                            <div className="detail-item">
                                <div className="detail-icon"><Calendar size={18} /></div>
                                <div className="detail-text">
                                    <label>Join Date</label>
                                    <p>{patientData.join_date}</p>
                                </div>
                            </div>
                            <div className="detail-item">
                                <div className="detail-icon"><Calendar size={18} /></div>
                                <div className="detail-text">
                                    <label>Valid Up To</label>
                                    <p style={{ color: status === 'expired' ? '#e74c3c' : 'inherit' }}>{patientData.expire_date}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!patientData && status === 'not-found' && (
                        <div className="not-found-msg">
                            <p>No records found for ID: <strong>{scanResult}</strong></p>
                            <p>Please ensure this is a valid HRM Privilege Card.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="results-placeholder">
                    <p>Waiting for scan...</p>
                    <p className="small-text">Align the QR code within the frame to automatically fetch patient records.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default CardScanner;
