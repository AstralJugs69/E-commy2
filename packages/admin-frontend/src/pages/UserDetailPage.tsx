import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, Row, Col, Table, Spinner, Alert, Badge, Button } from 'react-bootstrap';
import { formatDateTime, formatCurrency, getStatusBadgeVariant } from '../utils/formatters';

// Interfaces for the API response data
interface UserOrderDetail {
  id: number;
  status: string;
  totalAmount: number;
  createdAt: string;
}

interface AdminUserDetail {
  id: number;
  email: string;
  createdAt: string;
  orders: UserOrderDetail[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const UserDetailPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('admin_token');
        if (!token) {
          setError('Authentication required. Please log in again.');
          setIsLoading(false);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/admin/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUser(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          if (err.response.status === 401) {
            setError('Your session has expired. Please log in again.');
          } else if (err.response.status === 404) {
            setError(`User with ID ${userId} not found.`);
          } else {
            setError(err.response.data.message || 'Failed to fetch user details.');
          }
          console.error('Error fetching user details:', err.response.data);
        } else {
          setError('Network error. Please check your connection.');
          console.error('Network error:', err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  if (isLoading) {
    return (
      <Container className="py-4">
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading user details...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger" className="my-3">
          {error}
        </Alert>
        <div className="text-center">
          <Link to="/admin/users">
            <Button variant="secondary">
              Back to User List
            </Button>
          </Link>
        </div>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          No user data available.
        </Alert>
        <div className="text-center">
          <Link to="/admin/users">
            <Button variant="secondary">
              Back to User List
            </Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>User Details</h2>
        <Link to="/admin/users">
          <Button variant="outline-secondary">
            Back to User List
          </Button>
        </Link>
      </div>

      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">User Information</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p><strong>User ID:</strong> {user.id}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Registration Date:</strong> {formatDateTime(user.createdAt)}</p>
                  <p><strong>Total Orders:</strong> {user.orders.length}</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">User Order History</h5>
            </Card.Header>
            <Card.Body>
              {user.orders.length > 0 ? (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th className="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.orders.map(order => (
                      <tr key={order.id}>
                        <td>
                          <Link to={`/admin/orders/${order.id}`}>
                            #{order.id}
                          </Link>
                        </td>
                        <td>{formatDateTime(order.createdAt)}</td>
                        <td>
                          <Badge bg={getStatusBadgeVariant(order.status)}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="text-end">{formatCurrency(order.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center p-4">
                  <p className="text-muted mb-0">This user has not placed any orders yet.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserDetailPage; 