import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge, Form, ButtonGroup, ToggleButton } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  stock: number;
}

interface Category {
  id: number;
  name: string;
}

const API_BASE_URL = 'http://localhost:3001/api';

const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { addToCart } = useCart(); // Get addToCart function from context
  
  // Category state
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(''); // '' means All
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(true);

  const fetchProducts = async () => {
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
      const queryString = params.toString();
      const apiUrl = `${API_BASE_URL}/products${queryString ? `?${queryString}` : ''}`;

      console.log(`Fetching products from ${apiUrl}`);
      const response = await axios.get(apiUrl);
      setProducts(response.data);
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

  // Fetch products when search term or category filter changes
  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategoryId]); // Re-fetch when filters change

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

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Our Products</h2>
      
      {/* Category Filter */}
      <div className="mb-4">
        <h5 className="mb-3">Categories</h5>
        {isLoadingCategories ? (
          <Spinner animation="border" size="sm" />
        ) : (
          <ButtonGroup size="sm" className="flex-wrap">
            <ToggleButton
              key="all-cats"
              id="cat-all"
              type="radio"
              variant="outline-secondary"
              name="categoryFilter"
              value=""
              checked={selectedCategoryId === ''}
              onChange={(e) => setSelectedCategoryId(e.currentTarget.value)}
              className="me-2 mb-2"
            >
              All
            </ToggleButton>
            {categories.map((category) => (
              <ToggleButton
                key={category.id}
                id={`cat-${category.id}`}
                type="radio"
                variant="outline-secondary"
                name="categoryFilter"
                value={category.id.toString()}
                checked={selectedCategoryId === category.id.toString()}
                onChange={(e) => setSelectedCategoryId(e.currentTarget.value)}
                className="me-2 mb-2"
              >
                {category.name}
              </ToggleButton>
            ))}
          </ButtonGroup>
        )}
      </div>
      
      <Row className="mb-4">
        <Col md={6} lg={4}>
          <Form.Group controlId="productSearch">
            <Form.Label visuallyHidden>Search Products</Form.Label>
            <Form.Control
              type="search"
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>
      
      {isLoading && (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading products...</span>
          </Spinner>
        </div>
      )}
      
      {error && (
        <Alert variant="danger" className="my-4">
          {error}
        </Alert>
      )}
      
      {!isLoading && !error && (
        <Row xs={1} sm={2} md={3} lg={4} className="g-4 mb-4">
          {products.length === 0 ? (
            <Col>
              <p>No products available at the moment.</p>
            </Col>
          ) : (
            products.map((product) => (
              <Col key={product.id}>
                <Card className="h-100 shadow-sm mb-2">
                  <div className="position-relative">
                    {product.imageUrl ? (
                      <Card.Img 
                        variant="top" 
                        src={`${API_BASE_URL}${product.imageUrl}`} 
                        alt={product.name}
                        style={{ height: '180px', objectFit: 'cover' }}
                      />
                    ) : (
                      <Card.Img 
                        variant="top" 
                        src="/placeholder-image.svg"
                        alt={product.name}
                        style={{ height: '180px', objectFit: 'cover' }}
                      />
                    )}
                    {product.stock > 0 ? (
                      <Badge 
                        bg={product.stock > 10 ? "success" : "warning"} 
                        className="position-absolute top-0 end-0 m-2"
                      >
                        {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left`}
                      </Badge>
                    ) : (
                      <Badge 
                        bg="danger" 
                        className="position-absolute top-0 end-0 m-2"
                      >
                        Out of Stock
                      </Badge>
                    )}
                  </div>
                  <Link to={`/product/${product.id}`} className="text-decoration-none">
                    <Card.Body className="d-flex flex-column p-3">
                      <Card.Title className="text-dark mb-2">{product.name}</Card.Title>
                      <Card.Subtitle className="mb-3 text-muted">€{product.price.toFixed(2)}</Card.Subtitle>
                      <Card.Text className="text-muted small flex-grow-1">{product.description || ''}</Card.Text>
                    </Card.Body>
                  </Link>
                  <Card.Footer className="bg-white border-0 pt-0 p-3">
                    <Button 
                      variant="primary" 
                      className="w-100"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock <= 0}
                    >
                      {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            ))
          )}
        </Row>
      )}
    </Container>
  );
};

export default HomePage; 