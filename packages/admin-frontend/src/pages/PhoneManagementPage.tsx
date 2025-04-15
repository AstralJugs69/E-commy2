import React, { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import { Container, Table, Button, Alert, Spinner, Badge, Form, Modal, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface PhoneNumber {
  id: number;
  numberString: string;
  status: 'Available' | 'Busy' | 'Offline';
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const PhoneManagementPage = () => {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Add Phone Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  // Function to handle authentication errors
  const handleAuthError = () => {
    // Clear the invalid token
    localStorage.removeItem('admin_token');
    // Set error message
    setError('Your session has expired or is invalid. Please log in again.');
    // Add a button to redirect to login
    setTimeout(() => {
      navigate('/login');
    }, 3000); // Redirect after 3 seconds
  };

  // Modal handlers
  const handleShowAddModal = () => {
    setNewPhoneNumber('');
    setAddError(null);
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };

  const handleAddPhoneNumber = async (event: FormEvent) => {
    event.preventDefault();
    
    // Basic validation
    if (!newPhoneNumber.trim()) {
      setAddError('Phone number is required');
      return;
    }
    
    setIsAdding(true);
    setAddError(null);
    
    // Get token
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setAddError('Authentication token not found. Please log in again.');
      setIsAdding(false);
      handleAuthError();
      return;
    }

    // Ensure the token is properly formatted
    const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

    try {
      // Call API to add phone number
      await axios.post(
        `${API_BASE_URL}/admin/phonenumbers`, 
        { numberString: newPhoneNumber },
        {
          headers: {
            Authorization: formattedToken
          }
        }
      );
      
      // Success handling
      toast.success('Phone number added successfully');
      fetchPhoneNumbers(); // Refresh list
      handleCloseAddModal(); // Close modal
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          // Handle unauthorized error
          console.error('Authentication error:', err.response.data);
          handleAuthError();
          setAddError('Authentication failed. Please log in again.');
        } else if (err.response?.status === 409) {
          // Conflict - phone number already exists
          setAddError('This phone number already exists');
          toast.error('Phone number already exists');
        } else if (err.response?.status === 400) {
          // Validation error
          setAddError(err.response.data.message || 'Invalid phone number format');
          toast.error('Invalid phone number format');
        } else if (err.response) {
          // Other API errors
          setAddError(err.response.data.message || 'Failed to add phone number');
          toast.error('Failed to add phone number');
          console.error('Error adding phone number:', err.response.data);
        } else {
          // Network errors
          setAddError('Network error. Please check your connection and try again.');
          toast.error('Network error');
          console.error('Network error:', err);
        }
      } else {
        // Other unexpected errors
        setAddError('An unexpected error occurred. Please try again later.');
        toast.error('Unexpected error occurred');
        console.error('Error adding phone number:', err);
      }
    } finally {
      setIsAdding(false);
    }
  };

  const fetchPhoneNumbers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('admin_token');
      
      // Debug: Log the token to check its format
      console.log('Token used for API call:', token ? `${token.substring(0, 15)}...` : 'No token');
      
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        handleAuthError();
        return;
      }

      // Ensure the token is properly formatted - it may or may not include 'Bearer ' prefix
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      console.log('Making API request to:', `${API_BASE_URL}/admin/phonenumbers`);
      console.log('With Authorization header:', formattedToken.substring(0, 20) + '...');
      
      const response = await axios.get(`${API_BASE_URL}/admin/phonenumbers`, {
        headers: {
          Authorization: formattedToken
        }
      });

      console.log('API response:', response.data);
      setPhoneNumbers(response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          // Handle unauthorized error specifically
          console.error('Authentication error:', err.response.data);
          
          // Debug: For 401 errors, we want to see the full details
          console.error('Request details:', {
            url: err.config?.url,
            method: err.config?.method,
            headers: err.config?.headers,
            data: err.config?.data
          });
          
          handleAuthError();
        } else if (err.response) {
          // Other API errors
          setError(err.response.data.message || 'Failed to fetch phone numbers');
          console.error('Error fetching phone numbers:', err.response.data);
        } else {
          // Network errors
          setError('Network error. Please check your connection and try again.');
          console.error('Network error:', err);
        }
      } else {
        // Other unexpected errors
        setError('An unexpected error occurred. Please try again later.');
        console.error('Error fetching phone numbers:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPhoneNumbers();
  }, []);

  const handleStatusToggle = async (id: number, currentStatus: PhoneNumber['status']) => {
    // Determine next status in the cycle: Available -> Busy -> Offline -> Available
    let nextStatus: PhoneNumber['status'];
    if (currentStatus === 'Available') {
      nextStatus = 'Busy';
    } else if (currentStatus === 'Busy') {
      nextStatus = 'Offline';
    } else {
      nextStatus = 'Available';
    }

    const token = localStorage.getItem('admin_token');
    if (!token) {
      setError('Authentication token not found. Please log in again.');
      handleAuthError();
      return;
    }

    // Ensure the token is properly formatted
    const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

    setError(null);

    try {
      await axios.post(`${API_BASE_URL}/admin/phonenumbers/${id}/status`, 
        { status: nextStatus },
        {
          headers: {
            Authorization: formattedToken
          }
        }
      );

      // Refresh the phone numbers list
      fetchPhoneNumbers();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          // Handle unauthorized error specifically
          console.error('Authentication error:', err.response.data);
          handleAuthError();
        } else if (err.response) {
          // Other API errors
          setError(err.response.data.message || 'Failed to update phone status');
          console.error('Error updating phone status:', err.response.data);
        } else {
          // Network errors
          setError('Network error. Please check your connection and try again.');
          console.error('Network error:', err);
        }
      } else {
        // Other unexpected errors
        setError('An unexpected error occurred. Please try again later.');
        console.error('Error updating phone status:', err);
      }
    }
  };

  // Helper function to determine next status text
  const getNextStatusText = (currentStatus: PhoneNumber['status']): string => {
    if (currentStatus === 'Available') return 'Busy';
    if (currentStatus === 'Busy') return 'Offline';
    return 'Available';
  };

  // Helper function to get badge color based on status
  const getStatusBadgeVariant = (status: PhoneNumber['status']): string => {
    switch (status) {
      case 'Available': return 'success';
      case 'Busy': return 'warning';
      case 'Offline': return 'secondary';
      default: return 'light';
    }
  };

  // Function to manually refresh token and redirect to login
  const handleManualRefresh = () => {
    localStorage.removeItem('admin_token');
    navigate('/login', { replace: true });
  };

  return (
    <Container className="mt-3">
      <h2 className="mb-4">Phone Number Management</h2>
      
      {isLoading && (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}
      
      {error && (
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          <div className="d-flex justify-content-end">
            <Button 
              variant="outline-danger" 
              onClick={handleManualRefresh}
            >
              Go to Login
            </Button>
          </div>
        </Alert>
      )}
      
      {!isLoading && !error && (
        <>
          <div className="mb-3 d-flex justify-content-between align-items-center">
            <div>
              <Button variant="outline-secondary" size="sm" onClick={fetchPhoneNumbers} className="me-2">
                Refresh Data
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={handleShowAddModal}
              >
                Add New Phone Number
              </Button>
            </div>
            <Button variant="outline-primary" size="sm" onClick={handleManualRefresh}>
              Re-authenticate
            </Button>
          </div>
          
          <Table striped bordered hover responsive size="sm">
            <thead>
              <tr>
                <th>Number</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {phoneNumbers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center">No phone numbers found.</td>
                </tr>
              ) : (
                phoneNumbers.map((phone) => (
                  <tr key={phone.id}>
                    <td>{phone.numberString}</td>
                    <td>
                      <Badge bg={getStatusBadgeVariant(phone.status)}>
                        {phone.status}
                      </Badge>
                    </td>
                    <td>
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        onClick={() => handleStatusToggle(phone.id, phone.status)}
                      >
                        Set to {getNextStatusText(phone.status)}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </>
      )}
      
      {/* Add Phone Number Modal */}
      <Modal show={showAddModal} onHide={handleCloseAddModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Phone Number</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddPhoneNumber}>
          <Modal.Body>
            {addError && (
              <Alert variant="danger">
                {addError}
              </Alert>
            )}
            <Form.Group controlId="newPhoneNumber">
              <Form.Label>Phone Number</Form.Label>
              <InputGroup>
                <Form.Control
                  type="tel"
                  placeholder="e.g., 555-123-4567"
                  value={newPhoneNumber}
                  onChange={(e) => setNewPhoneNumber(e.target.value)}
                  required
                />
              </InputGroup>
              <Form.Text className="text-muted">
                Enter the phone number in a consistent format (e.g., +1 555-123-4567)
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseAddModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isAdding}>
              {isAdding ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-1"
                  />
                  Adding...
                </>
              ) : (
                'Add Number'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default PhoneManagementPage; 