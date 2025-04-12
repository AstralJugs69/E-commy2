import { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Clear previous error message and set loading state
    setErrorMessage(null);
    setIsLoading(true);
    
    // Basic frontend validation
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Email and password are required');
      setIsLoading(false);
      return;
    }
    
    try {
      // Make API call to login endpoint
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });
      
      // Check if token exists in response
      if (response.data && response.data.token) {
        // Store token in localStorage
        localStorage.setItem('admin_token', response.data.token);
        console.log('Login successful!');
        // Navigation will be added later
      } else {
        // Handle unexpected response format
        setErrorMessage('Invalid server response');
        console.error('Server response missing token', response.data);
      }
    } catch (error) {
      // Handle error
      if (axios.isAxiosError(error) && error.response) {
        // Server responded with an error
        setErrorMessage(error.response.data.message || 'Authentication failed');
        console.error('Login error:', error.response.data);
      } else {
        // Network or other error
        setErrorMessage('Network or server error. Please try again later.');
        console.error('Login error:', error);
      }
    } finally {
      // Reset loading state
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Admin Login</h2>
        
        <form onSubmit={handleLogin}>
          {/* Email input */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
          
          {/* Password input */}
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          
          {/* Error message */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {errorMessage}
            </div>
          )}
          
          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-md font-medium text-white ${
              isLoading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage; 