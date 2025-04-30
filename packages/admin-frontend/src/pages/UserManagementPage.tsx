import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Spinner, Alert, Pagination, Form, InputGroup, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { formatDateTime, formatCurrency } from '../utils/formatters';
import api from '../utils/api';
import axios from 'axios'; // Keep for error type checking
import { FaSort, FaSortUp, FaSortDown, FaSearch, FaTimes } from 'react-icons/fa';

// User interface with order count
interface AdminUser {
  id: number;
  email: string;
  createdAt: string;
  _count: {
    orders: number;
  };
  totalSpent: number;
}

const UserManagementPage: React.FC = () => {
  // User data state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  
  // Sorting state
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInputValue, setSearchInputValue] = useState('');

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Debounce search term changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInputValue !== searchTerm) {
        setSearchTerm(searchInputValue);
        fetchUsers(1, searchInputValue);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInputValue]);

  // Fetch users with pagination, sorting, and filtering
  const fetchUsers = async (
    page: number = currentPage, 
    search: string = searchTerm, 
    newSortBy: string = sortBy, 
    newSortOrder: 'asc' | 'desc' = sortOrder
  ) => {
      setIsLoading(true);
      setError(null);

      try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', itemsPerPage.toString());
      params.append('sortBy', newSortBy);
      params.append('sortOrder', newSortOrder);
      
      if (search.trim()) {
        params.append('search', search.trim());
      }

      const response = await api.get(`/admin/users?${params.toString()}`);

      // Handle the paginated response structure
      const { data, meta } = response.data;
      
      // Set users from the data array
      setUsers(data);
      
      // Update pagination state from metadata
      setCurrentPage(meta.currentPage);
      setTotalPages(meta.totalPages);
      setTotalItems(meta.totalItems);
      setItemsPerPage(meta.itemsPerPage);
      
      // Update sorting state
      if (newSortBy !== sortBy) setSortBy(newSortBy);
      if (newSortOrder !== sortOrder) setSortOrder(newSortOrder);
      
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response) {
          if (err.response.status === 401) {
            setError('Your session has expired. Please log in again.');
          } else {
            setError(err.response.data.message || 'Failed to fetch users.');
          }
          console.error('Error fetching users:', err.response.data);
        } else {
          setError('Network error. Please check your connection.');
          console.error('Network error:', err);
        }
      } finally {
        setIsLoading(false);
      }
    };

  // Handle sorting column click
  const handleSortColumn = (column: string) => {
    const newSortOrder = column === sortBy && sortOrder === 'desc' ? 'asc' : 'desc';
    fetchUsers(1, searchTerm, column, newSortOrder);
  };

  // Get sort icon for column header
  const getSortIcon = (column: string) => {
    if (column !== sortBy) return <FaSort className="ms-1 text-muted" size={12} />;
    return sortOrder === 'asc' ? <FaSortUp className="ms-1" size={14} /> : <FaSortDown className="ms-1" size={14} />;
  };

  // Create clickable column header
  const SortableColumnHeader = ({ column, label }: { column: string, label: string }) => (
    <div 
      className="d-flex align-items-center" 
      style={{ cursor: 'pointer' }} 
      onClick={() => handleSortColumn(column)}
    >
      {label}
      {getSortIcon(column)}
    </div>
  );

  // Handle search clear
  const handleClearSearch = () => {
    setSearchInputValue('');
    setSearchTerm('');
    fetchUsers(1, '');
  };

  // Render pagination items
  const renderPaginationItems = () => {
    const items = [];

    // Add First and Previous buttons
    items.push(
      <Pagination.First 
        key="first" 
        disabled={currentPage === 1} 
        onClick={() => fetchUsers(1)} 
      />
    );
    items.push(
      <Pagination.Prev 
        key="prev" 
        disabled={currentPage === 1} 
        onClick={() => fetchUsers(currentPage - 1)} 
      />
    );

    // Add page numbers with ellipsis for large ranges
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    // Adjust when near the end
    if (endPage - startPage < 4 && totalPages > 5) {
      startPage = Math.max(1, endPage - 4);
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      items.push(
        <Pagination.Item key={1} onClick={() => fetchUsers(1)}>
          1
        </Pagination.Item>
      );
      if (startPage > 2) {
        items.push(<Pagination.Ellipsis key="ellipsis1" />);
      }
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item 
          key={i} 
          active={i === currentPage} 
          onClick={() => fetchUsers(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    // Add last page and ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<Pagination.Ellipsis key="ellipsis2" />);
      }
      items.push(
        <Pagination.Item 
          key={totalPages} 
          onClick={() => fetchUsers(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }

    // Add Next and Last buttons
    items.push(
      <Pagination.Next 
        key="next" 
        disabled={currentPage === totalPages} 
        onClick={() => fetchUsers(currentPage + 1)} 
      />
    );
    items.push(
      <Pagination.Last 
        key="last" 
        disabled={currentPage === totalPages} 
        onClick={() => fetchUsers(totalPages)} 
      />
    );

    return items;
  };

  // Loading state
  if (isLoading && users.length === 0) {
    return (
      <Container className="py-4">
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading users...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">User Management</h2>

      {error && (
        <Alert variant="danger" className="my-3">
          {error}
        </Alert>
      )}

      {/* Search input */}
      <div className="mb-4">
        <InputGroup>
          <Form.Control
            placeholder="Search users by email..."
            value={searchInputValue}
            onChange={(e) => setSearchInputValue(e.target.value)}
          />
          <Button variant="outline-secondary" onClick={handleClearSearch}>
            <FaTimes />
          </Button>
          <Button variant="primary" onClick={() => fetchUsers(1, searchInputValue)}>
            <FaSearch />
          </Button>
        </InputGroup>
      </div>

      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">All Users</h5>
            </Card.Header>
            <Card.Body>
              {isLoading && (
                <div className="text-center py-3">
                  <Spinner animation="border" size="sm" className="me-2" />
                  <span>Loading...</span>
                </div>
              )}
              
              <Table responsive hover>
                <thead>
                  <tr>
                    <th><SortableColumnHeader column="id" label="ID" /></th>
                    <th><SortableColumnHeader column="email" label="Email" /></th>
                    <th><SortableColumnHeader column="createdAt" label="Registration Date" /></th>
                    <th className="text-center">Order Count</th>
                    <th className="text-end"><SortableColumnHeader column="totalSpent" label="Total Spent" /></th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map(user => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td><Link to={`/admin/users/${user.id}`}>{user.email}</Link></td>
                        <td>{formatDateTime(user.createdAt)}</td>
                        <td className="text-center">{user._count?.orders ?? 0}</td>
                        <td className="text-end">{formatCurrency(user.totalSpent ?? 0)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center">
                        {searchTerm ? 'No users match your search criteria.' : 'No users found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
              
              {/* Pagination controls */}
              {users.length > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <div className="text-muted">
                    Showing {users.length} of {totalItems} users
                    {searchTerm && <span> (filtered by "{searchTerm}")</span>}
                  </div>
                  <Pagination>{renderPaginationItems()}</Pagination>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserManagementPage;