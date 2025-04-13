import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';
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

const API_BASE_URL = 'http://localhost:3001/api';

const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart(); // Get addToCart function from context

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/products`);
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

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <Container className="py-3">
      <h2 className="mb-4">Our Products</h2>
      
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
        <Row xs={1} sm={2} md={3} lg={4} className="g-4 my-3">
          {products.length === 0 ? (
            <Col>
              <p>No products available at the moment.</p>
            </Col>
          ) : (
            products.map((product) => (
              <Col key={product.id}>
                <Card className="h-100 shadow-sm">
                  <Link to={`/product/${product.id}`} className="text-decoration-none">
                    {product.imageUrl ? (
                      <div className="position-relative">
                        <Card.Img 
                          variant="top" 
                          src={product.imageUrl} 
                          alt={product.name}
                          style={{ height: '180px', objectFit: 'cover' }}
                        />
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
                    ) : (
                      <div className="position-relative" style={{ height: '180px', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="text-muted">No image available</span>
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
                    )}
                    <Card.Body className="d-flex flex-column">
                      <Card.Title className="text-dark">{product.name}</Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">€{product.price.toFixed(2)}</Card.Subtitle>
                      <Card.Text className="text-muted small">{product.description || ''}</Card.Text>
                    </Card.Body>
                  </Link>
                  <Card.Footer className="bg-white border-0 pt-0">
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