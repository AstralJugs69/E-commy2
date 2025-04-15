import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError(null); // Clear previous validation errors

    // --- Frontend Validation ---
    if (password !== confirmPassword) {
      setValidationError("Passwords do not match.");
      return; // Stop submission
    }
    if (password.length < 6) { // Example minimum length
      setValidationError("Password must be at least 6 characters long.");
      return; // Stop submission
    }
    // Add email format validation if desired (optional)

    setIsLoading(true); // Start loading indicator

    try {
      // --- Step 1: Attempt Registration ---
      console.log("Attempting registration for:", email);
      await axios.post(`${API_BASE_URL}/auth/register`, {
        email: email,
        password: password,
      });
      console.log("Registration API call successful for:", email);
      
      // Show success toast
      toast.success('Registration successful!');

      // --- Step 2: Attempt Auto-Login ---
      console.log("Attempting auto-login for:", email);
      try {
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: email,
          password: password, // Use the same password just provided
        });

        console.log("Auto-login API call successful for:", email);
        if (loginResponse.data && loginResponse.data.token) {
          login(loginResponse.data.token); // Update AuthContext state & localStorage
          navigate('/', { replace: true }); // Redirect to home on success
          // No need to set loading false here, navigation happens
          return; // Exit function successfully
        } else {
          // Login response was OK but missing token (unexpected)
          console.error("Auto-login failed: Token missing in response.");
          toast.error("Registration successful, but auto-login failed. Please log in manually.");
          navigate('/login'); // Navigate to login page
        }

      } catch (loginError: any) {
        // Handle errors specifically from the auto-login attempt
        console.error("Auto-login Error:", loginError);
        let loginErrMsg = "Auto-login failed after registration.";
        if (axios.isAxiosError(loginError) && loginError.response) {
           loginErrMsg = `Auto-login failed: ${loginError.response.data.message || 'Please log in manually.'}`;
        }
        // Show error, user needs to login manually now
        toast.error(`Registration successful, but ${loginErrMsg}`);
        navigate('/login'); // Navigate to login page
      }

    } catch (registerError: any) {
      // --- Handle errors from the registration attempt ---
      console.error("Registration Error:", registerError);
      if (axios.isAxiosError(registerError) && registerError.response) {
        if (registerError.response.status === 409) { // Conflict
          toast.error(registerError.response.data.message || 'This email address is already registered.');
        } else { // Other backend error during registration
          toast.error(registerError.response.data.message || 'Registration failed. Please try again.');
        }
      } else { // Network or other unexpected error during registration
        toast.error('Registration failed due to a network or server issue.');
      }
    } finally {
      // This will run even if navigation happens, but it's okay
      setIsLoading(false); // Stop loading indicator in case of errors
    }
  };

  return (
    <Container fluid className="py-3">
      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6} xl={4}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <h3 className="text-center mb-4">Create an Account</h3>
              
              <Form onSubmit={handleRegister}>
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
                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    size="lg"
                  />
                  <Form.Text className="text-muted">
                    Must be at least 6 characters long
                  </Form.Text>
                </Form.Group>
                
                {/* Confirm Password input */}
                <Form.Group className="mb-4" controlId="formBasicConfirmPassword">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    size="lg"
                  />
                </Form.Group>
                
                {/* Error message */}
                {validationError && (
                  <Alert variant="danger" className="mb-3">
                    {validationError}
                  </Alert>
                )}
                
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
                      Creating Account...
                    </>
                  ) : (
                    'Register'
                  )}
                </Button>
              </Form>
              
              <p className="mt-4 text-center">
                Already have an account? <Link to="/login">Login here</Link>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage; 