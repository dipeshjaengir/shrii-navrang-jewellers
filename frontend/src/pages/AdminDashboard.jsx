import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  TrendingUp, Users, ShoppingBag, Database, ShieldAlert, 
  Plus, Edit, Trash2, CheckCircle2, ChevronRight, X, 
  LogOut, ShoppingCart, Info, ListOrdered, UserX, Search, Landmark
} from 'lucide-react';
import { API_URL } from '../config';

const AdminDashboard = ({ onShowToast }) => {
  const { token, user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, products, orders, users, rates
  
  // States
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Rates & Email Config State
  const [ratesForm, setRatesForm] = useState({
    gold24k: '',
    gold22k: '',
    silver: '',
    businessEmail: ''
  });
  const [ratesLoading, setRatesLoading] = useState(false);

  // Search & Filter States
  const [prodSearch, setProdSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // CRUD Product Form States
  const [showProductModal, setShowProductModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [productForm, setProductForm] = useState({
    productName: '',
    category: 'Necklaces',
    price: '',
    description: '',
    images: '', // Comma separated list in form
    stock: '',
    material: 'Gold',
    weight: '',
    gender: 'Women'
  });

  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      
      // 1. Fetch Analytics
      const analRes = await fetch(`${API_URL}/admin/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (analRes.ok) {
        const analData = await analRes.json();
        setAnalytics(analData);
      }

      // 2. Fetch Products
      const prodRes = await fetch(`${API_URL}/products`);
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      }

      // 3. Fetch Orders
      const orderRes = await fetch(`${API_URL}/admin/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (orderRes.ok) {
        const orderData = await orderRes.json();
        setOrders(orderData);
      }

      // 4. Fetch Customers
      const userRes = await fetch(`${API_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        setCustomers(userData);
      }

    } catch (error) {
      console.error('Error fetching admin data:', error);
      if (onShowToast) onShowToast('Error loading dashboard registry.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchRatesConfig = async () => {
    try {
      const res = await fetch(`${API_URL}/rates`);
      if (res.ok) {
        const data = await res.json();
        setRatesForm({
          gold24k: data.gold24k,
          gold22k: data.gold22k,
          silver: data.silver,
          businessEmail: data.businessEmail
        });
      }
    } catch (err) {
      console.error('Error fetching rates inside dashboard:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'rates') {
      fetchRatesConfig();
    }
  }, [activeTab]);

  const handleRatesSubmit = async (e) => {
    e.preventDefault();
    setRatesLoading(true);
    try {
      const res = await fetch(`${API_URL}/rates`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ratesForm)
      });
      const data = await res.json();
      if (res.ok) {
        if (onShowToast) onShowToast('Rates & Showroom Config updated successfully! ✨', 'success');
      } else {
        throw new Error(data.message || 'Rates update failed');
      }
    } catch (err) {
      if (onShowToast) onShowToast(err.message, 'error');
    } finally {
      setRatesLoading(false);
    }
  };

  const handleAdminLogout = () => {
    logout();
    if (onShowToast) onShowToast('Logged out of manager panel.', 'success');
    navigate('/');
  };

  // ----------------------------------------------------
  // Product CRUD Handlers
  // ----------------------------------------------------
  const openAddProduct = () => {
    setIsEditing(false);
    setEditingId(null);
    setProductForm({
      productName: '',
      category: 'Necklaces',
      price: '',
      description: '',
      images: '',
      stock: '',
      material: 'Gold',
      weight: '',
      gender: 'Women'
    });
    setShowProductModal(true);
  };

  const openEditProduct = (prod) => {
    setIsEditing(true);
    setEditingId(prod._id);
    setProductForm({
      productName: prod.productName || '',
      category: prod.category || 'Necklaces',
      price: prod.price || '',
      description: prod.description || '',
      images: Array.isArray(prod.images) ? prod.images.join(', ') : (prod.images || ''),
      stock: prod.stock || '',
      material: prod.material || 'Gold',
      weight: prod.weight || '',
      gender: prod.gender || 'Women'
    });
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const { productName, category, price, description, images, stock, material, weight } = productForm;
    if (!productName || !price || !description || !images || !stock || !weight) {
      if (onShowToast) onShowToast('Please fill out all required fields.', 'error');
      return;
    }

    const imagesArr = images.split(',').map(img => img.trim()).filter(Boolean);

    const payload = {
      ...productForm,
      price: parseFloat(price),
      stock: parseInt(stock),
      images: imagesArr
    };

    try {
      let res;
      if (isEditing) {
        res = await fetch(`${API_URL}/admin/products/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API_URL}/admin/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Saving failed');

      if (onShowToast) onShowToast(isEditing ? 'Masterpiece updated successfully.' : 'New design catalogued successfully!', 'success');
      setShowProductModal(false);
      fetchDashboardData(); // Reload listings
    } catch (err) {
      if (onShowToast) onShowToast(err.message, 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this product design?')) return;
    try {
      const res = await fetch(`${API_URL}/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        if (onShowToast) onShowToast('Product deleted from registry.', 'success');
        fetchDashboardData();
      } else {
        const data = await res.json();
        if (onShowToast) onShowToast(data.message || 'Delete failed', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------------------------------------------
  // Order Dispatch Status Handler
  // ----------------------------------------------------
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderStatus: newStatus })
      });
      if (res.ok) {
        if (onShowToast) onShowToast(`Order status updated to ${newStatus}. Notification dispatched.`, 'success');
        fetchDashboardData();
      } else {
        const data = await res.json();
        if (onShowToast) onShowToast(data.message, 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------------------------------------------
  // Customer accounts ban/delete Handler
  // ----------------------------------------------------
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this customer account? All addresses and records will be deleted.')) return;
    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        if (onShowToast) onShowToast('Customer removed from database.', 'success');
        fetchDashboardData();
      } else {
        const data = await res.json();
        if (onShowToast) onShowToast(data.message, 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filters
  const filteredProducts = products.filter(p => 
    p.productName.toLowerCase().includes(prodSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(prodSearch.toLowerCase()) ||
    p.material.toLowerCase().includes(prodSearch.toLowerCase())
  );

  const filteredOrders = orders.filter(o => 
    o._id.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.userId.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.orderStatus.toLowerCase().includes(orderSearch.toLowerCase())
  );

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    (c.phone && c.phone.includes(userSearch))
  );

  if (loading && !analytics) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', fontFamily: 'var(--font-body)' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(212,175,55,0.1)', borderTop: '3px solid var(--gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '20px', letterSpacing: '1px', color: 'var(--gold)' }}>INITIALIZING ADMINISTRATIVE DATABASES...</p>
        <style dangerouslySetInnerHTML={{__html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'var(--font-body)', backgroundColor: 'var(--alabaster)', minHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Admin Header Bar */}
      <div style={{ backgroundColor: 'var(--black)', color: '#ffffff', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--gold)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#4caf50', boxShadow: '0 0 8px #4caf50' }} />
          <div>
            <h2 style={{ fontFamily: 'var(--font-title)', color: '#ffffff', fontSize: '1.4rem', letterSpacing: '1px' }}>Shrii Navrang Jewellers</h2>
            <span style={{ fontSize: '0.65rem', color: 'var(--gold)', letterSpacing: '2px', fontWeight: 700, textTransform: 'uppercase' }}>Administrative Director Panel</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Logged in: <strong>{user?.name || 'Administrator'}</strong></span>
          <button 
            onClick={handleAdminLogout}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid var(--error)',
              backgroundColor: 'rgba(211,47,47,0.1)',
              color: 'var(--error)',
              borderRadius: '4px',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 600,
              transition: 'var(--transition)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--error)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(211,47,47,0.1)';
              e.currentTarget.style.color = 'var(--error)';
            }}
          >
            <LogOut size={12} /> Exit
          </button>
        </div>
      </div>

      {/* Main Panel Content Split */}
      <div style={{ display: 'flex', flex: 1, minHeight: '80vh' }}>
        
        {/* Left Side Tab Navigation */}
        <div style={{ width: '240px', backgroundColor: 'var(--charcoal)', borderRight: '1px solid rgba(212,175,55,0.15)', display: 'flex', flexDirection: 'column', gap: '6px', padding: '24px 12px' }}>
          
          <button 
            onClick={() => setActiveTab('analytics')}
            style={{
              padding: '12px 18px',
              borderRadius: '4px',
              border: 'none',
              background: activeTab === 'analytics' ? 'linear-gradient(135deg, var(--gold), var(--gold-dark))' : 'none',
              color: activeTab === 'analytics' ? 'var(--black)' : '#cccccc',
              textAlign: 'left',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: '0.85rem',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'var(--transition)'
            }}
          >
            <TrendingUp size={16} /> Dashboard Overview
          </button>

          <button 
            onClick={() => setActiveTab('products')}
            style={{
              padding: '12px 18px',
              borderRadius: '4px',
              border: 'none',
              background: activeTab === 'products' ? 'linear-gradient(135deg, var(--gold), var(--gold-dark))' : 'none',
              color: activeTab === 'products' ? 'var(--black)' : '#cccccc',
              textAlign: 'left',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: '0.85rem',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'var(--transition)'
            }}
          >
            <Database size={16} /> Products Catalog
          </button>

          <button 
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '12px 18px',
              borderRadius: '4px',
              border: 'none',
              background: activeTab === 'orders' ? 'linear-gradient(135deg, var(--gold), var(--gold-dark))' : 'none',
              color: activeTab === 'orders' ? 'var(--black)' : '#cccccc',
              textAlign: 'left',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: '0.85rem',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'var(--transition)'
            }}
          >
            <ListOrdered size={16} /> Orders Dispatch
          </button>

          <button 
            onClick={() => setActiveTab('users')}
            style={{
              padding: '12px 18px',
              borderRadius: '4px',
              border: 'none',
              background: activeTab === 'users' ? 'linear-gradient(135deg, var(--gold), var(--gold-dark))' : 'none',
              color: activeTab === 'users' ? 'var(--black)' : '#cccccc',
              textAlign: 'left',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: '0.85rem',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'var(--transition)'
            }}
          >
            <Users size={16} /> Customers Registry
          </button>

          <button 
            onClick={() => setActiveTab('rates')}
            style={{
              padding: '12px 18px',
              borderRadius: '4px',
              border: 'none',
              background: activeTab === 'rates' ? 'linear-gradient(135deg, var(--gold), var(--gold-dark))' : 'none',
              color: activeTab === 'rates' ? 'var(--black)' : '#cccccc',
              textAlign: 'left',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: '0.85rem',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'var(--transition)'
            }}
          >
            <Landmark size={16} /> Rates & Config
          </button>

        </div>

        {/* Right Side Main Board Area */}
        <div style={{ flex: 1, padding: '40px' }}>
          
          {/* TAB 1: ANALYTICS */}
          {activeTab === 'analytics' && analytics && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', animation: 'fadeIn 0.5s forwards' }}>
              
              {/* Aggregates Cards Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                
                <div className="glass-panel" style={{ padding: '24px', borderRadius: '6px', borderLeft: '4px solid var(--gold)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--grey)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Total Revenue</span>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--gold-dark)', marginTop: '4px' }}>₹{analytics.summary.totalRevenue.toLocaleString('en-IN')}</h3>
                  </div>
                  <TrendingUp size={28} color="var(--gold-dark)" style={{ opacity: 0.7 }} />
                </div>

                <div className="glass-panel" style={{ padding: '24px', borderRadius: '6px', borderLeft: '4px solid var(--black)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--grey)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Total Orders</span>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--black)', marginTop: '4px' }}>{analytics.summary.totalOrders}</h3>
                  </div>
                  <ShoppingCart size={28} color="var(--black)" style={{ opacity: 0.7 }} />
                </div>

                <div className="glass-panel" style={{ padding: '24px', borderRadius: '6px', borderLeft: '4px solid var(--gold-glow)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--grey)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Total Products</span>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--charcoal-light)', marginTop: '4px' }}>{analytics.summary.totalProducts}</h3>
                  </div>
                  <Database size={28} color="var(--grey)" style={{ opacity: 0.7 }} />
                </div>

                <div className="glass-panel" style={{ padding: '24px', borderRadius: '6px', borderLeft: '4px solid #4caf50', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--grey)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Active Customers</span>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--charcoal-light)', marginTop: '4px' }}>{analytics.summary.totalUsers}</h3>
                  </div>
                  <Users size={28} color="#4caf50" style={{ opacity: 0.7 }} />
                </div>

              </div>

              {/* Lower split: Category sales breakdown vs low stock list */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px' }}>
                
                {/* Sales by category */}
                <div className="glass-panel" style={{ padding: '30px', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.15)' }}>
                  <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.3rem', color: 'var(--black)', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '12px', marginBottom: '20px' }}>
                    Sales by Category
                  </h3>
                  
                  {analytics.categorySales.length === 0 ? (
                    <p style={{ fontSize: '0.9rem', color: 'var(--grey)', fontWeight: 300 }}>No orders placed yet to compute category metrics.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {analytics.categorySales.map((cat, idx) => (
                        <div key={idx}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 500 }}>
                            <span style={{ color: 'var(--charcoal-light)' }}>{cat.category}</span>
                            <span style={{ color: 'var(--gold-dark)', fontWeight: 700 }}>₹{cat.sales.toLocaleString('en-IN')}</span>
                          </div>
                          {/* Visual progress bar */}
                          <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '3px' }}>
                            <div style={{
                              width: `${Math.min(100, (cat.sales / analytics.summary.totalRevenue) * 100)}%`,
                              height: '100%',
                              backgroundColor: 'var(--gold)',
                              borderRadius: '3px'
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Low Stock Alerts */}
                <div className="glass-panel" style={{ padding: '30px', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.15)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '12px', marginBottom: '20px' }}>
                    <ShieldAlert size={18} color="var(--error)" />
                    <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.3rem', color: 'var(--black)' }}>
                      Low Stock Alerts ({analytics.summary.lowStockCount})
                    </h3>
                  </div>

                  {analytics.lowStockAlerts.length === 0 ? (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--success)' }}>
                      <CheckCircle2 size={16} />
                      <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>All jewellery design inventories are healthy and well-stocked.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxH: '250px', overflowY: 'auto' }}>
                      {analytics.lowStockAlerts.map((p) => (
                        <div 
                          key={p._id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px',
                            backgroundColor: 'rgba(211,47,47,0.05)',
                            borderRadius: '4px',
                            border: '1px solid rgba(211,47,47,0.15)'
                          }}
                        >
                          <div>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--black)' }}>{p.productName}</h4>
                            <span style={{ fontSize: '0.7rem', color: 'var(--grey)' }}>ID: #{p._id.substring(p._id.length - 8).toUpperCase()} • Price: ₹{p.price.toLocaleString('en-IN')}</span>
                          </div>
                          <span style={{
                            padding: '4px 8px',
                            backgroundColor: 'var(--error)',
                            color: '#ffffff',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 700
                          }}>
                            {p.stock} Left
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: PRODUCTS CRUD CATALOG */}
          {activeTab === 'products' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.5s forwards' }}>
              
              {/* Product header search and add buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: '300px' }}>
                  <Search size={16} color="var(--grey)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                  <input 
                    type="text" 
                    placeholder="Search catalog design..." 
                    className="form-control"
                    value={prodSearch}
                    onChange={(e) => setProdSearch(e.target.value)}
                    style={{ paddingLeft: '40px', paddingRight: '12px', paddingY: '8px' }}
                  />
                </div>
                
                <button onClick={openAddProduct} className="btn-gold" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                  <Plus size={14} /> Catalog New Design
                </button>
              </div>

              {/* Products Table list */}
              <div className="glass-panel" style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.15)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--black)', color: '#ffffff', borderBottom: '2px solid var(--gold)', textAlign: 'left' }}>
                      <th style={{ padding: '15px' }}>Design Image</th>
                      <th style={{ padding: '15px' }}>Name</th>
                      <th style={{ padding: '15px' }}>Material</th>
                      <th style={{ padding: '15px' }}>Weight</th>
                      <th style={{ padding: '15px' }}>Price</th>
                      <th style={{ padding: '15px' }}>Stock</th>
                      <th style={{ padding: '15px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p._id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', verticalAlign: 'middle' }}>
                        <td style={{ padding: '15px' }}>
                          <img 
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=150'} 
                            alt={p.productName} 
                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.05)' }}
                          />
                        </td>
                        <td style={{ padding: '15px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--black)' }}>{p.productName}</span><br />
                          <span style={{ fontSize: '0.7rem', color: 'var(--grey)' }}>Category: {p.category}</span>
                        </td>
                        <td style={{ padding: '15px', fontWeight: 500 }}>{p.material}</td>
                        <td style={{ padding: '15px', fontWeight: 500 }}>{p.weight}</td>
                        <td style={{ padding: '15px', fontWeight: 700, color: 'var(--gold-dark)' }}>₹{p.price.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '15px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor: p.stock <= 5 ? 'rgba(211,47,47,0.1)' : 'rgba(46,125,50,0.1)',
                            color: p.stock <= 5 ? 'var(--error)' : 'var(--success)'
                          }}>
                            {p.stock} Units
                          </span>
                        </td>
                        <td style={{ padding: '15px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                            <button 
                              onClick={() => openEditProduct(p)} 
                              style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--gold-dark)' }}
                              title="Edit design"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(p._id)} 
                              style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--error)' }}
                              title="Delete design"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 3: ORDERS DISPATCH */}
          {activeTab === 'orders' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.5s forwards' }}>
              
              {/* Dispatch Search */}
              <div style={{ position: 'relative', width: '300px' }}>
                <Search size={16} color="var(--grey)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                <input 
                  type="text" 
                  placeholder="Search order ID, status..." 
                  className="form-control"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  style={{ paddingLeft: '40px', paddingRight: '12px' }}
                />
              </div>

              {/* Orders registry list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {filteredOrders.map((order) => {
                  const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  });

                  return (
                    <div 
                      key={order._id}
                      className="glass-panel"
                      style={{
                        padding: '24px',
                        borderRadius: '6px',
                        border: '1px solid rgba(212,175,55,0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '15px'
                      }}
                    >
                      {/* Sub-header row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '12px' }}>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--grey)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order Reference</span>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--black)' }}>#{order._id.toUpperCase()}</h4>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--grey)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date Placed</span>
                          <p style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--charcoal-light)' }}>{date}</p>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--grey)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Price</span>
                          <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gold-dark)' }}>₹{order.totalPrice.toLocaleString('en-IN')}</p>
                        </div>
                        
                        {/* Status Select Control */}
                        <div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--grey)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Dispatch Stage</span>
                          <select 
                            value={order.orderStatus}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            style={{
                              padding: '6px 12px',
                              fontFamily: 'var(--font-body)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              borderRadius: '4px',
                              backgroundColor: 'var(--white)',
                              border: '1.5px solid var(--gold)',
                              color: 'var(--black)',
                              cursor: 'pointer',
                              textTransform: 'uppercase'
                            }}
                          >
                            <option value="Processing">Processing</option>
                            <option value="Packed">Packed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </div>
                      </div>

                      {/* Split: Customer Shipping vs Purchased items */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', fontSize: '0.85rem' }}>
                        <div>
                          <h5 style={{ fontWeight: 700, color: 'var(--black)', marginBottom: '6px' }}>Shipped Ornaments:</h5>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {order.products.map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontWeight: 300 }}>ID: #{item.productId.substring(item.productId.length - 8).toUpperCase()} (Qty: {item.quantity})</span>
                                <span style={{ fontWeight: 600 }}>₹{item.price.toLocaleString('en-IN')}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div style={{ borderLeft: '1px solid rgba(0,0,0,0.05)', paddingLeft: '20px' }}>
                          <h5 style={{ fontWeight: 700, color: 'var(--black)', marginBottom: '6px' }}>Destination Details:</h5>
                          <p style={{ fontWeight: 300, color: 'var(--charcoal-light)', lineHeight: '1.5' }}>
                            {order.address.street},<br />
                            {order.address.city}, {order.address.state} - <strong>{order.address.zip}</strong><br />
                            Txn ID: {order.paymentDetails.transactionId}
                          </p>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 4: CUSTOMERS REGISTRY */}
          {activeTab === 'users' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.5s forwards' }}>
              
              {/* Customer Search */}
              <div style={{ position: 'relative', width: '300px' }}>
                <Search size={16} color="var(--grey)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                <input 
                  type="text" 
                  placeholder="Search customer email, phone..." 
                  className="form-control"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{ paddingLeft: '40px', paddingRight: '12px' }}
                />
              </div>

              {/* Customers list Grid */}
              <div className="glass-panel" style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.15)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--black)', color: '#ffffff', borderBottom: '2px solid var(--gold)', textAlign: 'left' }}>
                      <th style={{ padding: '15px' }}>Patron Name</th>
                      <th style={{ padding: '15px' }}>Email Address</th>
                      <th style={{ padding: '15px' }}>Phone Support</th>
                      <th style={{ padding: '15px' }}>Saved Addresses</th>
                      <th style={{ padding: '15px', textAlign: 'center' }}>Admin Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((c) => (
                      <tr key={c._id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                        <td style={{ padding: '15px', fontWeight: 600, color: 'var(--black)' }}>{c.name}</td>
                        <td style={{ padding: '15px' }}>{c.email}</td>
                        <td style={{ padding: '15px' }}>{c.phone || 'Not provided'}</td>
                        <td style={{ padding: '15px', fontWeight: 300 }}>{c.addresses ? c.addresses.length : 0} Saved Addresses</td>
                        <td style={{ padding: '15px', textAlign: 'center' }}>
                          <button 
                            onClick={() => handleDeleteUser(c._id)}
                            style={{
                              border: 'none',
                              background: 'none',
                              color: 'var(--error)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontWeight: 600
                            }}
                            title="Remove account from showroom"
                          >
                            <UserX size={14} /> Remove Account
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 5: RATES & CONFIG */}
          {activeTab === 'rates' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', animation: 'fadeIn 0.5s forwards', maxWidth: '550px' }}>
              
              <div className="glass-panel" style={{ padding: '40px', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.15)', boxShadow: 'var(--shadow)', backgroundColor: '#ffffff' }}>
                <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.6rem', color: 'var(--black)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0 }}>
                  <Landmark size={22} color="var(--gold-dark)" /> Rates & Contact Management
                </h3>
                <p style={{ color: 'var(--grey)', fontSize: '0.85rem', marginBottom: '30px', fontWeight: 300 }}>
                  Showroom Live Rates and Contact details are displayed directly to clients on the homepage rates widget, navbar rates modal, contact page email concierges, and footer showroom channels.
                </p>

                <form onSubmit={handleRatesSubmit}>
                  {/* Gold 24K */}
                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label style={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--black)', display: 'block', marginBottom: '8px' }}>Today's Gold 24K (₹ / 1 Gram) *</label>
                    <input 
                      type="number" 
                      step="any"
                      required
                      placeholder="e.g. 7250"
                      className="form-control"
                      value={ratesForm.gold24k}
                      onChange={(e) => setRatesForm({ ...ratesForm, gold24k: e.target.value })}
                      style={{ border: '1.5px solid var(--light-grey)', borderRadius: '4px', padding: '12px 14px', fontSize: '0.85rem' }}
                    />
                  </div>

                  {/* Gold 22K */}
                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label style={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--black)', display: 'block', marginBottom: '8px' }}>Today's Gold 22K (₹ / 1 Gram) *</label>
                    <input 
                      type="number" 
                      step="any"
                      required
                      placeholder="e.g. 6650"
                      className="form-control"
                      value={ratesForm.gold22k}
                      onChange={(e) => setRatesForm({ ...ratesForm, gold22k: e.target.value })}
                      style={{ border: '1.5px solid var(--light-grey)', borderRadius: '4px', padding: '12px 14px', fontSize: '0.85rem' }}
                    />
                  </div>

                  {/* Silver */}
                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label style={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--black)', display: 'block', marginBottom: '8px' }}>Today's Silver (₹ / 1 Gram) *</label>
                    <input 
                      type="number" 
                      step="any"
                      required
                      placeholder="e.g. 90"
                      className="form-control"
                      value={ratesForm.silver}
                      onChange={(e) => setRatesForm({ ...ratesForm, silver: e.target.value })}
                      style={{ border: '1.5px solid var(--light-grey)', borderRadius: '4px', padding: '12px 14px', fontSize: '0.85rem' }}
                    />
                  </div>

                  {/* Showroom Contact Email */}
                  <div className="form-group" style={{ marginBottom: '35px' }}>
                    <label style={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--black)', display: 'block', marginBottom: '8px' }}>Showroom Business Email (Editable) *</label>
                    <input 
                      type="email" 
                      required
                      placeholder="e.g. info@shriinavrang.com"
                      className="form-control"
                      value={ratesForm.businessEmail}
                      onChange={(e) => setRatesForm({ ...ratesForm, businessEmail: e.target.value })}
                      style={{ border: '1.5px solid var(--light-grey)', borderRadius: '4px', padding: '12px 14px', fontSize: '0.85rem' }}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn-gold" 
                    style={{ width: '100%', justifyContent: 'center', height: '48px' }}
                    disabled={ratesLoading}
                  >
                    {ratesLoading ? 'SAVING BOARD CONFIG...' : 'UPDATE BOARD RATES & EMAIL'}
                  </button>
                </form>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Adding / Editing Product Form Translucent Modal popup */}
      {showProductModal && (
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
              position: 'relative'
            }}
          >
            
            <button 
              onClick={() => setShowProductModal(false)}
              style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--grey)' }}
            >
              <X size={24} />
            </button>

            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.8rem', color: 'var(--black)', marginBottom: '30px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '10px' }}>
              {isEditing ? 'Modify Jewelry Catalog' : 'Catalog New Masterpiece'}
            </h3>

            <form onSubmit={handleProductSubmit}>
              <div className="form-group">
                <label htmlFor="prod_name">Ornament Title *</label>
                <input 
                  type="text" 
                  id="prod_name"
                  className="form-control" 
                  placeholder="e.g. Royal filigree gold jhumkas..."
                  value={productForm.productName}
                  onChange={(e) => setProductForm({ ...productForm, productName: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label htmlFor="prod_cat">Category *</label>
                  <select 
                    id="prod_cat"
                    className="form-control"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  >
                    <option value="Necklaces">Necklaces</option>
                    <option value="Rings">Rings</option>
                    <option value="Earrings">Earrings</option>
                    <option value="Bangles">Bangles</option>
                    <option value="Bridal Collection">Bridal Collection</option>
                    <option value="Men's Collection">Men's Collection</option>
                    <option value="Silver Jewellery">Silver Jewellery</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="prod_price">Price (INR) *</label>
                  <input 
                    type="number" 
                    id="prod_price"
                    className="form-control" 
                    placeholder="e.g. 185000"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="prod_desc">Detailed Masterpiece Description *</label>
                <textarea 
                  id="prod_desc"
                  className="form-control" 
                  rows="4"
                  placeholder="Outline the detailed metal carvings, certifications, rubies, or diamond details..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="prod_images">Product Images (Comma-separated URLs) *</label>
                <input 
                  type="text" 
                  id="prod_images"
                  className="form-control" 
                  placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                  value={productForm.images}
                  onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label htmlFor="prod_mat">Material *</label>
                  <select 
                    id="prod_mat"
                    className="form-control"
                    value={productForm.material}
                    onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                  >
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Diamond">Diamond</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="prod_weight">Weight (grams) *</label>
                  <input 
                    type="text" 
                    id="prod_weight"
                    className="form-control" 
                    placeholder="e.g. 24.5g"
                    value={productForm.weight}
                    onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="prod_gender">Gender Theme</label>
                  <select 
                    id="prod_gender"
                    className="form-control"
                    value={productForm.gender}
                    onChange={(e) => setProductForm({ ...productForm, gender: e.target.value })}
                  >
                    <option value="Women">Women</option>
                    <option value="Men">Men</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="prod_stock">Initial Stock Quantity *</label>
                <input 
                  type="number" 
                  id="prod_stock"
                  className="form-control" 
                  placeholder="e.g. 10"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                <button type="submit" className="btn-gold" style={{ flex: 1, justifyContent: 'center' }}>
                  {isEditing ? 'Save Modifications' : 'Catalogue Design'}
                </button>
                <button 
                  type="button" 
                  className="btn-black" 
                  onClick={() => setShowProductModal(false)}
                  style={{ flex: 1, justifyContent: 'center', border: '1px solid #ccc', color: '#666', background: 'transparent' }}
                >
                  Cancel
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Embedded Keyframe Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulseGold {
          0% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(212, 175, 55, 0); }
          100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
        }
      `}} />

    </div>
  );
};

export default AdminDashboard;
