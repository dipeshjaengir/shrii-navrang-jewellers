import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { API_URL } from '../config';
import { Star, Heart, ShoppingBag, Truck, RotateCcw, ShieldCheck, MessageSquare, ChevronRight } from 'lucide-react';
import ProductZoom from '../components/ProductZoom';

const ProductDetails = ({ onShowToast }) => {
  const { id } = useParams();
  const { user, token, toggleWishlist, triggerRestrictedAction } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  // Reviews States
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [addingCart, setAddingCart] = useState(false);

  const fetchProductDetails = async () => {
    try {
      const res = await fetch(`${API_URL}/products/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProduct(data);
        setActiveImage(data.images && data.images[0] ? data.images[0] : '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_URL}/reviews/product/${id}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProductDetails();
    fetchReviews();
  }, [id]);

  const handleWishlistToggle = async () => {
    const success = await toggleWishlist(product._id);
    if (success && onShowToast) {
      const isCurrentlyWishlisted = user?.wishlist?.includes(product._id);
      onShowToast(isCurrentlyWishlisted ? 'Removed from wishlist' : 'Added to wishlist! ✨', 'success');
    }
  };

  const handleAddToCart = async () => {
    setAddingCart(true);
    const result = await addToCart(product._id, quantity);
    if (result && !result.triggerAuth) {
      if (result.success && onShowToast) {
        onShowToast(`${product.productName} (${quantity}) added to cart! ✨`, 'success');
      } else if (onShowToast) {
        onShowToast(result.error || 'Failed to add to cart', 'error');
      }
    }
    setAddingCart(false);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      triggerRestrictedAction(() => handleReviewSubmit(e));
      return;
    }

    if (!newComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product._id,
          rating: newRating,
          comment: newComment
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit review');

      if (onShowToast) onShowToast('Thank you! Review submitted successfully. ⭐', 'success');
      setNewComment('');
      setNewRating(5);
      
      // Refresh details and reviews listing
      await fetchProductDetails();
      await fetchReviews();
    } catch (error) {
      if (onShowToast) onShowToast(error.message, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const isWishlisted = user?.wishlist?.includes(product?._id) || false;

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', height: '60vh' }} className="skeleton" />
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center', fontFamily: 'var(--font-body)' }}>
        <h3>Masterpiece Not Found</h3>
        <p style={{ marginTop: '10px' }}>The jewelry design you are searching for is no longer active.</p>
        <Link to="/shop" className="btn-gold" style={{ marginTop: '20px' }}>Back to Shop</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 20px', fontFamily: 'var(--font-body)' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--grey)', marginBottom: '30px' }}>
        <Link to="/" style={{ hover: { color: 'var(--gold)' } }}>Home</Link>
        <ChevronRight size={12} />
        <Link to="/shop">Shop</Link>
        <ChevronRight size={12} />
        <Link to={`/shop?category=${encodeURIComponent(product.category)}`}>{product.category}</Link>
        <ChevronRight size={12} />
        <span style={{ color: 'var(--black)', fontWeight: 600 }}>{product.productName}</span>
      </div>

      {/* Main product detail section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '60px', marginBottom: '80px' }} className="details-grid">
        {/* Left Side: Images & Zoom Magnifier */}
        <div>
          <ProductZoom imageUrl={activeImage} altText={product.productName} />

          {/* Thumbnails grid */}
          {product.images && product.images.length > 1 && (
            <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    border: activeImage === img ? '2px solid var(--gold)' : '1px solid var(--light-grey)',
                    padding: 0,
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Specifications and details */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Material & BIS hallmarked Tag */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--gold-dark)', border: '1px solid var(--gold)', padding: '3px 10px', borderRadius: '4px', backgroundColor: 'rgba(212,175,55,0.05)' }}>
              {product.material} Jewellery
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontSize: '0.75rem', fontWeight: 600 }}>
              <ShieldCheck size={14} />
              <span>BIS Hallmarked Purity</span>
            </div>
          </div>

          {/* Title */}
          <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '2.2rem', color: 'var(--black)', lineHeight: '1.3', marginBottom: '12px' }}>
            {product.productName}
          </h2>

          {/* Stars & Reviews */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', color: '#ffd700', gap: '2px' }}>
              {[1,2,3,4,5].map(n => (
                <Star key={n} size={16} fill={n <= Math.round(product.ratings) ? "#ffd700" : "none"} color="#ffd700" />
              ))}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--black)' }}>{product.ratings} Stars</span>
            <span style={{ color: 'var(--light-grey)' }}>|</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--grey)' }}>({reviews.length} Customer Reviews)</span>
          </div>

          {/* Price */}
          <div style={{ padding: '20px', backgroundColor: 'var(--alabaster)', borderRadius: '6px', borderLeft: '3px solid var(--gold)', marginBottom: '30px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--grey)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Offer Price
            </span>
            <span style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--black)', fontFamily: 'var(--font-title)' }}>
              ₹{product.price?.toLocaleString('en-IN')}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--grey)', display: 'block', marginTop: '4px' }}>
              (Inclusive of all taxes & making charges)
            </span>
          </div>

          {/* Description */}
          <p style={{ color: 'var(--charcoal)', lineHeight: '1.8', fontSize: '0.9rem', marginBottom: '35px', fontWeight: 400 }}>
            {product.description}
          </p>

          {/* Purchase actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
            {/* Quantity Stepper */}
            {product.stock > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--light-grey)', borderRadius: '4px', overflow: 'hidden' }}>
                <button 
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  style={{ background: 'none', border: 'none', width: '40px', height: '40px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 600 }}
                >-</button>
                <span style={{ width: '40px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>{quantity}</span>
                <button 
                  onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                  style={{ background: 'none', border: 'none', width: '40px', height: '40px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 600 }}
                >+</button>
              </div>
            )}

            {/* Add to Cart button */}
            <button 
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addingCart}
              className="btn-gold"
              style={{ flexGrow: 1, justifyContent: 'center', height: '44px', gap: '10px' }}
            >
              <ShoppingBag size={18} />
              {product.stock === 0 ? 'Out of Stock' : (addingCart ? 'Adding to cart...' : 'Add To Bag')}
            </button>

            {/* Wishlist toggle */}
            <button
              onClick={handleWishlistToggle}
              style={{
                border: '1.5px solid var(--gold)',
                background: 'transparent',
                borderRadius: '4px',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--gold)',
                transition: 'var(--transition)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(212,175,55,0.05)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <Heart size={20} fill={isWishlisted ? "var(--gold)" : "none"} color="var(--gold)" />
            </button>
          </div>

          {/* Delivery & Returns highlight */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderTop: '1px solid var(--light-grey)', paddingTop: '30px', fontSize: '0.8rem', color: 'var(--charcoal)' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Truck size={20} color="var(--gold-dark)" />
              <div>
                <b style={{ color: 'var(--black)', display: 'block', marginBottom: '2px' }}>Free Insured Delivery</b>
                <span>Transit fully insured by Navrang. Delivery within 3-5 business days.</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <RotateCcw size={20} color="var(--gold-dark)" />
              <div>
                <b style={{ color: 'var(--black)', display: 'block', marginBottom: '2px' }}>7-Days Easy Return</b>
                <span>Don't love it? Return within 7 days in original condition, no questions asked.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications grid section */}
      <section style={{ marginBottom: '80px' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--black)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '20px' }}>Product Specifications</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--light-grey)' }}>
              <td style={{ padding: '12px 20px', fontWeight: 600, color: 'var(--grey)', width: '30%' }}>Material Type</td>
              <td style={{ padding: '12px 20px', color: 'var(--black)' }}>{product.material}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--light-grey)' }}>
              <td style={{ padding: '12px 20px', fontWeight: 600, color: 'var(--grey)' }}>Gross Weight</td>
              <td style={{ padding: '12px 20px', color: 'var(--black)' }}>{product.weight}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--light-grey)' }}>
              <td style={{ padding: '12px 20px', fontWeight: 600, color: 'var(--grey)' }}>Gender Suitability</td>
              <td style={{ padding: '12px 20px', color: 'var(--black)' }}>{product.gender}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--light-grey)' }}>
              <td style={{ padding: '12px 20px', fontWeight: 600, color: 'var(--grey)' }}>Category Classification</td>
              <td style={{ padding: '12px 20px', color: 'var(--black)' }}>{product.category}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--light-grey)' }}>
              <td style={{ padding: '12px 20px', fontWeight: 600, color: 'var(--grey)' }}>Certificate Purity Tag</td>
              <td style={{ padding: '12px 20px', color: 'var(--black)' }}>100% BIS Hallmarked Solid Metal</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Reviews & Submission Area */}
      <section style={{ borderTop: '1.5px solid var(--light-grey)', paddingTop: '60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '60px' }} className="reviews-grid">
          {/* Reviews listing list */}
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--black)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '30px' }}>
              Patron Reviews ({reviews.length})
            </h3>

            {reviews.length === 0 ? (
              <p style={{ color: 'var(--grey)', fontStyle: 'italic', fontSize: '0.9rem' }}>
                No reviews have been written for this masterpiece yet. Be the first to express your experience!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {reviews.map(rev => (
                  <div key={rev._id} style={{ borderBottom: '1px solid var(--light-grey)', paddingBottom: '24px' }}>
                    <div style={{ display: 'flex', color: '#ffd700', gap: '2px', marginBottom: '8px' }}>
                      {[1,2,3,4,5].map(n => (
                        <Star key={n} size={14} fill={n <= rev.rating ? "#ffd700" : "none"} color="#ffd700" />
                      ))}
                    </div>
                    <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--charcoal)', marginBottom: '12px' }}>
                      "{rev.comment}"
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--grey)' }}>
                      <span>Submitted by verified patron</span>
                      <span>{new Date(rev.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submission Form */}
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--black)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '30px' }}>
              Write A Review
            </h3>

            <form onSubmit={handleReviewSubmit} className="glass-panel" style={{ padding: '30px', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.15)' }}>
              {/* Star selector */}
              <div className="form-group">
                <label>Select Rating</label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  {[1,2,3,4,5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNewRating(n)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <Star size={24} fill={n <= newRating ? "#ffd700" : "none"} color="#ffd700" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment text area */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label>Write Comment</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Share details of your experience with this jewelry item..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button 
                type="submit" 
                className="btn-gold" 
                disabled={submittingReview || !newComment.trim()}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Responsive details styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .details-grid, .reviews-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}} />
    </div>
  );
};

export default ProductDetails;
