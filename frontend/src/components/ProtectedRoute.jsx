import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, triggerRestrictedAction, setShowAuthModal } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60vh',
        fontFamily: 'var(--font-body)',
        color: 'var(--gold)'
      }}>
        {/* Elegant Gold Spinning Ring */}
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid rgba(212, 175, 55, 0.2)',
          borderTop: '3px solid var(--gold)',
          borderRadius: '50%',
          animation: 'pulseGold 1s linear infinite, spin 1.2s linear infinite',
          marginBottom: '20px'
        }} />
        <p style={{ letterSpacing: '1px', fontWeight: 500 }}>CURATING COLLECTION...</p>
        
        {/* Embedded Keyframe spin for loading */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}} />
      </div>
    );
  }

  // If user is not logged in, redirect them to Home and pop open the Auth Modal!
  if (!user) {
    // We defer the modal opening slightly so React renders the Home page first
    setTimeout(() => {
      setShowAuthModal(true);
    }, 100);
    return <Navigate to="/" replace />;
  }

  // If page is admin-only, verify admin rights
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};
