import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Heart, ShoppingCart, Star } from 'lucide-react';

const ProductCard = ({ product, onShowToast }) => {
  const { user, toggleWishlist } = useAuth();
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);

  const isWishlisted = user?.wishlist?.includes(product._id) || false;

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const success = await toggleWishlist(product._id);
    if (success && onShowToast) {
      onShowToast(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist! ✨', 'success');
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    
    const result = await addToCart(product._id, 1);
    
    if (result && !result.triggerAuth) {
      if (result.success && onShowToast) {
        onShowToast(`${product.productName} added to cart! ✨`, 'success');
      } else if (onShowToast) {
        onShowToast(result.error || 'Failed to add to cart', 'error');
      }
    }
    setAdding(false);
  };

  return (
    <div 
      className="glass-panel"
      style={{
        borderRadius: '8px',
        overflow: 'hidden',
        position: 'relative',
        transition: 'var(--transition)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        border: '1px solid rgba(212, 175, 55, 0.1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-gold)';
        e.currentTarget.style.borderColor = 'var(--gold)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
        e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.1)';
      }}
    >
      {/* Product Image Area with Hover Zoom */}
      <Link to={`/product/${product._id}`} style={{ position: 'relative', display: 'block', overflow: 'hidden', paddingTop: '100%' }}>
        <img 
          src={product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600'} 
          alt={product.productName} 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease-out'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.08)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        />

        {/* Wishlist Button Overlay */}
        <button 
          onClick={handleWishlistToggle}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'rgba(255, 255, 255, 0.95)',
            border: 'none',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            zIndex: 10,
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Heart size={18} fill={isWishlisted ? 'var(--gold)' : 'none'} color={isWishlisted ? 'var(--gold)' : 'var(--charcoal)'} />
        </button>

        {/* Low Stock Badge Overlay */}
        {product.stock <= 3 && product.stock > 0 && (
          <span style={{
            position: 'absolute',
            bottom: '15px',
            left: '15px',
            backgroundColor: '#d32f2f',
            color: '#ffffff',
            fontSize: '0.65rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            padding: '4px 10px',
            borderRadius: '30px',
            letterSpacing: '0.5px',
            zIndex: 10
          }}>
            Only {product.stock} Left!
          </span>
        )}

        {/* Out of Stock Badge Overlay */}
        {product.stock === 0 && (
          <span style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: '#ffffff',
            fontSize: '1rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}>
            Sold Out
          </span>
        )}
      </Link>

      {/* Card Info Details */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        {/* Material Badge & Gender */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          <span style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--gold-dark)',
            border: '1px solid var(--gold)',
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: 'rgba(212,175,55,0.05)'
          }}>
            {product.material}
          </span>
          <span style={{ fontSize: '0.65rem', color: 'var(--grey)', textTransform: 'uppercase', fontWeight: 600, alignSelf: 'center' }}>
            {product.gender}
          </span>
        </div>

        {/* Title */}
        <Link to={`/product/${product._id}`}>
          <h4 style={{
            fontSize: '1rem',
            fontWeight: 600,
            lineHeight: '1.4',
            marginBottom: '8px',
            color: 'var(--black)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            height: '42px'
          }}>
            {product.productName}
          </h4>
        </Link>

        {/* Ratings and Reviews count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', color: '#ffd700' }}>
            <Star size={14} fill="#ffd700" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--charcoal)', marginLeft: '4px' }}>
              {product.ratings || 4.5}
            </span>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--grey)' }}>
            ({product.reviewsCount || 0} reviews)
          </span>
        </div>

        {/* Price and Add to Cart Block */}
        <div style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '15px',
          borderTop: '1px solid var(--light-grey)'
        }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--grey)', textTransform: 'uppercase', display: 'block', fontWeight: 500 }}>
              Price
            </span>
            <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--black)', fontFamily: 'var(--font-title)' }}>
              ₹{product.price?.toLocaleString('en-IN')}
            </span>
          </div>

          <button 
            onClick={handleAddToCart}
            disabled={product.stock === 0 || adding}
            style={{
              background: product.stock === 0 ? '#cccccc' : 'linear-gradient(135deg, var(--gold), var(--gold-dark))',
              color: 'var(--black)',
              border: 'none',
              borderRadius: '4px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
              transition: 'var(--transition)',
              boxShadow: '0 4px 10px rgba(212, 175, 55, 0.15)'
            }}
            onMouseEnter={(e) => {
              if (product.stock > 0) {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 6px 15px rgba(212, 175, 55, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 10px rgba(212, 175, 55, 0.15)';
            }}
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
