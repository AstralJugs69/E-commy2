import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:3001/api';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  stock: number;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
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
  );
};

export default ProductCard; 