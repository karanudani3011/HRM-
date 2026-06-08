import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth } from '../firebase';
import {
  verifyPasswordResetCode,
  confirmPasswordReset
} from 'firebase/auth';
import './ResetPassword.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const oobCode = searchParams.get('oobCode');
  const mode = searchParams.get('mode');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [verifying, setVerifying] = useState(true);
  const [codeError, setCodeError] = useState('');

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);

  // Verify the reset code on mount
  useEffect(() => {
    if (!oobCode || mode !== 'resetPassword') {
      setCodeError('Invalid or missing password reset link. Please request a new one.');
      setVerifying(false);
      return;
    }

    verifyPasswordResetCode(auth, oobCode)
      .then((email) => {
        setVerifiedEmail(email);
        setVerifying(false);
      })
      .catch((err) => {
        console.error('Code verification failed:', err);
        if (err.code === 'auth/expired-action-code') {
          setCodeError('This reset link has expired. Please request a new one.');
        } else if (err.code === 'auth/invalid-action-code') {
          setCodeError('This reset link is invalid or has already been used. Please request a new one.');
        } else {
          setCodeError('Unable to verify reset link. Please try again.');
        }
        setVerifying(false);
      });
  }, [oobCode, mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!newPassword || !confirmPassword) {
      setFormError('Both fields are required.');
      return;
    }
    if (newPassword.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError('Passwords do not match. Please try again.');
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess(true);
    } catch (err) {
      console.error('Password reset confirmation failed:', err);
      if (err.code === 'auth/expired-action-code') {
        setFormError('This reset link has expired. Please request a new one.');
      } else if (err.code === 'auth/weak-password') {
        setFormError('Password is too weak. Please choose a stronger password.');
      } else {
        setFormError('Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rp-page">
      <div className="rp-card">
        {/* Header */}
        <div className="rp-header">
          <div className="rp-icon">🔐</div>
          <h1>Set New Password</h1>
          <p>
            {verifiedEmail
              ? <>Resetting password for <strong>{verifiedEmail}</strong></>
              : 'Create a new secure password for your account'}
          </p>
        </div>

        {/* Loading state */}
        {verifying && (
          <div className="rp-verifying">
            <div className="rp-spinner" />
            <span>Verifying your reset link…</span>
          </div>
        )}

        {/* Invalid code */}
        {!verifying && codeError && (
          <div className="rp-state-box rp-error-box">
            <div className="rp-state-icon">⚠️</div>
            <p>{codeError}</p>
            <button
              className="rp-btn rp-btn-primary"
              onClick={() => navigate('/portal/login')}
            >
              Back to Login
            </button>
          </div>
        )}

        {/* Success state */}
        {!verifying && !codeError && success && (
          <div className="rp-state-box rp-success-box">
            <div className="rp-state-icon">✅</div>
            <h2>Password Changed!</h2>
            <p>Your password has been successfully updated. You can now log in with your new password.</p>
            <button
              className="rp-btn rp-btn-primary"
              onClick={() => navigate('/portal/login')}
            >
              Go to Login
            </button>
          </div>
        )}

        {/* Password form */}
        {!verifying && !codeError && !success && (
          <form className="rp-form" onSubmit={handleSubmit}>
            {/* New Password */}
            <div className="rp-input-group">
              <label htmlFor="rp-new-password">New Password *</label>
              <div className="rp-password-wrapper">
                <input
                  id="rp-new-password"
                  type={showNew ? 'text' : 'password'}
                  placeholder="Enter new password (min. 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  required
                  minLength={6}
                  autoFocus
                />
                <button
                  type="button"
                  className="rp-eye-btn"
                  onClick={() => setShowNew(!showNew)}
                  tabIndex={-1}
                  aria-label={showNew ? 'Hide password' : 'Show password'}
                >
                  {showNew ? '🙈' : '👁️'}
                </button>
              </div>

              {/* Strength bar */}
              {newPassword.length > 0 && (
                <div className="rp-strength">
                  <div className={`rp-strength-bar ${
                    newPassword.length >= 10
                      ? 'strong'
                      : newPassword.length >= 6
                      ? 'medium'
                      : 'weak'
                  }`} />
                  <span className="rp-strength-label">
                    {newPassword.length >= 10 ? 'Strong' : newPassword.length >= 6 ? 'Medium' : 'Weak'}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="rp-input-group">
              <label htmlFor="rp-confirm-password">Confirm Password *</label>
              <div className="rp-password-wrapper">
                <input
                  id="rp-confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="rp-eye-btn"
                  onClick={() => setShowConfirm(!showConfirm)}
                  tabIndex={-1}
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>

              {/* Match indicator */}
              {confirmPassword.length > 0 && (
                <div className={`rp-match-hint ${newPassword === confirmPassword ? 'match' : 'no-match'}`}>
                  {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </div>
              )}
            </div>

            {/* Error */}
            {formError && (
              <div className="rp-form-error">{formError}</div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="rp-btn rp-btn-primary rp-submit"
              disabled={loading}
            >
              {loading ? (
                <span className="rp-btn-loading">
                  <span className="rp-spinner-sm" /> Updating…
                </span>
              ) : (
                'Update Password'
              )}
            </button>

            <button
              type="button"
              className="rp-btn rp-btn-ghost"
              onClick={() => navigate('/portal/login')}
              disabled={loading}
            >
              ← Back to Login
            </button>
          </form>
        )}

        <div className="rp-footer">
          By continuing, you agree to our Terms &amp; Privacy Policy
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
