import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User as UserIcon, Phone, Sparkles, Key } from 'lucide-react';
import { API_URL } from '../config';

const AuthModal = () => {
  const { 
    showAuthModal, 
    setShowAuthModal, 
    authModalPurpose, 
    setAuthModalPurpose, 
    login, 
    register 
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Recovery flow states
  const [recoveryStep, setRecoveryStep] = useState(0); // 0 = standard, 1 = request otp, 2 = verify and reset
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [recoveryOtp, setRecoveryOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  if (!showAuthModal) return null;

  const handleToggleMode = () => {
    setError('');
    setSuccessMsg('');
    setAuthModalPurpose(authModalPurpose === 'login' ? 'signup' : 'login');
  };

  const handleBackToLogin = () => {
    setError('');
    setSuccessMsg('');
    setRecoveryStep(0);
    setAuthModalPurpose('login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (authModalPurpose === 'login') {
        await login(email, password);
      } else {
        // Enforce exact 10-digit Indian mobile number validation (starting with 6-9)
        const phoneClean = phone.trim().replace(/\D/g, '');
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phoneClean)) {
          setError('Please enter a valid 10-digit Indian mobile number (starting with 6-9)');
          setLoading(false);
          return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          setError('Please enter a valid email address');
          setLoading(false);
          return;
        }
        
        await register(name, email, phoneClean, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRecovery = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: recoveryIdentifier })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification request failed');

      setSuccessMsg(data.message);
      setRecoveryStep(2);
    } catch (err) {
      setError(err.message || 'Unable to process request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: recoveryIdentifier,
          otp: recoveryOtp,
          password: newPassword
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Password reset failed');

      setSuccessMsg('Your password has been successfully reset! Redirecting to login...');
      setTimeout(() => {
        setRecoveryStep(0);
        setAuthModalPurpose('login');
        setEmail(recoveryIdentifier.includes('@') ? recoveryIdentifier : '');
        setPassword('');
        setError('');
        setSuccessMsg('');
      }, 2500);
    } catch (err) {
      setError(err.message || 'Unable to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.3s ease-out forwards',
      padding: '20px'
    }}>
      <div 
        className="glass-panel-dark"
        style={{
          width: '100%',
          maxWidth: '450px',
          borderRadius: '8px',
          padding: '40px',
          position: 'relative',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3), 0 0 20px rgba(212, 175, 55, 0.1)',
          animation: 'slideUp 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) forwards',
          textAlign: 'center'
        }}
      >
        {/* Close Button */}
        <button 
          onClick={() => setShowAuthModal(false)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: '#888888',
            cursor: 'pointer',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.color = '#D4AF37'}
          onMouseLeave={(e) => e.target.style.color = '#888888'}
        >
          <X size={20} />
        </button>

        {/* Brand Logo & Heading */}
        <div style={{ display: 'inline-flex', marginBottom: '16px' }}>
          <img 
            src="/logo.png" 
            alt="Shri Navrang Jewellers Logo" 
            style={{
              height: '80px',
              width: 'auto',
              objectFit: 'contain',
              mixBlendMode: 'screen',
              filter: 'invert(1) hue-rotate(180deg) brightness(1.1) contrast(1.2)'
            }} 
          />
        </div>

        <h3 style={{ fontSize: '1.6rem', color: 'var(--white)', fontWeight: 600, fontFamily: 'var(--font-title)', marginBottom: '8px' }}>
          Shri Navrang Jewellers
        </h3>

        <p style={{ color: 'var(--gold)', fontSize: '0.85rem', letterSpacing: '0.5px', marginBottom: '24px', fontWeight: 500 }}>
          {recoveryStep === 1 && "Reset your luxury account credentials."}
          {recoveryStep === 2 && "Enter verification details to finalize."}
          {recoveryStep === 0 && (authModalPurpose === 'login' 
            ? "Please login or create an account to continue." 
            : "Register to curate your premium jewelry collection.")}
        </p>

        {error && (
          <div style={{
            backgroundColor: 'rgba(211, 47, 47, 0.15)',
            border: '1px solid #d32f2f',
            color: '#ff6b6b',
            borderRadius: '4px',
            padding: '10px 14px',
            fontSize: '0.85rem',
            textAlign: 'left',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {successMsg && (
          <div style={{
            backgroundColor: 'rgba(212, 175, 55, 0.15)',
            border: '1px solid var(--gold)',
            color: 'var(--gold)',
            borderRadius: '4px',
            padding: '10px 14px',
            fontSize: '0.85rem',
            textAlign: 'left',
            marginBottom: '20px'
          }}>
            {successMsg}
          </div>
        )}

        {/* 1. Request Recovery OTP */}
        {recoveryStep === 1 && (
          <form onSubmit={handleRequestRecovery} style={{ textAlign: 'left' }}>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label style={{ color: 'rgba(255,255,255,0.7)' }}>Email or Mobile Number</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#888888" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="Enter registered email or phone"
                  value={recoveryIdentifier}
                  onChange={(e) => setRecoveryIdentifier(e.target.value)}
                  required
                  style={{
                    backgroundColor: 'var(--black)',
                    border: '1px solid var(--charcoal-light)',
                    color: '#ffffff',
                    paddingLeft: '42px'
                  }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-gold"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '14px', marginBottom: '20px' }}
            >
              {loading ? 'Sending Code...' : 'Send Verification OTP'}
            </button>
          </form>
        )}

        {/* 2. Verify OTP & Reset Password */}
        {recoveryStep === 2 && (
          <form onSubmit={handleResetPassword} style={{ textAlign: 'left' }}>
            <div className="form-group">
              <label style={{ color: 'rgba(255,255,255,0.7)' }}>6-Digit OTP Code</label>
              <div style={{ position: 'relative' }}>
                <Key size={18} color="#888888" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="Enter 6-digit OTP code"
                  maxLength={6}
                  value={recoveryOtp}
                  onChange={(e) => setRecoveryOtp(e.target.value)}
                  required
                  style={{
                    backgroundColor: 'var(--black)',
                    border: '1px solid var(--charcoal-light)',
                    color: '#ffffff',
                    paddingLeft: '42px',
                    letterSpacing: '2px'
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ color: 'rgba(255,255,255,0.7)' }}>New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#888888" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="password" 
                  className="form-control"
                  placeholder="Enter new password (min 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  style={{
                    backgroundColor: 'var(--black)',
                    border: '1px solid var(--charcoal-light)',
                    color: '#ffffff',
                    paddingLeft: '42px'
                  }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '28px' }}>
              <label style={{ color: 'rgba(255,255,255,0.7)' }}>Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#888888" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="password" 
                  className="form-control"
                  placeholder="Confirm new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  style={{
                    backgroundColor: 'var(--black)',
                    border: '1px solid var(--charcoal-light)',
                    color: '#ffffff',
                    paddingLeft: '42px'
                  }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-gold"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '14px', marginBottom: '20px' }}
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}

        {/* 3. Normal Authentication Forms */}
        {recoveryStep === 0 && (
          <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
            {authModalPurpose === 'signup' && (
              <>
                <div className="form-group">
                  <label style={{ color: 'rgba(255,255,255,0.7)' }}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <UserIcon size={18} color="#888888" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      style={{
                        backgroundColor: 'var(--black)',
                        border: '1px solid var(--charcoal-light)',
                        color: '#ffffff',
                        paddingLeft: '42px'
                      }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ color: 'rgba(255,255,255,0.7)' }}>Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} color="#888888" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                      type="tel" 
                      className="form-control"
                      placeholder="e.g. 9876543210 (10-digit)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      style={{
                        backgroundColor: 'var(--black)',
                        border: '1px solid var(--charcoal-light)',
                        color: '#ffffff',
                        paddingLeft: '42px'
                      }}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label style={{ color: 'rgba(255,255,255,0.7)' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#888888" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="email" 
                  className="form-control"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    backgroundColor: 'var(--black)',
                    border: '1px solid var(--charcoal-light)',
                    color: '#ffffff',
                    paddingLeft: '42px'
                  }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 0 }}>Secure Password</label>
                {authModalPurpose === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setRecoveryStep(1); setError(''); setSuccessMsg(''); setRecoveryIdentifier(email); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--gold)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      padding: 0,
                      textDecoration: 'underline'
                    }}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#888888" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="password" 
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    backgroundColor: 'var(--black)',
                    border: '1px solid var(--charcoal-light)',
                    color: '#ffffff',
                    paddingLeft: '42px'
                  }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-gold"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '14px', marginBottom: '20px' }}
            >
              {loading ? 'Processing...' : (authModalPurpose === 'login' ? 'Login' : 'Create Account')}
            </button>
          </form>
        )}

        {/* Bottom Navigation links */}
        {recoveryStep !== 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
            Remembered password?{' '}
            <button 
              onClick={handleBackToLogin}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--gold)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                textDecoration: 'underline'
              }}
            >
              Back to Login
            </button>
          </p>
        ) : (
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
            {authModalPurpose === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
            <button 
              onClick={handleToggleMode}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--gold)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                textDecoration: 'underline'
              }}
            >
              {authModalPurpose === 'login' ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        )}

      </div>
    </div>
  );
};

export default AuthModal;
