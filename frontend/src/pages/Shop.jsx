import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Filter, RotateCcw, SlidersHorizontal, Star } from 'lucide-react';
import { API_URL } from '../config';
import ProductCard from '../components/ProductCard';

const Shop = ({ onShowToast }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [maxPrice, setMaxPrice] = useState(500000);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('popularity');
  const [searchWord, setSearchWord] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  // Load products from API
  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Parse URL search parameters for query syncs
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search') || '';
    const category = params.get('category');
    const material = params.get('material');
    const gender = params.get('gender');

    setSearchWord(search);
    
    if (category) {
      setSelectedCategories([category]);
    } else {
      setSelectedCategories([]);
    }

    if (material) {
      setSelectedMaterials([material]);
    } else {
      setSelectedMaterials([]);
    }

    if (gender) {
      setSelectedGenders([gender]);
    } else {
      setSelectedGenders([]);
    }
  }, [location.search]);

  // Apply active filters and sort
  useEffect(() => {
    let result = [...products];

    // Search Query
    if (searchWord) {
      const regex = new RegExp(searchWord, 'i');
      result = result.filter(p => regex.test(p.productName) || regex.test(p.description));
    }

    // Category Filter
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
    }

    // Material Filter
    if (selectedMaterials.length > 0) {
      result = result.filter(p => selectedMaterials.includes(p.material));
    }

    // Gender Filter
    if (selectedGenders.length > 0) {
      result = result.filter(p => selectedGenders.includes(p.gender));
    }

    // Price Filter
    result = result.filter(p => p.price <= maxPrice);

    // Rating Filter
    if (minRating > 0) {
      result = result.filter(p => p.ratings >= minRating);
    }

    // Sort Handler
    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.ratings - a.ratings);
    } else if (sortBy === 'latest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      // popularity
      result.sort((a, b) => b.stock - a.stock);
    }

    setFilteredProducts(result);
  }, [products, searchWord, selectedCategories, selectedMaterials, selectedGenders, maxPrice, minRating, sortBy]);

  const toggleCategory = (cat) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(x => x !== cat) : [...prev, cat]
    );
  };

  const toggleMaterial = (mat) => {
    setSelectedMaterials(prev => 
      prev.includes(mat) ? prev.filter(x => x !== mat) : [...prev, mat]
    );
  };

  const toggleGender = (gend) => {
    setSelectedGenders(prev => 
      prev.includes(gend) ? prev.filter(x => x !== gend) : [...prev, gend]
    );
  };

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedMaterials([]);
    setSelectedGenders([]);
    setMaxPrice(500000);
    setMinRating(0);
    setSortBy('popularity');
    setSearchWord('');
    navigate('/shop');
  };

  const categoriesList = ["Rings", "Bridal Collection", "Necklaces", "Earrings", "Bangles", "Diamond Jewellery", "Men's Jewellery", "Silver Jewellery", "Gold Jewellery"];
  const materialsList = ["Gold", "Silver", "Diamond", "Platinum"];
  const gendersList = ["Women", "Men", "Unisex"];

  return (
    <div className="container" style={{ padding: '40px 20px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: '40px', fontFamily: 'var(--font-body)' }}>
      {/* 1. Left Sidebar Filters panel */}
      <aside 
        className="glass-panel"
        style={{
          borderRadius: '8px',
          padding: '30px',
          height: 'fit-content',
          border: '1px solid rgba(212,175,55,0.15)',
          boxShadow: 'var(--shadow)',
          position: 'sticky',
          top: '110px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid var(--light-grey)', paddingBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--black)' }}>
            <SlidersHorizontal size={18} color="var(--gold-dark)" />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Filters</h4>
          </div>
          <button 
            onClick={handleResetFilters}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--grey)',
              fontSize: '0.75rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.color = 'var(--gold)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--grey)'}
          >
            <RotateCcw size={12} />
            Reset
          </button>
        </div>

        {/* Categories checklist */}
        <div style={{ marginBottom: '24px' }}>
          <h5 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--black)', letterSpacing: '0.5px', marginBottom: '12px' }}>Categories</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {categoriesList.map(cat => (
              <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--charcoal)' }}>
                <input 
                  type="checkbox" 
                  checked={selectedCategories.includes(cat)} 
                  onChange={() => toggleCategory(cat)}
                  style={{ accentColor: 'var(--gold)' }}
                />
                {cat}
              </label>
            ))}
          </div>
        </div>

        {/* Material checklist */}
        <div style={{ marginBottom: '24px' }}>
          <h5 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--black)', letterSpacing: '0.5px', marginBottom: '12px' }}>Material</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {materialsList.map(mat => (
              <label key={mat} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--charcoal)' }}>
                <input 
                  type="checkbox" 
                  checked={selectedMaterials.includes(mat)} 
                  onChange={() => toggleMaterial(mat)}
                  style={{ accentColor: 'var(--gold)' }}
                />
                {mat}
              </label>
            ))}
          </div>
        </div>

        {/* Gender checklist */}
        <div style={{ marginBottom: '24px' }}>
          <h5 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--black)', letterSpacing: '0.5px', marginBottom: '12px' }}>Gender</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {gendersList.map(gend => (
              <label key={gend} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--charcoal)' }}>
                <input 
                  type="checkbox" 
                  checked={selectedGenders.includes(gend)} 
                  onChange={() => toggleGender(gend)}
                  style={{ accentColor: 'var(--gold)' }}
                />
                {gend}
              </label>
            ))}
          </div>
        </div>

        {/* Price Slider */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <h5 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--black)', letterSpacing: '0.5px' }}>Max Price</h5>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gold-dark)' }}>₹{maxPrice.toLocaleString('en-IN')}</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="500000" 
            step="5000"
            value={maxPrice}
            onChange={(e) => setMaxPrice(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--gold)' }}
          />
        </div>

        {/* Minimum rating */}
        <div>
          <h5 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--black)', letterSpacing: '0.5px', marginBottom: '12px' }}>Minimum Rating</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[4.5, 4.0, 3.0].map(rating => (
              <label key={rating} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--charcoal)' }}>
                <input 
                  type="radio" 
                  name="ratingFilter"
                  checked={minRating === rating} 
                  onChange={() => setMinRating(rating)}
                  style={{ accentColor: 'var(--gold)' }}
                />
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  {rating} ★ & above
                </span>
              </label>
            ))}
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--charcoal)' }}>
              <input 
                type="radio" 
                name="ratingFilter"
                checked={minRating === 0} 
                onChange={() => setMinRating(0)}
                style={{ accentColor: 'var(--gold)' }}
              />
              Show All
            </label>
          </div>
        </div>
      </aside>

      {/* 2. Right Products Grid Area */}
      <main>
        {/* Sorting header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '30px',
          paddingBottom: '15px',
          borderBottom: '1.5px solid var(--light-grey)'
        }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--grey)' }}>Showing <b>{filteredProducts.length}</b> exquisite jewelry items</span>
            {searchWord && <span style={{ marginLeft: '10px', fontSize: '0.85rem', color: 'var(--gold-dark)' }}>for "<b>{searchWord}</b>"</span>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--grey)' }}>Sort By</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1.5px solid var(--light-grey)',
                borderRadius: '4px',
                backgroundColor: 'var(--white)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.8rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="popularity">Popularity</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Patron Rating</option>
              <option value="latest">New Arrivals</option>
            </select>
          </div>
        </div>

        {/* Products lists */}
        {loading ? (
          <div className="cards-grid">
            {[1,2,3,4,5,6].map(n => (
              <div key={n} style={{ height: '400px' }} className="skeleton" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            border: '2px dashed var(--light-grey)',
            borderRadius: '8px',
            color: 'var(--grey)'
          }}>
            <SlidersHorizontal size={48} style={{ marginBottom: '20px', opacity: 0.5 }} color="var(--gold)" />
            <h3 style={{ fontSize: '1.4rem', color: 'var(--black)', marginBottom: '8px' }}>No Masterpieces Found</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '24px' }}>Try loosening your filters or resetting search keywords.</p>
            <button onClick={handleResetFilters} className="btn-gold">Reset Filters</button>
          </div>
        ) : (
          <div className="cards-grid">
            {filteredProducts.map(prod => (
              <ProductCard key={prod._id} product={prod} onShowToast={onShowToast} />
            ))}
          </div>
        )}
      </main>

      {/* Responsive adjustments */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          main { grid-column: span 2 !important; }
          aside { display: none !important; }
        }
      `}} />
    </div>
  );
};

export default Shop;
