import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Upload, Sliders, RotateCw, ZoomIn, ZoomOut, Download, Sparkles, AlertCircle } from 'lucide-react';

const TryOnModal = ({ isOpen, onClose, product }) => {
  if (!isOpen || !product) return null;

  const [activeTab, setActiveTab] = useState('camera'); // 'camera' or 'upload'
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  
  // Try-on adjustments
  const [scale, setScale] = useState(1.0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(product.category?.toLowerCase()?.includes('neck') ? 120 : 0);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  
  // Drag and drop / Interactive states
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [uploadImage, setUploadImage] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const overlayRef = useRef(null);

  // Initialize camera stream
  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, activeTab]);

  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access camera. Please check permissions or upload a photo instead.');
      setActiveTab('upload');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadImage(event.target.result);
        setActiveTab('upload');
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and drop events
  const handleStartDrag = (e) => {
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - offsetX, y: clientY - offsetY });
  };

  const handleDrag = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setOffsetX(clientX - dragStart.x);
    setOffsetY(clientY - dragStart.y);
  };

  const handleStopDrag = () => {
    setIsDragging(false);
  };

  // Capture try-on snapshot and download
  const handleCapture = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Set size to match container
    canvas.width = 640;
    canvas.height = 480;

    // 1. Draw background user video or uploaded image
    if (activeTab === 'camera' && videoRef.current) {
      // Mirror video output
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
    } else if (activeTab === 'upload' && uploadImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawJewellerOverlay(ctx);
      };
      img.src = uploadImage;
      return; // handle drawing inside onload
    }

    drawJewellerOverlay(ctx);
  };

  const drawJewellerOverlay = (ctx) => {
    const canvas = canvasRef.current;
    const itemImg = new Image();
    itemImg.onload = () => {
      // 2. Apply filters (brightness/contrast)
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

      // 3. Calculate position & draw overlay
      ctx.save();
      const centerX = canvas.width / 2 + offsetX;
      const centerY = canvas.height / 2 + offsetY;
      
      ctx.translate(centerX, centerY);
      ctx.rotate((rotation * Math.PI) / 180);
      
      const width = 180 * scale;
      const height = 180 * scale;
      
      ctx.drawImage(itemImg, -width / 2, -height / 2, width, height);
      ctx.restore();
      ctx.filter = 'none'; // reset

      // 4. Download file
      const link = document.createElement('a');
      link.download = `${product.productName.replace(/\s+/g, '_')}_TryOn_Preview.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    itemImg.crossOrigin = 'anonymous';
    // Use first product image as try-on overlay
    itemImg.src = product.images && product.images[0] ? product.images[0] : '';
  };

  const resetAdjustments = () => {
    setScale(1.0);
    setOffsetX(0);
    setOffsetY(product.category?.toLowerCase()?.includes('neck') ? 120 : 0);
    setRotation(0);
    setBrightness(100);
    setContrast(100);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px',
      fontFamily: 'var(--font-body)'
    }}>
      <div 
        className="glass-panel-dark"
        style={{
          width: '100%',
          maxWidth: '1050px',
          borderRadius: '12px',
          border: '1.5px solid var(--gold)',
          backgroundColor: '#0a0a0a',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(212, 175, 55, 0.2)',
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          overflow: 'hidden',
          animation: 'fadeIn 0.3s ease-out',
          height: '80vh',
          maxHeight: '650px'
        }}
      >
        {/* Left Section: Live AR or Selfie view */}
        <div style={{ position: 'relative', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #222', overflow: 'hidden' }}>
          
          {activeTab === 'camera' && (
            <video 
              ref={videoRef}
              autoPlay
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)' // mirror effect
              }}
            />
          )}

          {activeTab === 'upload' && uploadImage ? (
            <img 
              src={uploadImage} 
              alt="Uploaded Selfie"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : activeTab === 'upload' && (
            <div style={{ textAlign: 'center', color: '#888', padding: '40px' }}>
              <Upload size={48} style={{ color: 'var(--gold)', marginBottom: '16px', display: 'inline-block' }} />
              <h4 style={{ color: '#fff', marginBottom: '8px' }}>Upload Your Selfie</h4>
              <p style={{ fontSize: '0.8rem', maxWidth: '300px', margin: '0 auto 16px' }}>
                Upload a clear front-facing photo to test our dynamic AI jewelry positioning and luxury filters.
              </p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="btn-gold"
                style={{ padding: '8px 20px', fontSize: '0.8rem' }}
              >
                Choose Photo
              </button>
            </div>
          )}

          {/* Draggable Jewelry Overlay */}
          {(activeTab === 'camera' || (activeTab === 'upload' && uploadImage)) && (
            <div
              ref={overlayRef}
              onTouchStart={handleStartDrag}
              onTouchMove={handleDrag}
              onTouchEnd={handleStopDrag}
              onMouseDown={handleStartDrag}
              onMouseMove={handleDrag}
              onMouseUp={handleStopDrag}
              onMouseLeave={handleStopDrag}
              style={{
                position: 'absolute',
                top: `calc(50% + ${offsetY}px)`,
                left: `calc(50% + ${offsetX}px)`,
                transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
                cursor: isDragging ? 'grabbing' : 'grab',
                width: '200px',
                height: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                transition: isDragging ? 'none' : 'transform 0.1s ease',
                userSelect: 'none',
                touchAction: 'none'
              }}
            >
              <img 
                src={product.images && product.images[0] ? product.images[0] : ''} 
                alt={product.productName}
                draggable="false"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  pointerEvents: 'none'
                }}
              />
            </div>
          )}

          {/* Mode Badges */}
          <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', gap: '8px', zIndex: 10 }}>
            <button
              onClick={() => setActiveTab('camera')}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                border: activeTab === 'camera' ? '1px solid var(--gold)' : '1px solid #444',
                backgroundColor: activeTab === 'camera' ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0, 0, 0, 0.6)',
                color: activeTab === 'camera' ? 'var(--gold)' : '#ccc',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 600,
                backdropFilter: 'blur(4px)'
              }}
            >
              <Camera size={12} /> Live AR Camera
            </button>
            <button
              onClick={() => {
                if (uploadImage) {
                  setActiveTab('upload');
                } else {
                  fileInputRef.current?.click();
                }
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                border: activeTab === 'upload' ? '1px solid var(--gold)' : '1px solid #444',
                backgroundColor: activeTab === 'upload' ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0, 0, 0, 0.6)',
                color: activeTab === 'upload' ? 'var(--gold)' : '#ccc',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 600,
                backdropFilter: 'blur(4px)'
              }}
            >
              <Upload size={12} /> Upload Photo
            </button>
          </div>

          {/* Hidden file input */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />

          {/* Hidden Canvas for capture rendering */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Guidelines hint overlay */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '0.7rem',
            color: '#aaa',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            border: '1px solid #333',
            pointerEvents: 'none',
            backdropFilter: 'blur(4px)'
          }}>
            <Sparkles size={12} color="var(--gold)" />
            <span>Drag item directly or use adjustment sliders to align</span>
          </div>
        </div>

        {/* Right Section: Specifications & AI controls */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#0a0a0a', padding: '30px', overflowY: 'auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="var(--gold)" className="animate-pulse" />
              <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 600, fontFamily: 'var(--font-title)', letterSpacing: '1px' }}>AI VIRTUAL TRY-ON</h3>
            </div>
            <button 
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', display: 'flex' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Product card info */}
          <div style={{ display: 'flex', gap: '15px', padding: '16px', borderRadius: '8px', border: '1px solid #222', backgroundColor: '#111', marginBottom: '28px' }}>
            <img 
              src={product.images && product.images[0] ? product.images[0] : ''} 
              alt={product.productName} 
              style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #333' }}
            />
            <div style={{ textAlign: 'left' }}>
              <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, marginBottom: '4px' }}>{product.productName}</h4>
              <span style={{ color: 'var(--gold)', fontSize: '0.8rem', fontWeight: 700 }}>₹{product.price?.toLocaleString('en-IN')}</span>
              <span style={{ color: '#888', fontSize: '0.75rem', display: 'block', textTransform: 'capitalize' }}>Category: {product.category}</span>
            </div>
          </div>

          {/* Sliders and alignment controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flexGrow: 1, textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--gold)' }}>
                Alignment Sliders
              </span>
              <button 
                onClick={resetAdjustments}
                style={{ background: 'none', border: 'none', color: '#666', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                onMouseEnter={(e) => e.target.style.color = 'var(--gold)'}
                onMouseLeave={(e) => e.target.style.color = '#666'}
              >
                Reset
              </button>
            </div>

            {/* Slider 1: Scale */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#aaa', marginBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ZoomIn size={12} /> Jewellery Scale</span>
                <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{Math.round(scale * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0.3" 
                max="2.5" 
                step="0.05"
                value={scale} 
                onChange={(e) => setScale(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--gold)' }}
              />
            </div>

            {/* Slider 2: Rotation */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#aaa', marginBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><RotateCw size={12} /> Rotation Angle</span>
                <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{rotation}°</span>
              </div>
              <input 
                type="range" 
                min="-180" 
                max="180" 
                step="1"
                value={rotation} 
                onChange={(e) => setRotation(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--gold)' }}
              />
            </div>

            {/* Slider 3: X Offset */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#aaa', marginBottom: '6px' }}>
                <span>Horizontal Offset (X)</span>
                <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{offsetX}px</span>
              </div>
              <input 
                type="range" 
                min="-250" 
                max="250" 
                step="1"
                value={offsetX} 
                onChange={(e) => setOffsetX(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--gold)' }}
              />
            </div>

            {/* Slider 4: Y Offset */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#aaa', marginBottom: '6px' }}>
                <span>Vertical Offset (Y)</span>
                <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{offsetY}px</span>
              </div>
              <input 
                type="range" 
                min="-250" 
                max="250" 
                step="1"
                value={offsetY} 
                onChange={(e) => setOffsetY(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--gold)' }}
              />
            </div>

            {/* Premium AI blending filters */}
            <div style={{ borderTop: '1px solid #222', paddingTop: '20px', marginTop: '10px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--gold)', display: 'block', marginBottom: '16px' }}>
                AI Blending & Lighting Filters
              </span>

              {/* Slider 5: Brightness */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#aaa', marginBottom: '6px' }}>
                  <span>Match Image Brightness</span>
                  <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{brightness}%</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="150" 
                  value={brightness} 
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--gold)' }}
                />
              </div>

              {/* Slider 6: Contrast */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#aaa', marginBottom: '6px' }}>
                  <span>Match Image Contrast</span>
                  <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{contrast}%</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="150" 
                  value={contrast} 
                  onChange={(e) => setContrast(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--gold)' }}
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '30px' }}>
            <button
              onClick={handleCapture}
              disabled={activeTab === 'upload' && !uploadImage}
              className="btn-gold"
              style={{
                width: '100%',
                justifyContent: 'center',
                height: '46px',
                gap: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
                border: 'none',
                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.2)'
              }}
            >
              <Download size={16} /> Save Try-On Snapshot
            </button>
            <span style={{ fontSize: '0.65rem', color: '#555', textAlign: 'center' }}>
              Snapshot will capture your selfie overlay and gold BIS Hallmarked purity board cleanly.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TryOnModal;
