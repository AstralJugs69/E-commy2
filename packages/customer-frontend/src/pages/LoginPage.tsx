import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaStore } from 'react-icons/fa';
import api from '../utils/api';

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
      const response = await api.post('/auth/login', {
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
    <Container fluid className="py-4">
      {/* Logo Section */}
      <Row className="justify-content-center mb-4">
        <Col xs={12} className="text-center">
          <div className="store-logo-container mb-3">
            <FaStore size={45} className="text-primary mb-2" />
            <h1 className="h3 fw-semibold text-primary">HybridStore</h1>
          </div>
        </Col>
      </Row>
      
      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={8} lg={5} xl={4}>
          <Card className="shadow-sm border-0 auth-card">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4 fw-semibold">Sign In</h2>
              
              {validationError && (
                <Alert variant="danger" className="mb-4">
                  {validationError}
                </Alert>
              )}
              
              <Form onSubmit={handleLogin}>
                {/* Email input */}
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label className="fw-medium">Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="auth-input"
                  />
                </Form.Group>
                
                {/* Password input */}
                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label className="fw-medium">Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="auth-input"
                  />
                </Form.Group>
                
                {/* Forgot Password Link */}
                <div className="text-end mb-4">
                  <Link to="/request-password-reset" className="text-decoration-none small">Forgot Password?</Link>
                </div>
                
                {/* Submit button */}
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isLoading}
                  className="w-100 py-2 rounded-pill fw-medium"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </Form>
              
              <p className="mt-4 text-center mb-0">
                Don't have an account? <Link to="/register" className="text-decoration-none fw-medium">Create account</Link>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage; 