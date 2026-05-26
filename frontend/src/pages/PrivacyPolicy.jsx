import React from 'react';
import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div style={{ fontFamily: 'var(--font-body)', backgroundColor: 'var(--white)', color: 'var(--charcoal)', overflowX: 'hidden' }}>
      
      {/* 1. Header */}
      <div style={{
        backgroundImage: `linear-gradient(to bottom, rgba(17, 17, 17, 0.85), rgba(17, 17, 17, 0.95)), url("https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&q=80&w=1200")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '100px 20px',
        textAlign: 'center',
        borderBottom: '2px solid var(--gold)'
      }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-title)', color: '#ffffff', fontSize: '3.2rem', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Privacy & Security Policy
          </h1>
          <p style={{ color: 'var(--gold)', fontFamily: 'var(--font-title)', fontStyle: 'italic', fontSize: '1.3rem', letterSpacing: '1px', maxWidth: '700px', margin: '0 auto' }}>
            "Your trust and privacy are our most sacred treasures."
          </p>
        </div>
      </div>

      {/* 2. Content */}
      <section style={{ padding: '80px 0' }}>
        <div className="container" style={{ maxWidth: '800px', lineHeight: '1.8', fontWeight: 300 }}>
          
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '30px' }}>
            <ShieldCheck size={28} color="var(--gold)" />
            <span style={{ fontSize: '0.9rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--black)' }}>
              Effective Date: May 2026
            </span>
          </div>

          <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.6rem', color: 'var(--black)', marginTop: '40px', marginBottom: '15px' }}>
            1. Commitment to Data Security
          </h3>
          <p style={{ marginBottom: '20px' }}>
            At Shrii Navrang Jewellers, we understand that purchasing luxury jewelry online involves sharing sensitive personal and financial data. We are fully committed to protecting your privacy. We implement industry-leading encryption and secure cloud-hosted databases to safeguard all customer data, transactions, and session information.
          </p>

          <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.6rem', color: 'var(--black)', marginTop: '40px', marginBottom: '15px' }}>
            2. Personal Information We Collect
          </h3>
          <p style={{ marginBottom: '10px' }}>
            To provide a seamless high-end shopping experience, we collect specific details when you perform activities on our website:
          </p>
          <ul style={{ paddingLeft: '24px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>Identity & Account Details</strong>: Your name, email, phone number, and password hashes collected during user registration.</li>
            <li><strong>Shipping & Billing Addresses</strong>: Saved addresses to facilitate convenient, rapid checkout.</li>
            <li><strong>Payment Logs</strong>: We utilize secure payment tokenization. Your raw credit card credentials are never processed or stored directly on our servers.</li>
            <li><strong>Shopping Data</strong>: Your shopping cart state, wishlist items, product reviews, and custom order history.</li>
          </ul>

          <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.6rem', color: 'var(--black)', marginTop: '40px', marginBottom: '15px' }}>
            3. How We Use Your Data
          </h3>
          <p style={{ marginBottom: '15px' }}>
            The personal information we collect is strictly utilized for the following core operations:
          </p>
          <ul style={{ paddingLeft: '24px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>Processing and executing your jewelry orders, engraving customization, and arranging secure insured shipping.</li>
            <li>Syncing guest cart sessions seamlessly into database storage upon successful authentication.</li>
            <li>Sending essential transaction updates, OTP codes, order tracking stages, and order invoices.</li>
            <li>Providing responsive customer support for bespoke orders or video consultations.</li>
          </ul>

          <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.6rem', color: 'var(--black)', marginTop: '40px', marginBottom: '15px' }}>
            4. Third-Party Sharing
          </h3>
          <p style={{ marginBottom: '20px' }}>
            We do not sell, rent, or trade your personal data to external marketing companies. Your details are shared solely with authorized third-party services necessary for fulfillment, such as (1) certified shipping couriers (e.g., Sequel Logistics, Blue Dart), (2) encrypted payment gateways (e.g., Razorpay, Stripe, secure bank gateways), and (3) transactional SMS/Email relays.
          </p>

          <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.6rem', color: 'var(--black)', marginTop: '40px', marginBottom: '15px' }}>
            5. Cookies & Tracking
          </h3>
          <p style={{ marginBottom: '40px' }}>
            We use secure browser cookies to recognize your authentication token, remember items in your cart, and study site traffic patterns to improve web layout responsiveness. You can choose to disable cookies in your browser settings, but please note that some interactive aspects of the site may cease to function correctly.
          </p>

          <div className="glass-panel" style={{ padding: '30px', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.15)', display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Lock size={36} color="var(--gold)" style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', marginBottom: '6px', color: 'var(--black)' }}>
                Questions or Data Requests?
              </h4>
              <p style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
                If you wish to view, modify, or permanently delete your stored details, please write to our Data Privacy Officer at <strong>security@shriinavrang.com</strong>.
              </p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};

export default PrivacyPolicy;
