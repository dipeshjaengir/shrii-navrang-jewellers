import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { API_URL } from '../config';
import { Heart, Trash2, ShoppingBag, ShoppingCart } from 'lucide-react';

const Wishlist = ({ onShowToast }) => {
  const { user, toggleWishlist } = useAuth();
  const { addToCart } = useCart();
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlistDetails = async () => {
    if (!user || !user.wishlist || user.wishlist.length === 0) {
      setWishlistProducts([]);
      return;
    }
    setLoading(true);
    try {
      const hydrated = [];
      for (let id of user.wishlist) {
        const res = await fetch(`${API_URL}/products/${id}`);
        if (res.ok) {
          const prodData = await res.json();
          hydrated.push(prodData);
        }
      }
      setWishlistProducts(hydrated);
    } catch (err) {
      console.error('Error fetching wishlist details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlistDetails();
  }, [user?.wishlist]);

  const handleRemove = async (productId) => {
    const success = await toggleWishlist(productId);
    if (success && onShowToast) {
      onShowToast('Removed from wishlist', 'success');
    }
  };

  const handleAddToCart = async (product) => {
    const result = await addToCart(product._id, 1);
    if (result && result.success) {
      if (onShowToast) onShowToast(`${product.productName} added to cart! ✨`, 'success');
    }
  };

  if (loading) {
    return (
      <div className="container skeleton" style={{ padding: '80px 20px', height: '50vh' }} />
    );
  }

  return (
    <div className="container" style={{ padding: '40px 20px', fontFamily: 'var(--font-body)' }}>
      <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '2rem', color: 'var(--black)', marginBottom: '30px', borderBottom: '1px solid var(--light-grey)', paddingBottom: '15px' }}>
        Your Favourites Wishlist
      </h2>

      {wishlistProducts.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          border: '2px dashed var(--light-grey)',
          borderRadius: '8px',
          color: 'var(--grey)'
        }}>
          <Heart size={48} style={{ marginBottom: '20px', opacity: 0.5 }} color="var(--gold)" />
          <h3 style={{ fontSize: '1.4rem', color: 'var(--black)', marginBottom: '8px' }}>Your Wishlist is Empty</h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '24px' }}>Save handcrafted jewelry masterpieces to review them later.</p>
          <Link to="/shop" className="btn-gold">Shop Collections</Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '30px'
        }}>
          {wishlistProducts.map(prod => (
            <div 
              key={prod._id}
              className="glass-panel"
              style={{
                borderRadius: '8px',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid rgba(212, 175, 55, 0.1)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
              }}
            >
              {/* Product Image */}
              <Link to={`/product/${prod._id}`} style={{ display: 'block', paddingTop: '100%', position: 'relative', overflow: 'hidden' }}>
                <img 
                  src={prod.images?.[0]} 
                  alt="" 
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                
                {/* Delete button overlay */}
                <button 
                  onClick={() => handleRemove(prod._id)}
                  style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    color: '#ff6b6b',
                    zIndex: 10
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </Link>

              {/* Details card content */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--gold-dark)', marginBottom: '8px' }}>
                  {prod.material} | {prod.weight}
                </span>

                <Link to={`/product/${prod._id}`}>
                  <h4 style={{
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    lineHeight: '1.4',
                    marginBottom: '10px',
                    color: 'var(--black)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    height: '38px'
                  }}>
                    {prod.productName}
                  </h4>
                </Link>

                <div style={{
                  marginTop: 'auto',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '15px',
                  borderTop: '1px solid var(--light-grey)'
                }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--black)', fontFamily: 'var(--font-title)' }}>
                    ₹{prod.price?.toLocaleString('en-IN')}
                  </span>

                  <button 
                    onClick={() => handleAddToCart(prod)}
                    style={{
                      background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))',
                      color: 'var(--black)',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <ShoppingCart size={14} />
                    Add to Bag
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
