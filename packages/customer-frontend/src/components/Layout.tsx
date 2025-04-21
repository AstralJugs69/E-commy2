import React, { useContext, useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Navbar, Nav, Offcanvas, Badge, Row, Col, Button, NavDropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useTranslation } from 'react-i18next';
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
import { FaDownload } from 'react-icons/fa';
import { FaGlobe } from 'react-icons/fa';

// Define BeforeInstallPromptEvent type
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface LayoutProps {
  installPrompt: BeforeInstallPromptEvent | null;
}

const Layout = ({ installPrompt }: LayoutProps) => {
  const { isAuthenticated, logout } = useAuth();
  const { getItemCount } = useCart();
  const { wishlistItems } = useWishlist();
  const { t, i18n } = useTranslation();
  const itemCount = getItemCount();
  const wishlistCount = wishlistItems.length;
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Language names mapping
  const languageNames: Record<string, string> = {
    'en': 'English',
    'am': 'አማርኛ',
    'om': 'Afaan Oromoo'
  };

  // Get current language display name
  const getCurrentLanguageName = () => {
    return languageNames[i18n.language] || languageNames['en'];
  };

  // Handle language change
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    handleCloseOffcanvas();
  };

  const handleCloseOffcanvas = () => setShowOffcanvas(false);
  const handleShowOffcanvas = () => setShowOffcanvas(true);

  const handleLogout = () => {
    logout();
    setShowOffcanvas(false);
    navigate('/');
    toast.success(t('notifications.loggedOut'));
  };

  // Direct installation handler that preserves user gesture context
  const handleInstallClick = (e: React.MouseEvent) => {
    if (!installPrompt) {
      toast.error(t('notifications.installationError'));
      return;
    }

    // This preserves the user gesture context since it's synchronous with the click
    installPrompt.prompt().catch(error => {
      console.error('Installation prompt error:', error);
      toast.error(t('notifications.installationPromptError'));
    });

    // Handle the user choice
    installPrompt.userChoice.then(result => {
      console.log(`User response to install prompt: ${result.outcome}`);
      if (result.outcome === 'accepted') {
        toast.success(t('notifications.installationStarted'));
      } else {
        toast(t('notifications.installationCancelled'));
      }
    }).catch(error => {
      console.error('Installation choice error:', error);
    });
  };

  return (
    <div className="app-wrapper d-flex flex-column min-vh-100">
      <Navbar bg="white" variant="light" expand={false} fixed="top" className="shadow-sm py-3 border-bottom">
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bolder text-decoration-none transition-hover">
            <FaStore className="me-2 text-primary" size={24} />
            <span style={{ color: 'var(--primary)' }}>{t('app.name').split('Store')[0]}</span>{t('app.name').includes('Store') ? 'Store' : ''}
          </Navbar.Brand>
          
          <div className="d-flex align-items-center">
            {/* Language Switcher Dropdown */}
            <NavDropdown 
              title={<><FaGlobe className="me-1" /> <span className="d-none d-md-inline">{getCurrentLanguageName()}</span></>}
              id="language-dropdown"
              align="end"
              className="me-3"
            >
              <NavDropdown.Item 
                onClick={() => changeLanguage('en')} 
                active={i18n.language === 'en'}
              >
                English
              </NavDropdown.Item>
              <NavDropdown.Item 
                onClick={() => changeLanguage('am')} 
                active={i18n.language === 'am'}
              >
                አማርኛ
              </NavDropdown.Item>
              <NavDropdown.Item 
                onClick={() => changeLanguage('om')} 
                active={i18n.language === 'om'}
              >
                Afaan Oromoo
              </NavDropdown.Item>
            </NavDropdown>
            
            {/* Install App button */}
            {installPrompt && (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handleInstallClick}
                className="d-flex align-items-center gap-1 me-3 rounded-pill px-3 py-1"
                title={t('common.installApp')}
              >
                <FaDownload />
                <span className="d-none d-md-inline">{t('common.installApp')}</span>
              </Button>
            )}
            
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
                {t('navigation.menu')}
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="p-0">
              <Nav className="justify-content-end flex-grow-1">
                <Nav.Link as={Link} to="/" onClick={handleCloseOffcanvas} className="py-3 border-bottom d-flex align-items-center px-3">
                  <FaHome className="me-2 text-primary" /> {t('navigation.home')}
                </Nav.Link>
                <Nav.Link as={Link} to="/cart" onClick={handleCloseOffcanvas} className="py-3 border-bottom d-flex align-items-center position-relative px-3">
                  <FaShoppingCart className="me-2 text-primary" /> {t('navigation.cart')}
                  {itemCount > 0 && <Badge pill bg="danger" className="ms-2">{itemCount}</Badge>}
                </Nav.Link>
                
                {/* Language Switcher in Offcanvas Menu */}
                <div className="py-3 border-bottom px-3">
                  <div className="d-flex align-items-center mb-2">
                    <FaGlobe className="me-2 text-primary" /> {t('common.language', 'Language')}
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    <Button 
                      variant={i18n.language === 'en' ? 'primary' : 'outline-primary'} 
                      size="sm"
                      onClick={() => changeLanguage('en')}
                      className="flex-grow-1"
                    >
                      English
                    </Button>
                    <Button 
                      variant={i18n.language === 'am' ? 'primary' : 'outline-primary'} 
                      size="sm"
                      onClick={() => changeLanguage('am')}
                      className="flex-grow-1"
                    >
                      አማርኛ
                    </Button>
                    <Button 
                      variant={i18n.language === 'om' ? 'primary' : 'outline-primary'} 
                      size="sm"
                      onClick={() => changeLanguage('om')}
                      className="flex-grow-1"
                    >
                      Afaan Oromoo
                    </Button>
                  </div>
                </div>
                
                {/* Add Install App button to offcanvas menu if available */}
                {installPrompt && (
                  <Button
                    variant="link"
                    onClick={(e) => {
                      handleInstallClick(e);
                      handleCloseOffcanvas();
                    }}
                    className="py-3 border-bottom d-flex align-items-center w-100 text-decoration-none px-3"
                  >
                    <FaDownload className="me-2 text-primary" /> {t('common.installApp')}
                  </Button>
                )}
                
                {isAuthenticated ? (
                  <>
                    <Nav.Link as={Link} to="/wishlist" onClick={handleCloseOffcanvas} className="py-3 border-bottom d-flex align-items-center position-relative px-3">
                      <FaHeart className="me-2 text-primary" /> {t('navigation.myWishlist')}
                      {wishlistCount > 0 && <Badge pill bg="primary" className="ms-2">{wishlistCount}</Badge>}
                    </Nav.Link>
                    <Nav.Link as={Link} to="/settings" onClick={handleCloseOffcanvas} className="py-3 border-bottom d-flex align-items-center px-3">
                      <FaCog className="me-2 text-primary" /> {t('navigation.settings')}
                    </Nav.Link>
                    <Nav.Link as={Link} to="/orders" onClick={handleCloseOffcanvas} className="py-3 border-bottom d-flex align-items-center px-3">
                      <FaList className="me-2 text-primary" /> {t('navigation.myOrders')}
                    </Nav.Link>
                    <Button variant="link" onClick={handleLogout} className="py-3 border-bottom d-flex align-items-center w-100 text-danger text-decoration-none px-3">
                      <FaSignOutAlt className="me-2" /> {t('navigation.logout')}
                    </Button>
                  </>
                ) : (
                  <>
                    <Nav.Link as={Link} to="/login" onClick={handleCloseOffcanvas} className="py-3 border-bottom d-flex align-items-center px-3">
                      <FaUser className="me-2 text-primary" /> {t('navigation.loginRegister')}
                    </Nav.Link>
                  </>
                )}
                <Nav.Link as={Link} to="/about" onClick={handleCloseOffcanvas} className="py-3 border-bottom d-flex align-items-center px-3">
                  <FaStore className="me-2 text-primary" /> {t('navigation.about')}
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
                <small style={{ fontSize: '0.7rem' }}>{t('navigation.home')}</small>
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
                <small style={{ fontSize: '0.7rem' }}>{t('navigation.cart')}</small>
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
                <small style={{ fontSize: '0.7rem' }}>{t('navigation.orders')}</small>
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
                <small style={{ fontSize: '0.7rem' }}>{t('navigation.settings')}</small>
              </Nav.Link>
            </Nav>
          </Container>
        </Navbar>
      </div>
    </div>
  );
};

export default Layout; 