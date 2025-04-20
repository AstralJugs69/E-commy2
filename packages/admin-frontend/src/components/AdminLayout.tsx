import React, { useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { FiHome } from 'react-icons/fi';
import { FiSmartphone } from 'react-icons/fi';
import { FiShoppingCart } from 'react-icons/fi';
import { FiBox } from 'react-icons/fi';
import { FiTag } from 'react-icons/fi';
import { FiMap } from 'react-icons/fi';
import { FiUsers } from 'react-icons/fi';
import { FiLogOut } from 'react-icons/fi';
import { FiBarChart2 } from 'react-icons/fi';
import { FiUser } from 'react-icons/fi';
import { FiSettings } from 'react-icons/fi';
import { FaStore } from 'react-icons/fa';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove the token
    localStorage.removeItem('admin_token');
    // Redirect to login page
    navigate('/login', { replace: true });
  };

  return (
    <div className="admin-layout d-flex flex-column min-vh-100">
      <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect className="mb-4 shadow-sm py-2">
        <Container>
          <Navbar.Brand as={Link} to="dashboard" className="fw-bolder text-decoration-none">
            <FaStore className="me-2 text-primary" size={22} />
            <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>Hybrid</span>Store Admin
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="dashboard" className="px-3 py-2 d-flex align-items-center gap-2">
                <FiHome size={16} /> Dashboard
              </Nav.Link>
              <Nav.Link as={Link} to="statistics" className="px-3 py-2 d-flex align-items-center gap-2">
                <FiBarChart2 size={16} /> Statistics
              </Nav.Link>
              <Nav.Link as={Link} to="phones" className="px-3 py-2 d-flex align-items-center gap-2">
                <FiSmartphone size={16} /> Phones
              </Nav.Link>
              <Nav.Link as={Link} to="orders" className="px-3 py-2 d-flex align-items-center gap-2">
                <FiShoppingCart size={16} /> Orders
              </Nav.Link>
              <Nav.Link as={Link} to="products" className="px-3 py-2 d-flex align-items-center gap-2">
                <FiBox size={16} /> Products
              </Nav.Link>
              <Nav.Link as={Link} to="categories" className="px-3 py-2 d-flex align-items-center gap-2">
                <FiTag size={16} /> Categories
              </Nav.Link>
              <Nav.Link as={Link} to="zones" className="px-3 py-2 d-flex align-items-center gap-2">
                <FiMap size={16} /> Zones
              </Nav.Link>
              <Nav.Link as={Link} to="users" className="px-3 py-2 d-flex align-items-center gap-2">
                <FiUsers size={16} /> Users
              </Nav.Link>
            </Nav>
            <div className="d-flex gap-2">
              <Button
                variant="outline-light"
                size="sm"
                as={Link}
                to="profile"
                className="px-3 d-flex align-items-center gap-2"
              >
                <FiUser size={16} /> Profile
              </Button>
              <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={handleLogout} 
                className="px-3 d-flex align-items-center gap-2"
              >
                <FiLogOut size={16} /> Logout
              </Button>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      
      <Container className="py-4 flex-grow-1">
        <Outlet />
      </Container>

      <footer className="py-3 bg-light border-top mt-auto">
        <Container className="text-center">
          <div className="d-flex align-items-center justify-content-center mb-2">
            <FaStore className="me-2 text-primary" size={18} />
            <span className="text-muted small fw-bold">
              <span style={{ color: 'var(--primary)' }}>Hybrid</span>Store Admin
            </span>
          </div>
          <p className="text-muted mb-0 small">
            &copy; {new Date().getFullYear()} All rights reserved.
          </p>
        </Container>
      </footer>
    </div>
  );
};

export default AdminLayout; 