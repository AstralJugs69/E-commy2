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
      <Navbar bg="white" variant="light" expand={false} fixed="top" className="shadow-sm py-2 border-bottom">
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bolder text-decoration-none">
            <FaStore className="me-2 text-primary" size={22} />
            <span style={{ color: 'var(--primary)' }}>Hybrid</span>Store
          </Navbar.Brand>
          
          <div className="d-flex align-items-center">
            {isAuthenticated && (
              <Link to="/wishlist" className="position-relative me-3 d-flex align-items-center text-decoration-none d-none d-lg-flex">
                <FaHeart size={20} className="text-secondary" />
                {wishlistCount > 0 && (
                  <Badge pill bg="primary" className="position-absolute top-0 start-100 translate-middle badge-sm">
                    {wishlistCount}
                  </Badge>
                )}
              </Link>
            )}
            <Link to="/cart" className="position-relative me-3 d-flex align-items-center text-decoration-none d-none d-lg-flex">
              <FaShoppingCart size={20} className="text-secondary" />
              {itemCount > 0 && (
                <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle badge-sm">
                  {itemCount}
                </Badge>
              )}
            </Link>
            <Navbar.Toggle 
              aria-controls="offcanvasNavbar-expand-false" 
              onClick={handleShowOffcanvas}
              className="border-0"
            />
          </div>
          
          <Navbar.Offcanvas
            id="offcanvasNavbar-expand-false"
            aria-labelledby="offcanvasNavbarLabel-expand-false"
            placement="end"
            show={showOffcanvas}
            onHide={handleCloseOffcanvas}
          >
            <Offcanvas.Header closeButton className="border-bottom">
              <Offcanvas.Title id="offcanvasNavbarLabel-expand-false" className="fw-bold d-flex align-items-center">
                <FaStore className="me-2 text-secondary" />
                Menu
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="justify-content-end flex-grow-1">
                <Nav.Link as={Link} to="/" onClick={handleCloseOffcanvas} className="py-3 border-bottom d-flex align-items-center d-none d-lg-flex">
                  <FaHome className="me-2 text-secondary" /> Home
                </Nav.Link>
                <Nav.Link as={Link} to="/cart" onClick={handleCloseOffcanvas} className="py-3 border-bottom d-flex align-items-center position-relative d-none d-lg-flex">
                  <FaShoppingCart className="me-2 text-secondary" /> Cart 
                  {itemCount > 0 && <Badge pill bg="danger" className="ms-2">{itemCount}</Badge>}
                </Nav.Link>
                
                {isAuthenticated ? (
                  <>
                    <Nav.Link as={Link} to="/wishlist" onClick={handleCloseOffcanvas} className="py-3 border-bottom d-flex align-items-center position-relative">
                      <FaHeart className="me-2 text-secondary" /> My Wishlist
                      {wishlistCount > 0 && <Badge pill bg="primary" className="ms-2">{wishlistCount}</Badge>}
                    </Nav.Link>
                    <Nav.Link as={Link} to="/settings" onClick={handleCloseOffcanvas} className="py-3 border-bottom d-flex align-items-center d-none d-lg-flex">
                      <FaCog className="me-2 text-secondary" /> Settings
                    </Nav.Link>
                    <Nav.Link as={Link} to="/orders" onClick={handleCloseOffcanvas} className="py-3 border-bottom d-flex align-items-center d-none d-lg-flex">
                      <FaList className="me-2 text-secondary" /> My Orders
                    </Nav.Link>
                    <Button variant="link" onClick={handleLogout} className="py-3 border-bottom d-flex align-items-center w-100 text-danger text-decoration-none">
                      <FaSignOutAlt className="me-2" /> Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Nav.Link as={Link} to="/login" onClick={handleCloseOffcanvas} className="py-3 border-bottom d-flex align-items-center">
                      <FaUser className="me-2 text-secondary" /> Login / Register
                    </Nav.Link>
                  </>
                )}
                <Nav.Link as={Link} to="/about" onClick={handleCloseOffcanvas} className="py-3 border-bottom d-flex align-items-center">
                  <FaStore className="me-2 text-secondary" /> About Us
                </Nav.Link>
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
      
      <main className="flex-grow-1 pt-5 mt-3 pb-5 pb-lg-0">
        <Outlet />
      </main>
      
      {/* Bottom Navigation Bar - Mobile Only */}
      <div className="d-lg-none">
        <Navbar fixed="bottom" bg="light" className="shadow-sm border-top">
          <Container>
            <Nav className="w-100 justify-content-around">
              <Nav.Link 
                as={Link} 
                to="/" 
                className="d-flex flex-column align-items-center text-center text-secondary py-1"
                style={{ color: location.pathname === '/' ? 'var(--primary)' : undefined }}
              >
                <FaHome 
                  size={18} 
                  style={{ color: location.pathname === '/' ? 'var(--primary)' : undefined }} 
                />
                <small style={{ color: location.pathname === '/' ? 'var(--primary)' : undefined }}>Home</small>
              </Nav.Link>
              
              <Nav.Link 
                as={Link} 
                to="/cart" 
                className="d-flex flex-column align-items-center text-center text-secondary py-1 position-relative"
                style={{ color: location.pathname === '/cart' ? 'var(--primary)' : undefined }}
              >
                <FaShoppingCart 
                  size={18} 
                  style={{ color: location.pathname === '/cart' ? 'var(--primary)' : undefined }} 
                />
                {itemCount > 0 && (
                  <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle badge-sm">
                    {itemCount}
                  </Badge>
                )}
                <small style={{ color: location.pathname === '/cart' ? 'var(--primary)' : undefined }}>Cart</small>
              </Nav.Link>
              
              <Nav.Link 
                as={Link} 
                to="/orders" 
                className="d-flex flex-column align-items-center text-center text-secondary py-1"
                style={{ color: location.pathname === '/orders' ? 'var(--primary)' : undefined }}
              >
                <FaList 
                  size={18} 
                  style={{ color: location.pathname === '/orders' ? 'var(--primary)' : undefined }} 
                />
                <small style={{ color: location.pathname === '/orders' ? 'var(--primary)' : undefined }}>Orders</small>
              </Nav.Link>
              
              <Nav.Link 
                as={Link} 
                to="/settings" 
                className="d-flex flex-column align-items-center text-center text-secondary py-1"
                style={{ color: location.pathname === '/settings' ? 'var(--primary)' : undefined }}
              >
                <FaCog 
                  size={18} 
                  style={{ color: location.pathname === '/settings' ? 'var(--primary)' : undefined }} 
                />
                <small style={{ color: location.pathname === '/settings' ? 'var(--primary)' : undefined }}>Settings</small>
              </Nav.Link>
            </Nav>
          </Container>
        </Navbar>
      </div>
    </div>
  );
};

export default Layout; 