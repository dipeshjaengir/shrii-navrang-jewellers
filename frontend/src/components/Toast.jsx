import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const isSuccess = type === 'success';

  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      zIndex: 1100,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '16px 24px',
      borderRadius: '4px',
      background: isSuccess ? '#1c1c1c' : '#8c1d1d',
      borderLeft: `4px solid ${isSuccess ? '#D4AF37' : '#ff4d4d'}`,
      boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
      color: '#ffffff',
      fontFamily: 'var(--font-body)',
      fontSize: '0.9rem',
      animation: 'slideUp 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards',
    }}>
      {isSuccess ? (
        <CheckCircle size={18} color="#D4AF37" />
      ) : (
        <AlertTriangle size={18} color="#ff4d4d" />
      )}
      <span style={{ fontWeight: 500 }}>{message}</span>
      <button 
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '2px',
          color: 'rgba(255, 255, 255, 0.6)',
          transition: 'color 0.2s',
          display: 'flex',
          alignItems: 'center',
        }}
        onMouseEnter={(e) => e.target.style.color = '#ffffff'}
        onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.6)'}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
