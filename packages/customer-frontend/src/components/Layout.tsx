import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, Offcanvas, Badge, Row, Col, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { toast } from 'react-hot-toast';
import { FaShoppingCart, FaUser, FaList, FaSignOutAlt, FaHome, FaRegHeart, FaStore, FaHeart } from 'react-icons/fa';

const Layout = () => {
  const { isAuthenticated, logout } = useAuth();
  const { getItemCount } = useCart();
  const { wishlistItems } = useWishlist();
  const itemCount = getItemCount();
  const wishlistCount = wishlistItems.length;
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const navigate = useNavigate();
  
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
      <Navbar bg="white" expand={false} fixed="top" className="shadow-sm py-2 border-bottom">
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bolder text-decoration-none">
            <FaStore className="me-2 text-primary" size={22} />
            <span style={{ color: 'var(--primary)' }}>Hybrid</span>Store
          </Navbar.Brand>
          
          <div className="d-flex align-items-center">
            {isAuthenticated && (
              <Link to="/wishlist" className="position-relative me-3 d-flex align-items-center text-decoration-none">
                <FaHeart size={20} className="text-danger" />
                {wishlistCount > 0 && (
                  <Badge pill bg="primary" className="position-absolute top-0 start-100 translate-middle badge-sm">
                    {wishlistCount}
                  </Badge>
                )}
              </Link>
            )}
            <Link to="/cart" className="position-relative me-3 d-flex align-items-center text-decoration-none">
              <FaShoppingCart size={20} className="text-primary" />
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
                <FaStore className="me-2 text-primary" />
                Menu
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="justify-content-end flex-grow-1">
                <Nav.Link as={Link} to="/" onClick={handleCloseOffcanvas} className="py-3 border-bottom d-flex align-items-center">
                  <FaHome className="me-2 text-primary" /> Home
                </Nav.Link>
                <Nav.Link as={Link} to="/cart" onClick={handleCloseOffcanvas} className="py-3 border-bottom d-flex align-items-center position-relative">
                  <FaShoppingCart className="me-2 text-primary" /> Cart 
                  {itemCount > 0 && <Badge pill bg="danger" className="ms-2">{itemCount}</Badge>}
                </Nav.Link>
                
                {isAuthenticated ? (
                  <>
                    <Nav.Link as={Link} to="/wishlist" onClick={handleCloseOffcanvas} className="py-3 border-bottom d-flex align-items-center position-relative">
                      <FaHeart className="me-2 text-danger" /> My Wishlist
                      {wishlistCount > 0 && <Badge pill bg="primary" className="ms-2">{wishlistCount}</Badge>}
                    </Nav.Link>
                    <Nav.Link as={Link} to="/profile" onClick={handleCloseOffcanvas} className="py-3 border-bottom d-flex align-items-center">
                      <FaUser className="me-2 text-primary" /> My Profile
                    </Nav.Link>
                    <Nav.Link as={Link} to="/orders" onClick={handleCloseOffcanvas} className="py-3 border-bottom d-flex align-items-center">
                      <FaList className="me-2 text-primary" /> My Orders
                    </Nav.Link>
                    <Nav.Link onClick={handleLogout} style={{ cursor: 'pointer' }} className="py-3 border-bottom d-flex align-items-center">
                      <FaSignOutAlt className="me-2 text-danger" /> Logout
                    </Nav.Link>
                  </>
                ) : (
                  <>
                    <Nav.Link as={Link} to="/login" onClick={handleCloseOffcanvas} className="py-3 border-bottom d-flex align-items-center">
                      <FaUser className="me-2 text-primary" /> Login / Register
                    </Nav.Link>
                  </>
                )}
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
      
      <main className="flex-grow-1 pt-5 mt-3">
        <Outlet />
      </main>
      
      <footer className="footer bg-dark text-white py-5 mt-5">
        <Container>
          <Row className="gy-4">
            <Col md={4} className="mb-4 mb-md-0">
              <div className="d-flex align-items-center mb-3">
                <FaStore className="me-2 text-primary" size={24} />
                <h5 className="fw-bold mb-0">
                  <span style={{ color: 'var(--primary)' }}>Hybrid</span>Store
                </h5>
              </div>
              <p className="text-light">Your one-stop destination for quality products with convenient pickup and delivery options.</p>
            </Col>
            <Col md={2} className="mb-4 mb-md-0 d-none d-md-block">
              <h6 className="fw-semibold mb-3">Shop</h6>
              <ul className="list-unstyled">
                <li className="mb-2"><Link to="/" className="text-decoration-none text-light">Products</Link></li>
                <li className="mb-2"><Link to="/cart" className="text-decoration-none text-light">Cart</Link></li>
              </ul>
            </Col>
            <Col md={2} className="mb-4 mb-md-0 d-none d-md-block">
              <h6 className="fw-semibold mb-3">Account</h6>
              <ul className="list-unstyled">
                <li className="mb-2"><Link to="/profile" className="text-decoration-none text-light">My Profile</Link></li>
                <li className="mb-2"><Link to="/orders" className="text-decoration-none text-light">Orders</Link></li>
              </ul>
            </Col>
            <Col md={4} className="d-none d-md-block">
              <h6 className="fw-semibold mb-3">Contact</h6>
              <p className="mb-1 text-light">Email: support@hybridstore.com</p>
              <p className="mb-1 text-light">Phone: (123) 456-7890</p>
              <p className="mb-1 text-light">Address: 123 Commerce St, Business City</p>
            </Col>
          </Row>
          <hr className="my-4 border-light" />
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
            <p className="mb-2 mb-md-0 text-light small text-center text-md-start">© {new Date().getFullYear()} Hybrid Store. All rights reserved.</p>
            <div className="d-none d-md-flex gap-2">
              <Button variant="outline-light" size="sm">Terms of Service</Button>
              <Button variant="outline-light" size="sm">Privacy Policy</Button>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default Layout; 