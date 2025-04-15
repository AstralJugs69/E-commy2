import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';

// Define types
interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  stock: number;
}

interface WishlistItem {
  id: number;
  userId: number;
  productId: number;
  createdAt: string;
  product: Product;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  isLoading: boolean;
  error: string | null;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  isWishlisted: (productId: number) => boolean;
  fetchWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:3001/api';

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { token, isAuthenticated } = useAuth();

  // Fetch wishlist items when auth state changes
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchWishlist();
    } else {
      // Clear wishlist when logged out
      setWishlistItems([]);
    }
  }, [isAuthenticated, token]);

  // Fetch wishlist items from API
  const fetchWishlist = async (): Promise<void> => {
    if (!isAuthenticated || !token) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setWishlistItems(response.data);
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setError("Failed to load wishlist items.");
      
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        toast.error("Your session has expired. Please log in again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add item to wishlist
  const addToWishlist = async (productId: number): Promise<void> => {
    if (!isAuthenticated || !token) {
      toast.error("Please log in to add items to your wishlist.");
      throw new Error("User not authenticated");
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await axios.post(
        `${API_BASE_URL}/wishlist`,
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await fetchWishlist();
      toast.success("Item added to wishlist!");
    } catch (err) {
      console.error("Error adding to wishlist:", err);
      let errorMsg = "Failed to add item to wishlist.";
      
      if (axios.isAxiosError(err) && err.response) {
        // If the item is already in the wishlist, don't show an error
        if (err.response.status === 409) {
          toast.success("Item is already in your wishlist!");
          return;
        }
        
        errorMsg = err.response.data.message || errorMsg;
      }
      
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (productId: number): Promise<void> => {
    if (!isAuthenticated || !token) {
      toast.error("Please log in to manage your wishlist.");
      throw new Error("User not authenticated");
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await axios.delete(`${API_BASE_URL}/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state immediately for better UX
      setWishlistItems(prevItems => prevItems.filter(item => item.productId !== productId));
      toast.success("Item removed from wishlist.");
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      let errorMsg = "Failed to remove item from wishlist.";
      
      if (axios.isAxiosError(err) && err.response) {
        errorMsg = err.response.data.message || errorMsg;
      }
      
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Check if an item is already in the wishlist
  const isWishlisted = (productId: number): boolean => {
    return wishlistItems.some(item => item.productId === productId);
  };

  return (
    <WishlistContext.Provider 
      value={{ 
        wishlistItems, 
        isLoading, 
        error, 
        addToWishlist, 
        removeFromWishlist, 
        isWishlisted,
        fetchWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

// Custom hook to use the WishlistContext
export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}; 