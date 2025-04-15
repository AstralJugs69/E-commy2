import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Define types for cart items and product
interface Product {
  id: number;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  stock: number;
}

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => Promise<void>;
  addOrUpdateItemQuantity: (productId: number, quantity: number) => Promise<void>;
  updateCartItemQuantity: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  getItemCount: () => number;
  totalPrice: number;
  fetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
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
      setCartItems(response.data.map((item: any) => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        description: item.product.description,
        imageUrl: item.product.imageUrl,
        stock: item.product.stock,
        quantity: item.quantity
      })));
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

  // Add an item to cart (with quantity 1)
  const addToCart = async (product: Product): Promise<void> => {
    try {
      await addOrUpdateItemQuantity(product.id, 1);
    } catch (err) {
      console.error("Error adding product to cart:", err);
      let errorMsg = "Failed to add item to cart.";
      
      if (axios.isAxiosError(err) && err.response) {
        console.log('API Error details:', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message
        });
        
        errorMsg = err.response.data.message || errorMsg;
      }
      
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Add or update cart item quantity
  const addOrUpdateItemQuantity = async (productId: number, quantity: number): Promise<void> => {
    const token = getToken();
    
    console.log('Adding/updating cart item:', { productId, quantity, isLoggedIn: !!token });
    
    if (!token || !isAuthenticated()) {
      console.log('User not authenticated, token:', token);
      toast.error("Please log in to update your cart.");
      throw new Error("User not authenticated");
    }
    
    if (quantity < 1) {
      await removeFromCart(productId);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Sending API request to add/update cart:', {
        url: `${API_BASE_URL}/cart/item`,
        data: { productId, quantity },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Use the POST /cart/item endpoint to add or update an item
      await axios.post(
        `${API_BASE_URL}/cart/item`,
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Re-fetch the entire cart to ensure state consistency
      await fetchCart();
      
      toast.success(`${quantity} item(s) added to cart.`);
    } catch (err) {
      console.error("Error adding/updating cart:", err);
      let errorMsg = "Failed to update cart item.";
      
      if (axios.isAxiosError(err) && err.response) {
        console.log('API Error details:', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message
        });
        
        errorMsg = err.response.data.message || errorMsg;
      }
      
      toast.error(errorMsg);
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId: number): Promise<void> => {
    const token = getToken();
    
    if (!token || !isAuthenticated()) {
      toast.error("Please log in to update your cart.");
      throw new Error("User not authenticated");
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Removing item from cart:', productId);
      
      // Call the API to remove the item
      await axios.delete(`${API_BASE_URL}/cart/item/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Re-fetch cart or update local state
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
      addOrUpdateItemQuantity,
      updateCartItemQuantity: addOrUpdateItemQuantity,
      removeFromCart, 
      clearCart, 
      getCartTotal, 
      getItemCount,
      totalPrice,
      fetchCart
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