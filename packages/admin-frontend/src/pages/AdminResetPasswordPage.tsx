import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const AdminResetPasswordPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
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

      const successMessage = response.data.message || 'Password reset successfully! You can now log in.';
      setMessage(successMessage);
      setIsError(false);
      setIsSuccess(true); // Disable form on success
      toast.success(successMessage);
      
      // Clear form fields
      setPassword('');
      setConfirmPassword('');
      
      // Optionally navigate to login after a delay
      setTimeout(() => navigate('/login'), 3000);

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
      toast.error(errorMessage);
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

              {message && (
                <Alert variant={isError ? 'danger' : 'success'} className="mb-3">
                  {message}
                </Alert>
              )}

              {!isSuccess && !token && (
                <Alert variant='danger' className="mb-3">
                  Invalid or missing password reset token link.
                </Alert>
              )}

              {token && !isSuccess && (
                <Form onSubmit={handleResetPassword}>
                  <Form.Group className="mb-3" controlId="formNewPassword">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      disabled={isLoading}
                    />
                    <Form.Text className="text-muted">
                      Must be at least 6 characters long.
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="formConfirmPassword">
                    <Form.Label>Confirm New Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      disabled={isLoading}
                    />
                  </Form.Group>

                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="w-100 py-2" 
                    disabled={isLoading || !token}
                  >
                    {isLoading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                        Resetting...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                </Form>
              )}

              {isSuccess && (
                <div className="text-center">
                  <p>Your password has been reset successfully.</p>
                  <p>You will be redirected to the login page shortly...</p>
                </div>
              )}

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

export default AdminResetPasswordPage;
