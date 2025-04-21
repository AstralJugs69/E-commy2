import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaStore } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'; // Make sure this matches your backend

const RequestPasswordResetPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handleRequestReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setIsError(false);

    // Basic frontend email validation (optional, backend validates too)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address.');
      setIsError(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/request-password-reset`, { email });
      // API always returns 200 with a message on success (even if email not found)
      setMessage(response.data.message);
      setIsError(false); // It's a success message from the backend
      setEmail(''); // Clear email field on success
    } catch (err) {
      console.error('Password reset request error:', err);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (axios.isAxiosError(err) && err.response) {
        // Use backend error message if available, otherwise generic
        errorMessage = err.response.data.message || errorMessage;
      }
      setMessage(errorMessage);
      setIsError(true);
    } finally {
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
              <h2 className="text-center mb-4 fw-semibold">Reset Password</h2>
              
              <p className="text-center text-muted mb-4">
                Enter your email address and we'll send you instructions to reset your password (if an account exists).
              </p>

              {message && (
                <Alert variant={isError ? 'danger' : 'success'} className="mb-4">
                  {message}
                </Alert>
              )}

              <Form onSubmit={handleRequestReset}>
                <Form.Group className="mb-4" controlId="formBasicEmail">
                  <Form.Label className="fw-medium text-neutral-700">Email address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="py-2"
                  />
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 py-2 rounded-pill fw-medium" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Sending Request...
                    </>
                  ) : (
                    'Request Reset Link'
                  )}
                </Button>
              </Form>

              <div className="text-center mt-4">
                <Link to="/login" className="text-decoration-none fw-medium">Back to Login</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RequestPasswordResetPage; 