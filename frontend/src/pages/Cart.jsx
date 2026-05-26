import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { API_URL } from '../config';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Heart } from 'lucide-react';

const Cart = ({ onShowToast }) => {
  const { cart, loading, updateQuantity, removeFromCart, cartCount } = useCart();
  const [cartProducts, setCartProducts] = useState([]);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const navigate = useNavigate();

  // Hydrate cart item products details from the API
  useEffect(() => {
    const fetchCartDetails = async () => {
      if (!cart || !cart.products || cart.products.length === 0) {
        setCartProducts([]);
        return;
      }
      setFetchingDetails(true);
      try {
        const hydrated = [];
        for (let item of cart.products) {
          const res = await fetch(`${API_URL}/products/${item.productId}`);
          if (res.ok) {
            const productData = await res.json();
            hydrated.push({
              product: productData,
              quantity: item.quantity
            });
          }
        }
        setCartProducts(hydrated);
      } catch (err) {
        console.error('Error hydrating cart details:', err);
      } finally {
        setFetchingDetails(false);
      }
    };
    fetchCartDetails();
  }, [cart]);

  const handleQtyChange = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      if (onShowToast) onShowToast('Item removed from bag', 'success');
    } else {
      updateQuantity(productId, newQty);
    }
  };

  const handleRemove = (productId) => {
    removeFromCart(productId);
    if (onShowToast) onShowToast('Item removed from bag', 'success');
  };

  const calculateSubtotal = () => {
    return cartProducts.reduce((sum, item) => sum + (item.product?.price * item.quantity), 0);
  };

  const subtotal = calculateSubtotal();
  const makingCharges = Math.round(subtotal * 0.03); // 3% making charges mock
  const gstTax = Math.round((subtotal + makingCharges) * 0.03); // 3% GST on precious metals
  const total = subtotal + makingCharges + gstTax;

  if (loading || fetchingDetails) {
    return (
      <div className="container skeleton" style={{ padding: '80px 20px', height: '50vh' }} />
    );
  }

  return (
    <div className="container" style={{ padding: '40px 20px', fontFamily: 'var(--font-body)' }}>
      <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '2rem', color: 'var(--black)', marginBottom: '30px', borderBottom: '1px solid var(--light-grey)', paddingBottom: '15px' }}>
        Your Shopping Bag ({cartCount} items)
      </h2>

      {cartProducts.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          border: '2px dashed var(--light-grey)',
          borderRadius: '8px',
          color: 'var(--grey)'
        }}>
          <ShoppingBag size={48} style={{ marginBottom: '20px', opacity: 0.5 }} color="var(--gold)" />
          <h3 style={{ fontSize: '1.4rem', color: 'var(--black)', marginBottom: '8px' }}>Your Bag is Empty</h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '24px' }}>Add some handcrafted masterpieces to your collection.</p>
          <Link to="/shop" className="btn-gold">Shop Collections</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '40px' }} className="cart-grid">
          {/* Cart Items list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {cartProducts.map((item, idx) => (
              <div 
                key={idx}
                className="glass-panel"
                style={{
                  display: 'flex',
                  gap: '20px',
                  padding: '20px',
                  borderRadius: '6px',
                  border: '1px solid rgba(212,175,55,0.1)'
                }}
              >
                {/* Product Image */}
                <div style={{ width: '100px', height: '100px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={item.product?.images?.[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                {/* Details */}
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <Link to={`/product/${item.product?._id}`}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--black)' }}>{item.product?.productName}</h4>
                    </Link>
                    <button 
                      onClick={() => handleRemove(item.product?._id)}
                      style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <span style={{ fontSize: '0.75rem', color: 'var(--grey)', textTransform: 'uppercase', marginBottom: '12px' }}>
                    Material: <b>{item.product?.material}</b> | Weight: <b>{item.product?.weight}</b>
                  </span>

                  {/* Quantity Stepper & Price Row */}
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--light-grey)', borderRadius: '4px', overflow: 'hidden' }}>
                      <button 
                        onClick={() => handleQtyChange(item.product?._id, item.quantity - 1)}
                        style={{ background: 'none', border: 'none', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1.1rem' }}
                      >-</button>
                      <span style={{ width: '32px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600 }}>{item.quantity}</span>
                      <button 
                        onClick={() => handleQtyChange(item.product?._id, item.quantity + 1)}
                        style={{ background: 'none', border: 'none', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1.1rem' }}
                      >+</button>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--black)', fontFamily: 'var(--font-title)' }}>
                        ₹{(item.product?.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                      {item.quantity > 1 && (
                        <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--grey)' }}>
                          (₹{item.product?.price?.toLocaleString('en-IN')} each)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Pricing Summary Panel */}
          <div>
            <div 
              className="glass-panel" 
              style={{
                padding: '30px', 
                borderRadius: '6px', 
                border: '1.5px solid var(--gold)',
                boxShadow: 'var(--shadow)',
                position: 'sticky',
                top: '110px'
              }}
            >
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--black)', marginBottom: '20px', borderBottom: '1px solid var(--light-grey)', paddingBottom: '12px' }}>
                Order Summary
              </h3>

              {/* pricing table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '0.9rem', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--grey)' }}>Cart Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--grey)' }}>Making Charges (3%)</span>
                  <span>₹{makingCharges.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--grey)' }}>GST Tax (3%)</span>
                  <span>₹{gstTax.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--light-grey)', paddingTop: '15px', fontWeight: 700, fontSize: '1.1rem', color: 'var(--black)' }}>
                  <span>Total Amount</span>
                  <span style={{ fontFamily: 'var(--font-title)', color: 'var(--gold-dark)' }}>
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Checkout actions */}
              <button 
                onClick={() => navigate('/checkout')}
                className="btn-gold" 
                style={{ width: '100%', justifyContent: 'center', height: '46px', gap: '10px', marginBottom: '20px' }}
              >
                Proceed to Checkout
                <ArrowRight size={18} />
              </button>

              {/* Security parameters */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--success)', fontSize: '0.75rem', fontWeight: 600, justifyContent: 'center' }}>
                <ShieldCheck size={18} />
                <span>100% Secured Premium Checkout Gateway</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Responsive details styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .cart-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}} />
    </div>
  );
};

export default Cart;
