import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { FaHeart, FaTrash, FaChevronLeft, FaRegHeart, FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { useWishlist } from '../context/WishlistContext';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../utils/formatters';

// Define Product interface if not imported
interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  stock: number;
  description?: string;
  averageRating?: number;
  reviewCount?: number;
}

const WishlistPage: React.FC = () => {
  const { wishlistItems, isLoading, error, fetchWishlist, removeFromWishlist } = useWishlist();

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
      toast.success(`${productName} removed from wishlist`);
    } catch (error) {
      console.error("Error removing item from wishlist:", error);
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
      <h2 className="mb-4">My Wishlist</h2>
      
      <div className="mb-4">
        <Link to="/" className="text-decoration-none">
          <Button variant="outline-secondary" size="sm">
            <FaChevronLeft className="me-1" /> Back to Shopping
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Loading your wishlist...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : wishlistItems.length === 0 ? (
        <div className="text-center my-5">
          <Alert variant="info">
            Your wishlist is empty. Browse our products and add items to your wishlist!
          </Alert>
          <Link to="/">
            <Button variant="primary" className="mt-3">Browse Products</Button>
          </Link>
        </div>
      ) : (
        <>
          <p className="text-muted mb-4">{wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} in your wishlist</p>
          
          <Row className="g-2 my-3">
            {wishlistItems.map((item) => (
              <Col key={item.id} xs={6} md={4} lg={3} className="d-flex">
                <Card className="w-100 shadow-sm">
                  <Link to={`/product/${item.product.id}`} className="text-decoration-none text-reset">
                    <div className="position-relative">
                      {item.product.imageUrl ? (
                        <Card.Img 
                          variant="top" 
                          src={item.product.imageUrl} 
                          alt={item.product.name}
                          style={{ height: '130px', objectFit: 'cover' }}
                          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                            // Prevent infinite loop if placeholder itself fails
                            if (e.currentTarget.src !== '/placeholder-image.svg') {
                              e.currentTarget.onerror = null; // Remove handler after first error
                              e.currentTarget.src = '/placeholder-image.svg';
                            }
                          }}
                        />
                      ) : (
                        <Card.Img 
                          variant="top" 
                          src="/placeholder-image.svg"
                          alt={item.product.name}
                          style={{ height: '130px', objectFit: 'cover' }}
                        />
                      )}
                      
                      {/* Remove from wishlist button */}
                      <Button
                        variant="light"
                        size="sm"
                        className="position-absolute top-0 end-0 m-2 rounded-circle p-1"
                        style={{ width: '30px', height: '30px' }}
                        onClick={(e) => handleRemoveFromWishlist(e, item.product.id, item.product.name)}
                        aria-label="Remove from wishlist"
                      >
                        <FaTrash className="text-danger" style={{ fontSize: '14px' }} />
                      </Button>
                    </div>
                    <Card.Body className="p-2 p-md-3">
                      <Card.Title className="h6 text-dark mb-1 text-truncate">{item.product.name}</Card.Title>
                      <Card.Subtitle className="mb-1 text-muted small">{formatCurrency(item.product.price)}</Card.Subtitle>
                      
                      {/* Display Rating if available */}
                      {item.product.averageRating !== undefined && item.product.averageRating !== null && (
                        <div className="d-flex align-items-center mb-1">
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