import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check for existing token on mount and clear if redirected for re-auth
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      console.log('Found existing token on login page, will be cleared');
      localStorage.removeItem('admin_token');
    }
  }, []);

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
      console.log('Attempting login with:', { email, passwordLength: password.length });
      console.log('Using API endpoint:', `${API_BASE_URL}/auth/login`);

      // Make API call to login endpoint
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });
      
      console.log('Login response received:', response.status);
      
      // Check if token exists in response
      if (response.data && response.data.token) {
        // Store token in localStorage
        console.log('Token received. First 10 chars:', response.data.token.substring(0, 10) + '...');
        localStorage.setItem('admin_token', response.data.token);
        console.log('Login successful!');
        
        // Add a small delay to ensure token is stored before navigation
        setTimeout(() => {
          // Navigate to admin dashboard
          navigate('/admin/dashboard', { replace: true });
        }, 100);
      } else {
        // Handle unexpected response format
        console.error('Server response format:', response.data);
        setErrorMessage('Invalid server response - token missing');
        console.error('Server response missing token', response.data);
      }
    } catch (error) {
      // Handle error
      if (axios.isAxiosError(error) && error.response) {
        // Server responded with an error
        console.error('Login API error:', error.response.status, error.response.data);
        setErrorMessage(error.response.data.message || 'Authentication failed');
      } else {
        // Network or other error
        console.error('Login network error:', error);
        setErrorMessage('Network or server error. Please try again later.');
      }
    } finally {
      // Reset loading state
      setIsLoading(false);
    }
  };

  return (
    <Container fluid>
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col md={6} lg={4}>
          <Card className="shadow mb-4">
            <Card.Body className="p-4">
              <h3 className="text-center mb-4">Admin Login</h3>
              
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
                  />
                </Form.Group>
                
                {/* Password input */}
                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                
                {/* Forgot Password Link */}
                <div className="text-end mb-3">
                  <Link to="/request-password-reset">Forgot Password?</Link>
                </div>
                
                {/* Error message */}
                {errorMessage && (
                  <Alert variant="danger" className="mb-4">
                    {errorMessage}
                  </Alert>
                )}
                
                {/* Submit button */}
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isLoading}
                  className="w-100 py-2 mt-2"
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
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default LoginPage; 