import React, { useState, useEffect } from 'react';
import { Container, Form, Row, Col, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaArrowLeft, FaMinus, FaPlus } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { getImageUrl } from '../utils/imageUrl';

const CartPage = () => {
  const { cartItems, updateCartItemQuantity, removeFromCart, clearCart, getCartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isQuantityUpdating, setIsQuantityUpdating] = useState<number | null>(null);
  
  const cartIsEmpty = cartItems.length === 0;
  
  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to checkout');
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };
  
  // Helper function to format currency
  const formatCurrency = (value: number): string => {
    return `€${value.toFixed(2)}`;
  };
  
  // Enhanced update function with optimistic UI update and error handling
  const handleQuantityUpdate = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return; // Don't allow quantities below 1
    
    setIsQuantityUpdating(itemId);
    try {
      await updateCartItemQuantity(itemId, newQuantity);
    } catch (error) {
      toast.error('Failed to update quantity');
      console.error('Error updating quantity:', error);
    } finally {
      setIsQuantityUpdating(null);
    }
  };
  
  // If not authenticated, show a message and login button
  if (!isAuthenticated) {
    return (
      <Container className="py-4">
        <h2 className="mb-4 fw-semibold">Your Shopping Cart</h2>
        <Card className="shadow-sm border-0 mb-4">
          <Card.Body className="p-5 text-center">
            <div className="empty-state">
              <div className="empty-state-icon mb-4">
                <FaTrash size={40} />
              </div>
              <h3 className="empty-state-text mb-3">Your cart is empty</h3>
              <p className="text-muted mb-4">Add some products to your cart and they will appear here.</p>
              <Link to="/" className="btn btn-primary rounded-pill px-4 py-2">
                Start Shopping
              </Link>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      <h2 className="mb-4 fw-semibold">Your Shopping Cart</h2>
      
      {cartIsEmpty ? (
        <Card className="shadow-sm border-0 mb-4">
          <Card.Body className="p-5 text-center">
            <div className="empty-state">
              <div className="empty-state-icon mb-4">
                <FaTrash size={40} />
              </div>
              <h3 className="empty-state-text mb-3">Your cart is empty</h3>
              <p className="text-muted mb-4">Add some products to your cart and they will appear here.</p>
              <Link to="/" className="btn btn-primary rounded-pill px-4 py-2">
                Start Shopping
              </Link>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <>
          {/* Cart Items */}
          <div className="mb-4">
            {cartItems.map(item => (
              <Card key={item.id} className="mb-3 shadow-sm border-0">
                <Card.Body className="p-3">
                  <Row className="align-items-center">
                    {/* Image Col */}
                    <Col xs={3} sm={2}>
                      <img 
                        src={getImageUrl(item.images?.[0]?.url || item.imageUrl)}
                        alt={item.name}
                        className="img-fluid rounded"
                        style={{ maxHeight: '70px', objectFit: 'cover', width: '100%' }}
                      />
                    </Col>
                    
                    {/* Name Col */}
                    <Col xs={6} sm={7}>
                      <h6 className="mb-1">{item.name}</h6>
                      <div className="text-muted small mb-2">{formatCurrency(item.price)} each</div>
                      
                      {/* Quantity Controls - Mobile Only */}
                      <div className="d-sm-none">
                        <div className="d-flex align-items-center">
                          <Button
                            variant="light"
                            size="sm"
                            className="border rounded-start p-0"
                            style={{ width: '24px', height: '24px' }}
                            onClick={() => {
                              const newQuantity = Math.max(1, item.quantity - 1);
                              handleQuantityUpdate(item.id, newQuantity);
                            }}
                            disabled={isQuantityUpdating === item.id}
                          >
                            -
                          </Button>
                          <Form.Control
                            type="number"
                            size="sm"
                            min={1}
                            max={item.stock}
                            value={item.quantity}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const newQuantityStr = e.target.value;
                              const newQuantity = newQuantityStr === '' ? 0 : parseInt(newQuantityStr, 10);
                              
                              if (!isNaN(newQuantity)) {
                                handleQuantityUpdate(item.id, newQuantity);
                              }
                            }}
                            style={{ width: '35px', textAlign: 'center', borderRadius: 0, height: '24px', padding: '0' }}
                            className="border-start-0 border-end-0"
                            disabled={isQuantityUpdating === item.id}
                          />
                          <Button
                            variant="light"
                            size="sm"
                            className="border rounded-end p-0"
                            style={{ width: '24px', height: '24px' }}
                            onClick={() => {
                              const newQuantity = Math.min(item.stock, item.quantity + 1);
                              handleQuantityUpdate(item.id, newQuantity);
                            }}
                            disabled={isQuantityUpdating === item.id}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </Col>
                    
                    {/* Quantity Col - Desktop Only */}
                    <Col xs={3} className="d-none d-sm-block">
                      <div className="d-flex align-items-center">
                        <Button
                          variant="light"
                          size="sm"
                          className="border rounded-start p-0"
                          style={{ width: '24px', height: '24px' }}
                          onClick={() => {
                            const newQuantity = Math.max(1, item.quantity - 1);
                            handleQuantityUpdate(item.id, newQuantity);
                          }}
                          disabled={isQuantityUpdating === item.id}
                        >
                          -
                        </Button>
                        <Form.Control
                          type="number"
                          size="sm"
                          min={1}
                          max={item.stock}
                          value={item.quantity}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const newQuantityStr = e.target.value;
                            const newQuantity = newQuantityStr === '' ? 0 : parseInt(newQuantityStr, 10);
                            
                            if (!isNaN(newQuantity)) {
                              handleQuantityUpdate(item.id, newQuantity);
                            }
                          }}
                          style={{ width: '35px', textAlign: 'center', borderRadius: 0, height: '24px', padding: '0' }}
                          className="border-start-0 border-end-0"
                          disabled={isQuantityUpdating === item.id}
                        />
                        <Button
                          variant="light"
                          size="sm"
                          className="border rounded-end p-0"
                          style={{ width: '24px', height: '24px' }}
                          onClick={() => {
                            const newQuantity = Math.min(item.stock, item.quantity + 1);
                            handleQuantityUpdate(item.id, newQuantity);
                          }}
                          disabled={isQuantityUpdating === item.id}
                        >
                          +
                        </Button>
                      </div>
                    </Col>
                    {/* Price/Remove Col */}
                    <Col xs={3} sm={3} className="text-end">
                      <div className="fw-semibold small mb-2">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        className="rounded-pill px-2 py-1"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <FaTrash />
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}
          </div>

          {/* Summary and Buttons Section (Visible on all sizes) */}
          <Card className="mb-4 shadow-sm border-0">
            <Card.Body className="p-4">
              <h4 className="mb-4 fw-semibold text-end">Total: {formatCurrency(getCartTotal())}</h4>
              <div className="d-grid gap-3 d-md-flex justify-content-md-end">
                <Button 
                  variant="outline-danger" 
                  className="rounded-pill px-4 py-2 fw-medium" 
                  onClick={() => clearCart()}
                >
                  Clear Cart
                </Button>
                <Link 
                  to="/" 
                  className="btn btn-secondary rounded-pill px-4 py-2 fw-medium"
                >
                  Continue Shopping
                </Link>
                <Button 
                  variant="primary" 
                  className="rounded-pill px-4 py-2 fw-medium" 
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
};

export default CartPage; 