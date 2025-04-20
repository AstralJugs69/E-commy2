import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

const ProfileSettingsPage = () => {
  const navigate = useNavigate();
  
  // Admin profile data state
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Password change form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Fetch admin profile data
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const response = await api.get('/auth/me');
        setAdminProfile(response.data);
      } catch (error) {
        console.error('Error fetching admin profile:', error);
        toast.error('Failed to load your profile information');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchAdminProfile();
  }, []);

  // Handle password change form submission
  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Reset states
    setPasswordError(null);
    setPasswordSuccess(null);
    setIsChangingPassword(true);
    
    // Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      setIsChangingPassword(false);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      setIsChangingPassword(false);
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      setIsChangingPassword(false);
      return;
    }
    
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword
      });
      
      setPasswordSuccess('Password updated successfully');
      toast.success('Password has been changed');
      
      // Clear form fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (error: any) {
      if (error.response) {
        // The request was made and the server responded with an error status
        if (error.response.status === 401 && error.response.data.message === 'Incorrect current password.') {
          setPasswordError('Current password is incorrect');
        } else {
          setPasswordError(error.response.data.message || 'Failed to update password');
        }
        console.error('Error changing password:', error.response.data);
      } else {
        setPasswordError('Network error. Please check your connection.');
        console.error('Network error:', error);
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <Container>
      <h1 className="mb-4">Profile Settings</h1>
      
      {isLoadingProfile ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <Row>
          <Col lg={4} className="mb-4">
            <Card className="shadow-sm h-100">
              <Card.Body>
                <h4 className="mb-4">Admin Information</h4>
                {adminProfile && (
                  <>
                    <p><strong>Email:</strong> {adminProfile.email}</p>
                    <p><strong>Role:</strong> {adminProfile.role}</p>
                    <p><strong>Last Login:</strong> {adminProfile.lastLogin ? new Date(adminProfile.lastLogin).toLocaleString() : 'N/A'}</p>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={8}>
            <Card className="shadow-sm">
              <Card.Body>
                <h4 className="mb-4">Change Password</h4>
                
                {passwordError && (
                  <Alert variant="danger" className="mb-4">
                    {passwordError}
                  </Alert>
                )}
                
                {passwordSuccess && (
                  <Alert variant="success" className="mb-4">
                    {passwordSuccess}
                  </Alert>
                )}
                
                <Form onSubmit={handlePasswordChange}>
                  <Form.Group className="mb-3" controlId="formCurrentPassword">
                    <Form.Label className="fw-medium text-neutral-700">Current Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter your current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="py-2"
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3" controlId="formNewPassword">
                    <Form.Label className="fw-medium text-neutral-700">New Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="py-2"
                    />
                    <Form.Text className="text-muted">
                      Password must be at least 6 characters long.
                    </Form.Text>
                  </Form.Group>
                  
                  <Form.Group className="mb-4" controlId="formConfirmPassword">
                    <Form.Label className="fw-medium text-neutral-700">Confirm New Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="py-2"
                    />
                  </Form.Group>
                  
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isChangingPassword}
                    className="py-2"
                  >
                    {isChangingPassword ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                        Changing Password...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default ProfileSettingsPage; 