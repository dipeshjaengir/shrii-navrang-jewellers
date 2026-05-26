import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_URL } from '../config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalPurpose, setAuthModalPurpose] = useState('login'); // 'login' or 'signup'
  const [restrictedActionCallback, setRestrictedActionCallback] = useState(null); // Callback after successful login

  useEffect(() => {
    // Load cached credentials on startup
    const storedUser = localStorage.getItem('sn_user');
    const storedToken = localStorage.getItem('sn_token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      
      localStorage.setItem('sn_user', JSON.stringify(data));
      localStorage.setItem('sn_token', data.token);
      setUser(data);
      setToken(data.token);
      setShowAuthModal(false);

      // Execute callback if it was set
      if (restrictedActionCallback) {
        restrictedActionCallback(data);
        setRestrictedActionCallback(null);
      }
      return data;
    } catch (err) {
      throw err;
    }
  };

  const register = async (name, email, phone, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      localStorage.setItem('sn_user', JSON.stringify(data));
      localStorage.setItem('sn_token', data.token);
      setUser(data);
      setToken(data.token);
      setShowAuthModal(false);
      
      if (restrictedActionCallback) {
        restrictedActionCallback(data);
        setRestrictedActionCallback(null);
      }
      return data;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('sn_user');
    localStorage.removeItem('sn_token');
    setUser(null);
    setToken(null);
    setRestrictedActionCallback(null);
  };

  const syncProfile = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem('sn_user', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error syncing profile:', error);
    }
  };

  const updateProfile = async (updatedData) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Profile update failed');
      
      // Update token in payload if updatedData returns a fresh token or sync profile
      await syncProfile();
      return data;
    } catch (err) {
      throw err;
    }
  };

  const toggleWishlist = async (productId) => {
    if (!token) {
      triggerRestrictedAction(() => toggleWishlist(productId));
      return false;
    }

    try {
      const res = await fetch(`${API_URL}/auth/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      await syncProfile();
      return true;
    } catch (error) {
      console.error('Wishlist error:', error);
      return false;
    }
  };

  const triggerRestrictedAction = (callback) => {
    setRestrictedActionCallback(() => callback);
    setAuthModalPurpose('login');
    setShowAuthModal(true);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      showAuthModal,
      authModalPurpose,
      setShowAuthModal,
      setAuthModalPurpose,
      login,
      register,
      logout,
      updateProfile,
      toggleWishlist,
      syncProfile,
      triggerRestrictedAction
    }}>
      {children}
    </AuthContext.Provider>
  );
};
