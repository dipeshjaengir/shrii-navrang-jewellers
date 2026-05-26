import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Send, ShieldCheck, MessageCircle, Sparkles, Star } from 'lucide-react';
import { API_URL } from '../config';

const ContactUs = ({ onShowToast }) => {
  const [ratesConfig, setRatesConfig] = useState({
    gold24k: 7250,
    gold22k: 6650,
    silver: 90,
    businessEmail: 'info@shriinavrang.com'
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${API_URL}/rates`);
        if (res.ok) {
          const data = await res.json();
          setRatesConfig(data);
        }
      } catch (err) {
        console.error('Error fetching rates/config:', err);
      }
    };
    fetchConfig();
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Bespoke Jewelry Consultation',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      if (onShowToast) onShowToast('Please fill out all required fields.', 'error');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      if (onShowToast) onShowToast('Thank you! Your inquiry has been logged. Our luxury concierge will connect with you within 24 hours. ✨', 'success');
      setFormData({ name: '', email: '', phone: '', subject: 'Bespoke Jewelry Consultation', message: '' });
    }, 2000);
  };

  return (
    <div style={{ fontFamily: 'var(--font-body)', backgroundColor: 'var(--alabaster)', color: 'var(--charcoal)', overflowX: 'hidden' }}>
      
      {/* 1. Luxurious Header */}
      <div style={{
        backgroundImage: `linear-gradient(to bottom, rgba(10, 10, 10, 0.8), rgba(17, 17, 17, 0.95)), url("https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1200")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '140px 20px',
        textAlign: 'center',
        borderBottom: '3px solid var(--gold)',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(212,175,55,0.03)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', padding: '6px 12px', backgroundColor: 'rgba(212,175,55,0.15)', border: '1px solid var(--gold)', borderRadius: '4px', gap: '8px', alignItems: 'center', marginBottom: '20px', animation: 'fadeIn 1s' }}>
            <Sparkles size={14} color="var(--gold)" />
            <span style={{ fontSize: '0.7rem', color: 'var(--gold)', letterSpacing: '2px', fontWeight: 600, textTransform: 'uppercase' }}>Purity • Trust • Perfection</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-title)', color: '#ffffff', fontSize: '3.6rem', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}>
            Shrii Navrang Jewellers
          </h1>
          <p style={{ color: '#cccccc', fontSize: '1.2rem', lineHeight: '1.6', maxWidth: '650px', margin: '0 auto', fontWeight: 300 }}>
            Whether scheduling a private showroom preview or arranging a bespoke design consultation, our personal advisors are delighted to assist you.
          </p>
        </div>
      </div>

      {/* 2. Main Contact Grid */}
      <section style={{ padding: '80px 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '60px' }}>
          
          {/* Left Column: Elegant Contact Form */}
          <div 
            className="glass-panel" 
            style={{ 
              padding: '50px 45px', 
              borderRadius: '8px', 
              border: '1.5px solid var(--gold)',
              boxShadow: 'var(--shadow)',
              backgroundColor: '#ffffff'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <Star size={18} color="var(--gold-dark)" fill="var(--gold)" />
              <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '2.2rem', color: 'var(--black)', margin: 0 }}>
                Concierge Request
              </h2>
            </div>
            <p style={{ color: 'var(--grey)', fontSize: '0.9rem', marginBottom: '35px', fontWeight: 300 }}>
              Complete the details below, and an expert jewelry advisor will guide you through custom modifications, diamond certification queries, or custom bridal sketches.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '20px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="name" style={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--black)', display: 'block', marginBottom: '8px' }}>Your Name *</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    className="form-control" 
                    placeholder="Enter full name"
                    value={formData.name} 
                    onChange={handleChange}
                    required
                    style={{ border: '1.5px solid var(--light-grey)', borderRadius: '4px', padding: '12px 14px', fontSize: '0.85rem' }}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="email" style={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--black)', display: 'block', marginBottom: '8px' }}>Email Address *</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    className="form-control" 
                    placeholder="Enter email address"
                    value={formData.email} 
                    onChange={handleChange}
                    required
                    style={{ border: '1.5px solid var(--light-grey)', borderRadius: '4px', padding: '12px 14px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '20px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="phone" style={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--black)', display: 'block', marginBottom: '8px' }}>Phone Number</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    className="form-control" 
                    placeholder="Enter mobile number"
                    value={formData.phone} 
                    onChange={handleChange}
                    style={{ border: '1.5px solid var(--light-grey)', borderRadius: '4px', padding: '12px 14px', fontSize: '0.85rem' }}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="subject" style={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--black)', display: 'block', marginBottom: '8px' }}>Inquiry Purpose</label>
                  <select 
                    id="subject" 
                    name="subject" 
                    className="form-control" 
                    value={formData.subject} 
                    onChange={handleChange}
                    style={{ border: '1.5px solid var(--light-grey)', borderRadius: '4px', padding: '12px 14px', fontSize: '0.85rem', height: '45px', cursor: 'pointer' }}
                  >
                    <option value="Bespoke Jewelry Consultation">Bespoke Jewelry Consultation</option>
                    <option value="Showroom Private Preview">Showroom Private Preview</option>
                    <option value="Order & Delivery Tracking">Order & Delivery Tracking</option>
                    <option value="Lifetime Exchange Program">Lifetime Exchange Program</option>
                    <option value="Other Inquiries">Other Inquiries</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '30px' }}>
                <label htmlFor="message" style={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--black)', display: 'block', marginBottom: '8px' }}>Message details *</label>
                <textarea 
                  id="message" 
                  name="message" 
                  className="form-control" 
                  rows="5"
                  placeholder="Tell us about the design, gemstones, or custom sizing you are interested in. If scheduling a private preview, please state your preferred dates..."
                  value={formData.message} 
                  onChange={handleChange}
                  required
                  style={{ resize: 'vertical', border: '1.5px solid var(--light-grey)', borderRadius: '4px', padding: '14px', fontSize: '0.85rem' }}
                />
              </div>

              <button 
                type="submit" 
                className="btn-gold" 
                style={{ width: '100%', justifyContent: 'center', height: '48px', gap: '10px' }}
                disabled={submitting}
              >
                {submitting ? 'DISPATCHING TO ADVISORS...' : 'SEND SECURED MESSAGE'}
                <Send size={16} />
              </button>
            </form>
          </div>

          {/* Right Column: Showroom Details & Glowing WhatsApp button */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            
            {/* Showroom card */}
            <div className="glass-panel" style={{ padding: '40px', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.15)', backgroundColor: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.8rem', color: 'var(--black)', marginBottom: '8px' }}>
                Flagship Showroom
              </h3>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold-dark)', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '24px', borderBottom: '1px solid var(--light-grey)', paddingBottom: '12px' }}>
                Since 1921 • Managed by Navrang Jangid & Family
              </span>
              
              <div style={{ display: 'flex', gap: '15px', marginBottom: '24px', alignItems: 'flex-start' }}>
                <div style={{ minWidth: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={18} color="var(--gold-dark)" />
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--black)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</h4>
                  <p style={{ fontWeight: 300, fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--charcoal-light)' }}>
                    BR Tower, Near Sonu Monu Complex, Jhunjhunu, Rajasthan - 333001.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', marginBottom: '24px', alignItems: 'flex-start' }}>
                <div style={{ minWidth: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Phone size={18} color="var(--gold-dark)" />
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--black)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Luxury Phone Concierge</h4>
                  <p style={{ fontWeight: 300, fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--charcoal-light)' }}>
                    CA Ajay Jangir: +91 80941 50075<br />
                    Sachin Jangir: +91 70142 22896
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', marginBottom: '24px', alignItems: 'flex-start' }}>
                <div style={{ minWidth: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Mail size={18} color="var(--gold-dark)" />
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--black)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Channels</h4>
                  <p style={{ fontWeight: 300, fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--charcoal-light)' }}>
                    Showroom: {ratesConfig.businessEmail}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                <div style={{ minWidth: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Clock size={18} color="var(--gold-dark)" />
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--black)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Visiting Hours</h4>
                  <p style={{ fontWeight: 300, fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--charcoal-light)' }}>
                    Tuesday - Sunday: 11:00 AM - 08:30 PM<br />
                    <span style={{ color: 'var(--error)', fontWeight: 600 }}>(Mondays Closed for inventory audit)</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Glowing WhatsApp Chat Button */}
            <div 
              className="glass-panel" 
              style={{ 
                padding: '30px', 
                borderRadius: '8px', 
                border: '1.5px solid #25d366', 
                backgroundColor: '#ffffff', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '15px',
                boxShadow: '0 4px 15px rgba(37, 211, 102, 0.05)'
              }}
            >
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'rgba(37,211,102,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#25d366' }}>
                  <MessageCircle size={24} fill="#25d366" color="#ffffff" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: 'var(--black)' }}>Instant WhatsApp Advisor</h4>
                  <span style={{ fontSize: '0.75rem', color: '#25d366', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#25d366', display: 'inline-block', animation: 'pulseGreen 1.5s infinite' }} />
                    Advisors Online Now
                  </span>
                </div>
              </div>
              
              <p style={{ fontSize: '0.8rem', fontWeight: 300, color: 'var(--charcoal-light)', lineHeight: '1.5', margin: 0 }}>
                Prefer instant messaging? Chat directly with our high-jewelry advisors on WhatsApp. Request real-time photos, video previews, or lock diamond selections.
              </p>

              <a 
                href="https://wa.me/918094150075?text=Hello%20Shrii%20Navrang%20Jewellers,%20I%20would%20like%20to%20schedule%20a%20bespoke%20consultation." 
                target="_blank" 
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: '#25d366',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  padding: '12px 20px',
                  borderRadius: '4px',
                  boxShadow: '0 4px 10px rgba(37, 211, 102, 0.25)',
                  transition: 'background-color 0.2s',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#20ba5a'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#25d366'}
              >
                <MessageCircle size={18} />
                CHAT ON WHATSAPP
              </a>
            </div>

          </div>

        </div>
      </section>

      {/* 3. Interactive Embedded Google Maps Section */}
      <section style={{ borderTop: '3px solid var(--gold)', height: '450px', backgroundColor: 'var(--black)' }}>
        <iframe 
          src="https://maps.google.com/maps?q=Shrii%20Navrang%20Jewellers,%20BR%20Tower,%20Jhunjhunu&t=&z=16&ie=UTF8&iwloc=&output=embed" 
          width="100%" 
          height="100%" 
          style={{ border: 0, filter: 'grayscale(0.1) contrast(1.1) invert(0)' }} 
          allowFullScreen="" 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          title="Shrii Navrang Jewellers Flagship Showroom Jhunjhunu"
        />
      </section>

      {/* 4. Valet Parking & Trust highlights */}
      <section style={{ backgroundColor: 'var(--black)', padding: '50px 0', color: 'var(--white)', borderTop: '1px solid var(--charcoal-light)' }}>
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', gap: '30px', textAlign: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', maxWidth: '250px' }}>
            <ShieldCheck size={28} color="var(--gold)" />
            <h5 style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '4px 0 0 0' }}>COMPLIMENTARY VALET PARKING</h5>
            <span style={{ fontSize: '0.75rem', color: '#b5b5b5', fontWeight: 300 }}>Experience premium secured valet parking service right at our entrance.</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', maxWidth: '250px' }}>
            <Clock size={28} color="var(--gold)" />
            <h5 style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '4px 0 0 0' }}>BESPOKE DISCRETION</h5>
            <span style={{ fontSize: '0.75rem', color: '#b5b5b5', fontWeight: 300 }}>Private VIP lounge available for high-value bridal previews upon reservation.</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', maxWidth: '250px' }}>
            <Sparkles size={28} color="var(--gold)" />
            <h5 style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '4px 0 0 0' }}>EXPERT GEMOLOGISTS</h5>
            <span style={{ fontSize: '0.75rem', color: '#b5b5b5', fontWeight: 300 }}>In-house GIA-certified gemologists available for complimentary diamond grading.</span>
          </div>
        </div>
      </section>

      {/* Embedded Animations styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulseGreen {
          0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(37, 211, 102, 0); }
          100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
        }
        @keyframes pulseGold {
          0% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(212, 175, 55, 0); }
          100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
        }
        @media (max-width: 768px) {
          section > .container {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          h1[style*="fontSize: 3.6rem"] {
            font-size: 2.2rem !important;
          }
        }
      `}} />
    </div>
  );
};

export default ContactUs;
