import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Define types for cart items and product
interface ProductImage {
  id: number;
  url: string;
  productId: number;
  createdAt: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  description: string | null;
  images?: ProductImage[];
  stock: number;
}

interface CartItem extends Product {
  quantity: number;
  // For backward compatibility
  imageUrl?: string | null;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateCartItemQuantity: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  getItemCount: () => number;
  totalPrice: number;
  fetchCart: () => Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Lock mechanism to prevent concurrent updates
  const updateLocks = useRef<Record<number, boolean>>({});
  
  // Get token from localStorage
  const getToken = (): string | null => {
    return localStorage.getItem('customer_token');
  };
  
  const isAuthenticated = (): boolean => {
    return !!getToken();
  };

  // Fetch cart items from API
  const fetchCart = async (): Promise<void> => {
    const token = getToken();
    if (!token) {
      console.log('No token available for fetching cart');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching cart from server');
      
      // Fetch all cart items for this user
      const response = await axios.get(`${API_BASE_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Cart data received:', response.data);
      
      // Update local cart state with server data
      setCartItems(response.data.map((item: any) => {
        // Extract the first image URL if available
        const firstImageUrl = item.product.images && item.product.images.length > 0 
          ? item.product.images[0].url 
          : null;
          
        return {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          description: item.product.description,
          images: item.product.images,
          // For backward compatibility
          imageUrl: firstImageUrl,
          stock: item.product.stock,
          quantity: item.quantity
        };
      }));
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError("Failed to load cart items.");
      
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        toast.error("Your session has expired. Please log in again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add new item to cart
  const addToCart = async (productId: number, quantity: number): Promise<void> => {
    const token = getToken();
    
    if (!token || !isAuthenticated()) {
      toast.error("Please log in to add items to your cart.");
      throw new Error("User not authenticated");
    }
    
    if (quantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }

    // Check if operation is already in progress
    if (updateLocks.current[productId]) {
      console.log('Operation already in progress for this item');
      return;
    }
    
    // Set lock
    updateLocks.current[productId] = true;
    setIsLoading(true);
    setError(null);

    try {
      console.log('Adding new item to cart:', { productId, quantity });
      
      // Check if item already exists in cart
      const existingItem = cartItems.find(item => item.id === productId);
      
      if (existingItem) {
        // If item exists, check stock limits first
        const newQuantity = existingItem.quantity + quantity;
        
        if (newQuantity > existingItem.stock) {
          toast.error(`Cannot add more than available stock (${existingItem.stock})`);
          setIsLoading(false);
          updateLocks.current[productId] = false;
          return;
        }
        
        // If within stock limits, add to existing quantity
        await updateCartItemQuantity(productId, newQuantity);
        return;
      }
      
      // For new items, we'll let the server validate stock
      const response = await axios.post(
        `${API_BASE_URL}/cart/item`,
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Add to cart response:', response.data);

      // Refresh cart data from server
      await fetchCart();
      
      // Show success message
      toast.success(`${quantity} item(s) added to cart`);
    } catch (err) {
      console.error("Error adding item to cart:", err);
      let errorMsg = "Failed to add item to cart.";
      
      if (axios.isAxiosError(err) && err.response) {
        console.error('Error response data:', err.response.data);
        
        // Use specific error message from the server if available
        if (err.response.data && err.response.data.message) {
          errorMsg = err.response.data.message;
        } else if (err.response.data && typeof err.response.data === 'string') {
          errorMsg = err.response.data;
        }
        
        // Common validation cases
        if (err.response.status === 400) {
          if (errorMsg.includes('stock') || errorMsg.includes('available')) {
            errorMsg = `Cannot add more than available stock.`;
          }
        }
      }
      
      toast.error(errorMsg);
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
      // Release lock
      updateLocks.current[productId] = false;
    }
  };

  // Update item quantity in cart
  const updateCartItemQuantity = async (productId: number, quantity: number): Promise<void> => {
    const token = getToken();
    
    if (!token || !isAuthenticated()) {
      toast.error("Please log in to update your cart.");
      throw new Error("User not authenticated");
    }
    
    if (quantity < 1) {
      await removeFromCart(productId);
      return;
    }
    
    // Check if operation is already in progress
    if (updateLocks.current[productId]) {
      console.log('Operation already in progress for this item');
      return;
    }
    
    // Set lock
    updateLocks.current[productId] = true;
    setIsLoading(true);
    setError(null);

    try {
      console.log('Updating cart item quantity:', { productId, quantity });
      
      // Check current item in cart for local validation
      const currentItem = cartItems.find(item => item.id === productId);
      if (currentItem && quantity > currentItem.stock) {
        toast.error(`Cannot add more than available stock (${currentItem.stock})`);
        setIsLoading(false);
        updateLocks.current[productId] = false;
        return;
      }
      
      // Use the update endpoint to set the quantity directly instead of incrementing
      const response = await axios.post(
        `${API_BASE_URL}/cart/update/${productId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Cart update response:', response.data);

      // Update the cart item directly for immediate UI feedback
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.id === productId ? { ...item, quantity } : item
        )
      );
      
      // Then refresh cart data from server
      await fetchCart();
      
      // Show success message
      toast.success(`Cart quantity updated to ${quantity}`);
    } catch (err) {
      console.error("Error updating cart item quantity:", err);
      let errorMsg = "Failed to update quantity.";
      
      if (axios.isAxiosError(err) && err.response) {
        console.error('Error response data:', err.response.data);
        
        // Use specific error message from the server if available
        if (err.response.data && err.response.data.message) {
          errorMsg = err.response.data.message;
        } else if (err.response.data && typeof err.response.data === 'string') {
          errorMsg = err.response.data;
        }
        
        // Common validation cases
        if (err.response.status === 400) {
          if (errorMsg.includes('stock') || errorMsg.includes('available')) {
            errorMsg = `Cannot add more than available stock.`;
          }
        }
      }
      
      toast.error(errorMsg);
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
      // Release lock
      updateLocks.current[productId] = false;
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId: number): Promise<void> => {
    const token = getToken();
    
    if (!token || !isAuthenticated()) {
      toast.error("Please log in to update your cart.");
      throw new Error("User not authenticated");
    }
    
    // Check if operation is already in progress
    if (updateLocks.current[productId]) {
      console.log('Operation already in progress for this item');
      return;
    }
    
    // Set lock
    updateLocks.current[productId] = true;
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Removing item from cart:', productId);
      
      // Call the API to remove the item
      await axios.delete(`${API_BASE_URL}/cart/item/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state immediately for responsiveness
      setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
      
      // Re-fetch cart to ensure consistency
      await fetchCart();
      
      toast.success("Item removed from cart.");
    } catch (err) {
      console.error("Error removing item from cart:", err);
      let errorMsg = "Failed to remove item from cart.";
      
      if (axios.isAxiosError(err) && err.response) {
        errorMsg = err.response.data.message || errorMsg;
      }
      
      toast.error(errorMsg);
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
      // Release lock
      updateLocks.current[productId] = false;
    }
  };

  // Clear cart
  const clearCart = async (): Promise<void> => {
    const token = getToken();
    
    if (!token || !isAuthenticated()) {
      toast.error("Please log in to clear your cart.");
      throw new Error("User not authenticated");
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Clearing cart');
      
      // Call the API to clear the cart
      await axios.delete(`${API_BASE_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setCartItems([]);
      
      toast.success("Cart cleared successfully.");
    } catch (err) {
      console.error("Error clearing cart:", err);
      let errorMsg = "Failed to clear cart.";
      
      if (axios.isAxiosError(err) && err.response) {
        errorMsg = err.response.data.message || errorMsg;
      }
      
      toast.error(errorMsg);
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getCartTotal = (): number => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getItemCount = (): number => {
     return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  // Calculate the total price of items in the cart
  const totalPrice = getCartTotal();

  // Initialize cart from API when component mounts
  useEffect(() => {
    if (isAuthenticated()) {
      fetchCart();
    }
  }, []);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart,
      updateCartItemQuantity,
      removeFromCart, 
      clearCart, 
      getCartTotal, 
      getItemCount,
      totalPrice,
      fetchCart,
      isLoading
    }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 