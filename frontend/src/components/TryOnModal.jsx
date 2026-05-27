import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Upload, RotateCw, ZoomIn, ZoomOut, Download, Sparkles, AlertCircle, Loader } from 'lucide-react';

const TryOnModal = ({ isOpen, onClose, product }) => {
  if (!isOpen || !product) return null;

  const [activeTab, setActiveTab] = useState('camera'); // 'camera' or 'upload'
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [libsLoaded, setLibsLoaded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [trackingActive, setTrackingActive] = useState(false);

  // Manual fine-tune adjustments (layered on top of AI auto-tracking)
  const [scale, setScale] = useState(1.0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  // Auto-calculated AI landmark positions
  const [aiNecklacePos, setAiNecklacePos] = useState({ x: 0, y: 0, scale: 1.0, angle: 0 });
  const [aiLeftEarPos, setAiLeftEarPos] = useState({ x: 0, y: 0, scale: 1.0, angle: 0 });
  const [aiRightEarPos, setAiRightEarPos] = useState({ x: 0, y: 0, scale: 1.0, angle: 0 });

  const [uploadImage, setUploadImage] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const faceMeshRef = useRef(null);
  const activeCameraRef = useRef(null);

  const isNecklace = product.category?.toLowerCase()?.includes('neck') || product.productName?.toLowerCase()?.includes('neck');

  // Load MediaPipe libraries dynamically from CDN
  useEffect(() => {
    let cameraScript, faceMeshScript;

    const loadScripts = async () => {
      setIsInitializing(true);
      
      // Check if already loaded globally
      if (window.Camera && window.FaceMesh) {
        setLibsLoaded(true);
        setIsInitializing(false);
        return;
      }

      // 1. Camera utils
      cameraScript = document.createElement('script');
      cameraScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';
      cameraScript.async = true;
      document.body.appendChild(cameraScript);

      // 2. Face mesh
      faceMeshScript = document.createElement('script');
      faceMeshScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js';
      faceMeshScript.async = true;
      document.body.appendChild(faceMeshScript);

      const checkLoaded = setInterval(() => {
        if (window.Camera && window.FaceMesh) {
          clearInterval(checkLoaded);
          setLibsLoaded(true);
          setIsInitializing(false);
        }
      }, 500);
    };

    loadScripts();

    return () => {
      // Clean up scripts on unmount
      if (cameraScript && document.body.contains(cameraScript)) document.body.removeChild(cameraScript);
      if (faceMeshScript && document.body.contains(faceMeshScript)) document.body.removeChild(faceMeshScript);
    };
  }, []);

  // Initialize camera and start MediaPipe Face Mesh loop
  useEffect(() => {
    if (isOpen && libsLoaded && activeTab === 'camera') {
      startCameraTryOn();
    } else {
      stopCameraTryOn();
    }
    return () => stopCameraTryOn();
  }, [isOpen, libsLoaded, activeTab]);

  const startCameraTryOn = async () => {
    setCameraError('');
    setTrackingActive(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Initialize Face Mesh instance
      const faceMesh = new window.FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      faceMesh.onResults(handleTrackingResults);
      faceMeshRef.current = faceMesh;

      // Start camera utility loop
      if (videoRef.current) {
        const camera = new window.Camera(videoRef.current, {
          onFrame: async () => {
            if (faceMeshRef.current) {
              await faceMeshRef.current.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480
        });
        camera.start();
        activeCameraRef.current = camera;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access camera. Photo Upload try-on is fully active.');
      setActiveTab('upload');
    }
  };

  const stopCameraTryOn = () => {
    if (activeCameraRef.current) {
      activeCameraRef.current.stop();
      activeCameraRef.current = null;
    }
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    if (faceMeshRef.current) {
      faceMeshRef.current.close();
      faceMeshRef.current = null;
    }
    setTrackingActive(false);
  };

  // MediaPipe results handler
  const handleTrackingResults = (results) => {
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      setTrackingActive(false);
      return;
    }

    setTrackingActive(true);
    const landmarks = results.multiFaceLandmarks[0];

    // Landmark indexes:
    // Forehead top: 10
    // Chin bottom: 152
    // Nose tip: 4
    // Left Cheek edge: 454
    // Right Cheek edge: 234
    // Left Ear Lobe / Jaw edge: 361 or 389
    // Right Ear Lobe / Jaw edge: 132 or 162

    const forehead = landmarks[10];
    const chin = landmarks[152];
    const nose = landmarks[4];
    const leftCheek = landmarks[454];
    const rightCheek = landmarks[234];
    const leftEar = landmarks[361] || landmarks[389];
    const rightEar = landmarks[132] || landmarks[162];

    // 1. Calculate face width and height scale metrics
    const faceHeight = Math.hypot(forehead.x - chin.x, forehead.y - chin.y);
    const faceWidth = Math.hypot(leftCheek.x - rightCheek.x, leftCheek.y - rightCheek.y);
    const dynamicScale = faceWidth * 1.5; // proportional jewellery scale factor

    // 2. Calculate tilt rotation (in degrees) based on cheek midline
    const faceAngle = Math.atan2(leftCheek.y - rightCheek.y, leftCheek.x - rightCheek.x) * (180 / Math.PI);

    // 3. Auto Necklace Anchor calculation (collars/neck region, projected downwards from chin)
    const midlineX = chin.x - nose.x;
    const midlineY = chin.y - nose.y;
    const norm = Math.hypot(midlineX, midlineY);
    
    // Project base position downwards from chin along the face midline
    const neckProjectX = chin.x + (midlineX / norm) * (faceHeight * 0.45);
    const neckProjectY = chin.y + (midlineY / norm) * (faceHeight * 0.45);

    setAiNecklacePos({
      x: (neckProjectX - 0.5) * 640,
      y: (neckProjectY - 0.5) * 480,
      scale: dynamicScale,
      angle: faceAngle
    });

    // 4. Auto Earring Lobe anchors calculation
    setAiLeftEarPos({
      x: (leftEar.x - 0.5) * 640,
      y: (leftEar.y - 0.5) * 480,
      scale: dynamicScale * 0.4,
      angle: faceAngle
    });

    setAiRightEarPos({
      x: (rightEar.x - 0.5) * 640,
      y: (rightEar.y - 0.5) * 480,
      scale: dynamicScale * 0.4,
      angle: faceAngle
    });
  };

  // Photo upload and single landmark detection
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadImage(event.target.result);
        setActiveTab('upload');
        setTrackingActive(false);

        // Auto align on photo upload using FaceMesh once!
        if (libsLoaded) {
          triggerPhotoLandmarks(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerPhotoLandmarks = (imgSrc) => {
    const img = new Image();
    img.onload = async () => {
      const faceMesh = new window.FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5
      });

      faceMesh.onResults((results) => {
        handleTrackingResults(results);
        faceMesh.close();
      });

      // Create a temporary canvas to draw the image for MediaPipe
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 640;
      tempCanvas.height = 480;
      const ctx = tempCanvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 640, 480);
      await faceMesh.send({ image: tempCanvas });
    };
    img.src = imgSrc;
  };

  // Canvas screenshot download
  const handleCapture = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    canvas.width = 640;
    canvas.height = 480;

    // 1. Draw Background Stream
    if (activeTab === 'camera' && videoRef.current) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset
    } else if (activeTab === 'upload' && uploadImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawItemsOnCanvas(ctx);
      };
      img.src = uploadImage;
      return;
    }

    drawItemsOnCanvas(ctx);
  };

  const drawItemsOnCanvas = (ctx) => {
    const canvas = canvasRef.current;
    const itemImg = new Image();
    itemImg.onload = () => {
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

      if (isNecklace) {
        // Draw Auto-aligned Necklace
        ctx.save();
        const basePos = trackingActive ? aiNecklacePos : { x: 0, y: 120, scale: 1.0, angle: 0 };
        const finalX = canvas.width / 2 + basePos.x + offsetX;
        const finalY = canvas.height / 2 + basePos.y + offsetY;
        const finalScale = basePos.scale * scale;
        const finalAngle = basePos.angle + rotation;

        ctx.translate(finalX, finalY);
        ctx.rotate((finalAngle * Math.PI) / 180);
        
        const w = 200 * finalScale;
        const h = 200 * finalScale;
        ctx.drawImage(itemImg, -w / 2, -h / 2, w, h);
        ctx.restore();
      } else {
        // Draw Auto-aligned left & right symmetric earrings
        const finalScale = scale;
        const finalAngle = rotation;

        // Left Earring
        ctx.save();
        const lPos = trackingActive ? aiLeftEarPos : { x: -60, y: 10, scale: 0.4, angle: 0 };
        const lX = canvas.width / 2 + lPos.x + offsetX;
        const lY = canvas.height / 2 + lPos.y + offsetY;
        const lScale = lPos.scale * finalScale;
        ctx.translate(lX, lY);
        ctx.rotate(((lPos.angle + finalAngle) * Math.PI) / 180);
        const lw = 60 * lScale;
        const lh = 60 * lScale;
        ctx.drawImage(itemImg, -lw / 2, -lh / 2, lw, lh);
        ctx.restore();

        // Right Earring
        ctx.save();
        const rPos = trackingActive ? aiRightEarPos : { x: 60, y: 10, scale: 0.4, angle: 0 };
        const rX = canvas.width / 2 + rPos.x - offsetX; // mirrored offset
        const rY = canvas.height / 2 + rPos.y + offsetY;
        const rScale = rPos.scale * finalScale;
        ctx.translate(rX, rY);
        ctx.rotate(((rPos.angle - finalAngle) * Math.PI) / 180); // mirrored rotation
        const rw = 60 * rScale;
        const rh = 60 * rScale;
        ctx.drawImage(itemImg, -rw / 2, -rh / 2, rw, rh);
        ctx.restore();
      }

      ctx.filter = 'none';

      // Capture download
      const link = document.createElement('a');
      link.download = `${product.productName.replace(/\s+/g, '_')}_AI_TryOn.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    itemImg.crossOrigin = 'anonymous';
    itemImg.src = product.images && product.images[0] ? product.images[0] : '';
  };

  const resetAdjustments = () => {
    setScale(1.0);
    setOffsetX(0);
    setOffsetY(0);
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
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2500,
      padding: '20px'
    }}>
      <div 
        className="glass-panel-dark"
        style={{
          width: '100%',
          maxWidth: '1050px',
          borderRadius: '12px',
          border: '1.5px solid var(--gold)',
          backgroundColor: '#070707',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(212, 175, 55, 0.25)',
          display: 'grid',
          gridTemplateColumns: '1.4fr 1.05fr',
          overflow: 'hidden',
          height: '82vh',
          maxHeight: '680px'
        }}
      >
        {/* Left viewport */}
        <div style={{ position: 'relative', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #1a1a1a', overflow: 'hidden' }}>
          
          {isInitializing ? (
            <div style={{ textAlign: 'center', color: 'var(--gold)' }}>
              <Loader size={36} className="animate-spin" style={{ marginBottom: '16px', display: 'inline-block' }} />
              <p style={{ fontSize: '0.85rem', letterSpacing: '1px' }}>LOADING AI RECOGNITION ENGINES...</p>
            </div>
          ) : (
            <>
              {activeTab === 'camera' && (
                <video 
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)' // Mirror stream
                  }}
                />
              )}

              {activeTab === 'upload' && uploadImage && (
                <img src={uploadImage} alt="Selfie" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}

              {/* Photo Mode Empty State */}
              {activeTab === 'upload' && !uploadImage && (
                <div style={{ textAlign: 'center', color: '#888', padding: '40px' }}>
                  <Upload size={48} style={{ color: 'var(--gold)', marginBottom: '16px', display: 'inline-block' }} />
                  <h4 style={{ color: '#fff', marginBottom: '8px' }}>AI Photo Alignment</h4>
                  <p style={{ fontSize: '0.8rem', maxWidth: '300px', margin: '0 auto 16px', lineHeight: '1.5' }}>
                    Upload your selfie photo. MediaPipe AI will automatically extract face landmarks and perfectly size the items!
                  </p>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-gold"
                    style={{ padding: '8px 20px', fontSize: '0.8rem' }}
                  >
                    Select Selfie
                  </button>
                </div>
              )}

              {/* Real-time MediaPipe overlay placement */}
              {(activeTab === 'camera' || (activeTab === 'upload' && uploadImage)) && (
                <div style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, pointerEvents: 'none' }}>
                  {isNecklace ? (
                    // 1. Auto-Aligned Necklace
                    <div style={{
                      position: 'absolute',
                      top: `calc(50% + ${(trackingActive ? aiNecklacePos.y : 120) + offsetY}px)`,
                      left: `calc(50% + ${(trackingActive ? aiNecklacePos.x : 0) + offsetX}px)`,
                      transform: `translate(-50%, -50%) rotate(${(trackingActive ? aiNecklacePos.angle : 0) + rotation}deg) scale(${(trackingActive ? aiNecklacePos.scale : 1.0) * scale})`,
                      width: '200px',
                      height: '200px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                      transition: trackingActive ? 'none' : 'all 0.3s ease'
                    }}>
                      <img src={product.images[0]} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                  ) : (
                    // 2. Symmetric Earring Set
                    <>
                      {/* Left Lobe Earring */}
                      <div style={{
                        position: 'absolute',
                        top: `calc(50% + ${(trackingActive ? aiLeftEarPos.y : 10) + offsetY}px)`,
                        left: `calc(50% + ${(trackingActive ? aiLeftEarPos.x : -60) + offsetX}px)`,
                        transform: `translate(-50%, -50%) rotate(${(trackingActive ? aiLeftEarPos.angle : 0) + rotation}deg) scale(${(trackingActive ? aiLeftEarPos.scale : 0.4) * scale})`,
                        width: '60px',
                        height: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                        transition: trackingActive ? 'none' : 'all 0.3s ease'
                      }}>
                        <img src={product.images[0]} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      </div>

                      {/* Right Lobe Earring */}
                      <div style={{
                        position: 'absolute',
                        top: `calc(50% + ${(trackingActive ? aiRightEarPos.y : 10) + offsetY}px)`,
                        left: `calc(50% + ${(trackingActive ? aiRightEarPos.x : 60) - offsetX}px)`, // mirrored horizontal
                        transform: `translate(-50%, -50%) rotate(${(trackingActive ? aiRightEarPos.angle : 0) - rotation}deg) scale(${(trackingActive ? aiRightEarPos.scale : 0.4) * scale})`,
                        width: '60px',
                        height: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                        transition: trackingActive ? 'none' : 'all 0.3s ease'
                      }}>
                        <img src={product.images[0]} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {/* Mode Badges */}
          <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', gap: '8px', zIndex: 10 }}>
            <button
              onClick={() => setActiveTab('camera')}
              disabled={isInitializing}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                border: activeTab === 'camera' ? '1px solid var(--gold)' : '1px solid #333',
                backgroundColor: activeTab === 'camera' ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0, 0, 0, 0.75)',
                color: activeTab === 'camera' ? 'var(--gold)' : '#bbb',
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
              disabled={isInitializing}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                border: activeTab === 'upload' ? '1px solid var(--gold)' : '1px solid #333',
                backgroundColor: activeTab === 'upload' ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0, 0, 0, 0.75)',
                color: activeTab === 'upload' ? 'var(--gold)' : '#bbb',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 600,
                backdropFilter: 'blur(4px)'
              }}
            >
              <Upload size={12} /> Photo Mode
            </button>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />

          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* AI Active indicator */}
          {trackingActive && (
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(27, 94, 32, 0.85)',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '0.7rem',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid #2e7d32',
              fontWeight: 600,
              backdropFilter: 'blur(4px)'
            }}>
              <Sparkles size={12} className="animate-pulse" />
              <span>MediaPipe Auto AI Tracking Active</span>
            </div>
          )}
        </div>

        {/* Right Section: alignment controls */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#070707', padding: '30px', overflowY: 'auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="var(--gold)" />
              <h3 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 600, fontFamily: 'var(--font-title)', letterSpacing: '1px' }}>AI VIRTUAL TRY-ON</h3>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          {/* Product details */}
          <div style={{ display: 'flex', gap: '15px', padding: '12px', borderRadius: '6px', border: '1px solid #1c1c1c', backgroundColor: '#0d0d0d', marginBottom: '20px' }}>
            <img 
              src={product.images[0]} 
              alt={product.productName} 
              style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #222' }}
            />
            <div style={{ textAlign: 'left' }}>
              <h4 style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600, marginBottom: '2px' }}>{product.productName}</h4>
              <span style={{ color: 'var(--gold)', fontSize: '0.75rem', fontWeight: 700 }}>₹{product.price?.toLocaleString('en-IN')}</span>
              <span style={{ color: '#666', fontSize: '0.7rem', display: 'block', textTransform: 'capitalize' }}>Category: {product.category}</span>
            </div>
          </div>

          {/* Controls and Sliders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1, textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #111', paddingBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--gold)' }}>
                Fine-Tune Alignment
              </span>
              <button 
                onClick={resetAdjustments}
                style={{ background: 'none', border: 'none', color: '#555', fontSize: '0.7rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Reset
              </button>
            </div>

            {/* Slider 1: Scale */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#999', marginBottom: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ZoomIn size={12} /> Jewelry Scale Adjustment</span>
                <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{Math.round(scale * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="2.0" 
                step="0.02"
                value={scale} 
                onChange={(e) => setScale(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--gold)' }}
              />
            </div>

            {/* Slider 2: Rotation */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#999', marginBottom: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><RotateCw size={12} /> Rotation Angle</span>
                <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{rotation}°</span>
              </div>
              <input 
                type="range" 
                min="-90" 
                max="90" 
                step="1"
                value={rotation} 
                onChange={(e) => setRotation(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--gold)' }}
              />
            </div>

            {/* Slider 3: X Offset */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#999', marginBottom: '4px' }}>
                <span>Horizontal Offset (X)</span>
                <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{offsetX}px</span>
              </div>
              <input 
                type="range" 
                min="-150" 
                max="150" 
                step="1"
                value={offsetX} 
                onChange={(e) => setOffsetX(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--gold)' }}
              />
            </div>

            {/* Slider 4: Y Offset */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#999', marginBottom: '4px' }}>
                <span>Vertical Offset (Y)</span>
                <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{offsetY}px</span>
              </div>
              <input 
                type="range" 
                min="-150" 
                max="150" 
                step="1"
                value={offsetY} 
                onChange={(e) => setOffsetY(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--gold)' }}
              />
            </div>

            {/* Premium AI blending filters */}
            <div style={{ borderTop: '1px solid #111', paddingTop: '14px', marginTop: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--gold)', display: 'block', marginBottom: '10px' }}>
                AI Blending Filters
              </span>

              {/* Slider 5: Brightness */}
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#999', marginBottom: '4px' }}>
                  <span>Match Ambient Brightness</span>
                  <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{brightness}%</span>
                </div>
                <input 
                  type="range" 
                  min="60" 
                  max="140" 
                  value={brightness} 
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--gold)' }}
                />
              </div>

              {/* Slider 6: Contrast */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#999', marginBottom: '4px' }}>
                  <span>Match Contrast Lighting</span>
                  <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{contrast}%</span>
                </div>
                <input 
                  type="range" 
                  min="60" 
                  max="140" 
                  value={contrast} 
                  onChange={(e) => setContrast(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--gold)' }}
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '20px' }}>
            <button
              onClick={handleCapture}
              disabled={activeTab === 'upload' && !uploadImage}
              className="btn-gold"
              style={{
                width: '100%',
                justifyContent: 'center',
                height: '44px',
                gap: '8px',
                fontWeight: 600,
                fontSize: '0.85rem',
                border: 'none',
                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.2)'
              }}
            >
              <Download size={14} /> Download AI Try-On Photo
            </button>
            <span style={{ fontSize: '0.6rem', color: '#555', textAlign: 'center' }}>
              Snapshot will capture your high-fidelity MediaPipe landmarks overlay perfectly.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TryOnModal;
