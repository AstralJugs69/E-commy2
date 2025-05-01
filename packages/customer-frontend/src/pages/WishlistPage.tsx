import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { FaHeart } from 'react-icons/fa';
import { FaTrash } from 'react-icons/fa';
import { FaChevronLeft } from 'react-icons/fa';
import { FaRegHeart } from 'react-icons/fa';
import { FaStar } from 'react-icons/fa';
import { FaStarHalfAlt } from 'react-icons/fa';
import { FaRegStar } from 'react-icons/fa';
import { useWishlist } from '../context/WishlistContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../utils/formatters';
import EmptyState from '../components/EmptyState';
import { getImageUrl } from '../utils/imageUrl';

// Define Product interface with support for both image formats
interface ProductImage {
  id: number;
  url: string;
  productId: number;
  createdAt: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl?: string | null; // For backward compatibility
  images?: ProductImage[];
  stock: number;
  description?: string;
  averageRating?: number;
  reviewCount?: number;
}

const WishlistPage: React.FC = () => {
  const { wishlistItems, isLoading, error, fetchWishlist, removeFromWishlist } = useWishlist();
  const { t } = useTranslation();

  // Reload wishlist when the component mounts
  useEffect(() => {
    fetchWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only on mount

  const handleRemoveFromWishlist = async (e: React.MouseEvent, productId: number, productName: string) => {
    e.preventDefault(); // Prevent navigation to product detail
    e.stopPropagation(); // Prevent event bubbling
    
    try {
      await removeFromWishlist(productId);
      toast.success(t('wishlist.removedFromWishlist'));
    } catch (error) {
      console.error("Error removing item from wishlist:", error);
      toast.error(t('wishlist.errorRemoving', 'Error removing item from wishlist'));
    }
  };

  // Star rating component (identical to HomePage)
  const StarRating = ({ rating }: { rating: number }) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-warning" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-warning" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-warning" />);
      }
    }
    
    return <div className="d-inline-flex align-items-center">{stars}</div>;
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4 fw-semibold">{t('wishlistPage.title', 'My Wishlist')}</h2>
      
      <div className="mb-4">
        <Link to="/" className="text-decoration-none">
          <Button variant="outline-secondary" size="sm" className="rounded-pill px-3 py-2">
            <FaChevronLeft className="me-2" /> {t('cart.continueShopping', 'Continue Shopping')}
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">{t('common.loading', 'Loading...')}</span>
          </Spinner>
          <p className="mt-3">{t('wishlist.loadingWishlist', 'Loading your wishlist...')}</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : wishlistItems.length === 0 ? (
        <EmptyState
          icon={<FaRegHeart />}
          title={t('wishlist.emptyWishlist', 'Your Wishlist is Empty')}
          message={t('wishlist.emptyWishlistMessage', 'Add items you love to your wishlist by clicking the heart icon.')}
          actionButton={<Link to="/" className="btn btn-primary px-4 rounded-pill">{t('wishlist.browseProducts', 'Browse Products')}</Link>}
        />
      ) : (
        <>
          <p className="text-muted mb-4">
            {t('wishlist.itemCount', { count: wishlistItems.length })}
          </p>
          
          <Row className="g-3 my-3">
            {wishlistItems.map((item) => (
              <Col key={item.id} xs={6} md={4} lg={3} className="d-flex">
                <Card className="w-100 shadow-sm h-100">
                  <Link to={`/products/${item.product.id}`} className="text-decoration-none text-reset">
                    <div className="position-relative">
                      {((item.product.images && item.product.images.length > 0) || item.product.imageUrl) ? (
                        <Card.Img 
                          variant="top" 
                          src={getImageUrl(
                            item.product.images && item.product.images.length > 0
                              ? item.product.images[0].url
                              : item.product.imageUrl
                          )}
                          alt={item.product.name}
                          style={{ height: '150px', objectFit: 'contain', padding: '0.75rem' }}
                          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                            if (e.currentTarget.src !== '/placeholder-image.svg') {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/placeholder-image.svg';
                              console.warn('Image failed to load:', item.product.images?.[0]?.url || item.product.imageUrl);
                            }
                          }}
                        />
                      ) : (
                        <Card.Img 
                          variant="top" 
                          src="/placeholder-image.svg"
                          alt={item.product.name}
                          style={{ height: '150px', objectFit: 'contain', padding: '0.75rem' }}
                        />
                      )}
                      
                      {/* Remove from wishlist button */}
                      <Button
                        variant="light"
                        size="sm"
                        className="position-absolute top-0 end-0 m-2 rounded-circle p-1 shadow-sm"
                        style={{ width: '32px', height: '32px' }}
                        onClick={(e) => handleRemoveFromWishlist(e, item.product.id, item.product.name)}
                        aria-label={t('wishlist.removeFromWishlist', 'Remove from Wishlist')}
                      >
                        <FaTrash className="text-danger" style={{ fontSize: '14px' }} />
                      </Button>
                    </div>
                    <Card.Body className="p-3 text-center">
                      <Card.Title className="h6 text-dark mb-2 fw-semibold text-truncate">{item.product.name}</Card.Title>
                      <Card.Subtitle className="mb-2 fw-bold text-primary">{formatCurrency(item.product.price)}</Card.Subtitle>
                      
                      {/* Display Rating if available */}
                      {item.product.averageRating !== undefined && item.product.averageRating !== null && (
                        <div className="d-flex align-items-center justify-content-center mb-2">
                          <StarRating rating={item.product.averageRating} />
                          <small className="ms-1 text-muted">
                            ({item.product.reviewCount ?? 0})
                          </small>
                        </div>
                      )}
                      
                      <Card.Text className="text-muted small d-none d-sm-block text-truncate mb-0">
                        {item.product.description || ''}
                      </Card.Text>
                    </Card.Body>
                  </Link>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}
    </Container>
  );
};

export default WishlistPage; 