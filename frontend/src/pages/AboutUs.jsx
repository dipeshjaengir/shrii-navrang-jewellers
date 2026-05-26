import React from 'react';
import { Award, ShieldCheck, Heart, Sparkles, BookOpen } from 'lucide-react';

const AboutUs = () => {
  return (
    <div style={{ fontFamily: 'var(--font-body)', backgroundColor: 'var(--white)', color: 'var(--charcoal)', overflowX: 'hidden' }}>
      
      {/* 1. Page Header */}
      <div style={{
        backgroundImage: `linear-gradient(to bottom, rgba(17, 17, 17, 0.85), rgba(17, 17, 17, 0.95)), url("https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&q=80&w=1200")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '120px 20px',
        textAlign: 'center',
        borderBottom: '2px solid var(--gold)'
      }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-title)', color: '#ffffff', fontSize: '3.5rem', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Our Heritage & Story
          </h1>
          <p style={{ color: 'var(--gold)', fontFamily: 'var(--font-title)', fontStyle: 'italic', fontSize: '1.4rem', letterSpacing: '1px', maxWidth: '700px', margin: '0 auto' }}>
            "Shri Navrang Jewellers - Where pure devotion meets timeless artistry."
          </p>
        </div>
      </div>

      {/* 2. The Legacy Block */}
      <section style={{ padding: '80px 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '2.5rem', color: 'var(--black)', marginBottom: '25px', position: 'relative' }}>
              Four Decades of Purity
            </h2>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.8', marginBottom: '20px', fontWeight: 300 }}>
              Founded in 1982 by Shri Ram Navrang, our legacy began as a humble crafting workshop in the heart of traditional gold-smithing lanes. With a steadfast dedication to absolute transparency, impeccable purity, and unmatched craftsmanship, we have grown into a premier jewellery house.
            </p>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.8', marginBottom: '20px', fontWeight: 300 }}>
              Every ornament we build represents an emotional bond. We specialize in bespoke, hand-beaten gold chokers, authentic uncut Polki designs, and high-brilliance diamond wedding bands that become symbols of heritage, passed down through generations.
            </p>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.8', fontWeight: 300 }}>
              To ensure absolute peace of mind, every piece of gold jewelry carries the 100% official 3-stamp BIS Hallmark, and every diamond is graded by independent labs like IGI and GIA.
            </p>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-15px', left: '-15px', right: '15px', bottom: '15px', border: '2px solid var(--gold)', borderRadius: '8px', zIndex: 1 }} />
            <img 
              src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600" 
              alt="Luxury gold necklace details"
              style={{ width: '100%', borderRadius: '8px', position: 'relative', zIndex: 2, boxShadow: 'var(--shadow-gold)' }}
            />
          </div>
        </div>
      </section>

      {/* 3. The Pillars of Excellence */}
      <section style={{ padding: '80px 0', backgroundColor: 'var(--alabaster)', borderTop: '1px solid rgba(212,175,55,0.15)', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
        <div className="container">
          <div className="section-title">
            <h2>Our Core Values</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '30px', marginTop: '40px' }}>
            
            <div className="glass-panel" style={{ padding: '40px 30px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(212,175,55,0.15)' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <ShieldCheck size={30} color="var(--gold)" />
              </div>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.3rem', marginBottom: '15px' }}>Impeccable Purity</h3>
              <p style={{ fontSize: '0.95rem', fontWeight: 300, lineHeight: '1.6' }}>
                Every single gram of gold we sell is 100% BIS Hallmarked. No compromise. No shortcuts.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '40px 30px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(212,175,55,0.15)' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Award size={30} color="var(--gold)" />
              </div>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.3rem', marginBottom: '15px' }}>Bespoke Artistry</h3>
              <p style={{ fontSize: '0.95rem', fontWeight: 300, lineHeight: '1.6' }}>
                Our karigars carry legacy wisdom of metal carving, giving you unique details that machine-mades lack.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '40px 30px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(212,175,55,0.15)' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Heart size={30} color="var(--gold)" />
              </div>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.3rem', marginBottom: '15px' }}>Honest Pricing</h3>
              <p style={{ fontSize: '0.95rem', fontWeight: 300, lineHeight: '1.6' }}>
                No hidden costs. Complete details of gold rate, making charges, and gem weights printed on your invoice.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Master Craftsman Bio */}
      <section style={{ padding: '80px 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '50px', alignItems: 'center' }}>
          <div>
            <img 
              src="https://images.unsplash.com/photo-1615655404740-8f030d678890?auto=format&fit=crop&q=80&w=600" 
              alt="Crafting hand detailed work"
              style={{ width: '100%', borderRadius: '8px', boxShadow: 'var(--shadow)' }}
            />
          </div>
          <div>
            <div style={{ display: 'inline-flex', padding: '4px 10px', backgroundColor: 'rgba(212,175,55,0.15)', border: '1px solid var(--gold)', borderRadius: '4px', gap: '6px', alignItems: 'center', marginBottom: '20px' }}>
              <BookOpen size={12} color="var(--gold)" />
              <span style={{ fontSize: '0.65rem', color: 'var(--gold)', letterSpacing: '1px', fontWeight: 600, textTransform: 'uppercase' }}>Behind The Bench</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '2.5rem', color: 'var(--black)', marginBottom: '20px' }}>
              Master Craftsman: Devendra Soni
            </h2>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.8', marginBottom: '15px', fontWeight: 300 }}>
              Leading our studio of artisans is Devendra Soni, a third-generation master goldsmith with over 35 years of experience. Devendra has designed ornaments for royal families, heritage exhibitions, and premium custom collections.
            </p>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.8', fontWeight: 300 }}>
              "Every design starts as a memory or a spiritual symbol. We mold hot gold, set delicate gemstones, and hand-polish it until it sings a song of beauty. Our bench is our temple, and our craft is our devotion."
            </p>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          section > .container {
            grid-template-columns: 1fr !important;
            gap: 30px !important;
          }
          h1[style*="fontSize: 3.5rem"] {
            font-size: 2.2rem !important;
          }
        }
      `}} />
    </div>
  );
};

export default AboutUs;
