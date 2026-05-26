import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Sparkles, Send, ShieldCheck } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer style={{
      backgroundColor: 'var(--black)',
      color: '#b5b5b5',
      fontFamily: 'var(--font-body)',
      borderTop: '2px solid var(--gold)',
      padding: '80px 0 30px 0',
      fontSize: '0.85rem'
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '40px',
        marginBottom: '60px'
      }}>
        {/* Legacy Narrative */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Sparkles size={20} color="var(--gold)" />
            <h4 style={{ fontFamily: 'var(--font-title)', color: '#ffffff', fontSize: '1.2rem', fontWeight: 600 }}>
              Shrii Navrang
            </h4>
          </div>
          <p style={{ lineHeight: '1.8', marginBottom: '20px' }}>
            Celebrating generations of timeless legacy, masterly craftsmanship, and purity. Our jewelry items are handcrafted with absolute devotion by Indian artisans.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--gold)', fontWeight: 600 }}>
            <ShieldCheck size={16} />
            <span>100% BIS Hallmarked Purity Guaranteed</span>
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h4 style={{ color: '#ffffff', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem', marginBottom: '24px', fontWeight: 600, borderBottom: '1px solid #222', paddingBottom: '10px' }}>
            Useful Links
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li><Link to="/shop" style={{ transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = '#b5b5b5'}>Browse Collections</Link></li>
            <li><Link to="/about" style={{ transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = '#b5b5b5'}>Our Heritage Story</Link></li>
            <li><Link to="/faq" style={{ transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = '#b5b5b5'}>Frequently Asked Questions</Link></li>
            <li><Link to="/privacy-policy" style={{ transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = '#b5b5b5'}>Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 style={{ color: '#ffffff', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem', marginBottom: '24px', fontWeight: 600, borderBottom: '1px solid #222', paddingBottom: '10px' }}>
            Our Showrooms
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <MapPin size={18} color="var(--gold)" style={{ shrink: 0, marginTop: '2px' }} />
              <span>45, Gold Plaza Market, Sector 18, Noida, Uttar Pradesh, India</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Phone size={16} color="var(--gold)" />
              <span>+91 120 4567 890</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Mail size={16} color="var(--gold)" />
              <span>support@shriinavrang.com</span>
            </li>
          </ul>
        </div>

        {/* Newsletter subscription */}
        <div>
          <h4 style={{ color: '#ffffff', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem', marginBottom: '24px', fontWeight: 600, borderBottom: '1px solid #222', paddingBottom: '10px' }}>
            Join the Navrang Circle
          </h4>
          <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
            Subscribe to receive exclusive access to collection launches, heritage events, and private previews.
          </p>

          {subscribed ? (
            <div style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, animation: 'fadeIn 0.3s' }}>
              <Sparkles size={16} />
              <span>Welcome to the circle! Check your email.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} style={{ display: 'flex', overflow: 'hidden', borderRadius: '4px', border: '1px solid var(--charcoal-light)' }}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  padding: '12px 14px',
                  backgroundColor: '#1a1a1a',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  width: '100%',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.8rem'
                }}
              />
              <button 
                type="submit" 
                style={{
                  backgroundColor: 'var(--gold)',
                  color: 'var(--black)',
                  border: 'none',
                  padding: '0 18px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--gold-light)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--gold)'}
              >
                <Send size={16} />
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="container" style={{ borderTop: '1px solid #1c1c1c', paddingTop: '30px', textAlign: 'center', fontSize: '0.75rem', color: '#666' }}>
        <p>© {new Date().getFullYear()} Shrii Navrang Jewellers. All Rights Reserved. Crafted with absolute devotion.</p>
      </div>
    </footer>
  );
};

export default Footer;
