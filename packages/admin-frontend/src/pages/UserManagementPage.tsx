import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { formatDateTime, formatCurrency } from '../utils/formatters';
import api from '../utils/api';
import axios from 'axios'; // Keep for error type checking

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
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get('/admin/users');

        setUsers(response.data);
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

    fetchUsers();
  }, []);

  if (isLoading) {
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

      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">All Users</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Registration Date</th>
                    <th className="text-center">Order Count</th>
                    <th className="text-end">Total Spent</th>
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
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserManagementPage;