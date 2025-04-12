import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove the token
    localStorage.removeItem('admin_token');
    // Redirect to login page
    navigate('/login', { replace: true });
  };

  return (
    <div className="admin-layout">
      <Navbar bg="primary" variant="dark" expand="lg" collapseOnSelect className="mb-4 shadow-md">
        <Container>
          <Navbar.Brand as={Link} to="/admin/dashboard">Admin Panel</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/admin/dashboard">Dashboard</Nav.Link>
              <Nav.Link as={Link} to="/admin/phones">Phones</Nav.Link>
              <Nav.Link as={Link} to="/admin/orders">Orders</Nav.Link>
              <Nav.Link as={Link} to="/admin/zones">Zones</Nav.Link>
            </Nav>
            <Button variant="danger" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      
      <Container className="p-4">
        <Outlet />
      </Container>
    </div>
  );
};

export default AdminLayout; 