import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
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
import { FaExclamationTriangle } from 'react-icons/fa';
import { FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../utils/api';

interface UserProfile {
  id: number;
  email: string;
  name?: string | null;
  createdAt?: string;
}

interface DeliveryLocation {
  id: number;
  name: string;
  phone: string;
  district: string;
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
  
  // Delivery location management state
  const [deliveryLocations, setDeliveryLocations] = useState<DeliveryLocation[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<DeliveryLocation | null>(null);
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  
  // Districts state
  const [districts, setDistricts] = useState<string[]>([]);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [districtError, setDistrictError] = useState<string | null>(null);
  
  // Profile edit modal state
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  
  // Location form state
  const [locationForm, setLocationForm] = useState({
    name: '',
    phone: '',
    district: ''
  });
  
  // Tab state
  const [activeTab, setActiveTab] = useState('account');
  
  // Add form validation errors state
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [modalError, setModalError] = useState<string | null>(null);
  
  // Add state for tracking operations in progress
  const [isSettingDefault, setIsSettingDefault] = useState<number | null>(null);
  const [isDeletingLocation, setIsDeletingLocation] = useState<number | null>(null);
  
  // Add these state variables if they don't exist already (they seem to be defined around line 50)
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
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

  // Fetch delivery locations
  useEffect(() => {
    if (isAuthLoading || !isAuthenticated || !token) {
      return;
    }

    fetchLocations();
  }, [token, isAuthenticated, isAuthLoading]);

  // Fetch districts
  useEffect(() => {
    if (isAuthLoading || !isAuthenticated || !token) {
      return;
    }

    fetchDistricts();
  }, [token, isAuthenticated, isAuthLoading]);

  // Extracted function to fetch delivery locations (for reuse with the "Try Again" button)
  const fetchLocations = async () => {
    setIsLoadingLocations(true);
    setLocationError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setDeliveryLocations(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setLocationError(err.response.data.message || 'Failed to fetch delivery locations.');
        console.error('Error fetching delivery locations:', err.response.data);
      } else {
        setLocationError('Network error. Please check your connection.');
        console.error('Network error:', err);
      }
    } finally {
      setIsLoadingLocations(false);
    }
  };

  // Function to fetch districts
  const fetchDistricts = async () => {
    setIsLoadingDistricts(true);
    setDistrictError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/districts`);
      setDistricts(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setDistrictError(err.response.data.message || 'Failed to fetch districts.');
        console.error('Error fetching districts:', err.response.data);
      } else {
        setDistrictError('Network error. Please check your connection.');
        console.error('Network error:', err);
      }
    } finally {
      setIsLoadingDistricts(false);
    }
  };

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
  
  // Location Modal Handlers
  const handleShowLocationModal = () => {
    setEditingLocation(null);
    // Initialize district with first available district or empty string
    const initialDistrict = districts.length > 0 ? districts[0] : '';
    setLocationForm({
      name: '',
      phone: '',
      district: initialDistrict,
    });
    // Clear any previous errors
    setFormErrors({});
    setModalError(null);
    setShowLocationModal(true);
  };
  
  const handleCloseLocationModal = () => {
    setShowLocationModal(false);
    setEditingLocation(null);
    setFormErrors({});
    setModalError(null);
  };
  
  const handleEditLocation = (location: DeliveryLocation) => {
    setEditingLocation(location);
    setLocationForm({
      name: location.name,
      phone: location.phone,
      district: location.district,
    });
    // Clear any previous errors
    setFormErrors({});
    setModalError(null);
    setShowLocationModal(true);
  };
  
  const handleLocationFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLocationForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSaveLocation = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast.error("You're not logged in. Please login and try again.");
      return;
    }
    
    // Basic validation
    const errors: {[key: string]: string} = {};
    if (!locationForm.name.trim()) errors.name = "Location name is required";
    if (!locationForm.phone.trim()) errors.phone = "Phone number is required";
    if (!locationForm.district.trim()) errors.district = "District is required";
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSavingLocation(true);
    setModalError(null);
    
    try {
      let response;
      
      if (editingLocation) {
        // Update existing location
        response = await axios.put(
          `${API_BASE_URL}/addresses/${editingLocation.id}`,
          locationForm,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        toast.success("Delivery location updated successfully!");
      } else {
        // Create new location
        response = await axios.post(
          `${API_BASE_URL}/addresses`,
          locationForm,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        toast.success("Delivery location added successfully!");
      }
      
      // Refresh locations
      const locationsResponse = await axios.get(`${API_BASE_URL}/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setDeliveryLocations(locationsResponse.data);
      setShowLocationModal(false);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        // Check if the error response contains field-specific validation errors
        if (err.response.data.errors && typeof err.response.data.errors === 'object') {
          setFormErrors(err.response.data.errors);
        } else {
          setModalError(err.response.data.message || 'Failed to save delivery location.');
        }
        console.error('Error saving delivery location:', err.response.data);
      } else {
        setModalError('Network error. Please check your connection.');
        console.error('Network error:', err);
      }
    } finally {
      setIsSavingLocation(false);
    }
  };
  
  const handleDeleteLocation = async (locationId: number) => {
    if (!window.confirm('Are you sure you want to delete this delivery location?')) {
      return;
    }
    
    if (!token) {
      toast.error("You're not logged in. Please login and try again.");
      return;
    }
    
    setIsDeletingLocation(locationId);
    
    try {
      await axios.delete(`${API_BASE_URL}/addresses/${locationId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Remove from state
      setDeliveryLocations((prevLocations) => 
        prevLocations.filter((loc) => loc.id !== locationId)
      );
      
      toast.success("Delivery location deleted successfully!");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to delete delivery location.');
        console.error('Error deleting delivery location:', err.response.data);
      } else {
        toast.error('Network error. Please check your connection.');
        console.error('Network error:', err);
      }
    } finally {
      setIsDeletingLocation(null);
    }
  };
  
  const handleSetDefaultLocation = async (locationId: number) => {
    if (!token) {
      toast.error("You're not logged in. Please login and try again.");
      return;
    }
    
    setIsSettingDefault(locationId);
    
    try {
      await axios.post(
        `${API_BASE_URL}/addresses/${locationId}/set-default`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Update local state
      setDeliveryLocations((prevLocations) => 
        prevLocations.map((loc) => ({
          ...loc,
          isDefault: loc.id === locationId
        }))
      );
      
      toast.success("Default delivery location updated successfully!");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to update default delivery location.');
        console.error('Error updating default delivery location:', err.response.data);
      } else {
        toast.error('Network error. Please check your connection.');
        console.error('Network error:', err);
      }
    } finally {
      setIsSettingDefault(null);
    }
  };

  // Add this function near the other handler functions (around line 205)
  const handleShowPasswordModal = () => {
    // Reset form state
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setUpdateError(null);
    setUpdateSuccess(null);
    setShowPasswordModal(true);
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
  };

  // Update the handlePasswordChange function to use the api utility
  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setIsUpdatingPassword(true);
    setUpdateError(null);
    setUpdateSuccess(null);
    
    // Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setUpdateError('All fields are required');
      setIsUpdatingPassword(false);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setUpdateError('New passwords do not match');
      setIsUpdatingPassword(false);
      return;
    }
    
    if (newPassword.length < 6) {
      setUpdateError('New password must be at least 6 characters long');
      setIsUpdatingPassword(false);
      return;
    }
    
    try {
      // Use the api utility instead of axios directly
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword
      });
      
      setUpdateSuccess('Password updated successfully');
      toast.success('Password has been changed');
      
      // Clear form fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401 && err.response.data.message === 'Incorrect current password.') {
          setUpdateError('Current password is incorrect');
        } else {
          setUpdateError(err.response.data.message || 'Failed to update password');
        }
        console.error('Error changing password:', err.response.data);
      } else {
        setUpdateError('Network error. Please check your connection.');
        console.error('Network error:', err);
      }
    } finally {
      setIsUpdatingPassword(false);
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
                <Nav.Link eventKey="security" className="py-3">
                  <FaShieldAlt className="me-2" size={18} /> Security
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
                  <h4 className="mb-0 fs-5 fw-semibold">My Delivery Locations</h4>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={handleShowLocationModal}
                    className="d-flex align-items-center rounded-pill px-3 py-2"
                    disabled={isLoadingLocations}
                  >
                    <FaPlus className="me-2" /> Add New Location
                  </Button>
                </div>
                
                {isLoadingLocations ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" role="status" variant="primary">
                      <span className="visually-hidden">Loading delivery locations...</span>
                    </Spinner>
                    <p className="mt-3 text-muted">Loading your delivery locations...</p>
                  </div>
                ) : locationError ? (
                  <Alert variant="danger" className="shadow-sm">
                    <div className="d-flex align-items-center">
                      <FaExclamationTriangle className="text-danger me-2" size={20} />
                      <div>
                        <p className="mb-1 fw-semibold">Error loading delivery locations</p>
                        <p className="mb-0 small">{locationError}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={() => fetchLocations()}
                        className="rounded-pill px-3"
                      >
                        Try Again
                      </Button>
                    </div>
                  </Alert>
                ) : deliveryLocations.length === 0 ? (
                  <div className="address-empty-state shadow-sm">
                    <div className="address-empty-state-icon">
                      <FaMapMarkerAlt />
                    </div>
                    <p className="address-empty-state-text">
                      You don't have any saved delivery locations yet. Add your first location to make checkout faster.
                    </p>
                    <Button 
                      variant="primary" 
                      onClick={handleShowLocationModal}
                      className="rounded-pill px-4"
                    >
                      <FaPlus className="me-2" /> Add Your First Location
                    </Button>
                  </div>
                ) : (
                  <ListGroup className="address-list shadow-sm">
                    {deliveryLocations.map((location) => (
                      <ListGroup.Item key={location.id} className="d-flex flex-column p-3">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="address-info">
                            <div className="fw-semibold">{location.name}</div>
                            <div>{location.phone}</div>
                            <div>{location.district}</div>
                          </div>
                          {location.isDefault && (
                            <Badge bg="success" pill className="default-badge">Default</Badge>
                          )}
                        </div>
                        <div className="d-flex justify-content-end mt-2 address-actions">
                          {!location.isDefault && (
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              onClick={() => handleSetDefaultLocation(location.id)}
                              disabled={isSettingDefault !== null || isDeletingLocation !== null}
                              className="address-action-btn rounded-pill px-3"
                            >
                              {isSettingDefault === location.id ? (
                                <>
                                  <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-1"
                                  />
                                  <span className="visually-hidden">Setting as default...</span>
                                </>
                              ) : 'Set as Default'}
                            </Button>
                          )}
                          <Button 
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEditLocation(location)}
                            disabled={isDeletingLocation !== null || isSettingDefault !== null}
                            className="address-action-btn rounded-pill px-3"
                          >
                            <FaEdit className="me-1" /> Edit
                          </Button>
                          <Button 
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteLocation(location.id)}
                            disabled={isDeletingLocation !== null || isSettingDefault !== null}
                            className="address-action-btn rounded-pill px-3"
                          >
                            {isDeletingLocation === location.id ? (
                              <>
                                <Spinner
                                  as="span"
                                  animation="border"
                                  size="sm"
                                  role="status"
                                  aria-hidden="true"
                                  className="me-1"
                                />
                                <span className="visually-hidden">Deleting...</span>
                              </>
                            ) : (
                              <>
                                <FaTrash className="me-1" /> Delete
                              </>
                            )}
                          </Button>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Tab.Pane>
              
              {/* Security Tab */}
              <Tab.Pane eventKey="security" className="p-4">
                <h4 className="mb-4 fs-5 fw-semibold">Change Your Password</h4>
                
                {updateError && (
                  <Alert variant="danger" className="mb-4">
                    {updateError}
                  </Alert>
                )}
                
                {updateSuccess && (
                  <Alert variant="success" className="mb-4">
                    {updateSuccess}
                  </Alert>
                )}
                
                <Form onSubmit={handlePasswordChange}>
                  <Row>
                    <Col md={8} lg={6}>
                      <Form.Group className="mb-3" controlId="formCurrentPassword">
                        <Form.Label className="fw-medium">Current Password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Enter your current password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                        />
                      </Form.Group>
                      
                      <Form.Group className="mb-3" controlId="formNewPassword">
                        <Form.Label className="fw-medium">New Password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                        <Form.Text className="text-muted">
                          Password must be at least 6 characters long.
                        </Form.Text>
                      </Form.Group>
                      
                      <Form.Group className="mb-4" controlId="formConfirmPassword">
                        <Form.Label className="fw-medium">Confirm New Password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </Form.Group>
                      
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={isUpdatingPassword}
                        className="fw-medium py-2 rounded-pill px-4"
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
                        ) : (
                          'Update Password'
                        )}
                      </Button>
                    </Col>
                  </Row>
                </Form>
                
                <hr className="my-4" />
                
                <div className="mt-4">
                  <h5 className="mb-3 fs-6 fw-semibold">Password Security Tips</h5>
                  <ul className="text-muted">
                    <li>Use a combination of letters, numbers, and special characters</li>
                    <li>Avoid using easily guessable information like birthdays</li>
                    <li>Use different passwords for different accounts</li>
                    <li>Change your password periodically for enhanced security</li>
                  </ul>
                </div>
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
      
      {/* Location Modal */}
      <Modal show={showLocationModal} onHide={handleCloseLocationModal} centered>
        <Modal.Header closeButton className="border-bottom">
          <Modal.Title className="fw-semibold">{editingLocation ? 'Edit Delivery Location' : 'Add New Delivery Location'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {modalError && (
            <Alert variant="danger" className="mb-3">
              {modalError}
            </Alert>
          )}
          
          <Form onSubmit={handleSaveLocation} noValidate>
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label className="fw-medium">Location Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Home, Work, etc."
                    name="name"
                    value={locationForm.name}
                    onChange={handleLocationFormChange}
                    required
                    isInvalid={!!formErrors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.name}
                  </Form.Control.Feedback>
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
                    value={locationForm.phone}
                    onChange={handleLocationFormChange}
                    required
                    isInvalid={!!formErrors.phone}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.phone}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-4">
              <Col>
                <Form.Group>
                  <Form.Label className="fw-medium">District</Form.Label>
                  <Form.Select
                    name="district"
                    value={locationForm.district}
                    onChange={handleLocationFormChange}
                    required
                    isInvalid={!!formErrors.district}
                  >
                    <option value="" disabled>-- Select District --</option>
                    {districts.map((district) => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {formErrors.district}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <div className="d-grid">
              <Button 
                variant="primary" 
                type="submit" 
                disabled={isSavingLocation}
                className="rounded-pill py-2 fw-medium"
              >
                {isSavingLocation ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Saving...
                  </>
                ) : (editingLocation ? 'Update Location' : 'Add Location')}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      
      {/* Password Change Modal */}
      <Modal show={showPasswordModal} onHide={handleClosePasswordModal} centered>
        <Modal.Header closeButton className="border-bottom">
          <Modal.Title className="fw-semibold">Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handlePasswordChange}>
            {updateError && (
              <Alert variant="danger" className="mb-3">
                {updateError}
              </Alert>
            )}
            {updateSuccess && (
              <Alert variant="success" className="mb-3">
                {updateSuccess}
              </Alert>
            )}
            
            <Form.Group className="mb-3" controlId="formCurrentPassword">
              <Form.Label className="fw-medium">Current Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="formNewPassword">
              <Form.Label className="fw-medium">New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <Form.Text className="text-muted">
                Password must be at least 6 characters long.
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-4" controlId="formConfirmPassword">
              <Form.Label className="fw-medium">Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Form.Group>
            
            <div className="d-grid">
              <Button 
                variant="primary" 
                type="submit"
                disabled={isUpdatingPassword}
                className="fw-medium py-2 rounded-pill"
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
                ) : (
                  'Update Password'
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default SettingsPage; 