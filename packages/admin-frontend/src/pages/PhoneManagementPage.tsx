import React, { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import { Container, Table, Button, Alert, Spinner, Badge, Form, Modal, InputGroup, Row, Col, Pagination } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { FaSearch, FaTimes, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

interface PhoneNumber {
  id: number;
  numberString: string;
  status: 'Available' | 'Busy' | 'Offline';
}

interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

const PhoneManagementPage = () => {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  
  // Sorting state
  const [sortBy, setSortBy] = useState<string>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Filtering state
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
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
      // Call API to add phone number
      await api.post(
        '/admin/phonenumbers', 
        { numberString: newPhoneNumber }
      );
      
      // Success handling
      toast.success('Phone number added successfully');
      fetchPhoneNumbers(currentPage); // Refresh list
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

  const fetchPhoneNumbers = async (
    page = 1, 
    newSearch = search,
    newSortBy = sortBy,
    newSortOrder = sortOrder,
    newStatusFilter = statusFilter
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Build query params for pagination, search, status filter, and sorting
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', itemsPerPage.toString());
      
      // Add search filter if provided
      if (newSearch) {
        params.append('search', newSearch);
      }
      
      // Add status filter if provided
      if (newStatusFilter) {
        params.append('status', newStatusFilter);
      }
      
      // Add sorting parameters
      params.append('sortBy', newSortBy);
      params.append('sortOrder', newSortOrder);
      
      const response = await api.get(`/admin/phonenumbers?${params.toString()}`);

      // Handle paginated response format
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // New paginated response format
        const paginatedResponse = response.data as PaginatedResponse<PhoneNumber>;
        setPhoneNumbers(paginatedResponse.data);
        setCurrentPage(paginatedResponse.meta.currentPage);
        setTotalPages(paginatedResponse.meta.totalPages);
        setTotalItems(paginatedResponse.meta.totalItems);
        setItemsPerPage(paginatedResponse.meta.itemsPerPage);
      } else if (Array.isArray(response.data)) {
        // Legacy format (direct array)
      setPhoneNumbers(response.data);
        setCurrentPage(1);
        setTotalPages(1);
        setTotalItems(response.data.length);
      } else {
        throw new Error('Unexpected response format from API');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          // Handle unauthorized error specifically
          console.error('Authentication error:', err.response.data);
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
      // Set phoneNumbers to empty array to prevent map error
      setPhoneNumbers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchPhoneNumbers(page);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setCurrentPage(1);
    fetchPhoneNumbers(1, searchInput);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchInput('');
    setSearch('');
    setCurrentPage(1);
    fetchPhoneNumbers(1, '');
  };

  // Handle status filter
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
    fetchPhoneNumbers(1, search, sortBy, sortOrder, status);
  };

  // Handle column sorting
  const handleSort = (column: string) => {
    let newSortOrder: 'asc' | 'desc';
    if (sortBy === column) {
      // If clicking the same column, toggle sort order
      newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      setSortOrder(newSortOrder);
    } else {
      // If clicking a different column, set it as sort column with default asc order
      setSortBy(column);
      newSortOrder = 'asc';
      setSortOrder(newSortOrder);
    }
    fetchPhoneNumbers(currentPage, search, column, newSortOrder, statusFilter);
  };

  // Render sort icon for column header
  const renderSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <FaSort className="ms-1 text-muted" />;
    }
    return sortOrder === 'asc' ? <FaSortUp className="ms-1" /> : <FaSortDown className="ms-1" />;
  };

  // Debounce search input to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        setSearch(searchInput);
        setCurrentPage(1);
        fetchPhoneNumbers(1, searchInput);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch phone numbers on initial load and when filters/sort change
  useEffect(() => {
    fetchPhoneNumbers(1, search, sortBy, sortOrder, statusFilter);
  }, []); // Empty dependency array for initial load only

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

      // Refresh the phone numbers list for current page
      fetchPhoneNumbers(currentPage, search, sortBy, sortOrder, statusFilter);
      toast.success(`Phone number status updated to ${nextStatus}`);
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
          toast.error('Failed to update phone status');
        } else {
          // Network errors
          setError('Network error. Please check your connection and try again.');
          console.error('Network error:', err);
          toast.error('Network error');
        }
      } else {
        // Other unexpected errors
        setError('An unexpected error occurred. Please try again later.');
        console.error('Error updating phone status:', err);
        toast.error('An unexpected error occurred');
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

  // Function to manually refresh and redirect to login
  const handleManualRefresh = () => {
    localStorage.removeItem('admin_token');
    navigate('/login', { replace: true });
  };

  // Render pagination component
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="d-flex justify-content-center mt-4">
        <Pagination>
          <Pagination.First 
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          />
          <Pagination.Prev 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          />
          
          {/* First page */}
          <Pagination.Item
            active={currentPage === 1}
            onClick={() => handlePageChange(1)}
          >
            1
          </Pagination.Item>
          
          {/* Ellipsis if not showing first few pages */}
          {currentPage > 3 && <Pagination.Ellipsis disabled />}
          
          {/* Pages around current page */}
          {Array.from({ length: totalPages })
            .map((_, index) => index + 1)
            .filter(page => page !== 1 && page !== totalPages) // Exclude first and last pages which are always shown
            .filter(page => page >= currentPage - 1 && page <= currentPage + 1) // Show only pages around current page
            .map(page => (
              <Pagination.Item
                key={page}
                active={currentPage === page}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Pagination.Item>
            ))}
          
          {/* Ellipsis if not showing last few pages */}
          {currentPage < totalPages - 2 && <Pagination.Ellipsis disabled />}
          
          {/* Last page if more than one page */}
          {totalPages > 1 && (
            <Pagination.Item
              active={currentPage === totalPages}
              onClick={() => handlePageChange(totalPages)}
            >
              {totalPages}
            </Pagination.Item>
          )}
          
          <Pagination.Next
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
          <Pagination.Last
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      </div>
    );
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
              <Button variant="outline-secondary" size="sm" onClick={() => fetchPhoneNumbers(currentPage)} className="me-2">
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
          
          {/* Search and filter row */}
          <Row className="mb-3">
            <Col md={6}>
              <Form onSubmit={handleSearch}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search phone numbers..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                  {searchInput && (
                    <Button 
                      variant="outline-secondary" 
                      onClick={handleClearSearch}
                      title="Clear search"
                    >
                      <FaTimes />
                    </Button>
                  )}
                  <Button type="submit" variant="outline-primary">
                    <FaSearch />
                  </Button>
                </InputGroup>
              </Form>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Select 
                  value={statusFilter} 
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                  aria-label="Filter by status"
                  className="py-2"
                >
                  <option value="">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="Busy">Busy</option>
                  <option value="Offline">Offline</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <div className="d-flex justify-content-between align-items-center mb-2">
            {totalItems > 0 && (
              <div className="text-muted">
                Showing {phoneNumbers.length} of {totalItems} phone numbers
              </div>
            )}
            <div className="text-muted small">
              {statusFilter && <span className="me-2">Status: <Badge bg="info">{statusFilter}</Badge></span>}
              {search && <span>Search: <Badge bg="info">{search}</Badge></span>}
            </div>
          </div>
          
          <Table striped bordered hover responsive size="sm" className="shadow-sm">
            <thead>
              <tr>
                <th 
                  style={{ cursor: 'pointer', width: '70px' }} 
                  onClick={() => handleSort('id')}
                  className="user-select-none"
                >
                  <div className="d-flex align-items-center">
                    ID {renderSortIcon('id')}
                  </div>
                </th>
                <th 
                  style={{ cursor: 'pointer' }} 
                  onClick={() => handleSort('numberString')}
                  className="user-select-none"
                >
                  <div className="d-flex align-items-center">
                    Number {renderSortIcon('numberString')}
                  </div>
                </th>
                <th 
                  style={{ cursor: 'pointer', width: '120px' }} 
                  onClick={() => handleSort('status')}
                  className="user-select-none"
                >
                  <div className="d-flex align-items-center">
                    Status {renderSortIcon('status')}
                  </div>
                </th>
                <th style={{ width: '150px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {phoneNumbers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4">
                    {search || statusFilter 
                      ? "No phone numbers match your search criteria."
                      : "No phone numbers found."}
                  </td>
                </tr>
              ) : (
                phoneNumbers.map((phone) => (
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
          
          {/* Pagination controls */}
          {renderPagination()}
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
            <Form.Group className="mb-3" controlId="newPhoneNumber">
              <Form.Label className="fw-medium text-neutral-700">Phone Number</Form.Label>
              <InputGroup>
                <Form.Control
                  type="tel"
                  placeholder="e.g., 555-123-4567"
                  value={newPhoneNumber}
                  onChange={(e) => setNewPhoneNumber(e.target.value)}
                  required
                  className="py-2"
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
            <Button variant="primary" type="submit" disabled={isAdding} className="py-2">
              {isAdding ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
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