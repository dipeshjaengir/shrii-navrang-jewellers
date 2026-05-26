import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User as UserIcon, Phone, Sparkles } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);

  if (!showAuthModal) return null;

  const handleToggleMode = () => {
    setError('');
    setAuthModalPurpose(authModalPurpose === 'login' ? 'signup' : 'login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authModalPurpose === 'login') {
        await login(email, password);
      } else {
        await register(name, email, phone, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
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
          {authModalPurpose === 'login' 
            ? "Please login or create an account to continue." 
            : "Register to curate your premium jewelry collection."}
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

        {/* Authentication Form */}
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
                    placeholder="+91 XXXXX XXXXX"
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
            <label style={{ color: 'rgba(255,255,255,0.7)' }}>Secure Password</label>
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

        {/* Mode Toggle */}
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

        {/* Quick Testing helper */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--charcoal-light)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textAlign: 'left' }}>
          <span style={{ color: 'var(--gold)', fontWeight: 600 }}>💡 Testing Credentials:</span><br />
          Email: <span style={{ color: '#fff' }}>customer@Shrinavrang.com</span> | Pass: <span style={{ color: '#fff' }}>customerpassword123</span>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
