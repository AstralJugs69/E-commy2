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
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Language names mapping
  const languageNames: Record<string, string> = {
    'en': 'English',
    'am': 'አማርኛ',
    'om': 'Afaan Oromoo'
  };

  // Helper for language abbreviation
  const getLangAbbr = (lang: string) => {
    switch (lang) {
      case 'en': return 'EN';
      case 'am': return '\u12A0\u121B'; // አማ
      case 'om': return 'AF';
      default: return lang.substring(0,2).toUpperCase();
    }
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

  // Add body class when offcanvas is open to help with hiding elements
  useEffect(() => {
    if (showOffcanvas) {
      document.body.classList.add('offcanvas-open');
    } else {
      document.body.classList.remove('offcanvas-open');
    }
    
    return () => {
      document.body.classList.remove('offcanvas-open');
    };
  }, [showOffcanvas]);

  return (
    <div className="app-wrapper d-flex flex-column min-vh-100">
      <Navbar bg="white" variant="light" expand={false} fixed="top" className="shadow-sm py-1 border-bottom">
        <Container className="navbar-container">
          <Navbar.Brand as={Link} to="/" className="fw-bolder text-decoration-none transition-hover mb-0">
            <FaStore className="me-1 text-primary" size={20} />
            <span style={{ color: 'var(--primary)' }}>{t('app.name').split('Store')[0]}</span>
            <span className="d-none d-sm-inline">{t('app.name').includes('Store') ? 'Store' : ''}</span>
          </Navbar.Brand>
          
          <div className="d-flex align-items-center">
            {/* Custom Language Switcher Button & Dropdown */}
            <div className="dropdown me-2" style={{ position: 'relative' }} id="language-dropdown">
              <button
                className="dropdown-toggle btn"
                style={{
                  background: '#fff',
                  border: '1.5px solid #CCCCCC',
                  borderRadius: 16,
                  color: '#222',
                  fontWeight: 500,
                  padding: '0.25rem 0.5rem',
                  minWidth: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  boxShadow: '0 2px 8px rgba(51,51,51,0.07)',
                  outline: 'none',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
                onClick={() => setShowLangDropdown((v: boolean) => !v)}
                onBlur={() => setTimeout(() => setShowLangDropdown(false), 120)}
                tabIndex={0}
                aria-haspopup="listbox"
                aria-expanded={showLangDropdown}
              >
                <span style={{
                  fontWeight: 700,
                  fontSize: '0.97em',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                  marginRight: '0.35em',
                  minWidth: 16,
                  display: 'inline-block',
                  textAlign: 'center',
                  lineHeight: 1.1,
                }}>{getLangAbbr(i18n.language)}</span>
                <span className="d-none d-md-inline">{getCurrentLanguageName()}</span>
              </button>
              {showLangDropdown && (
                <ul
                  className="dropdown-menu show"
                  style={{
                    position: 'absolute',
                    right: 0,
                    minWidth: '100%',
                    width: '100%',
                    borderRadius: 14,
                    boxShadow: '0 6px 24px rgba(0,0,0,0.09)',
                    marginTop: 6,
                    zIndex: 3000,
                    padding: '0.35rem 0.3rem',
                  }}
                >
                  <li>
                    <button className={`dropdown-item${i18n.language === 'en' ? ' active' : ''}`} style={{ borderRadius: 8, fontWeight: 500, color: i18n.language === 'en' ? '#fff' : '#333', background: i18n.language === 'en' ? '#222' : 'transparent', padding: '0.45rem 1.2rem 0.45rem 0.7rem', display: 'flex', alignItems: 'center', gap: '0.6em' }} onClick={() => changeLanguage('en')}>
                      <span style={{ fontWeight: 700, fontSize: '1em', textTransform: 'uppercase', letterSpacing: '0.03em', minWidth: 16, display: 'inline-block', textAlign: 'center' }}>EN</span>
                      <span className="d-none d-md-inline">English</span>
                    </button>
                  </li>
                  <li>
                    <button className={`dropdown-item${i18n.language === 'am' ? ' active' : ''}`} style={{ borderRadius: 8, fontWeight: 500, color: i18n.language === 'am' ? '#fff' : '#333', background: i18n.language === 'am' ? '#222' : 'transparent', padding: '0.45rem 1.2rem 0.45rem 0.7rem', display: 'flex', alignItems: 'center', gap: '0.6em' }} onClick={() => changeLanguage('am')}>
                      <span style={{ fontWeight: 700, fontSize: '1em', minWidth: 16, display: 'inline-block', textAlign: 'center' }}>አማ</span>
                      <span className="d-none d-md-inline">አማርኛ</span>
                    </button>
                  </li>
                  <li>
                    <button className={`dropdown-item${i18n.language === 'om' ? ' active' : ''}`} style={{ borderRadius: 8, fontWeight: 500, color: i18n.language === 'om' ? '#fff' : '#333', background: i18n.language === 'om' ? '#222' : 'transparent', padding: '0.45rem 1.2rem 0.45rem 0.7rem', display: 'flex', alignItems: 'center', gap: '0.6em' }} onClick={() => changeLanguage('om')}>
                      <span style={{ fontWeight: 700, fontSize: '1em', minWidth: 16, display: 'inline-block', textAlign: 'center' }}>AF</span>
                      <span className="d-none d-md-inline">Afaan Oromoo</span>
                    </button>
                  </li>
                </ul>
              )}
            </div>
            
            {/* Install App button */}
            {installPrompt && (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handleInstallClick}
                className="d-flex align-items-center me-2 rounded-pill py-0 px-2"
                title={t('common.installApp')}
                style={{ minWidth: 'auto', fontSize: '0.85rem' }}
              >
                <FaDownload size={14} />
                <span className="d-none d-md-inline ms-1">{t('common.installApp')}</span>
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
                <div className="dropdown py-3 border-bottom px-3">
                  <div className="d-flex align-items-center mb-2">
                    <FaGlobe className="me-2 text-primary" /> 
                    <span>{t('common.language')}</span>
                  </div>
                  <div className="d-flex flex-wrap gap-2 mt-1">
                    <Button 
                      variant={i18n.language === 'en' ? 'primary' : 'outline-primary'} 
                      size="sm"
                      onClick={() => changeLanguage('en')}
                      className="rounded-pill px-3"
                    >
                      English
                    </Button>
                    <Button 
                      variant={i18n.language === 'am' ? 'primary' : 'outline-primary'} 
                      size="sm"
                      onClick={() => changeLanguage('am')}
                      className="rounded-pill px-3"
                    >
                      አማርኛ
                    </Button>
                    <Button 
                      variant={i18n.language === 'om' ? 'primary' : 'outline-primary'} 
                      size="sm"
                      onClick={() => changeLanguage('om')}
                      className="rounded-pill px-3"
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
                ) :
                  <>
                    <Nav.Link as={Link} to="/login" onClick={handleCloseOffcanvas} className="py-3 border-bottom d-flex align-items-center px-3">
                      <FaUser className="me-2 text-primary" /> {t('navigation.loginRegister')}
                    </Nav.Link>
                  </>
                }
                <Nav.Link as={Link} to="/about" onClick={handleCloseOffcanvas} className="py-3 border-bottom d-flex align-items-center px-3">
                  <FaStore className="me-2 text-primary" /> {t('navigation.about')}
                </Nav.Link>
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
      
      <main className="flex-grow-1 pt-5 mt-5 pb-5 pb-lg-0">
        <Outlet />
      </main>
      
      {/* Bottom Navigation Bar - Mobile Only */}
      <nav className="d-lg-none fixed-bottom bg-white border-top py-2 mobile-nav">
        <div className="d-flex justify-content-around align-items-center">
          <Link to="/" className="text-center text-decoration-none">
            <div className="d-flex flex-column align-items-center">
              <FaHome size={20} className="mb-1 text-dark" />
              <small className="d-block small text-dark">{t('navigation.home')}</small>
            </div>
          </Link>
          <Link to="/cart" className="text-center text-decoration-none position-relative">
            <div className="d-flex flex-column align-items-center">
                <div className="position-relative">
                <FaShoppingCart size={20} className="mb-1 text-dark" />
                  {itemCount > 0 && (
                  <Badge 
                    pill 
                    bg="danger" 
                    className="position-absolute top-0 start-100 translate-middle badge-sm"
                    style={{ fontSize: "0.6rem", padding: "0.2rem 0.4rem" }}
                  >
                      {itemCount}
                    </Badge>
                  )}
                </div>
              <small className="d-block small text-dark">{t('navigation.cart')}</small>
            </div>
          </Link>
          <Link to="/orders" className="text-center text-decoration-none">
            <div className="d-flex flex-column align-items-center">
              <FaList size={20} className="mb-1 text-dark" />
              <small className="d-block small text-dark">{t('navigation.orders')}</small>
            </div>
          </Link>
          <Link to="/settings" className="text-center text-decoration-none">
            <div className="d-flex flex-column align-items-center">
              <FaCog size={20} className="mb-1 text-dark" />
              <small className="d-block small text-dark">{t('navigation.settings')}</small>
            </div>
          </Link>
      </div>
      </nav>
    </div>
  );
};

export default Layout; 