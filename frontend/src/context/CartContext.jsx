import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { API_URL } from '../config';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ products: [] });
  const [loading, setLoading] = useState(false);
  const { token, triggerRestrictedAction } = useAuth();

  const fetchCart = async () => {
    if (!token) {
      setCart({ products: [] });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/cart`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [token]);

  const addToCart = async (productId, quantity = 1) => {
    if (!token) {
      // If user is guest, trigger auth popup, and perform add-to-cart immediately after login succeeds!
      triggerRestrictedAction(async (freshUser) => {
        // Fetch cart with the fresh token and then perform add
        const freshToken = localStorage.getItem('sn_token');
        try {
          const res = await fetch(`${API_URL}/cart/add`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${freshToken}`
            },
            body: JSON.stringify({ productId, quantity })
          });
          if (res.ok) {
            const data = await res.json();
            setCart(data);
          }
        } catch (err) {
          console.error(err);
        }
      });
      return { triggerAuth: true };
    }

    try {
      const res = await fetch(`${API_URL}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCart(data);
      return { success: true };
    } catch (error) {
      console.error('Add to cart error:', error);
      return { success: false, error: error.message };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/cart/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCart(data);
    } catch (error) {
      console.error('Update quantity error:', error);
    }
  };

  const removeFromCart = async (productId) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/cart/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCart(data);
    } catch (error) {
      console.error('Remove from cart error:', error);
    }
  };

  const clearCart = () => {
    setCart({ products: [] });
  };

  const cartCount = cart?.products?.reduce((total, p) => total + p.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      fetchCart,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};
