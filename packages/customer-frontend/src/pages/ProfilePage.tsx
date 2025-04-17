import { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import { Container, Card, Alert, Spinner, Form, Button, InputGroup, ListGroup, Badge, Modal, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUserEdit, FaPlus, FaEdit, FaTrash, FaList, FaHeart, FaMapMarkerAlt, FaLock, FaUser, FaChevronRight } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface UserProfile {
  id: number;
  email: string;
  name?: string | null;
  createdAt?: string;
}

interface Address {
  id: number;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  userId: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [formName, setFormName] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  
  // Address management state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  
  // Address form state
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
  });
  
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
        setFormName(response.data.name || '');
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

  // Fetch addresses
  useEffect(() => {
    if (isAuthLoading || !isAuthenticated || !token) {
      return;
    }

    const fetchAddresses = async () => {
      setIsLoadingAddresses(true);
      setAddressError(null);

      try {
        const response = await axios.get(`${API_BASE_URL}/addresses`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setAddresses(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          setAddressError(err.response.data.message || 'Failed to fetch addresses.');
          console.error('Error fetching addresses:', err.response.data);
        } else {
          setAddressError('Network error. Please check your connection.');
          console.error('Network error:', err);
        }
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [token, isAuthenticated, isAuthLoading]);

  const handleEditToggle = () => {
    if (isEditing) {
      // If canceling edit, reset form values to current profile values
      if (profile) {
        setFormName(profile.name || '');
      }
      setEditError(null);
    }
    setIsEditing(!isEditing);
  };

  const handleProfileUpdate = async (event: FormEvent) => {
    event.preventDefault();
    setIsSavingEdit(true);
    setEditError(null);

    if (!token) {
      setEditError("You're not logged in. Please login and try again.");
      setIsSavingEdit(false);
      return;
    }

    // Only include fields that changed
    const updateData: { name?: string } = {};
    if (profile?.name !== formName) {
      updateData.name = formName;
    }

    // If nothing to update, show message and return
    if (Object.keys(updateData).length === 0) {
      setEditError("No changes to save.");
      setIsSavingEdit(false);
      return;
    }

    try {
      const response = await axios.put(
        `${API_BASE_URL}/users/me`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update profile with the response data
      setProfile(response.data);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setEditError(err.response.data.message || 'Failed to update profile.');
        console.error('Error updating profile:', err.response.data);
        toast.error("Failed to update profile");
      } else {
        setEditError('Network error. Please check your connection.');
        console.error('Network error:', err);
        toast.error("Network error");
      }
    } finally {
      setIsSavingEdit(false);
    }
  };

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

  // Address Modal handlers
  const handleShowAddressModal = (address: Address | null = null) => {
    setEditingAddress(address);
    
    if (address) {
      // Edit mode - populate form with address data
      setAddressForm({
        fullName: address.fullName,
        phone: address.phone,
        address: address.address,
        city: address.city,
        zipCode: address.zipCode,
        country: address.country,
      });
    } else {
      // Add mode - reset form
      setAddressForm({
        fullName: '',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
        country: '',
      });
    }
    
    setShowAddressModal(true);
  };

  const handleCloseAddressModal = () => {
    setShowAddressModal(false);
    setEditingAddress(null);
  };

  const handleAddressFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddressForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveAddress = async (event: FormEvent) => {
    event.preventDefault();
    setIsSavingAddress(true);
    
    if (!token) {
      toast.error("You're not logged in. Please login and try again.");
      setIsSavingAddress(false);
      return;
    }
    
    try {
      if (editingAddress) {
        // Update existing address
        await axios.put(
          `${API_BASE_URL}/addresses/${editingAddress.id}`,
          addressForm,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        toast.success("Address updated successfully!");
      } else {
        // Create new address
        await axios.post(
          `${API_BASE_URL}/addresses`,
          addressForm,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        toast.success("Address added successfully!");
      }
      
      // Refresh address list
      const response = await axios.get(`${API_BASE_URL}/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setAddresses(response.data);
      
      // Close modal
      handleCloseAddressModal();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to save address.');
        console.error('Error saving address:', err.response.data);
      } else {
        toast.error('Network error. Please check your connection.');
        console.error('Network error:', err);
      }
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId: number) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }
    
    if (!token) {
      toast.error("You're not logged in. Please login and try again.");
      return;
    }
    
    try {
      await axios.delete(`${API_BASE_URL}/addresses/${addressId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update addresses state by removing the deleted address
      setAddresses(addresses.filter(addr => addr.id !== addressId));
      toast.success("Address deleted successfully!");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to delete address.');
        console.error('Error deleting address:', err.response.data);
      } else {
        toast.error('Network error. Please check your connection.');
        console.error('Network error:', err);
      }
    }
  };

  const handleSetDefaultAddress = async (addressId: number) => {
    if (!token) {
      toast.error("You're not logged in. Please login and try again.");
      return;
    }
    
    try {
      await axios.put(
        `${API_BASE_URL}/addresses/${addressId}/default`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update addresses state to reflect new default
      setAddresses(addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      })));
      
      toast.success("Default address updated!");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to update default address.');
        console.error('Error updating default address:', err.response.data);
      } else {
        toast.error('Network error. Please check your connection.');
        console.error('Network error:', err);
      }
    }
  };

  return (
    <Container className="py-3">
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
          {/* Profile Header Section */}
          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h2 className="mb-1">{profile.name || 'Your Profile'}</h2>
                  <p className="text-muted mb-0">{profile.email}</p>
                  <small className="text-muted d-block mt-1">Member since: {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}</small>
                </div>
                {!isEditing && (
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={handleEditToggle}
                  >
                    <FaUserEdit className="me-1" /> Edit Profile
                  </Button>
                )}
              </div>
              
              {isEditing && (
                <Form onSubmit={handleProfileUpdate}>
                  {editError && (
                    <Alert variant="danger" className="mb-3">
                      {editError}
                    </Alert>
                  )}
                  
                  <Form.Group className="mb-3" controlId="formName">
                    <Form.Label>Name</Form.Label>
                    <InputGroup>
                      <Form.Control 
                        type="text" 
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Enter your name"
                      />
                    </InputGroup>
                  </Form.Group>
                  
                  <div className="d-flex gap-2">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isSavingEdit}
                    >
                      {isSavingEdit ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Saving...
                        </>
                      ) : 'Save Changes'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={handleEditToggle}
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
          
          {/* Action/Navigation List */}
          <Card className="mb-4 profile-action-card">
            <Card.Body className="p-0">
              <div className="px-3 pt-3">
                <Card.Title className="mb-3">Account Management</Card.Title>
              </div>
              <ListGroup variant="flush" className="profile-action-list">
                <ListGroup.Item action as={Link} to="/orders" className="d-flex justify-content-between align-items-center">
                  <div>
                    <FaList className="me-3 action-icon" /> My Orders
                  </div>
                  <FaChevronRight size={14} className="text-muted" />
                </ListGroup.Item>
                <ListGroup.Item action as={Link} to="/wishlist" className="d-flex justify-content-between align-items-center">
                  <div>
                    <FaHeart className="me-3 action-icon" /> My Wishlist
                  </div>
                  <FaChevronRight size={14} className="text-muted" />
                </ListGroup.Item>
                <ListGroup.Item action onClick={() => handleShowAddressModal()} className="d-flex justify-content-between align-items-center">
                  <div>
                    <FaMapMarkerAlt className="me-3 action-icon" /> Shipping Addresses
                  </div>
                  <FaChevronRight size={14} className="text-muted" />
                </ListGroup.Item>
                <ListGroup.Item action href="#password-section" className="d-flex justify-content-between align-items-center">
                  <div>
                    <FaLock className="me-3 action-icon" /> Change Password
                  </div>
                  <FaChevronRight size={14} className="text-muted" />
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
          
          {/* Address Management Section */}
          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Card.Title id="addresses-section">My Shipping Addresses</Card.Title>
              </div>
              
              {addressError && (
                <Alert variant="danger" className="mb-3">
                  {addressError}
                </Alert>
              )}
              
              {isLoadingAddresses ? (
                <div className="text-center my-3">
                  <Spinner animation="border" size="sm" role="status">
                    <span className="visually-hidden">Loading addresses...</span>
                  </Spinner>
                </div>
              ) : addresses.length === 0 ? (
                <Alert variant="info">
                  You don't have any saved addresses yet. Click "Shipping Addresses" above to add one and make checkout faster.
                </Alert>
              ) : (
                <div className="address-list">
                  {addresses.map(address => (
                    <Card key={address.id} className="mb-3 address-card">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h6 className="mb-0">{address.fullName}</h6>
                            <p className="text-muted mb-0">{address.phone}</p>
                          </div>
                          {address.isDefault && (
                            <Badge bg="success">Default</Badge>
                          )}
                        </div>
                        
                        <p className="mb-1">
                          {address.address}<br />
                          {address.city}, {address.zipCode}<br />
                          {address.country}
                        </p>
                        
                        <div className="mt-3 d-flex gap-2">
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => handleShowAddressModal(address)}
                          >
                            <FaEdit className="me-1" /> Edit
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeleteAddress(address.id)}
                          >
                            <FaTrash className="me-1" /> Delete
                          </Button>
                          {!address.isDefault && (
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              onClick={() => handleSetDefaultAddress(address.id)}
                            >
                              Set as Default
                            </Button>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
          
          {/* Change Password Section */}
          <Card className="mb-4" id="password-section">
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

          {/* Address Modal */}
          <Modal show={showAddressModal} onHide={handleCloseAddressModal}>
            <Modal.Header closeButton>
              <Modal.Title>{editingAddress ? 'Edit Address' : 'Add New Address'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleSaveAddress}>
                <Row>
                  <Col xs={12} className="mb-3">
                    <Form.Group controlId="addressFullName">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="fullName"
                        value={addressForm.fullName}
                        onChange={handleAddressFormChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col xs={12} className="mb-3">
                    <Form.Group controlId="addressPhone">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={addressForm.phone}
                        onChange={handleAddressFormChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col xs={12} className="mb-3">
                    <Form.Group controlId="addressLine">
                      <Form.Label>Address</Form.Label>
                      <Form.Control
                        type="text"
                        name="address"
                        value={addressForm.address}
                        onChange={handleAddressFormChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col sm={6} className="mb-3">
                    <Form.Group controlId="addressCity">
                      <Form.Label>City</Form.Label>
                      <Form.Control
                        type="text"
                        name="city"
                        value={addressForm.city}
                        onChange={handleAddressFormChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col sm={6} className="mb-3">
                    <Form.Group controlId="addressZip">
                      <Form.Label>ZIP Code</Form.Label>
                      <Form.Control
                        type="text"
                        name="zipCode"
                        value={addressForm.zipCode}
                        onChange={handleAddressFormChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col xs={12} className="mb-3">
                    <Form.Group controlId="addressCountry">
                      <Form.Label>Country</Form.Label>
                      <Form.Control
                        type="text"
                        name="country"
                        value={addressForm.country}
                        onChange={handleAddressFormChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseAddressModal}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSaveAddress}
                disabled={isSavingAddress}
              >
                {isSavingAddress ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Saving...
                  </>
                ) : (editingAddress ? 'Update Address' : 'Add Address')}
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </Container>
  );
};

export default ProfilePage; 