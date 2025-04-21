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
import LinkButton from './LinkButton';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove the token
    localStorage.removeItem('admin_token');
    // Redirect to login page
    navigate('/login', { replace: true });
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="admin-layout d-flex flex-column min-vh-100">
      <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect className="mb-4 shadow-sm py-2">
        <Container>
          <Navbar.Brand className="fw-bolder text-decoration-none" onClick={() => navigate('dashboard')} style={{ cursor: 'pointer' }}>
            <FaStore className="me-2 text-primary" size={22} />
            <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>Hybrid</span>Store Admin
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as="div" className="p-0">
                <Link to="dashboard" className="px-3 py-2 d-flex align-items-center gap-2 nav-link">
                  <FiHome size={16} /> Dashboard
                </Link>
              </Nav.Link>
              <Nav.Link as="div" className="p-0">
                <Link to="statistics" className="px-3 py-2 d-flex align-items-center gap-2 nav-link">
                  <FiBarChart2 size={16} /> Statistics
                </Link>
              </Nav.Link>
              <Nav.Link as="div" className="p-0">
                <Link to="phones" className="px-3 py-2 d-flex align-items-center gap-2 nav-link">
                  <FiSmartphone size={16} /> Phones
                </Link>
              </Nav.Link>
              <Nav.Link as="div" className="p-0">
                <Link to="orders" className="px-3 py-2 d-flex align-items-center gap-2 nav-link">
                  <FiShoppingCart size={16} /> Orders
                </Link>
              </Nav.Link>
              <Nav.Link as="div" className="p-0">
                <Link to="products" className="px-3 py-2 d-flex align-items-center gap-2 nav-link">
                  <FiBox size={16} /> Products
                </Link>
              </Nav.Link>
              <Nav.Link as="div" className="p-0">
                <Link to="categories" className="px-3 py-2 d-flex align-items-center gap-2 nav-link">
                  <FiTag size={16} /> Categories
                </Link>
              </Nav.Link>
              <Nav.Link as="div" className="p-0">
                <Link to="zones" className="px-3 py-2 d-flex align-items-center gap-2 nav-link">
                  <FiMap size={16} /> Zones
                </Link>
              </Nav.Link>
              <Nav.Link as="div" className="p-0">
                <Link to="users" className="px-3 py-2 d-flex align-items-center gap-2 nav-link">
                  <FiUsers size={16} /> Users
                </Link>
              </Nav.Link>
            </Nav>
            <div className="d-flex gap-2">
              <LinkButton
                variant="secondary"
                size="sm"
                to="profile"
                className="px-3 d-flex align-items-center gap-2"
              >
                <FiUser size={16} /> Profile
              </LinkButton>
              <Button 
                variant="danger" 
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