import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Button, Spinner, Alert, Badge, Card, Form, ListGroup, Carousel, Dropdown } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import toast from 'react-hot-toast';
import StarRating from '../components/StarRating';
import api from '../utils/api';
import { formatCurrency } from '../utils/formatters';
import { FaStar } from 'react-icons/fa';
import { FaRegStar } from 'react-icons/fa';
import { FaStarHalfAlt } from 'react-icons/fa';
import { FaHeart } from 'react-icons/fa';
import { FaRegHeart } from 'react-icons/fa';
import ProductCard from '../components/ProductCard';
import { getImageUrl } from '../utils/imageUrl';
import { useTranslation } from 'react-i18next';

// Define interface for product data matching backend response
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
  description: string | null;
  images?: ProductImage[];
  stock: number;
  createdAt: string;
  averageRating?: number | null;
  reviewCount?: number;
  discountPercentage: number;
  category: string;
}

// Define interface for review data
interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    email: string;
  };
}

// Define interface for paginated products response
interface PaginatedProductsResponse {
  products: Product[];
  currentPage: number;
  totalPages: number;
  totalProducts: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const ProductDetailPage = () => {
  const { t } = useTranslation();
  
  // State for product
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  
  // State for reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  
  // State for new review
  const [newRating, setNewRating] = useState<number>(0);
  const [newComment, setNewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [submitReviewError, setSubmitReviewError] = useState<string | null>(null);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  
  // Add wishlist state
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  
  // State for other products
  const [otherProducts, setOtherProducts] = useState<Product[]>([]);
  const [isLoadingOther, setIsLoadingOther] = useState(false);
  
  // Rating dropdown options
  const ratingOptions = [
    { value: 0, label: t('product.selectARating') },
    { value: 1, label: `1 - ${t('product.ratingOptions.poor')}` },
    { value: 2, label: `2 - ${t('product.ratingOptions.fair')}` },
    { value: 3, label: `3 - ${t('product.ratingOptions.good')}` },
    { value: 4, label: `4 - ${t('product.ratingOptions.veryGood')}` },
    { value: 5, label: `5 - ${t('product.ratingOptions.excellent')}` }
  ];
  const currentRatingLabel = ratingOptions.find(opt => opt.value === newRating)?.label || t('product.selectARating');
  
  // Hooks
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const { isAuthenticated, token } = useAuth();
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();
  
  // Check if product is in cart
  useEffect(() => {
    if (product && cartItems) {
      const itemInCart = cartItems.some(item => item.id === product.id);
      setIsInCart(itemInCart);
    }
  }, [product, cartItems]);
  
  // Fetch product data
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productId) {
        setError('Product ID is missing');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await api.get(`/products/${productId}`);
        setProduct(response.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          // Handle 404 error specifically
          if (err.response?.status === 404) {
            setError('Product not found. It may have been removed or is no longer available.');
          } else {
            setError(err.response?.data?.message || 'Failed to load product details');
          }
          console.error('Error fetching product details:', err.response?.data);
        } else {
          setError('Network error. Please check your connection and try again.');
          console.error('Network error:', err);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProductDetails();
  }, [productId]);
  
  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!productId) return;
      
      setIsLoadingReviews(true);
      setReviewError(null);
      
