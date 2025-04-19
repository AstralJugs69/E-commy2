import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge, Form, Pagination, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { toast } from 'react-hot-toast';
import { FaStar } from 'react-icons/fa';
import { FaRegStar } from 'react-icons/fa';
import { FaStarHalfAlt } from 'react-icons/fa';
import { FaHeart } from 'react-icons/fa';
import { FaRegHeart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import StarRating from '../components/StarRating';

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
  imageUrl?: string | null; // For backward compatibility
  stock: number;
  averageRating?: number | null;
  reviewCount?: number;
}

interface Category {
  id: number;
  name: string;
  imageUrl?: string | null;
}

interface PaginatedProductsResponse {
  products: Product[];
  currentPage: number;
  totalPages: number;
  totalProducts: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:3001/uploads';

const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { wishlistItems, isWishlisted, addToWishlist, removeFromWishlist } = useWishlist();
  
  // Category state
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(''); // '' means All
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(true);
  
  // Sort state
  const [sortBy, setSortBy] = useState<string>('createdAt'); // Default sort
  const [sortOrder, setSortOrder] = useState<string>('desc'); // Default order
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const fetchProducts = async (page = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      // Construct query parameters
      const params = new URLSearchParams();
      if (searchTerm.trim() !== '') {
        params.append('search', searchTerm.trim());
      }
      if (selectedCategoryId) {
        params.append('categoryId', selectedCategoryId);
      }
      if (sortBy) {
        params.append('sortBy', sortBy);
      }
      if (sortOrder) {
        params.append('sortOrder', sortOrder);
      }
      
      // Add pagination parameters
      params.append('page', page.toString());
      params.append('limit', '12'); // Default limit
      
      const queryString = params.toString();
      const apiUrl = `${API_BASE_URL}/products${queryString ? `?${queryString}` : ''}`;

      console.log(`Fetching products from ${apiUrl}`);
      const response = await axios.get<PaginatedProductsResponse>(apiUrl);
      
      // Update state with paginated response data
      setProducts(response.data.products);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
      setTotalProducts(response.data.totalProducts);
      
      console.log(`Loaded page ${response.data.currentPage} of ${response.data.totalPages}`);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const errorMessage = err.response.data.message || 'Failed to fetch products';
        setError(errorMessage);
        console.error('Error fetching products:', err.response.data);
      } else {
        setError('Network error. Please check your connection.');
        console.error('Network error:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    if (page !== currentPage) {
      setCurrentPage(page);
      fetchProducts(page);
      // Scroll to top of product section
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Fetch products when search term, category filter, or sort changes - reset to page 1
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    fetchProducts(1);
  }, [searchTerm, selectedCategoryId, sortBy, sortOrder]); // Re-fetch when filters or sort changes

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/categories`);
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Optionally set an error state for categories
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleToggleWishlist = (e: React.MouseEvent, product: Product) => {
    e.preventDefault(); // Prevent navigation to product detail
    e.stopPropagation(); // Prevent event bubbling
    
    if (isWishlisted(product.id)) {
      removeFromWishlist(product.id);
      toast.success(`${product.name} removed from wishlist`);
    } else {
      addToWishlist(product.id);
      toast.success(`${product.name} added to wishlist`);
    }
  };

  // Pagination UI component
  const PaginationControls = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="d-flex justify-content-center my-4">
        <Pagination>
          <Pagination.First 
            onClick={() => handlePageChange(1)} 
            disabled={currentPage === 1}
          />
          <Pagination.Prev 
            onClick={() => handlePageChange(currentPage - 1)} 
            disabled={currentPage === 1}
          />
          
          {/* Show limited number of page buttons */}
          {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
            // For simplicity, show pages around current page
            let pageNum;
            if (totalPages <= 5) {
              // If 5 or fewer pages, show all
              pageNum = idx + 1;
            } else if (currentPage <= 3) {
              // If near start, show first 5 pages
              pageNum = idx + 1;
            } else if (currentPage >= totalPages - 2) {
              // If near end, show last 5 pages
              pageNum = totalPages - 4 + idx;
            } else {
              // Show current page and 2 before/after
              pageNum = currentPage - 2 + idx;
            }
            
            return (
              <Pagination.Item
                key={pageNum}
                active={pageNum === currentPage}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </Pagination.Item>
            );
          })}
          
          <Pagination.Next 
            onClick={() => handlePageChange(currentPage + 1)} 
            disabled={currentPage === totalPages}
          />
          <Pagination.Last 
            onClick={() => handlePageChange(totalPages)} 
            disabled={currentPage === totalPages}
          />
        </Pagination>
      </div>
    );
  };

  return (
    <Container className="py-3">
      <h2 className="mb-3 d-none d-sm-block">Our Products</h2>
      
      {/* Category Filter */}
      <div className="mb-4">
        <h5 className="mb-3 d-none d-sm-block">Categories</h5>
        {isLoadingCategories ? (
          <div className="text-center py-4">
            <Spinner animation="border" size="sm" />
            <p className="mt-2">Loading categories...</p>
          </div>
        ) : (
          <div className="category-scroll-container mb-3">
            {/* All Categories Option */}
            <div className={`category-item-wrapper ${selectedCategoryId === '' ? 'active' : ''}`}>
              <div 
                className="category-item"
                onClick={() => setSelectedCategoryId('')}
              >
                <img 
                  src="/placeholder-image.svg" 
                  alt="All Categories" 
                  className="category-image" 
                  onError={(e) => {e.currentTarget.src = '/placeholder-image.svg'}}
                />
                <p className="category-name text-truncate w-100">All Categories</p>
              </div>
            </div>
            
            {/* Individual Categories */}
            {categories.map((category) => (
              <div key={category.id} className={`category-item-wrapper ${selectedCategoryId === category.id.toString() ? 'active' : ''}`}>
                <div 
                  className="category-item"
                  onClick={() => setSelectedCategoryId(category.id.toString())}
                >
                  <img 
                    src={category.imageUrl 
                      ? `${API_BASE_URL}${category.imageUrl}` 
                      : '/placeholder-image.svg'}
                    alt={category.name} 
                    className="category-image"
                    onError={(e) => {e.currentTarget.src = '/placeholder-image.svg'}}
                  />
                  <p className="category-name text-truncate w-100">{category.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Combined Search and Sort */}
      <div className="mb-4">
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={7}>
            <InputGroup className="shadow-sm rounded overflow-hidden">
              <Form.Control
                id="productSearch"
                type="search"
                placeholder="Search products by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search Products"
                className="border-end-0"
              />
              <Form.Select
                id="productSort"
                size="sm"
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                aria-label="Sort products by"
                className="flex-grow-0 border-start-0"
                style={{ minWidth: '130px', maxWidth: '180px' }}
              >
                <option value="createdAt-desc">Newest</option>
                <option value="price-asc">Price: Low-High</option>
                <option value="price-desc">Price: High-Low</option>
                <option value="name-asc">Name: A-Z</option>
                <option value="name-desc">Name: Z-A</option>
              </Form.Select>
            </InputGroup>
          </Col>
        </Row>
      </div>
      
      {/* Product Listing */}
      {isLoading && (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading products...</span>
          </Spinner>
        </div>
      )}
      
      {error && (
        <Alert variant="danger" className="my-3">
          {error}
        </Alert>
      )}
      
      {!isLoading && !error && (
        <>
          {totalProducts > 0 && (
            <p className="text-muted mb-3">
              {totalProducts === 1 
                ? 'Found 1 product'
                : `Found ${totalProducts} products`}
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          )}
          
          <Row className="g-3 my-3">
            {products.length === 0 ? (
              <Col>
                <p>No products available at the moment.</p>
              </Col>
            ) : (
              products.map((product) => (
                <Col key={product.id} xs={6} md={4} lg={3} className="d-flex">
                  <Card className="w-100 shadow-sm product-card">
                    <Link to={`/product/${product.id}`} className="text-decoration-none text-reset">
                      <div className="position-relative">
                        {((product.images && product.images.length > 0) || product.imageUrl) ? (
                          <Card.Img 
                            variant="top" 
                            src={
                              product.images && product.images.length > 0
                                ? (product.images[0].url.startsWith('/uploads/') 
                                  ? `${UPLOADS_URL}${product.images[0].url.substring(8)}`
                                  : product.images[0].url.startsWith('http')
                                    ? product.images[0].url
                                    : `${API_BASE_URL}${product.images[0].url}`)
                                : (product.imageUrl?.startsWith('/uploads/')
                                  ? `${UPLOADS_URL}${product.imageUrl.substring(8)}`
                                  : product.imageUrl?.startsWith('http')
                                    ? product.imageUrl
                                    : `${API_BASE_URL}${product.imageUrl || ''}`)
                            } 
                            alt={product.name}
                            style={{ height: '160px', objectFit: 'cover' }}
                            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                              if (e.currentTarget.src !== '/placeholder-image.svg') {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/placeholder-image.svg';
                              }
                            }}
                          />
                        ) : (
                          <Card.Img 
                            variant="top" 
                            src="/placeholder-image.svg"
                            alt={product.name}
                            style={{ height: '160px', objectFit: 'cover' }}
                          />
                        )}
                        
                        {/* Wishlist button */}
                        <Button
                          variant="light"
                          size="sm"
                          className="position-absolute top-0 end-0 m-2 rounded-circle p-1"
                          style={{ width: '30px', height: '30px' }}
                          onClick={(e) => handleToggleWishlist(e, product)}
                          aria-label={isWishlisted(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                        >
                          {isWishlisted(product.id) ? (
                            <FaHeart className="text-danger" />
                          ) : (
                            <FaRegHeart />
                          )}
                        </Button>
                      </div>
                      <Card.Body className="p-2 p-md-3 text-center">
                        <Card.Title className="h6 text-dark mb-2 text-truncate">{product.name}</Card.Title>
                        <Card.Subtitle className="mb-2 product-price">€{product.price.toFixed(2)}</Card.Subtitle>
                        
                        {/* Display Rating */}
                        {product.averageRating !== undefined && product.averageRating !== null && (
                          <div className="d-flex align-items-center justify-content-center mb-1">
                            <StarRating rating={product.averageRating} />
                            <small className="ms-1 text-muted">
                              ({product.reviewCount ?? 0})
                            </small>
                          </div>
                        )}
                        
                        <Card.Text className="text-muted small d-none d-sm-block text-truncate mb-0">
                          {product.description || ''}
                        </Card.Text>
                      </Card.Body>
                    </Link>
                  </Card>
                </Col>
              ))
            )}
          </Row>
          
          {/* Pagination Controls */}
          <PaginationControls />
        </>
      )}
    </Container>
  );
};

export default HomePage; 