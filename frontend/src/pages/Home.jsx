import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Star, ChevronLeft, ChevronRight, ArrowRight, ShieldCheck, Heart, Award } from 'lucide-react';
import { API_URL } from '../config';
import ProductCard from '../components/ProductCard';

const Home = ({ onShowToast }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const navigate = useNavigate();

  const heroSlides = [
    {
      title: "The Royal Bridal Heritage Collection",
      subtitle: "Unveiling masterpiece Polki and Kundan chokers handcrafted for your unforgettable moments.",
      btnText: "Explore Bridal Couture",
      image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&q=80&w=1200",
      link: "/shop?category=Bridal Collection"
    },
    {
      title: "Timeless Diamond Solitaires",
      subtitle: "Experience absolute brilliance and modern luxury with our curated certified diamond rings and studs.",
      btnText: "Browse Diamonds",
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1200",
      link: "/shop?material=Diamond"
    },
    {
      title: "BIS 22K Antique Gold Artifacts",
      subtitle: "Discover temple and filigree gold neckpieces celebrating Indian devotion, legacy, and pure artistry.",
      btnText: "Shop Gold Creations",
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1200",
      link: "/shop?material=Gold"
    }
  ];

  // Fetch best sellers and featured products
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch(`${API_URL}/products`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.slice(0, 4)); // Get first 4 products for featured section
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  // Slide Interval Timer
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setActiveSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(slideTimer);
  }, [heroSlides.length]);

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
  };

  const categories = [
    { name: "Gold Jewellery", image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=300", filter: "material=Gold" },
    { name: "Diamond Solitaires", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=300", filter: "material=Diamond" },
    { name: "Bridal Couture", image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&q=80&w=300", filter: "category=Bridal Collection" },
    { name: "Men's Collection", image: "https://images.unsplash.com/photo-1615655404740-8f030d678890?auto=format&fit=crop&q=80&w=300", filter: "gender=Men" },
    { name: "Silver Elegance", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=300", filter: "material=Silver" }
  ];

  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>
      {/* 1. Hero Carousel Banner */}
      <div style={{ position: 'relative', height: '600px', width: '100%', overflow: 'hidden', backgroundColor: 'var(--black)' }}>
        {heroSlides.map((slide, idx) => (
          <div 
            key={idx}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `linear-gradient(to right, rgba(17, 17, 17, 0.9) 30%, rgba(17, 17, 17, 0.4) 100%), url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              opacity: idx === activeSlide ? 1 : 0,
              transition: 'opacity 1s cubic-bezier(0.25, 0.8, 0.25, 1)',
              zIndex: idx === activeSlide ? 1 : 0,
              padding: '0 80px'
            }}
          >
            <div className="container" style={{ maxWidth: '800px', margin: 0, animation: idx === activeSlide ? 'slideUp 1s ease-out forwards' : 'none' }}>
              <div style={{ display: 'inline-flex', padding: '6px 12px', backgroundColor: 'rgba(212,175,55,0.15)', border: '1px solid var(--gold)', borderRadius: '4px', gap: '8px', alignItems: 'center', marginBottom: '20px' }}>
                <Sparkles size={14} color="var(--gold)" />
                <span style={{ fontSize: '0.7rem', color: 'var(--gold)', letterSpacing: '2px', fontWeight: 600, textTransform: 'uppercase' }}>Legacy of Purity</span>
              </div>
              <h1 style={{
                fontFamily: 'var(--font-title)',
                color: '#ffffff',
                fontSize: '3.5rem',
                lineHeight: '1.2',
                marginBottom: '20px',
                fontWeight: 700
              }}>
                {slide.title}
              </h1>
              <p style={{
                color: '#cccccc',
                fontSize: '1.1rem',
                lineHeight: '1.6',
                marginBottom: '35px',
                fontWeight: 300,
                maxWidth: '600px'
              }}>
                {slide.subtitle}
              </p>
              <button onClick={() => navigate(slide.link)} className="btn-gold">
                {slide.btnText}
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        ))}

        {/* Carousel Controls */}
        <button onClick={handlePrevSlide} style={{ position: 'absolute', left: '30px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(17,17,17,0.6)', border: '1px solid var(--gold)', color: '#fff', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}>
          <ChevronLeft size={24} />
        </button>
        <button onClick={handleNextSlide} style={{ position: 'absolute', right: '30px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(17,17,17,0.6)', border: '1px solid var(--gold)', color: '#fff', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}>
          <ChevronRight size={24} />
        </button>
      </div>

      {/* 2. Hallmarked Trust Bar */}
      <div style={{ backgroundColor: 'var(--black)', borderBottom: '1px solid var(--charcoal-light)', padding: '24px 0', color: 'var(--white)' }}>
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', gap: '20px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={28} color="var(--gold)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>100% BIS Hallmarked Gold</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={28} color="var(--gold)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Certified Conflict-Free Diamonds</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={28} color="var(--gold)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Free Insured Shipping & Return</span>
          </div>
        </div>
      </div>

      {/* 3. Browse by Category */}
      <section style={{ padding: '80px 0', backgroundColor: 'var(--white)' }}>
        <div className="container">
          <div className="section-title">
            <h2>Select by Category</h2>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center' }}>
            {categories.map((cat, idx) => (
              <div 
                key={idx}
                onClick={() => navigate(`/shop?${cat.filter}`)}
                style={{
                  position: 'relative',
                  width: '210px',
                  height: '260px',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '1.5px solid rgba(212,175,55,0.1)',
                  boxShadow: 'var(--shadow)',
                  transition: 'var(--transition)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.borderColor = 'var(--gold)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(212,175,55,0.1)';
                }}
              >
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                  padding: '20px 15px',
                  textAlign: 'center'
                }}>
                  <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 600, fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {cat.name}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Featured Masterpieces */}
      <section style={{ padding: '80px 0', backgroundColor: 'var(--alabaster)' }}>
        <div className="container">
          <div className="section-title">
            <h2>Featured Masterpieces</h2>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '30px' }}>
              {[1, 2, 3, 4].map(n => (
                <div key={n} style={{ height: '380px', border: '1px solid #eee' }} className="skeleton" />
              ))}
            </div>
          ) : (
            <>
              <div className="cards-grid">
                {products.map(prod => (
                  <ProductCard key={prod._id} product={prod} onShowToast={onShowToast} />
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <button onClick={() => navigate('/shop')} className="btn-outline">
                  View All Masterpieces
                  <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 5. Brand Story */}
      <section style={{ backgroundColor: 'var(--black)', color: '#ffffff', overflow: 'hidden', padding: '100px 0', borderTop: '1px solid var(--gold)', borderBottom: '1px solid var(--gold)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', padding: '4px 10px', backgroundColor: 'rgba(212,175,55,0.15)', border: '1px solid var(--gold)', borderRadius: '4px', gap: '6px', alignItems: 'center', marginBottom: '20px' }}>
              <Award size={12} color="var(--gold)" />
              <span style={{ fontSize: '0.65rem', color: 'var(--gold)', letterSpacing: '1px', fontWeight: 600, textTransform: 'uppercase' }}>The Artisanal Heritage</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-title)', color: '#ffffff', fontSize: '2.8rem', lineHeight: '1.2', marginBottom: '24px' }}>
              Our Story of Devotion
            </h2>
            <p style={{ color: '#cccccc', lineHeight: '1.8', marginBottom: '20px', fontWeight: 300 }}>
              Shrii Navrang Jewellers was founded on a simple philosophy: gold is not just a metal; it is a sacred ornament carrying generations of Indian legacy, rituals, and emotions. For over four decades, our master artisans have breathed soul into gold, silver, and diamonds.
            </p>
            <p style={{ color: '#cccccc', lineHeight: '1.8', marginBottom: '30px', fontWeight: 300 }}>
              Every filigree wire we twist, every Polki diamond we select, and every temple figure we carve is a tribute to India's breathtaking heritage. When you wear a Navrang masterpiece, you wear a piece of eternity.
            </p>
            <button onClick={() => navigate('/about')} className="btn-gold">
              Read Heritage Story
            </button>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              top: '-15px',
              left: '-15px',
              right: '15px',
              bottom: '15px',
              border: '2px solid var(--gold)',
              borderRadius: '8px',
              zIndex: 1
            }} />
            <img 
              src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&q=80&w=600" 
              alt="Artisan sculpting gold"
              style={{
                width: '100%',
                borderRadius: '8px',
                position: 'relative',
                zIndex: 2,
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                display: 'block'
              }}
            />
          </div>
        </div>
      </section>

      {/* 6. Customer Testimonials */}
      <section style={{ padding: '80px 0', backgroundColor: 'var(--white)' }}>
        <div className="container">
          <div className="section-title">
            <h2>Patron Testimonials</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
            <div className="glass-panel" style={{ padding: '40px', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.1)' }}>
              <div style={{ display: 'flex', color: '#ffd700', gap: '4px', marginBottom: '16px' }}>
                {[1,2,3,4,5].map(n => <Star key={n} size={16} fill="#ffd700" color="#ffd700" />)}
              </div>
              <p style={{ fontStyle: 'italic', lineHeight: '1.8', color: 'var(--charcoal)', marginBottom: '24px' }}>
                "Ordered the Aditi temple choker for my wedding. The BIS 22k hallmark was fully certified, and the details of Goddess Lakshmi are breathtaking. Truly an heirloom piece."
              </p>
              <div>
                <h5 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--black)' }}>Aishwarya Sharma</h5>
                <span style={{ fontSize: '0.75rem', color: 'var(--grey)' }}>Jhunjhunu, Rajasthan</span>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '40px', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.1)' }}>
              <div style={{ display: 'flex', color: '#ffd700', gap: '4px', marginBottom: '16px' }}>
                {[1,2,3,4,5].map(n => <Star key={n} size={16} fill="#ffd700" color="#ffd700" />)}
              </div>
              <p style={{ fontStyle: 'italic', lineHeight: '1.8', color: 'var(--charcoal)', marginBottom: '24px' }}>
                "The Aria Solitaire Diamond Ring is absolutely stunning. Excellent brilliance. The magnifying lens zoom tool on their website helped me verify every facet before purchasing."
              </p>
              <div>
                <h5 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--black)' }}>Rohan Deshmukh</h5>
                <span style={{ fontSize: '0.75rem', color: 'var(--grey)' }}>Mumbai, Maharashtra</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Custom responsive details for Home story grid */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          section[style*="gridTemplateColumns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          h1[style*="fontSize: 3.5rem"] {
            font-size: 2.2rem !important;
          }
          div[style*="height: 600px"] {
            height: 500px !important;
          }
          div[style*="padding: 0 80px"] {
            padding: 0 20px !important;
          }
        }
      `}} />
    </div>
  );
};

export default Home;
