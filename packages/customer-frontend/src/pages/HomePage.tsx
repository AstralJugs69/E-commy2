import React, { useState, useEffect, useRef, MouseEvent as ReactMouseEvent } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge, Form, Pagination } from 'react-bootstrap';
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
import { getImageUrl } from '../utils/imageUrl';

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
  const [showSortOptions, setShowSortOptions] = useState(false);
  
  // Create ref for the dropdown container
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Function to handle sort selection
  const handleSortChange = (field: string, order: string) => {
    setSortBy(field);
    setSortOrder(order);
    setShowSortOptions(false);
  };

  // Toggle sort options dropdown
  const toggleSortOptions = () => {
    setShowSortOptions(prev => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setShowSortOptions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch products when search term, category filter, or sort changes - reset to page 1
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    fetchProducts(1);
  }, [searchTerm, selectedCategoryId, sortBy, sortOrder]); // Re-fetch when filters or sort changes

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
      
      // Ensure we have valid data before updating state
      if (response.data && response.data.products) {
        // Update state with paginated response data
        setProducts(response.data.products || []);
        setCurrentPage(response.data.currentPage || 1);
        setTotalPages(response.data.totalPages || 1);
        setTotalProducts(response.data.totalProducts || 0);
        
        console.log(`Loaded page ${response.data.currentPage || 1} of ${response.data.totalPages || 1}`);
      } else {
        console.error('Invalid product data received:', response.data);
        setProducts([]);
        setCurrentPage(1);
        setTotalPages(1);
        setTotalProducts(0);
        setError('Invalid data received from server');
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const errorMessage = err.response.data.message || 'Failed to fetch products';
        setError(errorMessage);
        console.error('Error fetching products:', err.response.data);
      } else {
        setError('Network error. Please check your connection.');
        console.error('Network error:', err);
      }
      // Set empty defaults in case of error
      setProducts([]);
      setCurrentPage(1);
      setTotalPages(1);
      setTotalProducts(0);
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

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
            
      try {
        const response = await axios.get(`${API_BASE_URL}/categories`);
        // Ensure response.data is an array
        if (Array.isArray(response.data)) {
          setCategories(response.data);
        } else {
          console.error('Expected array for categories data, got:', response.data);
          setCategories([]);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategories([]);
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
            let pageNum = 1; // Default to page 1 if calculations fail
            
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
                    src={getImageUrl(category.imageUrl)} 
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
      
      {/* Search and Sort Controls */}
      <Row className="justify-content-center mb-4">
        <Col xs={12} md={8} lg={7}>
          <div className="d-flex align-items-stretch shadow-sm rounded">
            {/* Search Input - 65% width */}
            <div style={{ width: "65%" }}>
              <Form.Control
                id="productSearch"
                type="search"
                placeholder="Search products by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search Products"
                size="sm"
                className="h-100 border-0 rounded-0"
              />
            </div>
            
            {/* Custom Sort Dropdown - 35% width */}
            <div 
              ref={sortDropdownRef}
              className="position-relative" 
              style={{ width: "35%" }}
            >
              <div 
                role="button"
                tabIndex={0}
                onClick={toggleSortOptions}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    toggleSortOptions();
                  }
                }}
                className="h-100 d-flex align-items-center justify-content-between px-3"
                style={{ 
                  backgroundColor: '#f8f9fa',
                  cursor: 'pointer',
                  userSelect: 'none',
                  color: '#000000'
                }}
              >
                <span style={{ fontSize: '0.85rem' }}>
                  {sortBy === 'createdAt' && sortOrder === 'desc' && 'Newest'}
                  {sortBy === 'price' && sortOrder === 'asc' && 'Price: Low-High'}
                  {sortBy === 'price' && sortOrder === 'desc' && 'Price: High-Low'}
                  {sortBy === 'name' && sortOrder === 'asc' && 'Name: A-Z'}
                  {sortBy === 'name' && sortOrder === 'desc' && 'Name: Z-A'}
                </span>
                <span style={{ fontSize: '0.7rem', marginLeft: '4px' }}>▼</span>
              </div>
              
              {showSortOptions && (
                <div 
                  className="position-absolute top-100 start-0 end-0 py-1 shadow-sm animate-dropdown"
                  style={{ 
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CCCCCC',
                    zIndex: 1050
                  }}
                >
                  <div 
                    role="button" 
                    tabIndex={0}
                    className="px-3 py-1"
                    onClick={() => handleSortChange('createdAt', 'desc')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleSortChange('createdAt', 'desc');
                      }
                    }}
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: sortBy === 'createdAt' && sortOrder === 'desc' ? '#f0f0f0' : 'transparent',
                      fontWeight: sortBy === 'createdAt' && sortOrder === 'desc' ? 'bold' : 'normal',
                      fontSize: '0.85rem'
                    }}
                  >
                    Newest
                  </div>
                  <div 
                    role="button" 
                    tabIndex={0}
                    className="px-3 py-1"
                    onClick={() => handleSortChange('price', 'asc')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleSortChange('price', 'asc');
                      }
                    }}
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: sortBy === 'price' && sortOrder === 'asc' ? '#f0f0f0' : 'transparent',
                      fontWeight: sortBy === 'price' && sortOrder === 'asc' ? 'bold' : 'normal',
                      fontSize: '0.85rem'
                    }}
                  >
                    Price: Low-High
                  </div>
                  <div 
                    role="button" 
                    tabIndex={0}
                    className="px-3 py-1"
                    onClick={() => handleSortChange('price', 'desc')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleSortChange('price', 'desc');
                      }
                    }}
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: sortBy === 'price' && sortOrder === 'desc' ? '#f0f0f0' : 'transparent',
                      fontWeight: sortBy === 'price' && sortOrder === 'desc' ? 'bold' : 'normal',
                      fontSize: '0.85rem'
                    }}
                  >
                    Price: High-Low
                  </div>
                  <div 
                    role="button" 
                    tabIndex={0}
                    className="px-3 py-1"
                    onClick={() => handleSortChange('name', 'asc')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleSortChange('name', 'asc');
                      }
                    }}
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: sortBy === 'name' && sortOrder === 'asc' ? '#f0f0f0' : 'transparent',
                      fontWeight: sortBy === 'name' && sortOrder === 'asc' ? 'bold' : 'normal',
                      fontSize: '0.85rem'
                    }}
                  >
                    Name: A-Z
                  </div>
                  <div 
                    role="button" 
                    tabIndex={0}
                    className="px-3 py-1"
                    onClick={() => handleSortChange('name', 'desc')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleSortChange('name', 'desc');
                      }
                    }}
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: sortBy === 'name' && sortOrder === 'desc' ? '#f0f0f0' : 'transparent',
                      fontWeight: sortBy === 'name' && sortOrder === 'desc' ? 'bold' : 'normal',
                      fontSize: '0.85rem'
                    }}
                  >
                    Name: Z-A
                  </div>
                </div>
              )}
            </div>
          </div>
        </Col>
      </Row>
      
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
                            src={getImageUrl(
                              product.images && product.images.length > 0
                                ? product.images[0].url
                                : product.imageUrl
                            )} 
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