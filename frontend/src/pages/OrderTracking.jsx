import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { Package, Truck, Compass, CheckCircle2, ChevronLeft, MapPin, Calendar, Clock, ShoppingBag } from 'lucide-react';

const OrderTracking = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [productsLookup, setProductsLookup] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!token || !id) return;
      try {
        setLoading(true);
        // Fetch order details
        const res = await fetch(`${API_URL}/orders/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Order not found');
        const data = await res.json();
        setOrder(data);

        // Hydrate product details
        const prodRes = await fetch(`${API_URL}/products`);
        const prodData = await prodRes.json();
        const lookup = {};
        if (Array.isArray(prodData)) {
          prodData.forEach(p => {
            lookup[p._id] = p;
          });
        }
        setProductsLookup(lookup);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, token]);

  const stages = [
    { name: 'Processing', desc: 'Crafting & hallmarking in progress', icon: Compass },
    { name: 'Packed', desc: 'Securely sealed in high-security vaults', icon: Package },
    { name: 'Shipped', desc: 'Dispatched via premium insured courier', icon: Truck },
    { name: 'Delivered', desc: 'OTP-verified handover completed', icon: CheckCircle2 }
  ];

  const getStageIndex = (status) => {
    switch (status) {
      case 'Processing': return 0;
      case 'Packed': return 1;
      case 'Shipped': return 2;
      case 'Delivered': return 3;
      default: return 0;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', fontFamily: 'var(--font-body)' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(212,175,55,0.1)', borderTop: '3px solid var(--gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '20px', letterSpacing: '1px', color: 'var(--gold)' }}>CONNECTING TO INSURED CARRIER REGISTRY...</p>
        <style dangerouslySetInnerHTML={{__html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}} />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', fontFamily: 'var(--font-body)' }}>
        <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.8rem', marginBottom: '20px' }}>Order not found</h3>
        <p style={{ color: 'var(--grey)', marginBottom: '30px' }}>The order reference ID you specified could not be retrieved.</p>
        <button onClick={() => navigate('/order-history')} className="btn-gold">Go to History</button>
      </div>
    );
  }

  const currentStageIdx = getStageIndex(order.orderStatus);
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div style={{ fontFamily: 'var(--font-body)', backgroundColor: 'var(--alabaster)', minHeight: '85vh', padding: '60px 20px' }}>
      <div className="container" style={{ maxWidth: '850px' }}>
        
        {/* Back link */}
        <button 
          onClick={() => navigate('/order-history')} 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: 'none', background: 'none', color: 'var(--gold-dark)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', marginBottom: '30px' }}
        >
          <ChevronLeft size={16} /> Back to History
        </button>

        {/* Title & Order ID */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '2.2rem', color: 'var(--black)', marginBottom: '8px' }}>
              Track My Order
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--grey)', fontWeight: 300 }}>
              Order ID: <strong style={{ color: 'var(--charcoal-light)' }}>#{order._id.toUpperCase()}</strong> • Placed on: {formattedDate}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--grey)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estimated Handover</span>
            <p style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem', fontWeight: 600, color: 'var(--gold-dark)' }}>
              {currentStageIdx === 3 ? 'Delivered successfully' : 'Within 3-5 Working Days'}
            </p>
          </div>
        </div>

        {/* The Stepper Progress Bar */}
        <div className="glass-panel" style={{ padding: '40px 30px', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.15)', marginBottom: '40px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '20px' }}>
            
            {/* The Background Line */}
            <div style={{
              position: 'absolute',
              top: '25px',
              left: '5%',
              width: '90%',
              height: '4px',
              backgroundColor: 'rgba(0,0,0,0.06)',
              zIndex: 1
            }} />
            
            {/* The Active Line */}
            <div style={{
              position: 'absolute',
              top: '25px',
              left: '5%',
              width: `${(currentStageIdx / (stages.length - 1)) * 90}%`,
              height: '4px',
              backgroundColor: 'var(--gold)',
              transition: 'width 1s cubic-bezier(0.25, 0.8, 0.25, 1)',
              zIndex: 2
            }} />

            {/* Stepper items */}
            {stages.map((stage, idx) => {
              const StageIcon = stage.icon;
              const isCompleted = idx <= currentStageIdx;
              const isActive = idx === currentStageIdx;

              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20%', zIndex: 10 }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    backgroundColor: isCompleted ? 'var(--black)' : '#ffffff',
                    border: `2.5px solid ${isCompleted ? 'var(--gold)' : 'rgba(0,0,0,0.1)'}`,
                    color: isCompleted ? 'var(--gold)' : 'rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isCompleted ? 'var(--shadow-gold)' : 'none',
                    transition: 'var(--transition)',
                    position: 'relative'
                  }}>
                    <StageIcon size={20} />
                    
                    {/* Glowing ring for active element */}
                    {isActive && (
                      <div style={{
                        position: 'absolute',
                        top: '-6px',
                        left: '-6px',
                        right: '-6px',
                        bottom: '-6px',
                        borderRadius: '50%',
                        border: '2px solid var(--gold)',
                        animation: 'pulseGold 1.5s infinite'
                      }} />
                    )}
                  </div>
                  
                  <h4 style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: isCompleted ? 'var(--black)' : 'rgba(0,0,0,0.4)',
                    marginTop: '15px',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {stage.name}
                  </h4>
                  <p style={{
                    fontSize: '0.65rem',
                    color: 'var(--grey)',
                    fontWeight: 300,
                    textAlign: 'center',
                    marginTop: '4px',
                    maxWidth: '120px'
                  }}>
                    {stage.desc}
                  </p>
                </div>
              );
            })}

          </div>

        </div>

        {/* Split Row: Details of order vs shipping address */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
          
          {/* Left panel: Packaged Products list */}
          <div className="glass-panel" style={{ padding: '30px', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem', color: 'var(--black)', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '12px', marginBottom: '20px' }}>
              Packaged Masterpieces
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {order.products.map((item, idx) => {
                const details = productsLookup[item.productId] || {};
                return (
                  <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <img 
                      src={details.images?.[0] || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=150"} 
                      alt={details.productName} 
                      style={{ width: '50px', height: '50px', borderRadius: '4px', objectFit: 'cover', border: '1px solid rgba(0,0,0,0.05)' }}
                    />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--black)' }}>
                        {details.productName || 'Exquisite Ornament'}
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--grey)', fontWeight: 300 }}>
                        Qty: {item.quantity} • Weight: {details.weight || 'N/A'} • ₹{item.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '15px', marginTop: '15px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--grey)' }}>Transaction Total:</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--gold-dark)' }}>₹{order.totalPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Right panel: Shipping details */}
          <div className="glass-panel" style={{ padding: '30px', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem', color: 'var(--black)', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '12px', marginBottom: '20px' }}>
              Delivery Destination
            </h3>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '20px' }}>
              <MapPin size={18} color="var(--gold-dark)" style={{ flexShrink: 0, marginTop: '3px' }} />
              <div>
                <h4 style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--black)', marginBottom: '4px' }}>Shipping Address</h4>
                <p style={{ fontWeight: 300, fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--charcoal-light)' }}>
                  {order.address.street},<br />
                  {order.address.city}, {order.address.state} - <strong>{order.address.zip}</strong>,<br />
                  {order.address.country}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '15px' }}>
              <Calendar size={18} color="var(--gold-dark)" style={{ flexShrink: 0, marginTop: '3px' }} />
              <div>
                <h4 style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--black)', marginBottom: '4px' }}>Insured Logistics Courier</h4>
                <p style={{ fontWeight: 300, fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--charcoal-light)' }}>
                  Partner: <strong>Sequel Logistics Gold Safe</strong><br />
                  Service: Secure Handover OTP Delivery<br />
                  Waybill Ref: WBL_{order._id.substring(order._id.length - 10).toUpperCase()}
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: 1.2fr 1fr"] {
            grid-template-columns: 1fr !important;
            gap: 30px !important;
          }
          div[style*="width: 20%"] {
            width: 25% !important;
          }
        }
      `}} />
    </div>
  );
};

export default OrderTracking;
