import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Button, Spinner, Alert, Card } from 'react-bootstrap';
import { formatCurrency } from '../utils/formatters';

interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  stock?: number;
  imageUrl?: string;
  category?: {
    id: number;
    name: string;
  };
}

const API_BASE_URL = 'http://localhost:3001';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('Authentication required. Please log in again.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/products/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProduct(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          if (err.response.status === 404) {
            setError(`Product #${id} not found.`);
          } else {
            setError(err.response.data.message || 'Failed to fetch product details.');
          }
          console.error('Error fetching product:', err.response.data);
        } else {
          setError('Network error. Please check your connection.');
          console.error('Network error:', err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleGoBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading product details...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={handleGoBack} className="mt-3">
          Back to Products
        </Button>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="my-5">
        <Alert variant="warning">Product not found.</Alert>
        <Button variant="secondary" onClick={handleGoBack} className="mt-3">
          Back to Products
        </Button>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Row>
        <Col xs={12} md={5} className="mb-4">
          <Card>
            <Card.Img 
              src={product.imageUrl 
                ? (product.imageUrl.startsWith('/') ? `${API_BASE_URL}${product.imageUrl}` : product.imageUrl)
                : '/placeholder-product.jpg'} 
              alt={product.name}
              style={{ height: '300px', objectFit: 'cover' }}
            />
          </Card>
        </Col>
        <Col xs={12} md={7}>
          <h1>{product.name}</h1>
          {product.category && (
            <p className="text-muted">Category: {product.category.name}</p>
          )}
          <h2 className="text-primary mb-3">{formatCurrency(product.price)}</h2>
          
          <div className="mb-4">
            <h3 className="h5">Description</h3>
            <p>{product.description || 'No description available.'}</p>
          </div>
          
          <div className="mb-4">
            <h3 className="h5">Inventory</h3>
            <p>Stock: {product.stock !== undefined ? product.stock : 'Not tracked'}</p>
          </div>
          
          <Button variant="secondary" onClick={handleGoBack}>
            Back to Products
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetailPage; 