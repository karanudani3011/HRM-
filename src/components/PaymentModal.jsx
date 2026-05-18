import React, { useState } from 'react';
import { X, CheckCircle2, ShieldAlert, Award, Zap, Camera, Phone, Check } from 'lucide-react';
import './PaymentModal.css';
import { useAuth } from '../context/AuthContext';

const PaymentModal = ({ onClose }) => {
  const { user } = useAuth();
  const [selectedTier, setSelectedTier] = useState('silver');

  const tiers = [
    {
      id: 'bronze',
      name: 'Bronze',
      price: '199',
      searches: 5,
      icon: <Award size={32} />
    },
    {
      id: 'silver',
      name: 'Silver',
      price: '399',
      searches: 10,
      icon: <Zap size={32} />
    },
    {
      id: 'gold',
      name: 'Gold',
      price: '599',
      searches: 20,
      icon: <ShieldAlert size={32} />
    }
  ];

  const activeTier = tiers.find(t => t.id === selectedTier);
  const userIdentifier = user?.email || "Guest";
  const userDisplayName = user?.displayName ? ` (${user.displayName})` : "";
  const whatsappText = encodeURIComponent(
    `Hello Admin,\n\nI am selecting the ${activeTier?.name} plan (₹${activeTier?.price}) on HRM Extractor.\nMy registered email: ${userIdentifier}${userDisplayName}\n\nHere is my successful payment screenshot.`
  );

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal-container">
        <div className="payment-modal-header">
          <h2><span>HRM</span> Premium Access</h2>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </div>
        
        <div className="payment-modal-body">
          <div className="limit-reached-msg">
            You've reached your free search limit. <strong>Upgrade your account</strong> to continue extracting high-quality, verified healthcare leads.
          </div>

          <div className="pricing-tiers">
            {tiers.map(tier => (
              <div 
                key={tier.id} 
                className={`tier-card ${tier.id} ${selectedTier === tier.id ? 'selected' : ''}`}
                onClick={() => setSelectedTier(tier.id)}
              >
                <div className="tier-icon">{tier.icon}</div>
                <h3>{tier.name}</h3>
                <div className="tier-price">₹{tier.price}</div>
                <ul className="tier-features">
                  <li><CheckCircle2 size={16} className="green-icon"/> {tier.searches} Premium Searches</li>
                  <li><CheckCircle2 size={16} className="green-icon"/> Export to CSV</li>
                  <li><CheckCircle2 size={16} className="green-icon"/> Auto-Verified Contacts</li>
                </ul>
              </div>
            ))}
          </div>

          <div className="payment-section">
            <div className="payment-content">
              <div className="qr-code-box">
                {/* 
                  Requires the user to place the QR code image 
                  as payment-qr.png in the public/ folder 
                */}
                <img src="/payment-qr.png" alt="Payment QR Code" onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = "https://via.placeholder.com/200x200.png?text=Place+QR+in+Public+Folder"
                }}/>
              </div>
              
              <div className="payment-instructions">
                <h4>How to Upgrade</h4>
                <div className="step-list">
                  <div className="step-item">
                    <div className="step-icon">1</div>
                    <p>Scan the QR code using any UPI app (GPay, PhonePe, Paytm).</p>
                  </div>
                  <div className="step-item">
                    <div className="step-icon">2</div>
                    <p>Pay the amount for your selected <strong>{tiers.find(t => t.id === selectedTier)?.name}</strong> plan (₹{tiers.find(t => t.id === selectedTier)?.price}).</p>
                  </div>
                  <div className="step-item">
                    <div className="step-icon">3</div>
                    <p>Send a screenshot of your successful payment to our admin via WhatsApp to activate your searches.</p>
                  </div>
                </div>

                <a 
                  href={`https://wa.me/919879450072?text=${whatsappText}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="whatsapp-btn"
                >
                  <Phone size={18} /> Send Screenshot on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
