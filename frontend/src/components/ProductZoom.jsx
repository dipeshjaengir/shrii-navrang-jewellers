import React, { useState, useRef } from 'react';

const ProductZoom = ({ imageUrl, altText = "Premium Jewelry" }) => {
  const [zoomStyle, setZoomStyle] = useState({ display: 'none' });
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    const container = containerRef.current;
    if (!container) return;

    const { left, top, width, height } = container.getBoundingClientRect();
    
    // Calculate cursor coordinates relative to the image container (in percentage)
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    // Constrain percentages between 0 and 100
    const boundedX = Math.max(0, Math.min(100, x));
    const boundedY = Math.max(0, Math.min(100, y));

    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${imageUrl})`,
      backgroundPosition: `${boundedX}% ${boundedY}%`,
      backgroundSize: '200%', // 2x magnification zoom
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none', // ensures mouse movements are captured by container, not overlay
      zIndex: 5,
      borderRadius: '8px',
      boxShadow: 'inset 0 0 20px rgba(0,0,0,0.15)',
      animation: 'fadeIn 0.2s ease-out forwards'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        width: '100%',
        paddingTop: '100%', // perfectly square ratio
        backgroundColor: '#faf8f5',
        borderRadius: '8px',
        border: '1px solid rgba(212, 175, 55, 0.15)',
        cursor: 'zoom-in',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
      }}
    >
      {/* Base Image */}
      <img 
        src={imageUrl} 
        alt={altText} 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '8px'
        }}
      />

      {/* Magnifying overlay crop (renders on hover) */}
      <div style={zoomStyle} />

      {/* Overlay Hint on Bottom Right */}
      <div style={{
        position: 'absolute',
        bottom: '15px',
        right: '15px',
        backgroundColor: 'rgba(17, 17, 17, 0.75)',
        color: 'var(--gold)',
        fontSize: '0.65rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        padding: '4px 10px',
        borderRadius: '4px',
        letterSpacing: '1px',
        pointerEvents: 'none',
        border: '1px solid var(--gold)'
      }}>
        Hover to Zoom
      </div>
    </div>
  );
};

export default ProductZoom;
