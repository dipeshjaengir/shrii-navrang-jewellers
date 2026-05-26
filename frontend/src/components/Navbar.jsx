import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Search, Heart, ShoppingBag, User as UserIcon, LogOut, ChevronDown, Menu, X, Sparkles, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout, triggerRestrictedAction, setAuthModalPurpose, setShowAuthModal } = useAuth();
  const { cartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();

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
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '80px',
        padding: '0 20px'
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => setShowProfileDropdown(false)}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '50%', backgroundColor: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--gold)' }}>
            <Sparkles size={20} color="var(--gold)" />
          </div>
          <span style={{
            fontFamily: 'var(--font-title)',
            fontWeight: 700,
            fontSize: '1.3rem',
            letterSpacing: '1px',
            color: 'var(--white)',
            background: 'linear-gradient(to right, #ffffff 40%, var(--gold) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Shrii Navrang
          </span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#222222',
          border: '1.5px solid var(--charcoal-light)',
          borderRadius: '4px',
          width: '100%',
          maxWidth: '400px',
          padding: '4px 12px',
          transition: 'border-color 0.3s'
        }}
        onFocusCapture={(e) => e.currentTarget.style.borderColor = 'var(--gold)'}
        onBlurCapture={(e) => e.currentTarget.style.borderColor = 'var(--charcoal-light)'}
        >
          <input 
            type="text" 
            placeholder="Search necklaces, gold rings, bridal sets..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              width: '100%',
              fontSize: '0.85rem',
              padding: '6px 0',
              fontFamily: 'var(--font-body)'
            }}
          />
          <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold)' }}>
            <Search size={18} />
          </button>
        </form>

        {/* Desktop Links & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }} className="nav-desktop-actions">
          <Link to="/shop" style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#e5e5e5' }} onMouseEnter={(e) => e.target.style.color = 'var(--gold)'} onMouseLeave={(e) => e.target.style.color = '#e5e5e5'}>
            Collections
          </Link>
          <Link to="/about" style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#e5e5e5' }} onMouseEnter={(e) => e.target.style.color = 'var(--gold)'} onMouseLeave={(e) => e.target.style.color = '#e5e5e5'}>
            Heritage
          </Link>
          <Link to="/contact" style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#e5e5e5' }} onMouseEnter={(e) => e.target.style.color = 'var(--gold)'} onMouseLeave={(e) => e.target.style.color = '#e5e5e5'}>
            Contact
          </Link>

          {/* Icons block */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '1px solid #333', paddingLeft: '20px' }}>
            {/* Wishlist */}
            <a href="/wishlist" onClick={handleWishlistClick} style={{ color: 'var(--gold)', position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Heart size={22} />
              {user?.wishlist?.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-10px',
                  backgroundColor: 'var(--white)',
                  color: 'var(--black)',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--gold)'
                }}>
                  {user.wishlist.length}
                </span>
              )}
            </a>

            {/* Cart */}
            <a href="/cart" onClick={handleCartClick} style={{ color: 'var(--gold)', position: 'relative', display: 'flex', alignItems: 'center' }}>
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-10px',
                  backgroundColor: 'var(--gold)',
                  color: 'var(--black)',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {cartCount}
                </span>
              )}
            </a>

            {/* Profile Dropdown controller */}
            <div style={{ position: 'relative' }}>
              <a href="/profile" onClick={handleProfileClick} style={{ color: user ? 'var(--gold)' : '#e5e5e5', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <UserIcon size={22} />
                {user && <ChevronDown size={14} />}
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
                    <Link to="/admin" onClick={() => setShowProfileDropdown(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '0.8rem', color: '#fff' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(212, 175, 55, 0.1)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                      <LayoutDashboard size={16} color="var(--gold)" />
                      Admin Panel
                    </Link>
                  )}
                  <Link to="/profile" onClick={() => setShowProfileDropdown(false)} style={{ display: 'block', padding: '10px 16px', fontSize: '0.8rem', color: '#fff' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(212, 175, 55, 0.1)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                    My Profile
                  </Link>
                  <Link to="/order-history" onClick={() => setShowProfileDropdown(false)} style={{ display: 'block', padding: '10px 16px', fontSize: '0.8rem', color: '#fff' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(212, 175, 55, 0.1)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
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
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 107, 107, 0.05)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
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

      {/* Navigation responsive injection styling */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .nav-desktop-actions { display: none !important; }
          .nav-mobile-trigger { display: block !important; }
        }
      `}} />
    </nav>
  );
};

export default Navbar;
