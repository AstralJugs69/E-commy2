import React, { useState } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';
import { FaMinus, FaPlus, FaShoppingCart } from 'react-icons/fa';
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
  stock: number;
  discountPercentage: number;
  category: string;
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
  const [hover, setHover] = React.useState(false);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  const calculateDiscountedPrice = () => {
    if (product.discountPercentage && product.discountPercentage > 0) {
      const discountAmount = (product.price * product.discountPercentage) / 100;
      return (product.price - discountAmount).toFixed(2);
    }
    return product.price.toFixed(2);
  };

  const handleAddToCart = (product: Product) => {
    addOrUpdateItemQuantity(product.id, quantity)
      .then(() => {
        toast.success('Added to cart');
      })
      .catch(error => {
        console.error('Error adding to cart:', error);
        toast.error('Failed to add to cart');
      });
  };

  // Get the first image URL if available
  const imageUrl = product.images && product.images.length > 0 ? product.images[0].url : null;

  return (
    <Card className="h-100 product-card shadow-sm border-0 transition-hover">
      <div className="product-image-wrapper position-relative">
        <Card.Img
          variant="top"
          src={getImageUrl(imageUrl)}
          alt={product.name}
          className="product-image"
          onClick={() => navigate(`/products/${product.id}`)}
        />
        {product.discountPercentage > 0 && (
          <Badge 
            bg="danger" 
            className="position-absolute top-0 end-0 m-2 py-2 px-3 rounded-pill fs-6 fw-medium"
          >
            {product.discountPercentage}% OFF
          </Badge>
        )}
      </div>
      <Card.Body className="d-flex flex-column p-3">
        <Card.Title 
          className="product-name mb-2 fw-semibold" 
          onClick={() => navigate(`/products/${product.id}`)}
        >
          {product.name}
        </Card.Title>
        <div className="mb-3">
          <span className="text-muted small">{product.category}</span>
        </div>
        <div className="d-flex align-items-center mb-3">
          {product.discountPercentage > 0 ? (
            <>
              <span className="text-danger fw-bold fs-5">₹{calculateDiscountedPrice()}</span>
              <span className="text-muted text-decoration-line-through ms-2">
                ₹{product.price.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="fw-bold fs-5">₹{product.price.toFixed(2)}</span>
          )}
        </div>
        <div className="mt-auto">
          <div className="d-flex gap-3 align-items-center">
            <div className="quantity-control d-flex align-items-center border rounded">
              <Button
                variant="light"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="border-0 py-1 px-2"
              >
                <FaMinus />
              </Button>
              <span className="px-3">{quantity}</span>
              <Button
                variant="light"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
                className="border-0 py-1 px-2"
              >
                <FaPlus />
              </Button>
            </div>
            <Button
              variant="primary"
              className="flex-grow-1 rounded-pill py-2 px-4"
              onClick={() => handleAddToCart(product)}
            >
              <FaShoppingCart className="me-2" /> Add
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard; 