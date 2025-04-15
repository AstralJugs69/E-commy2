import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:3001/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // If user is already authenticated, redirect to home
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Clear previous error message and set loading state
    setValidationError(null);
    setIsLoading(true);
    
    // Basic frontend validation
    if (!email.trim() || !password.trim()) {
      setValidationError('Email and password are required');
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('Attempting login with:', { email, passwordLength: password.length });
      
      // Make API call to login endpoint
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });
      
      // Check if token exists in response
      if (response.data && response.data.token) {
        // Use the context login function to store token
        login(response.data.token);
        console.log('Login successful!');
        
        // Show success toast
        toast.success('Login successful!');
        
        // Navigate to home page
        navigate('/', { replace: true });
      } else {
        // Handle unexpected response format
        toast.error('Invalid server response - token missing');
        console.error('Server response missing token', response.data);
      }
    } catch (error) {
      // Handle error
      if (axios.isAxiosError(error) && error.response) {
        // Server responded with an error
        console.error('Login API error:', error.response.status, error.response.data);
        toast.error(error.response.data.message || 'Authentication failed');
      } else {
        // Network or other error
        console.error('Login network error:', error);
        toast.error('Network or server error. Please try again later.');
      }
    } finally {
      // Reset loading state
      setIsLoading(false);
    }
  };

  return (
    <Container fluid className="py-3">
      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6} xl={4}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <h3 className="text-center mb-4">Customer Login</h3>
              
              {validationError && (
                <Alert variant="danger" className="mb-3">
                  {validationError}
                </Alert>
              )}
              
              <Form onSubmit={handleLogin}>
                {/* Email input */}
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    size="lg"
                  />
                </Form.Group>
                
                {/* Password input */}
                <Form.Group className="mb-4" controlId="formBasicPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    size="lg"
                  />
                </Form.Group>
                
                {/* Forgot Password Link */}
                <div className="text-end mb-3">
                  <Link to="/request-password-reset">Forgot Password?</Link>
                </div>
                
                {/* Submit button */}
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isLoading}
                  className="w-100 py-2"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </Form>
              
              <p className="mt-4 text-center">
                Don't have an account? <Link to="/register">Register here</Link>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage; 