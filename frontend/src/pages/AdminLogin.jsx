import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ShieldAlert, Award } from 'lucide-react';

const AdminLogin = ({ onShowToast }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@shriinavrang.com');
  const [password, setPassword] = useState('adminpassword123');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      if (onShowToast) onShowToast('Please provide credentials', 'error');
      return;
    }
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.role !== 'admin') {
        if (onShowToast) onShowToast('Access denied. Administrator privileges required.', 'error');
        // Log out immediately if they are not an admin to clear credentials
        localStorage.removeItem('sn_user');
        localStorage.removeItem('sn_token');
        window.location.reload();
      } else {
        if (onShowToast) onShowToast('Welcome back, Store Director. Restoring dashboard aggregates...', 'success');
        navigate('/admin/dashboard');
      }
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Login failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      fontFamily: 'var(--font-body)',
      minHeight: '90vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--black)',
      backgroundImage: `linear-gradient(to bottom, rgba(17,17,17,0.9), rgba(17,17,17,0.98)), url("https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&q=80&w=1200")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: '40px 20px'
    }}>
      
      <div 
        className="glass-panel-dark"
        style={{
          width: '100%',
          maxWidth: '450px',
          padding: '50px 40px',
          borderRadius: '8px',
          border: '2px solid var(--gold)',
          boxShadow: 'var(--shadow-gold)',
          textAlign: 'center',
          animation: 'slideUp 0.6s ease-out'
        }}
      >
        {/* Brand Crest */}
        <div style={{ display: 'inline-flex', padding: '10px 20px', backgroundColor: 'rgba(212,175,55,0.15)', border: '1.5px solid var(--gold)', borderRadius: '4px', gap: '8px', alignItems: 'center', marginBottom: '30px' }}>
          <Award size={18} color="var(--gold)" />
          <span style={{ fontSize: '0.8rem', color: 'var(--gold)', letterSpacing: '3px', fontWeight: 600, textTransform: 'uppercase' }}>
            Store Manager
          </span>
        </div>

        <h1 style={{ fontFamily: 'var(--font-title)', color: '#ffffff', fontSize: '2.2rem', marginBottom: '8px' }}>
          Shrii Navrang Jewellers
        </h1>
        <p style={{ color: 'var(--grey)', fontSize: '0.85rem', fontWeight: 300, marginBottom: '40px', letterSpacing: '0.5px' }}>
          Secure Administrative Director Console
        </p>

        {/* Credentials guidance box */}
        <div style={{
          backgroundColor: 'rgba(212,175,55,0.1)',
          border: '1px dashed var(--gold)',
          borderRadius: '6px',
          padding: '16px',
          textAlign: 'left',
          fontSize: '0.8rem',
          lineHeight: '1.5',
          color: 'var(--gold-light)',
          marginBottom: '30px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          <ShieldAlert size={28} color="var(--gold)" style={{ flexShrink: 0 }} />
          <div>
            <strong>CONVENIENT TESTING CREDENTIALS:</strong><br />
            Email: <span style={{ color: '#fff', textDecoration: 'underline' }}>admin@shriinavrang.com</span><br />
            Password: <span style={{ color: '#fff', textDecoration: 'underline' }}>adminpassword123</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div className="form-group">
            <label htmlFor="adm_email" style={{ color: 'var(--gold-light)' }}>Director Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--gold)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <input 
                type="email" 
                id="adm_email"
                className="form-control" 
                placeholder="admin@shriinavrang.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  paddingLeft: '42px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(212,175,55,0.3)',
                  color: '#ffffff'
                }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="adm_pass" style={{ color: 'var(--gold-light)' }}>Secure Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--gold)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <input 
                type="password" 
                id="adm_pass"
                className="form-control" 
                placeholder="••••••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  paddingLeft: '42px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(212,175,55,0.3)',
                  color: '#ffffff'
                }}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-gold" 
            style={{ width: '100%', justifyContent: 'center', marginTop: '15px' }}
            disabled={loading}
          >
            {loading ? 'Validating Registry...' : 'Enter Console'}
          </button>
        </form>

      </div>

    </div>
  );
};

export default AdminLogin;
