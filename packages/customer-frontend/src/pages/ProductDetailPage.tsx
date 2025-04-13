import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Image, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

// Define interface for product data matching backend response
interface Product {
  id: number;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  stock: number;
  createdAt: string;
}

const API_BASE_URL = 'http://localhost:3001/api';

const ProductDetailPage = () => {
  // State
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Hooks
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
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
        const response = await axios.get(`${API_BASE_URL}/products/${productId}`);
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
  
  // Handle adding product to cart
  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      toast.success(`${product.name} added to cart!`);
    }
  };
  
  // Handle back button click
  const handleBackClick = () => {
    navigate(-1); // Go back to previous page
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading product details...</span>
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
        <Button variant="secondary" onClick={handleBackClick}>
          Back to Products
        </Button>
      </Container>
    );
  }
  
  // Render product not found
  if (!product) {
    return (
      <Container className="py-3">
        <Alert variant="warning">
          Product not found or has been removed.
        </Alert>
        <Button variant="secondary" onClick={handleBackClick}>
          Back to Products
        </Button>
      </Container>
    );
  }
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Check if product is new (less than 14 days old)
  const isNewProduct = () => {
    const createdDate = new Date(product.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 14;
  };
  
  // Render product details
  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <Button variant="secondary" onClick={handleBackClick} className="mb-3">
            &larr; Back to Products
          </Button>
        </Col>
      </Row>
      
      <Row className="mb-4">
        {/* Product Image Column */}
        <Col md={6} className="mb-3 mb-md-0">
          <div className="position-relative">
            {product.imageUrl ? (
              <Image 
                src={product.imageUrl} 
                alt={product.name}
                fluid 
                rounded 
                className="product-image shadow-sm"
                style={{ maxHeight: '400px', width: '100%', objectFit: 'contain' }}
              />
            ) : (
              <div 
                className="rounded shadow-sm d-flex align-items-center justify-content-center bg-light"
                style={{ height: '400px', width: '100%' }}
              >
                <span className="text-muted">No image available</span>
              </div>
            )}
            {isNewProduct() && (
              <Badge 
                bg="info" 
                className="position-absolute top-0 start-0 m-2"
              >
                New!
              </Badge>
            )}
          </div>
        </Col>
        
        {/* Product Details Column */}
        <Col md={6}>
          <h1 className="mb-2">{product.name}</h1>
          
          <h2 className="text-primary mb-3">€{product.price.toFixed(2)}</h2>
          
          <div className="mb-3">
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
          
          <div className="mb-4">
            <p className="text-muted small">Added on {formatDate(product.createdAt)}</p>
          </div>
          
          <div className="mb-4">
            <h5>Description</h5>
            <p>{product.description || 'No description available.'}</p>
          </div>
          
          <Button 
            variant="primary" 
            size="lg" 
            className="w-100 mb-3"
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
          >
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetailPage; 