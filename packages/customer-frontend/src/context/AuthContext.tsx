import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  userId: number | null; // Or string if your IDs are strings
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
  const [isAuthLoading, setIsAuthLoading] = useState(true); // Add loading state
  // TODO: Add userId state if needed after decoding token

  // Load token from storage on initial mount
  useEffect(() => {
    setIsAuthLoading(true); // Start loading
    try {
      const storedToken = localStorage.getItem('customer_token');
      if (storedToken) {
        setToken(storedToken);
        // TODO: Decode token and set user ID if needed
        // const decoded = jwtDecode(storedToken); // Example using jwt-decode
        // setUserId(decoded.userId);
      }
    } catch (error) {
       console.error("Error reading token from localStorage:", error);
    } finally {
       setIsAuthLoading(false); // Finish loading regardless of outcome
    }
  }, []); // Run once on mount

  const login = (newToken: string) => {
    try {
        localStorage.setItem('customer_token', newToken);
        setToken(newToken);
        // TODO: Decode token and set user ID if needed
    } catch (error) {
        console.error("Error saving token to localStorage:", error);
        // Handle potential storage errors (e.g., storage full)
    }
  };

  const logout = () => {
    try {
        localStorage.removeItem('customer_token');
        setToken(null);
        // TODO: Clear userId state if implemented
    } catch (error) {
        console.error("Error removing token from localStorage:", error);
    }
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, userId: null, login, logout, isAuthenticated, isAuthLoading }}> {/* Add isAuthLoading to value */}
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