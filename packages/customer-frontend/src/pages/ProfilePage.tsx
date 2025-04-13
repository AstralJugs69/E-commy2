import React, { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import { Container, Card, Alert, Spinner, Form, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface UserProfile {
  id: number;
  email: string;
}

const API_BASE_URL = 'http://localhost:3001/api';

const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  
  const { token, isAuthenticated, isAuthLoading } = useAuth();

  useEffect(() => {
    // Don't fetch if auth is still loading or user is not authenticated
    if (isAuthLoading || !isAuthenticated || !token) {
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setProfile(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          if (err.response.status === 401) {
            setError('Your session has expired. Please login again.');
          } else {
            setError(err.response.data.message || 'Failed to fetch profile information.');
          }
          console.error('Error fetching profile:', err.response.data);
        } else {
          setError('Network error. Please check your connection.');
          console.error('Network error:', err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [token, isAuthenticated, isAuthLoading]);

  const handleChangePassword = async (event: FormEvent) => {
    event.preventDefault();
    
    // Reset status states
    setIsUpdatingPassword(true);
    setUpdateError(null);
    setUpdateSuccess(null);
    
    // Frontend validation
    if (newPassword !== confirmPassword) {
      setUpdateError("New passwords don't match.");
      setIsUpdatingPassword(false);
      return;
    }
    
    if (newPassword.length < 6) {
      setUpdateError("New password must be at least 6 characters long.");
      setIsUpdatingPassword(false);
      return;
    }
    
    // Check token
    if (!token) {
      setUpdateError("You're not logged in. Please login and try again.");
      setIsUpdatingPassword(false);
      return;
    }
    
    try {
      await axios.post(
        `${API_BASE_URL}/auth/change-password`, 
        { currentPassword, newPassword, confirmPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Success case
      setUpdateSuccess("Password updated successfully!");
      toast.success("Password updated!");
      
      // Clear form fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          setUpdateError("Current password is incorrect.");
        } else if (err.response.status === 400) {
          // Validation error
          const errorMsg = err.response.data.message || 
                         (err.response.data.errors ? Object.values(err.response.data.errors).join('. ') : 
                         'Invalid form data. Please check your inputs.');
          setUpdateError(errorMsg);
        } else {
          setUpdateError(err.response.data.message || 'Failed to update password.');
        }
        console.error('Error updating password:', err.response.data);
        toast.error("Failed to update password");
      } else {
        setUpdateError('Network error. Please check your connection.');
        console.error('Network error:', err);
        toast.error("Network error");
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <Container className="py-3">
      <h2 className="mb-4">My Profile</h2>
      
      {isLoading && (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading profile...</span>
          </Spinner>
        </div>
      )}
      
      {error && (
        <Alert variant="danger" className="my-3">
          {error}
        </Alert>
      )}
      
      {!isAuthenticated && !isAuthLoading && !error && (
        <Alert variant="info">
          Please login to view your profile.
        </Alert>
      )}
      
      {profile && (
        <>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Account Information</Card.Title>
              <Card.Text>
                <strong>Email:</strong> {profile.email}
              </Card.Text>
              <Card.Text>
                <strong>User ID:</strong> {profile.id}
              </Card.Text>
            </Card.Body>
          </Card>
          
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Change Password</Card.Title>
              
              {(updateSuccess || updateError) && (
                <Alert variant={updateError ? 'danger' : 'success'} className="mb-3">
                  {updateError || updateSuccess}
                </Alert>
              )}
              
              <Form onSubmit={handleChangePassword}>
                <Form.Group className="mb-3" controlId="currentPassword">
                  <Form.Label>Current Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="newPassword">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <Form.Text className="text-muted">
                    Password must be at least 6 characters long.
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="confirmPassword">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={isUpdatingPassword}
                >
                  {isUpdatingPassword ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Updating...
                    </>
                  ) : 'Update Password'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
};

export default ProfilePage; 