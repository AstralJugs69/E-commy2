import { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:3001/api';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

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
        // Navigate to dashboard or home page
        navigate('/dashboard');
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
    <Container fluid>
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col md={6} lg={4}>
          <Card className="shadow">
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
                <Form.Group className="mb-4" controlId="formBasicPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                
                {/* Error message */}
                {errorMessage && (
                  <Alert variant="danger" className="mb-3">
                    {errorMessage}
                  </Alert>
                )}
                
                {/* Submit button */}
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isLoading}
                  className="w-100"
                >
                  {isLoading ? 'Logging in...' : 'Login'}
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