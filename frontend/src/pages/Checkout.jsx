import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { API_URL } from '../config';
import { ShieldCheck, Plus, CheckCircle, CreditCard, ArrowRight, Truck } from 'lucide-react';

const Checkout = ({ onShowToast }) => {
  const { user, token, updateProfile } = useAuth();
  const { cart, clearCart } = useCart();
  const [cartProducts, setCartProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Flow control states
  const [selectedAddressIdx, setSelectedAddressIdx] = useState(0);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Address form inputs
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('India');

  // Card form inputs
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartDetails = async () => {
      if (!cart || !cart.products || cart.products.length === 0) {
        setCartProducts([]);
        setLoading(false);
        return;
      }
      try {
        const hydrated = [];
        for (let item of cart.products) {
          const res = await fetch(`${API_URL}/products/${item.productId}`);
          if (res.ok) {
            const productData = await res.json();
            hydrated.push({
              productId: item.productId,
              productName: productData.productName,
              price: productData.price,
              images: productData.images,
              quantity: item.quantity
            });
          }
        }
        setCartProducts(hydrated);
      } catch (err) {
        console.error('Checkout cart hydrate error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCartDetails();
  }, [cart]);

  // Set default selected address index if user has addresses
  useEffect(() => {
    if (user?.addresses?.length > 0) {
      const defaultIdx = user.addresses.findIndex(addr => addr.isDefault);
      setSelectedAddressIdx(defaultIdx >= 0 ? defaultIdx : 0);
    }
  }, [user]);

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    if (!street || !city || !state || !zip) return;

    const newAddress = { street, city, state, zip, country, isDefault: user.addresses.length === 0 };
    const updatedAddresses = [...user.addresses, newAddress];

    try {
      await updateProfile({ addresses: updatedAddresses });
      if (onShowToast) onShowToast('New address saved successfully! 🏠', 'success');
      
      // Reset form
      setStreet('');
      setCity('');
      setState('');
      setZip('');
      setShowAddressForm(false);
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Failed to add address', 'error');
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (user.addresses.length === 0) {
      if (onShowToast) onShowToast('Please save a shipping address to continue', 'error');
      return;
    }
    if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
      if (onShowToast) onShowToast('Please fill card details', 'error');
      return;
    }

    setProcessingPayment(true);

    // Simulate Insured Payment Gateway verification
    setTimeout(async () => {
      try {
        const activeAddress = user.addresses[selectedAddressIdx];
        const subtotal = cartProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const makingCharges = Math.round(subtotal * 0.03);
        const gstTax = Math.round((subtotal + makingCharges) * 0.03);
        const total = subtotal + makingCharges + gstTax;

        const orderPayload = {
          products: cartProducts.map(p => ({
            productId: p.productId,
            quantity: p.quantity,
            price: p.price
          })),
          address: {
            street: activeAddress.street,
            city: activeAddress.city,
            state: activeAddress.state,
            zip: activeAddress.zip,
            country: activeAddress.country
          },
          totalPrice: total,
          paymentDetails: {
            status: 'Paid',
            paymentMethod: 'Credit Card',
            transactionId: 'TXN_' + Math.random().toString(36).substring(2, 11).toUpperCase()
          }
        };

        const res = await fetch(`${API_URL}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(orderPayload)
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Payment placement failed');

        // Order success state
        setOrderSuccess(data);
        clearCart(); // Clear local/context cart states
        if (onShowToast) onShowToast('Order Placed Successfully! ✨', 'success');
      } catch (err) {
        if (onShowToast) onShowToast(err.message, 'error');
      } finally {
        setProcessingPayment(false);
      }
    }, 2500); // 2.5s bank secure verification
  };

  const calculateSubtotal = () => {
    return cartProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const subtotal = calculateSubtotal();
  const makingCharges = Math.round(subtotal * 0.03);
  const gstTax = Math.round((subtotal + makingCharges) * 0.03);
  const total = subtotal + makingCharges + gstTax;

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', height: '60vh' }} className="skeleton" />
    );
  }

  // 1. Interactive Loader during mock secure transaction
  if (processingPayment) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '70vh',
        fontFamily: 'var(--font-body)',
        color: 'var(--gold)',
        textAlign: 'center',
        padding: '20px'
      }}>
        {/* Circular Glowing Stepper */}
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid rgba(212, 175, 55, 0.1)',
          borderTop: '4px solid var(--gold)',
          borderRadius: '50%',
          animation: 'pulseGold 1s linear infinite, spin 1s linear infinite',
          marginBottom: '30px'
        }} />
        <h3 style={{ fontSize: '1.4rem', color: 'var(--black)', letterSpacing: '1px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
          Verifying Insured Transaction
        </h3>
        <p style={{ color: 'var(--grey)', fontSize: '0.85rem', maxWidth: '400px' }}>
          Establishing a 256-bit encrypted link with the merchant bank. Navrang insures your jewelry from crafting to your doorstep.
        </p>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}} />
      </div>
    );
  }

  // 2. High-fidelity Invoice Success state
  if (orderSuccess) {
    return (
      <div className="container animate-fade" style={{ padding: '60px 20px', maxWidth: '600px', textAlign: 'center', fontFamily: 'var(--font-body)' }}>
        <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', backgroundColor: 'rgba(46,125,50,0.1)', border: '2px solid var(--success)', color: 'var(--success)', marginBottom: '24px' }}>
          <CheckCircle size={36} />
        </div>
        
        <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '2.2rem', color: 'var(--black)', marginBottom: '8px' }}>
          Order Placed Successfully!
        </h2>
        <p style={{ color: 'var(--gold-dark)', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '35px' }}>
          A Legacy Crafted for Eternity
        </p>

        {/* Invoice Summary Card */}
        <div className="glass-panel" style={{ padding: '30px', borderRadius: '8px', border: '1.5px solid var(--gold)', textAlign: 'left', marginBottom: '35px', boxShadow: 'var(--shadow)' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--black)', textTransform: 'uppercase', borderBottom: '1px solid var(--light-grey)', paddingBottom: '10px', marginBottom: '15px' }}>
            Receipt & Details
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: 'var(--charcoal)' }}>
            <div>
              <span style={{ color: 'var(--grey)' }}>Transaction ID:</span> <b style={{ float: 'right', color: 'var(--black)' }}>{orderSuccess.paymentDetails?.transactionId}</b>
            </div>
            <div>
              <span style={{ color: 'var(--grey)' }}>Order Ref ID:</span> <b style={{ float: 'right', color: 'var(--black)', fontFamily: 'monospace' }}>{orderSuccess._id}</b>
            </div>
            <div>
              <span style={{ color: 'var(--grey)' }}>Total Paid Amount:</span> <b style={{ float: 'right', color: 'var(--gold-dark)', fontSize: '1.1rem' }}>₹{orderSuccess.totalPrice?.toLocaleString('en-IN')}</b>
            </div>
            <div>
              <span style={{ color: 'var(--grey)' }}>Payment Mode:</span> <b style={{ float: 'right', color: 'var(--black)' }}>Insured Card Payment</b>
            </div>
            <div style={{ borderTop: '1px solid #eee', paddingTop: '10px', marginTop: '5px' }}>
              <span style={{ color: 'var(--grey)', display: 'block', marginBottom: '4px' }}>Delivery Destination:</span>
              <span style={{ color: 'var(--black)', lineHeight: '1.6', fontWeight: 500 }}>
                {orderSuccess.address?.street}, {orderSuccess.address?.city}, {orderSuccess.address?.state} - {orderSuccess.address?.zip}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to={`/order-tracking/${orderSuccess._id}`} className="btn-gold" style={{ flexGrow: 1, justifyContent: 'center' }}>
            Track Shipment
          </Link>
          <Link to="/shop" className="btn-outline" style={{ flexGrow: 1, justifyContent: 'center' }}>
            Continue Browsing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 20px', fontFamily: 'var(--font-body)' }}>
      <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '2rem', color: 'var(--black)', marginBottom: '30px', borderBottom: '1px solid var(--light-grey)', paddingBottom: '15px' }}>
        Premium Insured Checkout
      </h2>

      {cartProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h3>No items in bag to checkout.</h3>
          <Link to="/shop" className="btn-gold" style={{ marginTop: '20px' }}>Shop Collection</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '40px' }} className="checkout-grid">
          {/* Left panel: Address & Payment */}
          <div>
            {/* 1. Address Section */}
            <div className="glass-panel" style={{ padding: '30px', borderRadius: '6px', border: '1px solid rgba(212,175,55,0.15)', marginBottom: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--light-grey)', paddingBottom: '12px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--black)' }}>
                  1. Shipping Destination
                </h3>
                <button 
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--gold-dark)',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Plus size={14} />
                  Add Address
                </button>
              </div>

              {/* Add address Form */}
              {showAddressForm && (
                <form onSubmit={handleAddNewAddress} style={{ marginBottom: '25px', backgroundColor: 'var(--alabaster)', padding: '20px', borderRadius: '4px', border: '1px solid var(--light-grey)' }}>
                  <div className="form-group">
                    <label>Street Address</label>
                    <input type="text" className="form-control" value={street} onChange={(e) => setStreet(e.target.value)} required />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="form-group">
                      <label>City</label>
                      <input type="text" className="form-control" value={city} onChange={(e) => setCity(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>State</label>
                      <input type="text" className="form-control" value={state} onChange={(e) => setState(e.target.value)} required />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                    <div className="form-group">
                      <label>ZIP / PIN Code</label>
                      <input type="text" className="form-control" value={zip} onChange={(e) => setZip(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Country</label>
                      <input type="text" className="form-control" value={country} disabled />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn-gold" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Save Address</button>
                    <button type="button" onClick={() => setShowAddressForm(false)} className="btn-outline" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Cancel</button>
                  </div>
                </form>
              )}

              {/* Addresses List selector */}
              {user?.addresses?.length === 0 ? (
                <p style={{ color: 'var(--grey)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                  No shipping addresses saved. Please add a shipping destination to continue.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {user.addresses.map((addr, idx) => (
                    <label 
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '16px',
                        borderRadius: '4px',
                        border: selectedAddressIdx === idx ? '1.5px solid var(--gold)' : '1px solid var(--light-grey)',
                        backgroundColor: selectedAddressIdx === idx ? 'rgba(212,175,55,0.02)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'var(--transition)'
                      }}
                    >
                      <input 
                        type="radio" 
                        name="shippingAddress"
                        checked={selectedAddressIdx === idx}
                        onChange={() => setSelectedAddressIdx(idx)}
                        style={{ marginTop: '3px', accentColor: 'var(--gold)' }}
                      />
                      <div style={{ fontSize: '0.85rem', color: 'var(--charcoal)' }}>
                        <span style={{ fontWeight: 600, color: 'var(--black)' }}>
                          Address {idx + 1} {addr.isDefault && <span style={{ color: 'var(--gold-dark)', fontSize: '0.7rem', marginLeft: '6px' }}>(Default)</span>}
                        </span>
                        <p style={{ marginTop: '4px', lineHeight: '1.5' }}>
                          {addr.street}, {addr.city}, {addr.state} - {addr.zip}, {addr.country}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Mock secure Card Payment Form */}
            <div className="glass-panel" style={{ padding: '30px', borderRadius: '6px', border: '1px solid rgba(212,175,55,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--light-grey)', paddingBottom: '12px', marginBottom: '20px' }}>
                <CreditCard size={18} color="var(--gold-dark)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--black)' }}>
                  2. Secure Card Payment
                </h3>
              </div>

              <form onSubmit={handlePaymentSubmit}>
                <div className="form-group">
                  <label>Cardholder Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Enter name on card"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Card Number</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="XXXX XXXX XXXX XXXX"
                    maxLength="16"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g,''))}
                    required 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="MM/YY"
                      maxLength="5"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV Code</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      placeholder="•••"
                      maxLength="3"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g,''))}
                      required 
                    />
                  </div>
                </div>

                {/* Secure Gateway submit */}
                <button 
                  type="submit" 
                  className="btn-gold" 
                  style={{ width: '100%', justifyContent: 'center', height: '46px', gap: '10px' }}
                >
                  Pay ₹{total.toLocaleString('en-IN')} Secured
                  <ShieldCheck size={18} />
                </button>
              </form>
            </div>
          </div>

          {/* Right panel: Summary checkout items list */}
          <div>
            <div className="glass-panel" style={{ padding: '30px', borderRadius: '6px', border: '1.5px solid var(--gold)', boxShadow: 'var(--shadow)', position: 'sticky', top: '110px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--black)', marginBottom: '20px', borderBottom: '1px solid var(--light-grey)', paddingBottom: '12px' }}>
                Cart Items
              </h3>

              {/* Items grid list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', borderBottom: '1.5px solid var(--light-grey)', paddingBottom: '20px', marginBottom: '20px', maxHeight: '250px', overflowY: 'auto' }}>
                {cartProducts.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <img src={item.images?.[0]} alt="" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                    <div style={{ flexGrow: 1, fontSize: '0.8rem', minWidth: 0 }}>
                      <h5 style={{ fontWeight: 600, color: 'var(--black)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.productName}</h5>
                      <span style={{ color: 'var(--grey)' }}>Qty: {item.quantity}</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--black)' }}>
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* pricing table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--grey)' }}>Subtotal</span>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--light-grey)', paddingTop: '12px', fontWeight: 700, fontSize: '1rem', color: 'var(--black)' }}>
                  <span>Total Due</span>
                  <span style={{ color: 'var(--gold-dark)' }}>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Responsive details styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .checkout-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}} />
    </div>
  );
};

export default Checkout;
