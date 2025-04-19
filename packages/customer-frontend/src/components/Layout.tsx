import React, { useContext, useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Navbar, Nav, Offcanvas, Badge, Row, Col, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { toast } from 'react-hot-toast';
import { FaShoppingCart } from 'react-icons/fa';
import { FaUser } from 'react-icons/fa';
import { FaList } from 'react-icons/fa';
import { FaSignOutAlt } from 'react-icons/fa';
import { FaHome } from 'react-icons/fa';
import { FaRegHeart } from 'react-icons/fa';
import { FaStore } from 'react-icons/fa';
import { FaHeart } from 'react-icons/fa';
import { FaCog } from 'react-icons/fa';

const Layout = () => {
  const { isAuthenticated, logout } = useAuth();
  const { getItemCount } = useCart();
  const { wishlistItems } = useWishlist();
  const itemCount = getItemCount();
  const wishlistCount = wishlistItems.length;
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleCloseOffcanvas = () => setShowOffcanvas(false);
  const handleShowOffcanvas = () => setShowOffcanvas(true);

  const handleLogout = () => {
    logout();
    setShowOffcanvas(false);
    navigate('/');
    toast.success('Logged out successfully');
  };

  return (
    <div className="app-wrapper d-flex flex-column min-vh-100">
      <Navbar bg="white" variant="light" expand={false} fixed="top" className="shadow-sm py-3 border-bottom">
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bolder text-decoration-none transition-hover">
            <FaStore className="me-2 text-primary" size={24} />
            <span style={{ color: 'var(--primary)' }}>Hybrid</span>Store
          </Navbar.Brand>
          
          <div className="d-flex align-items-center">
            {isAuthenticated && (
              <Link to="/wishlist" className="position-relative me-3 d-flex align-items-center text-decoration-none d-none d-lg-flex">
                <div className="nav-icon-container p-2 rounded-circle">
                  <FaHeart size={20} className="text-secondary" />
                  {wishlistCount > 0 && (
                    <Badge pill bg="primary" className="position-absolute top-0 start-100 translate-middle badge-sm">
                      {wishlistCount}
                    </Badge>
                  )}
                </div>
              </Link>
            )}
            <Link to="/cart" className="position-relative me-3 d-flex align-items-center text-decoration-none d-none d-lg-flex">
              <div className="nav-icon-container p-2 rounded-circle">
                <FaShoppingCart size={20} className="text-secondary" />
                {itemCount > 0 && (
                  <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle badge-sm">
                    {itemCount}
                  </Badge>
                )}
              </div>
            </Link>
            <Navbar.Toggle 
              aria-controls="offcanvasNavbar-expand-false" 
              onClick={handleShowOffcanvas}
              className="border-0 p-2"
            />
          </div>
          
          <Navbar.Offcanvas
            id="offcanvasNavbar-expand-false"
            aria-labelledby="offcanvasNavbarLabel-expand-false"
            placement="end"
            show={showOffcanvas}
            onHide={handleCloseOffcanvas}
            className="offcanvas-menu"
          >
            <Offcanvas.Header closeButton className="border-bottom py-3">
              <Offcanvas.Title id="offcanvasNavbarLabel-expand-false" className="fw-bold d-flex align-items-center">
                <FaStore className="me-2 text-primary" size={22} />
                Menu
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="p-0">
              <Nav className="justify-content-end flex-grow-1">
                <Nav.Link as={Link} to="/" onClick={handleCloseOffcanvas} className="py-3 border-bottom d-flex align-items-center px-3">
                  <FaHome className="me-2 text-primary" /> Home
                </Nav.Link>
                <Nav.Link as={Link} to="/cart" onClick={handleCloseOffcanvas} className="py-3 border-bottom d-flex align-items-center position-relative px-3">
                  <FaShoppingCart className="me-2 text-primary" /> Cart 
                  {itemCount > 0 && <Badge pill bg="danger" className="ms-2">{itemCount}</Badge>}
                </Nav.Link>
                
                {isAuthenticated ? (
                  <>
                    <Nav.Link as={Link} to="/wishlist" onClick={handleCloseOffcanvas} className="py-3 border-bottom d-flex align-items-center position-relative px-3">
                      <FaHeart className="me-2 text-primary" /> My Wishlist
                      {wishlistCount > 0 && <Badge pill bg="primary" className="ms-2">{wishlistCount}</Badge>}
                    </Nav.Link>
                    <Nav.Link as={Link} to="/settings" onClick={handleCloseOffcanvas} className="py-3 border-bottom d-flex align-items-center px-3">
                      <FaCog className="me-2 text-primary" /> Settings
                    </Nav.Link>
                    <Nav.Link as={Link} to="/orders" onClick={handleCloseOffcanvas} className="py-3 border-bottom d-flex align-items-center px-3">
                      <FaList className="me-2 text-primary" /> My Orders
                    </Nav.Link>
                    <Button variant="link" onClick={handleLogout} className="py-3 border-bottom d-flex align-items-center w-100 text-danger text-decoration-none px-3">
                      <FaSignOutAlt className="me-2" /> Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Nav.Link as={Link} to="/login" onClick={handleCloseOffcanvas} className="py-3 border-bottom d-flex align-items-center px-3">
                      <FaUser className="me-2 text-primary" /> Login / Register
                    </Nav.Link>
                  </>
                )}
                <Nav.Link as={Link} to="/about" onClick={handleCloseOffcanvas} className="py-3 border-bottom d-flex align-items-center px-3">
                  <FaStore className="me-2 text-primary" /> About Us
                </Nav.Link>
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
      
      <main className="flex-grow-1 pt-5 mt-4 pb-5 pb-lg-0">
        <Outlet />
      </main>
      
      {/* Bottom Navigation Bar - Mobile Only */}
      <div className="d-lg-none">
        <Navbar fixed="bottom" bg="white" className="shadow-sm border-top">
          <Container>
            <Nav className="w-100 justify-content-around">
              <Nav.Link 
                as={Link} 
                to="/" 
                className="d-flex flex-column align-items-center text-center py-2"
                style={{ color: location.pathname === '/' ? 'var(--primary)' : 'var(--text-muted)' }}
              >
                <FaHome 
                  size={20} 
                  className="mb-1"
                  style={{ color: location.pathname === '/' ? 'var(--primary)' : 'var(--text-muted)' }} 
                />
                <small style={{ fontSize: '0.7rem' }}>Home</small>
              </Nav.Link>
              
              <Nav.Link 
                as={Link} 
                to="/cart" 
                className="d-flex flex-column align-items-center text-center py-2 position-relative"
                style={{ color: location.pathname === '/cart' ? 'var(--primary)' : 'var(--text-muted)' }}
              >
                <div className="position-relative">
                  <FaShoppingCart 
                    size={20} 
                    className="mb-1"
                    style={{ color: location.pathname === '/cart' ? 'var(--primary)' : 'var(--text-muted)' }} 
                  />
                  {itemCount > 0 && (
                    <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle p-1" style={{ fontSize: '0.6rem' }}>
                      {itemCount}
                    </Badge>
                  )}
                </div>
                <small style={{ fontSize: '0.7rem' }}>Cart</small>
              </Nav.Link>
              
              <Nav.Link 
                as={Link} 
                to="/orders" 
                className="d-flex flex-column align-items-center text-center py-2"
                style={{ color: location.pathname === '/orders' ? 'var(--primary)' : 'var(--text-muted)' }}
              >
                <FaList 
                  size={20} 
                  className="mb-1"
                  style={{ color: location.pathname === '/orders' ? 'var(--primary)' : 'var(--text-muted)' }} 
                />
                <small style={{ fontSize: '0.7rem' }}>Orders</small>
              </Nav.Link>
              
              <Nav.Link 
                as={Link} 
                to="/settings" 
                className="d-flex flex-column align-items-center text-center py-2"
                style={{ color: location.pathname === '/settings' ? 'var(--primary)' : 'var(--text-muted)' }}
              >
                <FaCog 
                  size={20} 
                  className="mb-1" 
                  style={{ color: location.pathname === '/settings' ? 'var(--primary)' : 'var(--text-muted)' }} 
                />
                <small style={{ fontSize: '0.7rem' }}>Settings</small>
              </Nav.Link>
            </Nav>
          </Container>
        </Navbar>
      </div>
    </div>
  );
};

export default Layout; 