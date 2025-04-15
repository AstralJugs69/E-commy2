import { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const AdminRequestPasswordResetPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const handleRequestReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setError(false);

    // Basic frontend email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address.');
      setError(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/request-password-reset`, { email });
      // API always returns 200 with a message on success (even if email not found)
      setMessage(response.data.message);
      setError(false);
      setEmail(''); // Clear email field on success
    } catch (err) {
      console.error('Password reset request error:', err);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (axios.isAxiosError(err) && err.response) {
        // Use backend error message if available
        errorMessage = err.response.data.message || errorMessage;
      }
      setMessage(errorMessage);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container fluid>
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col md={6} lg={4}>
          <Card className="shadow mb-4">
            <Card.Body className="p-4">
              <h3 className="text-center mb-4">Reset Admin Password</h3>
              <p className="text-center text-muted mb-4">
                Enter your admin email address and we'll send you instructions to reset your password.
              </p>

              {message && (
                <Alert variant={error ? 'danger' : 'success'} className="mb-3">
                  {message}
                </Alert>
              )}

              <Form onSubmit={handleRequestReset}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter admin email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      Sending...
                    </>
                  ) : (
                    'Request Reset Link'
                  )}
                </Button>
              </Form>

              <div className="text-center mt-3">
                <Link to="/login">Back to Login</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminRequestPasswordResetPage; 