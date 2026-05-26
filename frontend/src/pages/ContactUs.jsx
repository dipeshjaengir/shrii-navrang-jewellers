import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, ShieldCheck } from 'lucide-react';

const ContactUs = ({ onShowToast }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
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
      if (onShowToast) onShowToast('Thank you! Your message has been sent successfully. Our concierge will connect with you within 24 hours.', 'success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <div style={{ fontFamily: 'var(--font-body)', backgroundColor: 'var(--white)', color: 'var(--charcoal)', overflowX: 'hidden' }}>
      
      {/* 1. Header */}
      <div style={{
        backgroundImage: `linear-gradient(to bottom, rgba(17, 17, 17, 0.85), rgba(17, 17, 17, 0.95)), url("https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1200")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '120px 20px',
        textAlign: 'center',
        borderBottom: '2px solid var(--gold)'
      }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-title)', color: '#ffffff', fontSize: '3.5rem', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Contact & Showrooms
          </h1>
          <p style={{ color: 'var(--gold)', fontFamily: 'var(--font-title)', fontStyle: 'italic', fontSize: '1.4rem', letterSpacing: '1px', maxWidth: '700px', margin: '0 auto' }}>
            "Step into the world of pure elegance. Visit our grand showroom."
          </p>
        </div>
      </div>

      {/* 2. Main Contact Grid */}
      <section style={{ padding: '80px 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '60px' }}>
          
          {/* Left Panel: Contact Form */}
          <div className="glass-panel" style={{ padding: '50px 40px', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
            <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '2.2rem', marginBottom: '30px', color: 'var(--black)' }}>
              Write to Our Concierge
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    className="form-control" 
                    placeholder="Enter your name"
                    value={formData.name} 
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    className="form-control" 
                    placeholder="Enter your email"
                    value={formData.email} 
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    className="form-control" 
                    placeholder="Enter your number"
                    value={formData.phone} 
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input 
                    type="text" 
                    id="subject" 
                    name="subject" 
                    className="form-control" 
                    placeholder="Bespoke consultation..."
                    value={formData.subject} 
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea 
                  id="message" 
                  name="message" 
                  className="form-control" 
                  rows="5"
                  placeholder="How can we assist you today? Feel free to request video calling appointments or custom modifications..."
                  value={formData.message} 
                  onChange={handleChange}
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button 
                type="submit" 
                className="btn-gold" 
                style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
                disabled={submitting}
              >
                {submitting ? 'Sending Request...' : 'Send Message'}
                <Send size={16} />
              </button>
            </form>
          </div>

          {/* Right Panel: Showroom Details & Quick Info */}
          <div>
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '2.2rem', marginBottom: '25px', color: 'var(--black)' }}>
                Grand Showroom
              </h2>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '24px', alignItems: 'flex-start' }}>
                <div style={{ minWidth: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={20} color="var(--gold)" />
                </div>
                <div>
                  <h4 style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--black)', marginBottom: '4px' }}>Address</h4>
                  <p style={{ fontWeight: 300, fontSize: '0.95rem', lineHeight: '1.6' }}>
                    Shrii Navrang Jewellers Building, 104-106, Chandni Chowk Road, Opposite Metro Gate 2, Delhi - 110006, India.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', marginBottom: '24px', alignItems: 'flex-start' }}>
                <div style={{ minWidth: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Phone size={20} color="var(--gold)" />
                </div>
                <div>
                  <h4 style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--black)', marginBottom: '4px' }}>Phone Support</h4>
                  <p style={{ fontWeight: 300, fontSize: '0.95rem', lineHeight: '1.6' }}>
                    Concierge Line: +91 11 4987 6543<br />
                    WhatsApp Catalogue: +91 98765 43210
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', marginBottom: '24px', alignItems: 'flex-start' }}>
                <div style={{ minWidth: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={20} color="var(--gold)" />
                </div>
                <div>
                  <h4 style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--black)', marginBottom: '4px' }}>General & Bespoke Inquiries</h4>
                  <p style={{ fontWeight: 300, fontSize: '0.95rem', lineHeight: '1.6' }}>
                    concierge@shriinavrang.com<br />
                    orders@shriinavrang.com
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                <div style={{ minWidth: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={20} color="var(--gold)" />
                </div>
                <div>
                  <h4 style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--black)', marginBottom: '4px' }}>Showroom Timings</h4>
                  <p style={{ fontWeight: 300, fontSize: '0.95rem', lineHeight: '1.6' }}>
                    Tuesday - Sunday: 11:00 AM - 08:30 PM<br />
                    (Closed on Mondays)
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '30px', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.15)', display: 'flex', gap: '15px', alignItems: 'center' }}>
              <ShieldCheck size={40} color="var(--gold)" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--charcoal)', lineHeight: '1.5' }}>
                <strong>VIRTUAL ASSISTANCE AVAILABLE</strong><br />
                Request a dedicated live video presentation of any jewellery piece via Google Meet or WhatsApp with our expert consultants.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Embedded Map Mockup */}
      <section style={{ height: '400px', borderTop: '2px solid var(--gold)', position: 'relative', overflow: 'hidden' }}>
        <img 
          src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&q=80&w=1200" 
          alt="Mock map showroom location background"
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) brightness(0.3)' }}
        />
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
          color: '#ffffff',
          textAlign: 'center',
          padding: '20px'
        }}>
          <h3 style={{ fontFamily: 'var(--font-title)', color: 'var(--gold)', fontSize: '2rem', marginBottom: '10px' }}>
            Visit Us in Chandni Chowk
          </h3>
          <p style={{ maxWidth: '500px', fontWeight: 300, fontSize: '1rem', lineHeight: '1.6' }}>
            Convenient valet parking is available right at our entrance. Guided shuttle assistance is also available from Chandni Chowk Metro Station.
          </p>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          section > .container {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          h1[style*="fontSize: 3.5rem"] {
            font-size: 2.2rem !important;
          }
        }
      `}} />
    </div>
  );
};

export default ContactUs;
