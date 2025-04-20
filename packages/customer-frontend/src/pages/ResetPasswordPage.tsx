import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { FaStore } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const ResetPasswordPage = () => {
  const { token } = useParams<{ token: string }>();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // To disable form on success

  useEffect(() => {
    if (!token) {
      setMessage('Invalid or missing password reset token.');
      setIsError(true);
    }
  }, [token]);

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setIsError(false);

    if (!token) {
        setMessage('Password reset token is missing.');
        setIsError(true);
        setIsLoading(false);
        return;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long.');
      setIsError(true);
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      setIsError(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        token,
        password,
        confirmPassword,
      });

      setMessage(response.data.message || 'Password reset successfully! You can now log in.');
      setIsError(false);
      setIsSuccess(true); // Disable form on success
      // Optionally navigate to login after a delay
      // setTimeout(() => navigate('/login'), 3000);

    } catch (err) {
      console.error('Password reset error:', err);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (axios.isAxiosError(err) && err.response) {
        // Use backend error message if available (e.g., token invalid/expired)
        errorMessage = err.response.data.message || errorMessage;
        // Handle specific validation errors from backend if needed
        if (err.response.data.errors) {
            const errors = err.response.data.errors;
            if (errors.password) errorMessage = errors.password.join(', ');
            else if (errors.confirmPassword) errorMessage = errors.confirmPassword.join(', ');
            else if (errors.token) errorMessage = errors.token.join(', ');
        }
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
              <h2 className="text-center mb-4 fw-semibold">Reset Your Password</h2>

              {message && (
                <Alert variant={isError ? 'danger' : 'success'} className="mb-4">
                  {message}
                </Alert>
              )}

              {!isSuccess && !token && (
                 <Alert variant='danger' className="mb-4">
                    Invalid or missing password reset token link.
                 </Alert>
              )}

              {token && (
                <Form onSubmit={handleResetPassword}>
                  <Form.Group className="mb-3" controlId="formNewPassword">
                    <Form.Label className="fw-medium">New Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      disabled={isLoading || isSuccess}
                    />
                    <Form.Text className="text-muted">
                      Must be at least 6 characters long.
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="formConfirmPassword">
                    <Form.Label className="fw-medium">Confirm New Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      disabled={isLoading || isSuccess}
                    />
                  </Form.Group>

                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="w-100 py-2 rounded-pill fw-medium" 
                    disabled={isLoading || isSuccess || !token}
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
                        Resetting Password...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                </Form>
              )}

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

export default ResetPasswordPage; 