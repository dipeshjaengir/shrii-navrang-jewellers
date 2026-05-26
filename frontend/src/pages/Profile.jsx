import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Phone, Mail, MapPin, Plus, Trash2, Home, Briefcase, Award, Check } from 'lucide-react';

const Profile = ({ onShowToast }) => {
  const { user, updateProfile, syncProfile, token } = useAuth();
  
  const [personalData, setPersonalData] = useState({
    name: '',
    phone: ''
  });
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'India',
    label: 'Home', // Home, Work, Other
    isDefault: false
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  // Sync profile details on mount
  useEffect(() => {
    if (token) {
      syncProfile();
    }
  }, [token]);

  // Update form inputs when user state hydrates
  useEffect(() => {
    if (user) {
      setPersonalData({
        name: user.name || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handlePersonalChange = (e) => {
    setPersonalData({ ...personalData, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm({
      ...addressForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleUpdatePersonal = async (e) => {
    e.preventDefault();
    if (!personalData.name || !personalData.phone) {
      if (onShowToast) onShowToast('Please fill out Name and Phone fields.', 'error');
      return;
    }
    setSavingPersonal(true);
    try {
      await updateProfile(personalData);
      if (onShowToast) onShowToast('Profile details updated successfully!', 'success');
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Error updating profile.', 'error');
    } finally {
      setSavingPersonal(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const { street, city, state, zip, country } = addressForm;
    if (!street || !city || !state || !zip) {
      if (onShowToast) onShowToast('Please fill out all address fields.', 'error');
      return;
    }
    setSavingAddress(true);
    try {
      let currentAddresses = user.addresses ? [...user.addresses] : [];
      
      // If setting as default, set all others to false
      if (addressForm.isDefault) {
        currentAddresses = currentAddresses.map(addr => ({ ...addr, isDefault: false }));
      }
      
      // If this is the very first address, enforce isDefault: true
      const isDefaultVal = currentAddresses.length === 0 ? true : addressForm.isDefault;

      const newAddress = {
        street,
        city,
        state,
        zip,
        country,
        label: addressForm.label,
        isDefault: isDefaultVal
      };

      const updatedAddresses = [...currentAddresses, newAddress];
      await updateProfile({ addresses: updatedAddresses });
      
      if (onShowToast) onShowToast('Address added successfully!', 'success');
      setAddressForm({
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'India',
        label: 'Home',
        isDefault: false
      });
      setShowAddressForm(false);
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Error saving address.', 'error');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addrId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      const userAddresses = user?.addresses || [];
      const updatedAddresses = userAddresses.filter(addr => addr._id !== addrId);
      
      // If we deleted the default address, and we have remaining addresses, set the first one as default
      const deletedWasDefault = userAddresses.find(addr => addr._id === addrId)?.isDefault;
      if (deletedWasDefault && updatedAddresses.length > 0) {
        updatedAddresses[0].isDefault = true;
      }

      await updateProfile({ addresses: updatedAddresses });
      if (onShowToast) onShowToast('Address deleted successfully.', 'success');
    } catch (err) {
      if (onShowToast) onShowToast('Error deleting address.', 'error');
    }
  };

  const handleSetDefault = async (addrId) => {
    try {
      const userAddresses = user?.addresses || [];
      const updatedAddresses = userAddresses.map(addr => ({
        ...addr,
        isDefault: addr._id === addrId
      }));
      await updateProfile({ addresses: updatedAddresses });
      if (onShowToast) onShowToast('Default address updated.', 'success');
    } catch (err) {
      if (onShowToast) onShowToast('Error updating default address.', 'error');
    }
  };

  if (!user) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', fontFamily: 'var(--font-body)' }}>
        <p>Loading your showroom credentials...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'var(--font-body)', backgroundColor: 'var(--alabaster)', minHeight: '80vh', padding: '60px 20px' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        
        {/* Title */}
        <div className="section-title" style={{ marginBottom: '40px' }}>
          <h2>My Profile</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '40px' }}>
          
          {/* Left Side: Profile Summary & Update details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* User Details Box */}
            <div className="glass-panel" style={{ padding: '40px 30px', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.15)', textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))',
                color: 'var(--black)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 600,
                margin: '0 auto 20px',
                boxShadow: 'var(--shadow-gold)'
              }}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.4rem', color: 'var(--black)', marginBottom: '8px' }}>
                {user.name}
              </h3>
              <p style={{ color: 'var(--gold-dark)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '2px', fontWeight: 600, marginBottom: '20px' }}>
                {user.role === 'admin' ? 'Store Administrator' : 'Valued Patron'}
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '20px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Mail size={16} color="var(--grey)" />
                  <span style={{ color: 'var(--charcoal-light)' }}>{user.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Phone size={16} color="var(--grey)" />
                  <span style={{ color: 'var(--charcoal-light)' }}>{user.phone || 'Add number'}</span>
                </div>
              </div>
            </div>

            {/* Profile update form */}
            <div className="glass-panel" style={{ padding: '40px 30px', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
              <h4 style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem', marginBottom: '20px', color: 'var(--black)' }}>
                Edit Personal Info
              </h4>
              <form onSubmit={handleUpdatePersonal}>
                <div className="form-group">
                  <label htmlFor="p_name">Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} color="var(--gold)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
                    <input 
                      type="text" 
                      id="p_name"
                      name="name" 
                      className="form-control" 
                      value={personalData.name} 
                      onChange={handlePersonalChange}
                      style={{ paddingLeft: '42px' }}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="p_phone">Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} color="var(--gold)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
                    <input 
                      type="tel" 
                      id="p_phone"
                      name="phone" 
                      className="form-control" 
                      value={personalData.phone} 
                      onChange={handlePersonalChange}
                      style={{ paddingLeft: '42px' }}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn-gold" style={{ width: '100%', justifyContent: 'center' }} disabled={savingPersonal}>
                  {savingPersonal ? 'Updating...' : 'Save Changes'}
                </button>
              </form>
            </div>

          </div>

          {/* Right Side: Saved Addresses */}
          <div className="glass-panel" style={{ padding: '40px', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.8rem', color: 'var(--black)' }}>
                Saved Addresses
              </h3>
              {!showAddressForm && (
                <button onClick={() => setShowAddressForm(true)} className="btn-gold" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                  <Plus size={14} /> Add New
                </button>
              )}
            </div>

            {/* Dynamic Address Form */}
            {showAddressForm && (
              <div style={{ border: '1px solid rgba(212,175,55,0.2)', padding: '25px', borderRadius: '6px', marginBottom: '30px', backgroundColor: 'rgba(255,255,255,0.7)' }}>
                <h4 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', marginBottom: '20px', color: 'var(--black)' }}>
                  Add Shipping Address
                </h4>
                <form onSubmit={handleAddAddress}>
                  <div className="form-group">
                    <label htmlFor="street">Street Address *</label>
                    <input 
                      type="text" 
                      id="street"
                      name="street" 
                      className="form-control" 
                      placeholder="Flat No, Wing, Apartment name & Street"
                      value={addressForm.street} 
                      onChange={handleAddressChange}
                      required
                    />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="form-group">
                      <label htmlFor="city">City *</label>
                      <input 
                        type="text" 
                        id="city"
                        name="city" 
                        className="form-control" 
                        placeholder="e.g. New Delhi"
                        value={addressForm.city} 
                        onChange={handleAddressChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="state">State *</label>
                      <input 
                        type="text" 
                        id="state"
                        name="state" 
                        className="form-control" 
                        placeholder="e.g. Delhi"
                        value={addressForm.state} 
                        onChange={handleAddressChange}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="form-group">
                      <label htmlFor="zip">ZIP / Postal Code *</label>
                      <input 
                        type="text" 
                        id="zip"
                        name="zip" 
                        className="form-control" 
                        placeholder="e.g. 110006"
                        value={addressForm.zip} 
                        onChange={handleAddressChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="label">Address Label</label>
                      <select 
                        id="label" 
                        name="label" 
                        className="form-control"
                        value={addressForm.label}
                        onChange={handleAddressChange}
                      >
                        <option value="Home">Home</option>
                        <option value="Work">Work (Office)</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                    <input 
                      type="checkbox" 
                      id="isDefault" 
                      name="isDefault" 
                      checked={addressForm.isDefault}
                      onChange={handleAddressChange}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--gold)', cursor: 'pointer' }}
                    />
                    <label htmlFor="isDefault" style={{ marginBottom: 0, cursor: 'pointer', textTransform: 'none', fontWeight: 500 }}>
                      Set as default shipping address
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
                    <button type="submit" className="btn-gold" style={{ flex: 1, justifyContent: 'center' }} disabled={savingAddress}>
                      {savingAddress ? 'Saving...' : 'Save Address'}
                    </button>
                    <button 
                      type="button" 
                      className="btn-black" 
                      style={{ flex: 1, justifyContent: 'center', border: '1px solid #ccc', color: '#666', background: 'transparent' }}
                      onClick={() => setShowAddressForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Address List */}
            {(!user.addresses || user.addresses.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '40px 0', border: '1px dashed rgba(212,175,55,0.3)', borderRadius: '6px' }}>
                <MapPin size={32} color="var(--gold)" style={{ opacity: 0.5, marginBottom: '10px' }} />
                <p style={{ fontWeight: 300, color: 'var(--grey)' }}>No addresses saved yet. Add your default shipping details for rapid checkout.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {user.addresses.map((addr) => (
                  <div 
                    key={addr._id}
                    style={{
                      border: addr.isDefault ? '2px solid var(--gold)' : '1px solid rgba(0,0,0,0.08)',
                      borderRadius: '8px',
                      padding: '24px',
                      backgroundColor: addr.isDefault ? 'var(--white)' : 'rgba(255,255,255,0.4)',
                      position: 'relative',
                      boxShadow: addr.isDefault ? 'var(--shadow-gold)' : 'none',
                      transition: 'var(--transition)'
                    }}
                  >
                    {/* Header Label bar */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', padding: '4px 10px', backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px', gap: '6px', alignItems: 'center' }}>
                        {addr.label === 'Home' && <Home size={12} color="var(--gold-dark)" />}
                        {addr.label === 'Work' && <Briefcase size={12} color="var(--gold-dark)" />}
                        {addr.label !== 'Home' && addr.label !== 'Work' && <MapPin size={12} color="var(--gold-dark)" />}
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                          {addr.label}
                        </span>
                      </div>
                      
                      {addr.isDefault && (
                        <div style={{ display: 'inline-flex', padding: '4px 10px', backgroundColor: 'rgba(212,175,55,0.15)', border: '1px solid var(--gold)', borderRadius: '4px', gap: '4px', alignItems: 'center' }}>
                          <Check size={10} color="var(--gold)" />
                          <span style={{ fontSize: '0.6rem', color: 'var(--gold)', letterSpacing: '1px', fontWeight: 700, textTransform: 'uppercase' }}>
                            Default
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Address Text */}
                    <p style={{ fontWeight: 300, fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--charcoal-light)', marginBottom: '16px', maxWidth: '85%' }}>
                      {addr.street},<br />
                      {addr.city}, {addr.state} - <strong>{addr.zip}</strong>,<br />
                      {addr.country}
                    </p>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '15px', borderTop: '1px solid rgba(0,0,0,0.04)', paddingTop: '16px' }}>
                      {!addr.isDefault && (
                        <button 
                          onClick={() => handleSetDefault(addr._id)}
                          style={{ border: 'none', background: 'none', color: 'var(--gold-dark)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                        >
                          Set as Default
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleDeleteAddress(addr._id)}
                        style={{ border: 'none', background: 'none', color: 'var(--error)', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', marginLeft: 'auto', padding: 0 }}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: 1.2fr 2fr"] {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}} />
    </div>
  );
};

export default Profile;
