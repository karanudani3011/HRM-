import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import { Lock, Mail, RefreshCw, ShieldCheck } from 'lucide-react';
import './EmailOTP.css';

const EmailOTP = ({ onVerified }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [loading, setLoading] = useState(false);

  const sendOTP = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    // Generate 6 digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);

    const templateParams = {
      to_email: email,
      otp: newOtp,
    };

    try {
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      if (!serviceId || !templateId || !publicKey) {
        throw new Error('EmailJS keys are missing in .env file');
      }

      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      setStep(2);
    } catch (error) {
      console.error('EmailJS Error:', error);
      alert('Error sending OTP. Please check your .env configuration and EmailJS dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = (e) => {
    e.preventDefault();
    if (otp === generatedOtp) {
      onVerified(email);
    } else {
      alert('Invalid verification code. Please try again.');
    }
  };

  return (
    <div className="otp-overlay">
      <div className="otp-modal">
        <div className="otp-header">
          <div className="lock-circle">
            <Lock size={28} />
          </div>
          <h2>Security Check</h2>
          <p>
            {step === 1 
              ? "This premium tool requires verification. Enter your email to receive an access code." 
              : `We've sent a 6-digit code to ${email}. Please enter it below.`}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={sendOTP}>
            <input 
              type="email" 
              placeholder="Enter your email address" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" disabled={loading}>
              {loading ? <RefreshCw className="spin" size={18} /> : 'Get Access Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOTP}>
            <input 
              className="otp-input-field"
              type="text" 
              placeholder="0 0 0 0 0 0" 
              maxLength="6"
              required 
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              autoFocus
            />
            <button type="submit">Verify & Unlock Access</button>
            <div className="resend" onClick={() => setStep(1)}>
              Didn't receive code? Change email
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EmailOTP;
