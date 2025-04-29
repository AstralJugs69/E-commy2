import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import api from '../utils/api';

interface UserProfile {
  id: number;
  email: string;
  name?: string | null; // Name is optional
  createdAt?: string; // Optional creation date
  // Add any other relevant fields returned by /auth/me
}

interface AuthContextType {
  token: string | null;
  userProfile: UserProfile | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAuthLoading: boolean; // Add loading state type
}

// Create context with a default value (can be undefined or null initially)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // Add loading state

  // Function to fetch user profile data
  const fetchUserProfile = async (currentToken: string) => {
    try {
      const response = await api.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${currentToken}`
        }
      });
      
      if (response.data) {
        setUserProfile(response.data);
        console.log('User profile fetched:', response.data);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setUserProfile(null);
      
      // If token is invalid/expired, logout the user
      if (err.response && err.response.status === 401) {
        console.log('Token invalid or expired, logging out');
        logout();
      }
    }
  };

  // Load token from storage on initial mount
  useEffect(() => {
    setIsAuthLoading(true); // Start loading
    
    (async () => {
      try {
        const storedToken = localStorage.getItem('customer_token');
        if (storedToken) {
          setToken(storedToken);
          // Fetch user profile if token exists
          await fetchUserProfile(storedToken);
        } else {
          // Ensure userProfile is null when no token exists
          setUserProfile(null);
        }
      } catch (error) {
        console.error("Error during auth initialization:", error);
        // Reset states on critical error
        setToken(null);
        setUserProfile(null);
      } finally {
        setIsAuthLoading(false); // Always finish loading regardless of outcome
      }
    })();
  }, []); // Run once on mount

  const login = async (newToken: string) => {
    try {
      localStorage.setItem('customer_token', newToken);
      setToken(newToken);
      
      // Fetch user profile after login
      await fetchUserProfile(newToken);
    } catch (error) {
      console.error("Error during login process:", error);
      // Handle potential storage errors (e.g., storage full)
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('customer_token');
      setToken(null);
      setUserProfile(null);
    } catch (error) {
      console.error("Error removing token from localStorage:", error);
    }
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ 
      token, 
      userProfile, 
      login, 
      logout, 
      isAuthenticated, 
      isAuthLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 