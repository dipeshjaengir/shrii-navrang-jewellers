import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Search, Heart, ShoppingBag, User as UserIcon, LogOut, ChevronDown, Menu, X, Sparkles, LayoutDashboard, Landmark } from 'lucide-react';
import { API_URL } from '../config';

const Navbar = () => {
  const { user, logout, triggerRestrictedAction, setAuthModalPurpose, setShowAuthModal } = useAuth();
  const { cartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showRatesModal, setShowRatesModal] = useState(false);
  const [ratesConfig, setRatesConfig] = useState({
    gold24k: 7250,
    gold22k: 6650,
    silver: 90,
    businessEmail: 'info@shriinavrang.com',
    updatedAt: new Date().toISOString()
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch(`${API_URL}/rates`);
        if (res.ok) {
          const data = await res.json();
          setRatesConfig(data);
        }
      } catch (err) {
        console.error('Error fetching rates in navbar:', err);
      }
    };
    fetchRates();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowRatesModal(false);
      }
    };
    if (showRatesModal) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showRatesModal]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowRatesModal(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    if (!user) {
      triggerRestrictedAction(() => navigate('/wishlist'));
    } else {
      navigate('/wishlist');
    }
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    if (!user) {
      triggerRestrictedAction(() => navigate('/cart'));
    } else {
      navigate('/cart');
    }
  };

  const handleProfileClick = (e) => {
    e.preventDefault();
    if (!user) {
      setAuthModalPurpose('login');
      setShowAuthModal(true);
    } else {
      setShowProfileDropdown(!showProfileDropdown);
    }
  };

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 900,
      backgroundColor: 'rgba(17, 17, 17, 0.98)',
      borderBottom: '1.5px solid var(--gold)',
      boxShadow: '0 4px 30px rgba(0,0,0,0.15)',
      backdropFilter: 'blur(10px)',
      color: '#ffffff',
      fontFamily: 'var(--font-body)'
    }}>
      <div className="nav-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '80px',
        width: '100%',
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '0 30px',
        gap: '20px'
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }} onClick={() => setShowProfileDropdown(false)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            {/* SN Royal Crown Premium Logo */}
            <svg width="42" height="42" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 2px 8px rgba(212, 175, 55, 0.45))' }}>
              <defs>
                <linearGradient id="gold-grad-logo" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF3B0" />
                  <stop offset="30%" stopColor="#D4AF37" />
                  <stop offset="70%" stopColor="#AA7C11" />
                  <stop offset="100%" stopColor="#F3E5AB" />
                </linearGradient>
                <radialGradient id="gold-glow-logo" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="50" cy="50" r="46" fill="url(#gold-glow-logo)" />
              <circle cx="50" cy="50" r="42" stroke="url(#gold-grad-logo)" strokeWidth="1.5" fill="none" />
              <circle cx="50" cy="50" r="38" stroke="url(#gold-grad-logo)" strokeWidth="0.75" strokeDasharray="2 2" fill="none" />
              
              {/* Crown Base */}
              <path d="M35 55 H65 V58 Q50 60 35 58 Z" fill="url(#gold-grad-logo)" />
              <rect x="38" y="52" width="24" height="1.5" rx="0.5" fill="#FFFFFF" opacity="0.8" />
              
              {/* Crown Peaks */}
              <path d="M35 55 L30 35 L40 48 Z" fill="url(#gold-grad-logo)" />
              <path d="M50 55 L50 24 L45 42 Z" fill="url(#gold-grad-logo)" />
              <path d="M50 55 L50 24 L55 42 Z" fill="url(#gold-grad-logo)" opacity="0.9" />
              <path d="M65 55 L70 35 L60 48 Z" fill="url(#gold-grad-logo)" />
              
              {/* Crown Peak Jewels */}
              <circle cx="30" cy="34" r="2.5" fill="#FFFFFF" />
              <circle cx="30" cy="34" r="1.5" fill="url(#gold-grad-logo)" />
              
              <circle cx="50" cy="22" r="3.5" fill="#FFFFFF" />
              <circle cx="50" cy="22" r="2.5" fill="url(#gold-grad-logo)" />
              
              <circle cx="70" cy="34" r="2.5" fill="#FFFFFF" />
              <circle cx="70" cy="34" r="1.5" fill="url(#gold-grad-logo)" />
              
              {/* Interwoven SN Serif Monogram */}
              <text x="50" y="78" fontFamily="'Playfair Display', Georgia, serif" fontSize="20" fontWeight="bold" fill="url(#gold-grad-logo)" textAnchor="middle" letterSpacing="0.5">SN</text>
              
              {/* Sparkling Stars */}
              <path d="M22 45 L24 47 L22 49 L20 47 Z" fill="url(#gold-grad-logo)" opacity="0.7" />
              <path d="M78 45 L80 47 L78 49 L76 47 Z" fill="url(#gold-grad-logo)" opacity="0.7" />
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="brand-text" style={{
              fontFamily: 'var(--font-title)',
              fontWeight: 700,
              fontSize: '1.35rem',
              letterSpacing: '1px',
              color: 'var(--white)',
              background: 'linear-gradient(to right, #ffffff 40%, var(--gold) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              whiteSpace: 'nowrap',
              display: 'inline-block',
              lineHeight: '1.2'
            }}>
              Shrii Navrang Jewellers
            </span>
            <span className="brand-tagline" style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.55rem',
              fontWeight: 600,
              color: 'var(--gold)',
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
              marginTop: '2px',
              opacity: 0.95
            }}>
              Purity • Trust • Perfection
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links (Center) */}
        <div className="nav-desktop-links" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '30px'
        }}>
          <Link to="/shop" className="nav-desktop-link">
            Collections
          </Link>
          <Link to="/about" className="nav-desktop-link">
            Heritage
          </Link>
          <Link to="/contact" className="nav-desktop-link">
            Contact
          </Link>
          <button 
            onClick={() => setShowRatesModal(true)}
            className="nav-rates-btn"
          >
            <Sparkles size={14} style={{ marginRight: '6px' }} />
            Today's Rate
          </button>
        </div>

        {/* Desktop Actions & Search (Right) */}
        <div className="nav-desktop-actions-right" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px'
        }}>
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="nav-search-form" style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#1a1a1a',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: '4px',
            width: '240px',
            padding: '4px 12px',
            transition: 'all 0.3s ease'
          }}>
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                color: '#ffffff',
                width: '100%',
                fontSize: '0.8rem',
                padding: '4px 0',
                fontFamily: 'var(--font-body)'
              }}
            />
            <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold)', padding: 0, display: 'flex', alignItems: 'center' }}>
              <Search size={16} />
            </button>
          </form>

          {/* Action Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '1px solid rgba(212, 175, 55, 0.2)', paddingLeft: '20px' }}>
            {/* Wishlist */}
            <a href="/wishlist" onClick={handleWishlistClick} className="nav-icon-link" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Heart size={20} />
              {user?.wishlist?.length > 0 && (
                <span className="badge-count">
                  {user.wishlist.length}
                </span>
              )}
            </a>

            {/* Cart */}
            <a href="/cart" onClick={handleCartClick} className="nav-icon-link" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="badge-count gold-badge">
                  {cartCount}
                </span>
              )}
            </a>

            {/* Profile Dropdown controller */}
            <div style={{ position: 'relative' }}>
              <a href="/profile" onClick={handleProfileClick} className="nav-icon-link" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <UserIcon size={20} />
                {user && <ChevronDown size={12} />}
              </a>

              {/* Profile sub menu */}
              {user && showProfileDropdown && (
                <div 
                  className="glass-panel-dark"
                  style={{
                    position: 'absolute',
                    top: '40px',
                    right: 0,
                    width: '220px',
                    borderRadius: '4px',
                    padding: '8px 0',
                    border: '1px solid var(--gold)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    zIndex: 1000,
                    textAlign: 'left'
                  }}
                >
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #222' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--gold)' }}>{user.role === 'admin' ? 'Administrator' : 'Valued Patron'}</p>
                  </div>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setShowProfileDropdown(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '0.8rem', color: '#fff' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.1)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <LayoutDashboard size={16} color="var(--gold)" />
                      Admin Panel
                    </Link>
                  )}
                  <Link to="/profile" onClick={() => setShowProfileDropdown(false)} style={{ display: 'block', padding: '10px 16px', fontSize: '0.8rem', color: '#fff' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.1)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    My Profile
                  </Link>
                  <Link to="/order-history" onClick={() => setShowProfileDropdown(false)} style={{ display: 'block', padding: '10px 16px', fontSize: '0.8rem', color: '#fff' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.1)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    Order History
                  </Link>
                  <button 
                    onClick={() => { logout(); setShowProfileDropdown(false); navigate('/'); }}
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      fontSize: '0.8rem',
                      color: '#ff6b6b',
                      cursor: 'pointer',
                      borderTop: '1px solid #222',
                      fontFamily: 'var(--font-body)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 107, 107, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu trigger */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', display: 'none' }}
          className="nav-mobile-trigger"
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu panel */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: 'var(--black)',
          borderTop: '1px solid var(--charcoal-light)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          animation: 'fadeIn 0.3s ease-out forwards'
        }} className="nav-mobile-panel">
          <Link to="/shop" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600 }}>Collections</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600 }}>Heritage</Link>
          <Link to="/contact" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600 }}>Contact</Link>
          <button 
            onClick={() => { setMobileMenuOpen(false); setShowRatesModal(true); }} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--gold)', 
              textAlign: 'left', 
              fontSize: '1rem', 
              fontWeight: 600, 
              cursor: 'pointer', 
              padding: 0,
              fontFamily: 'var(--font-body)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={16} /> Today's Rate
          </button>
          
          <div style={{ display: 'flex', gap: '20px', borderTop: '1px solid #222', paddingTop: '20px' }}>
            <a href="/wishlist" onClick={(e) => { setMobileMenuOpen(false); handleWishlistClick(e); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold)' }}>
              <Heart size={20} /> Wishlist
            </a>
            <a href="/cart" onClick={(e) => { setMobileMenuOpen(false); handleCartClick(e); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold)' }}>
              <ShoppingBag size={20} /> Cart ({cartCount})
            </a>
          </div>

          <div style={{ borderTop: '1px solid #222', paddingTop: '20px' }}>
            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <p style={{ color: 'var(--gold)', fontSize: '0.85rem' }}>Logged in as: <b>{user.name}</b></p>
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--gold)' }}>Admin Panel</Link>
                )}
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>My Profile</Link>
                <Link to="/order-history" onClick={() => setMobileMenuOpen(false)}>Order History</Link>
                <button 
                  onClick={() => { logout(); setMobileMenuOpen(false); navigate('/'); }}
                  style={{ background: 'none', border: 'none', color: '#ff6b6b', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => { setMobileMenuOpen(false); setAuthModalPurpose('login'); setShowAuthModal(true); }}
                className="btn-gold" 
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}

      {/* Polish and media styles */}
      <style dangerouslySetInnerHTML={{__html: `
        .nav-desktop-link {
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #e5e5e5;
          transition: all 0.3s ease;
          position: relative;
          padding: 6px 0;
        }
        .nav-desktop-link:hover {
          color: var(--gold);
        }
        .nav-desktop-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 1.5px;
          background-color: var(--gold);
          transition: width 0.3s ease;
        }
        .nav-desktop-link:hover::after {
          width: 100%;
        }

        .nav-rates-btn {
          background: rgba(212, 175, 55, 0.08);
          border: 1px solid var(--gold);
          border-radius: 20px;
          cursor: pointer;
          padding: 6px 16px;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          color: var(--gold);
          display: flex;
          align-items: center;
          font-family: var(--font-body);
          transition: all 0.3s ease;
        }
        .nav-rates-btn:hover {
          background: var(--gold);
          color: var(--black);
          box-shadow: 0 0 12px rgba(212, 175, 55, 0.3);
          transform: translateY(-1px);
        }

        .nav-icon-link {
          color: #e5e5e5;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .nav-icon-link:hover {
          color: var(--gold);
          transform: scale(1.08);
        }

        .badge-count {
          position: absolute;
          top: -8px;
          right: -10px;
          background-color: var(--white);
          color: var(--black);
          font-size: 0.65rem;
          font-weight: 800;
          width: 17px;
          height: 17px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justifyContent: center;
          border: 1px solid var(--gold);
          transition: all 0.3s ease;
        }
        .badge-count.gold-badge {
          background-color: var(--gold);
          border: none;
        }

        .nav-search-form:focus-within {
          border-color: var(--gold) !important;
          box-shadow: 0 0 8px rgba(212, 175, 55, 0.2);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0,0,0,0.85);
          display: flex;
          align-items: center;
          justifyContent: center;
          z-index: 9999;
          backdrop-filter: blur(8px);
          padding: 20px;
          overflow-y: auto;
        }

        .modal-content-card {
          width: 100%;
          max-width: 420px;
          max-height: 90vh;
          overflow-y: auto;
          background-color: #111111;
          border: 2px solid var(--gold);
          border-radius: 8px;
          padding: 40px 30px;
          color: #ffffff;
          text-align: center;
          box-shadow: 0 10px 40px rgba(212,175,55,0.25);
          position: relative;
          animation: modalSlideUp 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
        }

        @keyframes modalSlideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-close-btn {
          position: absolute;
          top: 15px;
          right: 15px;
          background: none;
          border: none;
          color: #cccccc;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justifyContent: center;
          padding: 4px;
        }
        .modal-close-btn:hover {
          color: var(--gold);
          transform: rotate(90deg);
        }

        /* Responsive Show/Hide */
        .nav-mobile-trigger {
          display: none !important;
        }

        @media (max-width: 1024px) {
          .nav-desktop-links {
            display: none !important;
          }
          .nav-desktop-actions-right {
            display: none !important;
          }
          .nav-mobile-trigger {
            display: block !important;
          }
        }
      `}} />

      {/* 5. Today's Rates Luxury Modal */}
      {showRatesModal && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal-content-card">
            <button className="modal-close-btn" onClick={() => setShowRatesModal(false)}>
              <X size={20} />
            </button>

            {/* Logo Monogram */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <svg width="46" height="46" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="46" stroke="#D4AF37" strokeWidth="4" fill="#111111" />
                <circle cx="50" cy="50" r="40" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="3 3" />
                <path d="M50 20 L60 32 L50 44 L40 32 Z" fill="#D4AF37" />
                <path d="M50 56 L60 68 L50 80 L40 68 Z" fill="#D4AF37" opacity="0.8" />
                <text x="50" y="58" fontFamily="Georgia, serif" fontSize="24" fontWeight="bold" fill="#D4AF37" textAnchor="middle">N</text>
              </svg>
            </div>

            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.6rem', color: '#ffffff', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Shrii Navrang Jewellers
            </h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--gold)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '30px' }}>
              Today's Live Showroom Rates
            </span>

            {/* Rates Table/Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '30px' }}>
              {/* Gold 24K */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', backgroundColor: 'rgba(212, 175, 55, 0.05)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '4px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e5e5e5' }}>Gold 24K (99.9% Purity)</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gold)' }}>₹{ratesConfig.gold24k.toLocaleString('en-IN')} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#aaa' }}>/ 1g</span></span>
              </div>

              {/* Gold 22K */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', backgroundColor: 'rgba(212, 175, 55, 0.05)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '4px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e5e5e5' }}>Gold 22K (91.6% Purity)</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gold)' }}>₹{ratesConfig.gold22k.toLocaleString('en-IN')} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#aaa' }}>/ 1g</span></span>
              </div>

              {/* Silver */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e5e5e5' }}>Silver (99.9% Purity)</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>₹{ratesConfig.silver.toLocaleString('en-IN')} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#aaa' }}>/ 1g</span></span>
              </div>
            </div>

            {/* Last Updated Timestamp & Hallmark Info */}
            <div style={{ borderTop: '1px solid #222', paddingTop: '20px', fontSize: '0.7rem', color: '#888', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--gold)' }}>
                <Landmark size={12} />
                <span>Showroom Rate Board • BIS 22/22 Hallmark</span>
              </div>
              <span>Last updated: {new Date(ratesConfig.updatedAt || ratesConfig.createdAt || new Date().toISOString()).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
              <span style={{ color: '#666', fontSize: '0.65rem' }}>Showroom Managed by Navrang Jangid & Family. GST & Making charges extra.</span>
            </div>
          </div>
        </div>
      )}

    </nav>
  );
};

export default Navbar;
