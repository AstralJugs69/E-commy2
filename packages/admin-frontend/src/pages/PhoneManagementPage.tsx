import React, { useState, useEffect, FormEvent } from 'react';
import { Container, Table, Button, Alert, Spinner, Badge, Form, Modal, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api'; // Use the centralized API instance

interface PhoneNumber {
  id: number;
  numberString: string;
  status: 'Available' | 'Busy' | 'Offline';
}

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
    
    try {
      // Call API to add phone number using the centralized api instance
      await api.post('/admin/phonenumbers', { numberString: newPhoneNumber });
      
      // Success handling
      toast.success('Phone number added successfully');
      fetchPhoneNumbers(); // Refresh list
      handleCloseAddModal(); // Close modal
    } catch (err: any) {
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
    } finally {
      setIsAdding(false);
    }
  };

  const fetchPhoneNumbers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get('/admin/phonenumbers');
      // Ensure we always have an array, even if the API returns null/undefined
      setPhoneNumbers(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
        if (err.response?.status === 401) {
          // Handle unauthorized error specifically
        console.error('Authentication error:', err.response?.data);
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
      // Initialize with empty array to prevent mapping errors
      setPhoneNumbers([]);
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

    setError(null);

    try {
      await api.post(`/admin/phonenumbers/${id}/status`, { status: nextStatus });
      // Refresh the phone numbers list
      fetchPhoneNumbers();
    } catch (err: any) {
        if (err.response?.status === 401) {
          // Handle unauthorized error specifically
        console.error('Authentication error:', err.response?.data);
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
    }
  };

  // Helper function to determine next status text
  const getNextStatusText = (currentStatus: PhoneNumber['status']): string => {
    if (currentStatus === 'Available') return 'Busy';
    if (currentStatus === 'Busy') return 'Offline';
    return 'Available';
  };

  // Helper function to get badge variant based on status
  const getStatusBadgeVariant = (status: PhoneNumber['status']): string => {
    if (status === 'Available') return 'success';
    if (status === 'Busy') return 'warning';
    return 'secondary';
  };

  const handleManualRefresh = () => {
    fetchPhoneNumbers();
    toast.success('Phone numbers refreshed');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this phone number?')) {
      return;
    }

    setError(null);

    try {
      await api.delete(`/admin/phonenumbers/${id}`);
      toast.success('Phone number deleted successfully');
      fetchPhoneNumbers(); // Refresh list
    } catch (err: any) {
      if (err.response?.status === 401) {
        // Handle unauthorized error specifically
        console.error('Authentication error:', err.response?.data);
        handleAuthError();
      } else if (err.response) {
        // Other API errors
        setError(err.response.data.message || 'Failed to delete phone number');
        toast.error('Failed to delete phone number');
        console.error('Error deleting phone number:', err.response.data);
      } else {
        // Network errors
        toast.error('Network error');
        setError('Network error. Please check your connection and try again.');
        console.error('Network error:', err);
      }
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Phone Number Management</h1>
        <div>
          <Button 
            variant="outline-primary" 
            className="me-2"
            onClick={handleManualRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-1"
                />
                Refreshing...
              </>
            ) : 'Refresh'}
          </Button>
          <Button 
            variant="primary" 
            onClick={handleShowAddModal}
          >
            Add Phone Number
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {isLoading && !phoneNumbers.length ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Loading phone numbers...</p>
        </div>
      ) : phoneNumbers.length === 0 ? (
        <Alert variant="info">
          No phone numbers found. Add one to get started.
        </Alert>
      ) : (
        <Table striped bordered hover responsive>
            <thead>
              <tr>
              <th>ID</th>
              <th>Phone Number</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
            {phoneNumbers && phoneNumbers.map((phone) => (
                  <tr key={phone.id}>
                <td>{phone.id}</td>
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
                    className="me-2"
                        onClick={() => handleStatusToggle(phone.id, phone.status)}
                      >
                        Set to {getNextStatusText(phone.status)}
                      </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(phone.id)}
                  >
                    Delete
                  </Button>
                    </td>
                  </tr>
            ))}
            </tbody>
          </Table>
      )}
      
      {/* Add Phone Modal */}
      <Modal show={showAddModal} onHide={handleCloseAddModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Phone Number</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddPhoneNumber}>
          <Modal.Body>
            {addError && (
              <Alert variant="danger" className="mb-3">
                {addError}
              </Alert>
            )}
            <Form.Group controlId="phoneNumber">
              <Form.Label>Phone Number</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Enter phone number (e.g., +1234567890)"
                  value={newPhoneNumber}
                  onChange={(e) => setNewPhoneNumber(e.target.value)}
                  required
                />
              </InputGroup>
              <Form.Text className="text-muted">
                Enter a valid phone number with country code (e.g., +1234567890)
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseAddModal}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={isAdding}
            >
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
              ) : 'Add Phone Number'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default PhoneManagementPage; 