      try {
        // Use the alternate route for fetching product reviews
        const response = await api.get(`/reviews/product/${productId}`);
        setReviews(response.data);
        
        // Check if the user has already reviewed this product
        if (isAuthenticated && token) {
          try {
            const userReviews = await api.get('/reviews/user');
            // Check if user has already reviewed this product
            const hasReviewed = userReviews.data.some(
              (review: any) => review.productId === parseInt(productId)
            );
            setHasUserReviewed(hasReviewed);
          } catch (error) {
            console.error('Error checking user reviews:', error);
          }
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setReviewError(err.response?.data?.message || 'Failed to load reviews');
          console.error('Error fetching reviews:', err.response?.data);
        } else {
          setReviewError('Network error. Please check your connection and try again.');
          console.error('Network error:', err);
        }
      } finally {
        setIsLoadingReviews(false);
      }
    };
    
    fetchReviews();
  }, [productId, isAuthenticated, token]);
  
  // Fetch other similar products
  useEffect(() => {
    const fetchOtherProducts = async () => {
      if (!product) return; // Don't fetch if main product isn't loaded

      setIsLoadingOther(true);
      try {
        const response = await api.get('/products');
        // The data now contains a products array instead of being the array directly
        const products = response.data.products;
        // Filter out current product and take first 4
        const filteredProducts = products
          .filter((p: Product) => p.id !== product.id)
          .slice(0, 4);
        setOtherProducts(filteredProducts);
      } catch (err) {
        console.error("Failed to fetch other products", err);
        // We don't set error state here as it's not critical
      } finally {
        setIsLoadingOther(false);
      }
    };

    if (product) { // Fetch only when main product is loaded
      fetchOtherProducts();
    }
  }, [product]); // Dependency on main product state
  
  // Handle adding product to cart
  const handleAddToCartClick = async () => {
    if (!product || product.stock <= 0) {
      return;
    }
    
    setIsAddingToCart(true);
    
    try {
      await addToCart(product.id, 1);
      // Success toast is handled by context
    } catch (error) {
      // Error is handled by context
      console.error("Add to cart failed (handled by context):", error);
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  // Handle adding product to wishlist
  const handleWishlistClick = async () => {
    if (!product) {
      return;
    }
    
    if (!isAuthenticated) {
      toast.error("Please log in to add items to your wishlist");
      navigate('/login');
      return;
    }
    
    setIsAddingToWishlist(true);
    
    try {
      const productIsWishlisted = isWishlisted(product.id);
      
      if (productIsWishlisted) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product.id);
      }
    } catch (error) {
      console.error("Wishlist operation failed:", error);
    } finally {
      setIsAddingToWishlist(false);
    }
  };
  
  // Handle submitting a review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !token) {
      toast.error('You must be logged in to submit a review');
      return;
    }
    
    if (!productId) {
      toast.error('Product ID is missing');
      return;
    }
    
    if (newRating <= 0) {
      setSubmitReviewError('Please select a rating');
      return;
    }
    
    setIsSubmittingReview(true);
    setSubmitReviewError(null);
    
    try {
      await api.post(
        '/reviews',
        {
          productId: parseInt(productId),
          rating: newRating,
          comment: newComment.trim() || null
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Clear form
      setNewRating(0);
      setNewComment('');
      
      // Show success message
      toast.success('Review submitted successfully');
      
      // Set that user has reviewed
      setHasUserReviewed(true);
      
      // Refetch product and reviews
      const [productResponse, reviewsResponse] = await Promise.all([
        api.get(`/products/${productId}`),
        api.get(`/reviews/product/${productId}`)
      ]);
      
      setProduct(productResponse.data);
      setReviews(reviewsResponse.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        // Handle 409 "already reviewed" error specifically
        if (err.response?.status === 409) {
          setSubmitReviewError('You have already reviewed this product');
          setHasUserReviewed(true);
        } else {
          setSubmitReviewError(err.response?.data?.message || 'Failed to submit review');
        }
        console.error('Error submitting review:', err.response?.data);
      } else {
        setSubmitReviewError('Network error. Please check your connection and try again.');
        console.error('Network error:', err);
      }
    } finally {
      setIsSubmittingReview(false);
    }
  };
  
  // Handle back button click
  const handleBackClick = () => {
    navigate(-1); // Go back to previous page
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Check if product is new (less than 14 days old)
  const isNewProduct = () => {
    if (!product) return false;
    const createdDate = new Date(product.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 14;
  };
  
  // Render star rating component
  const StarRating = ({ rating }: { rating: number | null | undefined }) => {
    if (!rating) return null;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="text-warning" />);
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-warning" />);
    }
    
    // Add empty stars to reach 5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="text-warning" />);
    }
    
    return <div className="d-inline-flex">{stars}</div>;
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">{t('product.loadingDetails')}</span>
        </Spinner>
      </Container>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Container className="py-3">
        <Alert variant="danger">
          {error}
        </Alert>
        <Button variant="secondary" size="sm" onClick={handleBackClick} className="mb-3">
          {t('navigation.backToProducts')}
        </Button>
      </Container>
    );
  }
  
  // Render product not found
  if (!product) {
    return (
      <Container className="py-3">
        <Alert variant="warning">
          {t('product.notFound')}
        </Alert>
        <Button variant="secondary" size="sm" onClick={handleBackClick} className="mb-3">
          {t('navigation.backToProducts')}
        </Button>
      </Container>
    );
  }
  
  // Render product details
  return (
    <Container className="py-3 product-detail-container">
      <style>
        {`
          .product-description {
            max-height: 150px;
            overflow-y: auto;
            padding-right: 5px;
          }
          .product-description::-webkit-scrollbar {
            width: 6px;
          }
          .product-description::-webkit-scrollbar-thumb {
            background-color: #ced4da;
            border-radius: 3px;
          }
          @media (max-width: 768px) {
            .product-detail-section {
              min-height: 350px;
            }
          }
        `}
      </style>
      
      <Row className="mb-2">
        <Col>
          <Button variant="secondary" size="sm" onClick={handleBackClick} className="mb-3">
            &larr; {t('navigation.backToProducts')}
          </Button>
        </Col>
      </Row>
      
      <Row className="g-3">
        {/* Product Image Column */}
        <Col xs={12} md={6} className="mb-3 mb-md-0">
          <div className="position-relative">
            {product.images && product.images.length > 1 ? (
              <Carousel 
                interval={null} 
                className="product-carousel" 
                indicators={true} 
                controls={true}
                style={{
                  backgroundColor: '#f8f9fa',
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  height: '350px'
                }}
              >
                {product.images.map((image, index) => (
                  <Carousel.Item 
                    key={image.id}
                    style={{
                      height: '350px',
                      textAlign: 'center',
                      padding: '10px'
                    }}
                  >
                    <div 
                      style={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <img
                        className="d-block"
                        src={getImageUrl(image.url)}
                        alt={`${product.name} - ${t('product.image')} ${index + 1}`}
                        style={{ 
                          objectFit: 'contain',
                          maxHeight: '330px',
                          width: 'auto',
                          maxWidth: '95%'
                        }}
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                          if (e.currentTarget.src !== '/placeholder-image.svg') {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/placeholder-image.svg';
                            console.warn(`Failed to load image: ${image.url || 'unknown'}`);
                          }
                        }}
                      />
                    </div>
                  </Carousel.Item>
                ))}
              </Carousel>
            ) : (
              <Card.Img 
                variant="top" 
                src={product.images && product.images.length > 0 
                  ? getImageUrl(product.images[0].url)
                  : getImageUrl(null)
                } 
                alt={product.name}
                style={{ 
                  height: '350px', 
                  objectFit: 'contain',
                  backgroundColor: '#f8f9fa' 
                }}
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  if (e.currentTarget.src !== '/placeholder-image.svg') {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/placeholder-image.svg';
                    console.warn(`Failed to load image: ${product.images?.[0]?.url || 'unknown'}`);
                  }
                }}
              />
            )}
            {isNewProduct() && (
              <Badge 
                bg="info" 
                className="position-absolute top-0 start-0 m-2 z-1"
              >
                {t('common.new')}
              </Badge>
            )}
          </div>
          
          <div className="mb-1">
            <p className="text-muted small mb-0">{t('product.addedOn')} {formatDate(product.createdAt)}</p>
          </div>
          
          {/* Description with reduced margin */}
          <div className="mb-2">
            <h5 className="mb-1">{t('product.description')}</h5>
            <p className="text-break mb-0 product-description">{product.description || t('product.noDescriptionAvailable')}</p>
          </div>
          
          {/* Add to Cart Button - with improved positioning */}
          <div className="mt-3 mb-2 sticky-bottom">
            <Button
              variant={isInCart ? "success" : "primary"}
              className="w-100 py-2"
              onClick={handleAddToCartClick}
              disabled={!product || product.stock <= 0 || isInCart || isAddingToCart}
            >
              {isAddingToCart ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/>
                  {t('product.adding')}
                </>
              ) : isInCart ? (
                t('product.inCart')
              ) : product?.stock <= 0 ? (
                t('product.outOfStock')
              ) : (
                t('product.addToCart')
              )}
            </Button>
          </div>
        </Col>
        
        {/* Product Details Column */}
        <Col xs={12} md={6} className="product-detail-section d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-1">
            <h1 className="mb-0 fs-2">{product.name}</h1>
            <Button 
              variant="outline-danger" 
              size="sm" 
              className="rounded-circle p-2" 
              onClick={handleWishlistClick}
              disabled={isAddingToWishlist}
            >
              {isAddingToWishlist ? (
                <Spinner animation="border" size="sm" />
              ) : isWishlisted(product.id) ? (
                <FaHeart size={20} />
              ) : (
                <FaRegHeart size={20} />
              )}
            </Button>
          </div>
          
          <h2 className="text-primary mb-1 fs-3">€{product.price.toFixed(2)}</h2>
          
          {/* Display Rating */}
          {product.averageRating !== undefined && product.averageRating !== null && (
            <div className="mb-1 d-flex align-items-center">
              <StarRating rating={product.averageRating} />
              <span className="ms-2 text-muted">
                ({product.reviewCount ?? 0} {product.reviewCount === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
          
          <div className="mb-1">
            {product.stock > 0 ? (
              <Badge 
                bg={product.stock > 10 ? "success" : "warning"} 
                className="p-2"
              >
                {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left`}
              </Badge>
            ) : (
              <Badge 
                bg="danger"
                className="p-2"
              >
                Out of Stock
              </Badge>
            )}
          </div>
          
          {/* Reviews Section - moved outside product details column */}
          <Row className="mt-4">
            <Col xs={12}>
              <Card>
                <Card.Header className="bg-light">
                  <h3 className="fs-4 mb-0">{t('product.reviews')}</h3>
                </Card.Header>
                <Card.Body>
                  {/* Write Review Form */}
                  {isAuthenticated && !hasUserReviewed && (
                    <div className="mb-4">
                      <h4 className="fs-5 mb-3 fw-semibold">{t('product.writeReview')}</h4>
                      <Form onSubmit={handleSubmitReview}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-medium">{t('product.rating')}</Form.Label>
                          <Dropdown onSelect={eventKey => setNewRating(eventKey ? parseInt(eventKey) : 0)}>
                            <Dropdown.Toggle
                              variant="outline-secondary"
                              id="ratingDropdown"
                              className="w-100 d-flex justify-content-between align-items-center"
                              size="sm"
                            >
                              {currentRatingLabel}
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="w-100 animate-dropdown">
                              {ratingOptions.map(option => (
                                <Dropdown.Item
                                  key={option.value}
                                  eventKey={option.value.toString()}
                                  active={newRating === option.value}
                                  disabled={option.value === 0}
                                >
                                  {option.label}
                                </Dropdown.Item>
                              ))}
                            </Dropdown.Menu>
                          </Dropdown>
                        </Form.Group>
                        
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-medium">{t('product.comment')}</Form.Label>
                          <Form.Control 
                            as="textarea" 
                            rows={3} 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={t('product.placeholder')}
                          />
                        </Form.Group>
                        
                        {submitReviewError && (
                          <Alert variant="danger" className="mb-3">
                            {submitReviewError}
                          </Alert>
                        )}
                        
                        <Button 
                          type="submit" 
                          variant="primary"
                          disabled={isSubmittingReview}
                          className="px-4 py-2 rounded-pill fw-medium"
                        >
                          {isSubmittingReview ? (
                            <>
                              <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-2"
                              />
                              {t('common.submitting')}
                            </>
                          ) : (
                            t('product.submitReview')
                          )}
                        </Button>
                      </Form>
                    </div>
                  )}
                  
                  {/* Display Reviews */}
                  <div>
                    <h4 className="fs-5 mb-3">{t('product.customerReviews')}</h4>
                    
                    {isLoadingReviews && (
                      <div className="text-center py-3">
                        <Spinner animation="border" size="sm" role="status">
                          <span className="visually-hidden">{t('product.loadingReviews')}</span>
                        </Spinner>
                        <p className="mb-0 mt-2">{t('product.loadingReviews')}</p>
                      </div>
                    )}
                    
                    {reviewError && !isLoadingReviews && (
                      <Alert variant="danger">
                        {reviewError}
                      </Alert>
                    )}
                    
                    {!isLoadingReviews && !reviewError && reviews.length === 0 && (
                      <p className="text-muted">
                        {t('product.noReviews')}
                      </p>
                    )}
                    
                    {!isLoadingReviews && !reviewError && reviews.length > 0 && (
                      <ListGroup variant="flush">
                        {reviews.map((review) => (
                          <ListGroup.Item key={review.id} className="py-3">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <div className="d-flex align-items-center">
                                <StarRating rating={review.rating} />
                                <span className="ms-2 fw-bold">{review.user.email}</span>
                              </div>
                              <small className="text-muted">
                                {formatDate(review.createdAt)}
                              </small>
                            </div>
                            {review.comment && (
                              <p className="mb-0 mt-2">{review.comment}</p>
                            )}
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* You Might Also Like Section */}
      <Row className="mt-5">
        <Col xs={12}>
          <h3 className="mb-3">{t('product.youMightAlsoLike')}</h3>
          {isLoadingOther ? (
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" role="status">
                <span className="visually-hidden">{t('product.loadingRecommendedProducts')}</span>
              </Spinner>
            </div>
          ) : otherProducts.length > 0 ? (
            <Row xs={2} md={4} className="g-3">
              {otherProducts.map(p => (
                <Col key={p.id}>
                  <Link to={`/product/${p.id}`} className="text-decoration-none text-reset d-block h-100">
                    <ProductCard product={p} hideAddToCart={true} disableInternalLink={true} />
                  </Link>
                </Col>
              ))}
            </Row>
          ) : (
            <p className="text-muted">{t('product.noSimilarProductsFound')}</p>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetailPage;
