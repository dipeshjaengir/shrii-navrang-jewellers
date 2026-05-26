import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { Calendar, Package, Receipt, Truck, ShoppingBag, ChevronRight, X, Printer, CheckCircle } from 'lucide-react';

const OrderHistory = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [productsLookup, setProductsLookup] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrdersAndProducts = async () => {
      if (!token) return;
      try {
        setLoading(true);
        // Fetch order history
        const orderRes = await fetch(`${API_URL}/orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const orderData = await orderRes.json();
        
        // Fetch all products to hydrate names & images
        const prodRes = await fetch(`${API_URL}/products`);
        const prodData = await prodRes.json();
        
        // Create product lookup map
        const lookup = {};
        if (Array.isArray(prodData)) {
          prodData.forEach(p => {
            lookup[p._id] = p;
          });
        }
        setProductsLookup(lookup);

        if (Array.isArray(orderData)) {
          setOrders(orderData);
        }
      } catch (error) {
        console.error('Error fetching order history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersAndProducts();
  }, [token]);

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing': return { bg: 'rgba(212,175,55,0.1)', color: 'var(--gold-dark)', border: 'var(--gold)' };
      case 'Packed': return { bg: 'rgba(0,123,255,0.06)', color: '#007bff', border: '#007bff' };
      case 'Shipped': return { bg: 'rgba(255,193,7,0.1)', color: '#d39e00', border: '#ffc107' };
      case 'Delivered': return { bg: 'rgba(46,125,50,0.1)', color: 'var(--success)', border: 'var(--success)' };
      default: return { bg: '#eee', color: '#666', border: '#ccc' };
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', fontFamily: 'var(--font-body)' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(212,175,55,0.1)', borderTop: '3px solid var(--gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '20px', letterSpacing: '1px', color: 'var(--gold)' }}>RETRIEVING ORDER REGISTRY...</p>
        <style dangerouslySetInnerHTML={{__html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'var(--font-body)', backgroundColor: 'var(--alabaster)', minHeight: '85vh', padding: '60px 20px' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        
        {/* Title */}
        <div className="section-title" style={{ marginBottom: '40px' }}>
          <h2>Order History</h2>
        </div>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 40px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.15)', boxShadow: 'var(--shadow)' }}>
            <ShoppingBag size={48} color="var(--gold)" style={{ opacity: 0.5, marginBottom: '20px' }} />
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.5rem', marginBottom: '10px' }}>No orders placed yet</h3>
            <p style={{ fontWeight: 300, color: 'var(--grey)', marginBottom: '30px', maxWidth: '400px', margin: '0 auto 30px' }}>
              Your order chest is currently empty. Explore our luxurious handcrafted masterpieces.
            </p>
            <button onClick={() => navigate('/shop')} className="btn-gold">
              Begin Shopping
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {orders.map((order) => {
              const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric'
              });
              const statusStyle = getStatusColor(order.orderStatus);

              return (
                <div 
                  key={order._id}
                  className="glass-panel"
                  style={{
                    padding: '30px',
                    borderRadius: '8px',
                    border: '1px solid rgba(212, 175, 55, 0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    transition: 'var(--transition)'
                  }}
                >
                  {/* Row 1: Order Meta & Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '15px' }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--grey)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order ID</span>
                        <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--black)' }}>#{order._id.substring(order._id.length - 8).toUpperCase()}</p>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--grey)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Placed On</span>
                        <p style={{ fontWeight: 500, fontSize: '0.95rem', color: 'var(--charcoal-light)' }}>{date}</p>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--grey)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Amount</span>
                        <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--gold-dark)' }}>₹{order.totalPrice.toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    <div style={{
                      padding: '6px 14px',
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.color,
                      border: `1px solid ${statusStyle.border}`,
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      {order.orderStatus}
                    </div>
                  </div>

                  {/* Row 2: Product items snippet */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {order.products.map((item, idx) => {
                      const details = productsLookup[item.productId] || {};
                      return (
                        <div key={idx} style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                          <img 
                            src={details.images?.[0] || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=150"} 
                            alt={details.productName || 'Jewelry Piece'} 
                            style={{ width: '60px', height: '60px', borderRadius: '4px', objectFit: 'cover', border: '1px solid rgba(0,0,0,0.06)' }}
                          />
                          <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--black)', marginBottom: '2px' }}>
                              {details.productName || 'Exquisite Ornament'}
                            </h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--grey)', fontWeight: 300 }}>
                              Qty: {item.quantity} • Material: {details.material || 'Gold'} • Weight: {details.weight || 'N/A'}
                            </p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--charcoal-light)' }}>
                              ₹{item.price.toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Row 3: Action Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '15px' }}>
                    <button 
                      onClick={() => navigate(`/order-tracking/${order._id}`)} 
                      className="btn-outline" 
                      style={{ padding: '8px 16px', fontSize: '0.8rem', gap: '6px' }}
                    >
                      <Truck size={14} /> Track Order
                    </button>
                    <button 
                      onClick={() => setSelectedOrder(order)} 
                      className="btn-gold" 
                      style={{ padding: '8px 16px', fontSize: '0.8rem', gap: '6px' }}
                    >
                      <Receipt size={14} /> View Invoice
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Invoice Modal Overlay */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div 
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '650px',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: '8px',
              border: '2px solid var(--gold)',
              backgroundColor: '#ffffff',
              padding: '40px',
              position: 'relative',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
            }}
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedOrder(null)}
              style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--grey)' }}
            >
              <X size={24} />
            </button>

            {/* Printable Invoice wrapper */}
            <div id="invoice-printable-area" style={{ fontFamily: 'var(--font-body)' }}>
              
              {/* Invoice Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--gold)', paddingBottom: '20px', marginBottom: '25px' }}>
                <div>
                  <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '1.6rem', color: 'var(--black)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Shri Navrang Jewellers
                  </h1>
                  <p style={{ fontSize: '0.75rem', color: 'var(--grey)', fontWeight: 300 }}>
                    104-106, Chandni Chowk Road, Delhi - 110006<br />
                    concierge@Shrinavrang.com • +91 11 4987 6543
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.8rem', color: 'var(--gold-dark)', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    INVOICE
                  </h2>
                  <p style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--charcoal)' }}>
                    Invoice #: INV-{selectedOrder._id.substring(selectedOrder._id.length - 8).toUpperCase()}<br />
                    Date: {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Billing / Shipping address split */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '25px', fontSize: '0.85rem' }}>
                <div>
                  <h4 style={{ fontWeight: 700, color: 'var(--black)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Billing To:</h4>
                  <p style={{ fontWeight: 300, color: 'var(--charcoal-light)', lineHeight: '1.5' }}>
                    Customer Account ID: {selectedOrder.userId.toUpperCase()}<br />
                    Payment Gateway Status: <strong>{selectedOrder.paymentDetails.status}</strong><br />
                    Method: {selectedOrder.paymentDetails.paymentMethod}<br />
                    Txn ID: {selectedOrder.paymentDetails.transactionId}
                  </p>
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, color: 'var(--black)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Shipping Address:</h4>
                  <p style={{ fontWeight: 300, color: 'var(--charcoal-light)', lineHeight: '1.5' }}>
                    {selectedOrder.address.street},<br />
                    {selectedOrder.address.city}, {selectedOrder.address.state} - <strong>{selectedOrder.address.zip}</strong>,<br />
                    {selectedOrder.address.country}
                  </p>
                </div>
              </div>

              {/* Items List Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '25px', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--alabaster)', borderTop: '1px solid #ddd', borderBottom: '2px solid var(--gold)' }}>
                    <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 700 }}>Item Description</th>
                    <th style={{ textAlign: 'center', padding: '12px 8px', fontWeight: 700 }}>Quantity</th>
                    <th style={{ textAlign: 'right', padding: '12px 8px', fontWeight: 700 }}>Unit Price</th>
                    <th style={{ textAlign: 'right', padding: '12px 8px', fontWeight: 700 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.products.map((item, idx) => {
                    const details = productsLookup[item.productId] || {};
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px 8px', fontWeight: 500 }}>
                          {details.productName || 'Exquisite Jewelry Creation'}<br />
                          <span style={{ fontSize: '0.7rem', color: 'var(--grey)', fontWeight: 300 }}>
                            Material: {details.material || 'Gold'} • Weight: {details.weight || 'N/A'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', padding: '12px 8px', fontWeight: 300 }}>{item.quantity}</td>
                        <td style={{ textAlign: 'right', padding: '12px 8px', fontWeight: 300 }}>₹{item.price.toLocaleString('en-IN')}</td>
                        <td style={{ textAlign: 'right', padding: '12px 8px', fontWeight: 600 }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Totals split */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.9rem', marginBottom: '30px' }}>
                <div style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--grey)', fontWeight: 300 }}>
                    <span>Subtotal:</span>
                    <span>₹{selectedOrder.totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--grey)', fontWeight: 300 }}>
                    <span>Making & Insured Ship:</span>
                    <span style={{ color: 'var(--success)', fontWeight: 500 }}>FREE</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--gold)', paddingTop: '10px', fontWeight: 700, fontSize: '1.1rem', color: 'var(--black)' }}>
                    <span>Grand Total:</span>
                    <span style={{ color: 'var(--gold-dark)' }}>₹{selectedOrder.totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Certification note */}
              <div style={{ border: '1px solid rgba(212,175,55,0.2)', backgroundColor: 'var(--alabaster)', padding: '15px', borderRadius: '4px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--charcoal-light)' }}>
                <p style={{ fontWeight: 500, color: 'var(--gold-dark)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                  ★ 100% BIS Hallmarked Purity Guarantee ★
                </p>
                <p style={{ fontWeight: 300 }}>
                  This invoice is computer-generated and acts as a certified document of ownership and purity for the jewelry items listed above. For lifetime exchanges, please retain this invoice copy.
                </p>
              </div>

            </div>

            {/* Print and Track Actions inside Modal */}
            <div style={{ display: 'flex', gap: '15px', marginTop: '30px', justifyContent: 'flex-end' }}>
              <button 
                onClick={handlePrint}
                className="btn-outline" 
                style={{ padding: '8px 16px', fontSize: '0.8rem', gap: '6px' }}
              >
                <Printer size={14} /> Print Invoice
              </button>
              <button 
                onClick={() => {
                  setSelectedOrder(null);
                  navigate(`/order-tracking/${selectedOrder._id}`);
                }}
                className="btn-gold" 
                style={{ padding: '8px 16px', fontSize: '0.8rem', gap: '6px' }}
              >
                <Truck size={14} /> Track Delivery
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Embedded print css overrides */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-printable-area, #invoice-printable-area * {
            visibility: visible;
          }
          #invoice-printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
        }
      `}} />

    </div>
  );
};

export default OrderHistory;
