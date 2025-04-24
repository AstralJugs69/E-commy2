import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';
import api from '../utils/api'; // Import centralized API utility

// Define types
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
  imageUrl: string | null;
  images?: ProductImage[];
  stock: number;
  description?: string | null;
  averageRating?: number | null;
  reviewCount?: number;
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
      const response = await api.get('/wishlist');
      
      // Ensure response.data is an array
      setWishlistItems(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      console.error("Error fetching wishlist:", err);
      setError("Failed to load wishlist items.");
      
      if (err.response?.status === 401) {
        toast.error("Your session has expired. Please log in again.");
      }
      
      // Set empty array to prevent mapping errors
      setWishlistItems([]);
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
      await api.post('/wishlist', { productId });
      
      await fetchWishlist();
      toast.success("Item added to wishlist!");
    } catch (err: any) {
      console.error("Error adding to wishlist:", err);
      let errorMsg = "Failed to add item to wishlist.";
      
        // If the item is already in the wishlist, don't show an error
      if (err.response?.status === 409) {
          toast.success("Item is already in your wishlist!");
          return;
        }
        
      if (err.response) {
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
      await api.delete(`/wishlist/${productId}`);
      
      // Update local state immediately for better UX
      setWishlistItems(prevItems => prevItems.filter(item => item.productId !== productId));
      toast.success("Item removed from wishlist.");
    } catch (err: any) {
      console.error("Error removing from wishlist:", err);
      let errorMsg = "Failed to remove item from wishlist.";
      
      if (err.response) {
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