import React, { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import { Container, Card, Alert, Spinner, Form, Button, InputGroup, ListGroup, Badge, Modal, Row, Col, Nav, Tab } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUserEdit } from 'react-icons/fa';
import { FaPlus } from 'react-icons/fa';
import { FaEdit } from 'react-icons/fa';
import { FaTrash } from 'react-icons/fa';
import { FaList } from 'react-icons/fa';
import { FaHeart } from 'react-icons/fa';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { FaLock } from 'react-icons/fa';
import { FaUser } from 'react-icons/fa';
import { FaChevronRight } from 'react-icons/fa';
import { FaInfoCircle } from 'react-icons/fa';
import { FaCog } from 'react-icons/fa';
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

const SettingsPage = () => {
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
  
  // Profile edit modal state
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  
  // Address form state
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
  });
  
  // Tab state
  const [activeTab, setActiveTab] = useState('account');
  
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

  // Handler to toggle edit profile modal
  const handleEditToggle = () => {
    setShowEditProfileModal(true);
  };

  // Handler to close edit profile modal
  const handleCloseEditModal = () => {
    setShowEditProfileModal(false);
    // Reset form values if canceling
    if (profile) {
      setFormName(profile.name || '');
    }
    setEditError(null);
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
      setShowEditProfileModal(false);
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
  
  // Address Modal Handlers
  const handleShowAddressModal = () => {
    setEditingAddress(null);
    setAddressForm({
      fullName: '',
      phone: '',
      address: '',
      city: '',
      zipCode: '',
      country: '',
    });
    setShowAddressModal(true);
  };
  
  const handleCloseAddressModal = () => {
    setShowAddressModal(false);
    setEditingAddress(null);
  };
  
  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressForm({
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      city: address.city,
      zipCode: address.zipCode,
      country: address.country,
    });
    setShowAddressModal(true);
  };
  
  const handleAddressFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSaveAddress = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast.error("You're not logged in. Please login and try again.");
      return;
    }
    
    setIsSavingAddress(true);
    
    try {
      let response;
      
      if (editingAddress) {
        // Update existing address
        response = await axios.put(
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
        response = await axios.post(
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
      
      // Refresh addresses
      const addressesResponse = await axios.get(`${API_BASE_URL}/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setAddresses(addressesResponse.data);
      setShowAddressModal(false);
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
      
      // Remove from state
      setAddresses((prevAddresses) => 
        prevAddresses.filter((addr) => addr.id !== addressId)
      );
      
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
      // Use the standard address update endpoint and include isDefault in the payload
      await axios.put(
        `${API_BASE_URL}/addresses/${addressId}`,
        { isDefault: true },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Update local state
      setAddresses((prevAddresses) => 
        prevAddresses.map((addr) => ({
          ...addr,
          isDefault: addr.id === addressId
        }))
      );
      
      toast.success("Default address updated successfully!");
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

  if (isLoading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading your profile information...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger" className="shadow-sm">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4 fw-semibold">Settings</h2>
      
      <Tab.Container id="settings-tabs" defaultActiveKey="account">
        <Card className="settings-card shadow-sm mb-4 border-0">
          <Card.Header className="bg-white">
            <Nav variant="tabs" className="nav-fill">
              <Nav.Item>
                <Nav.Link eventKey="account" className="py-3">
                  <FaUser className="me-2" size={18} /> Account
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="shipping" className="py-3">
                  <FaMapMarkerAlt className="me-2" size={18} /> Shipping
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="preferences" className="py-3">
                  <FaCog className="me-2" size={18} /> Preferences
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
          <Card.Body className="p-0">
            <Tab.Content>
              {/* Account Tab */}
              <Tab.Pane eventKey="account">
                <ListGroup variant="flush" className="profile-action-list">
                  <div 
                    onClick={handleEditToggle} 
                    className="d-flex justify-content-between align-items-center list-group-item"
                  >
                    <div className="d-flex align-items-center">
                      <FaUserEdit className="text-secondary me-3" size={20} />
                      <span className="fw-medium">Edit Profile</span>
                    </div>
                    <FaChevronRight className="text-muted" />
                  </div>
                  
                  <Link to="#" 
                    className="d-flex justify-content-between align-items-center list-group-item"
                  >
                    <div className="d-flex align-items-center">
                      <FaLock className="text-secondary me-3" size={20} />
                      <span className="fw-medium">Change Password</span>
                    </div>
                    <FaChevronRight className="text-muted" />
                  </Link>
                  
                  <Link to="/orders" 
                    className="d-flex justify-content-between align-items-center list-group-item"
                  >
                    <div className="d-flex align-items-center">
                      <FaList className="text-secondary me-3" size={20} />
                      <span className="fw-medium">My Orders</span>
                    </div>
                    <FaChevronRight className="text-muted" />
                  </Link>
                  
                  <Link to="/wishlist" 
                    className="d-flex justify-content-between align-items-center list-group-item"
                  >
                    <div className="d-flex align-items-center">
                      <FaHeart className="text-secondary me-3" size={20} />
                      <span className="fw-medium">My Wishlist</span>
                    </div>
                    <FaChevronRight className="text-muted" />
                  </Link>
                </ListGroup>
              </Tab.Pane>
              
              {/* Shipping Tab */}
              <Tab.Pane eventKey="shipping" className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="mb-0 fs-5 fw-semibold">My Shipping Addresses</h4>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={handleShowAddressModal}
                    className="d-flex align-items-center rounded-pill px-3 py-2"
                  >
                    <FaPlus className="me-2" /> Add New Address
                  </Button>
                </div>
                
                {isLoadingAddresses ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" size="sm" role="status" variant="primary">
                      <span className="visually-hidden">Loading addresses...</span>
                    </Spinner>
                    <p className="mb-0 mt-3">Loading your addresses...</p>
                  </div>
                ) : addressError ? (
                  <Alert variant="danger" className="shadow-sm">
                    {addressError}
                  </Alert>
                ) : addresses.length === 0 ? (
                  <Alert variant="info" className="shadow-sm">
                    You don't have any saved addresses yet. Add your first address to make checkout faster.
                  </Alert>
                ) : (
                  <ListGroup className="address-list shadow-sm">
                    {addresses.map((address) => (
                      <ListGroup.Item key={address.id} className="d-flex flex-column p-3">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="address-info">
                            <div className="fw-semibold">{address.fullName}</div>
                            <div>{address.phone}</div>
                            <div>{address.address}</div>
                            <div>{address.city}, {address.zipCode}</div>
                            <div>{address.country}</div>
                          </div>
                          {address.isDefault && (
                            <Badge bg="success" pill className="default-badge">Default</Badge>
                          )}
                        </div>
                        <div className="d-flex justify-content-end mt-2 address-actions">
                          {!address.isDefault && (
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              onClick={() => handleSetDefaultAddress(address.id)}
                              className="me-2 address-action-btn rounded-pill px-3"
                            >
                              Set as Default
                            </Button>
                          )}
                          <Button 
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEditAddress(address)}
                            className="me-2 address-action-btn rounded-pill px-3"
                          >
                            <FaEdit className="me-1" /> Edit
                          </Button>
                          <Button 
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteAddress(address.id)}
                            className="address-action-btn rounded-pill px-3"
                          >
                            <FaTrash className="me-1" /> Delete
                          </Button>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Tab.Pane>
              
              {/* Preferences Tab */}
              <Tab.Pane eventKey="preferences">
                <ListGroup variant="flush" className="profile-action-list">
                  <Link to="/about" 
                    className="d-flex justify-content-between align-items-center list-group-item"
                  >
                    <div className="d-flex align-items-center">
                      <FaInfoCircle className="text-secondary me-3" size={20} />
                      <span className="fw-medium">About HybridStore</span>
                    </div>
                    <FaChevronRight className="text-muted" />
                  </Link>
                  
                  {/* Add more preference options here as needed */}
                </ListGroup>
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
        </Card>
      </Tab.Container>
      
      {/* Edit Profile Modal */}
      <Modal show={showEditProfileModal} onHide={handleCloseEditModal} centered>
        <Modal.Header closeButton className="border-bottom">
          <Modal.Title className="fw-semibold">Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleProfileUpdate}>
            {editError && (
              <Alert variant="danger" className="mb-4">
                {editError}
              </Alert>
            )}
            
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">Email</Form.Label>
              <Form.Control 
                type="email" 
                value={profile?.email || ''} 
                disabled 
                className="bg-light"
              />
              <Form.Text className="text-muted">
                Email cannot be changed.
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label className="fw-medium">Full Name</Form.Label>
              <Form.Control 
                type="text" 
                value={formName} 
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Enter your name"
                className="auth-input"
              />
            </Form.Group>
            
            <div className="d-grid">
              <Button 
                variant="primary" 
                type="submit" 
                disabled={isSavingEdit}
                className="rounded-pill py-2 fw-medium"
              >
                {isSavingEdit ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Saving...
                  </>
                ) : 'Save Changes'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      
      {/* Address Modal */}
      <Modal show={showAddressModal} onHide={handleCloseAddressModal} centered>
        <Modal.Header closeButton className="border-bottom">
          <Modal.Title className="fw-semibold">{editingAddress ? 'Edit Address' : 'Add New Address'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleSaveAddress}>
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label className="fw-medium">Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Full name"
                    name="fullName"
                    value={addressForm.fullName}
                    onChange={handleAddressFormChange}
                    required
                    className="auth-input"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label className="fw-medium">Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Phone number"
                    name="phone"
                    value={addressForm.phone}
                    onChange={handleAddressFormChange}
                    required
                    className="auth-input"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label className="fw-medium">Address</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Street address"
                    name="address"
                    value={addressForm.address}
                    onChange={handleAddressFormChange}
                    required
                    className="auth-input"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col xs={12} sm={6} className="mb-3 mb-sm-0">
                <Form.Group>
                  <Form.Label className="fw-medium">City</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="City"
                    name="city"
                    value={addressForm.city}
                    onChange={handleAddressFormChange}
                    required
                    className="auth-input"
                  />
                </Form.Group>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Group>
                  <Form.Label className="fw-medium">Postal Code</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Postal code"
                    name="zipCode"
                    value={addressForm.zipCode}
                    onChange={handleAddressFormChange}
                    required
                    className="auth-input"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-4">
              <Col>
                <Form.Group>
                  <Form.Label className="fw-medium">Country</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Country"
                    name="country"
                    value={addressForm.country}
                    onChange={handleAddressFormChange}
                    required
                    className="auth-input"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <div className="d-grid">
              <Button 
                variant="primary" 
                type="submit" 
                disabled={isSavingAddress}
                className="rounded-pill py-2 fw-medium"
              >
                {isSavingAddress ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Saving...
                  </>
                ) : (editingAddress ? 'Update Address' : 'Add Address')}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default SettingsPage; 