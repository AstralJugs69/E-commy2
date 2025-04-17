import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

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
  hideAddToCart?: boolean;
  disableInternalLink?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  hideAddToCart = false,
  disableInternalLink = false 
}) => {
  const { addOrUpdateItemQuantity } = useCart();

  const handleAddToCart = (product: Product) => {
    addOrUpdateItemQuantity(product.id, 1).catch(error => {
      console.error('Error adding to cart:', error);
    });
  };

  return (
    <Card className="h-100 shadow-sm mb-2 product-card">
      <div className="position-relative">
        {product.imageUrl ? (
          <Card.Img 
            variant="top" 
            src={`${API_BASE_URL}${product.imageUrl}`} 
            alt={product.name}
            style={{ height: '180px', objectFit: 'cover' }}
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
      {disableInternalLink ? (
        <Card.Body className="d-flex flex-column p-3 text-center">
          <Card.Title className="text-dark mb-2 product-title">{product.name}</Card.Title>
          <Card.Subtitle className="mb-2 product-price">€{product.price.toFixed(2)}</Card.Subtitle>
          <Card.Text className="text-muted small flex-grow-1 d-none d-sm-block">{product.description || ''}</Card.Text>
        </Card.Body>
      ) : (
        <Link to={`/product/${product.id}`} className="text-decoration-none">
          <Card.Body className="d-flex flex-column p-3 text-center">
            <Card.Title className="text-dark mb-2 product-title">{product.name}</Card.Title>
            <Card.Subtitle className="mb-2 product-price">€{product.price.toFixed(2)}</Card.Subtitle>
            <Card.Text className="text-muted small flex-grow-1 d-none d-sm-block">{product.description || ''}</Card.Text>
          </Card.Body>
        </Link>
      )}
      {!hideAddToCart && (
        <Card.Footer className="bg-white border-0 pt-0 p-3 text-center">
          <Button 
            variant="primary" 
            className="w-100 rounded-pill"
            onClick={() => handleAddToCart(product)}
            disabled={product.stock <= 0}
          >
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </Card.Footer>
      )}
    </Card>
  );
};

export default ProductCard; 