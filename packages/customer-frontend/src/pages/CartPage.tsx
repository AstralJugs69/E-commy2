import React, { useState, useEffect } from 'react';
import { Container, Form, Row, Col, Button, Card, Spinner, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { getImageUrl } from '../utils/imageUrl';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const CartPage = () => {
  const { t } = useTranslation();
  const { cartItems, updateCartItemQuantity, removeFromCart, clearCart, getCartTotal, fetchCart, isLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);
  const [inputValues, setInputValues] = useState<Record<number, string>>({});
  const [pendingUpdate, setPendingUpdate] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Initialize input values from cart items
  useEffect(() => {
    const initialValues: Record<number, string> = {};
    cartItems.forEach(item => {
      initialValues[item.id] = item.quantity.toString();
    });
    setInputValues(initialValues);
  }, [cartItems]);
  
  // Force refresh cart after updates
  useEffect(() => {
    if (pendingUpdate) {
      const refreshTimer = setTimeout(() => {
        fetchCart().then(() => {
          setPendingUpdate(false);
        });
      }, 300);
      
      return () => clearTimeout(refreshTimer);
    }
  }, [pendingUpdate, fetchCart]);
  
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
  
  // Handle input change (update local state only)
  const handleInputChange = (itemId: number, value: string) => {
    setErrorMessage(null); // Clear any previous errors
    setInputValues(prev => ({
      ...prev,
      [itemId]: value
    }));
  };
  
  // Extract error message from Axios error
  const getErrorMessage = (error: any): string => {
    let message = 'Failed to update quantity.';
    
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.data && error.response.data.message) {
        message = error.response.data.message;
      } else if (error.response.data && typeof error.response.data === 'string') {
        message = error.response.data;
      }
    }
    
    return message;
  };
  
  // Handle quantity update (send to server)
  const handleQuantityUpdate = async (itemId: number, value: string, stockLimit: number) => {
    const newQuantity = value === '' ? 1 : parseInt(value, 10);
    
    if (isNaN(newQuantity)) {
      // Reset to current value in cart
      const currentItem = cartItems.find(item => item.id === itemId);
      if (currentItem) {
        setInputValues(prev => ({
          ...prev,
          [itemId]: currentItem.quantity.toString()
        }));
      }
      return;
    }
    
    // Clear previous errors
    setErrorMessage(null);
    
    // Client-side validation
    if (newQuantity < 1) {
      const errorMsg = 'Quantity cannot be less than 1';
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      
      // Reset to 1
      setInputValues(prev => ({
        ...prev,
        [itemId]: '1'
      }));
      return;
    }
    
    // Simple stock check
    if (newQuantity > stockLimit) {
      const errorMsg = `Cannot add more than available stock (${stockLimit})`;
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      
      // Reset to stock limit
      setInputValues(prev => ({
        ...prev,
        [itemId]: stockLimit.toString()
      }));
      return;
    }
    
    // Get the current item
    const currentItem = cartItems.find(item => item.id === itemId);
    
    // Skip update if quantity hasn't changed
    if (currentItem && currentItem.quantity === newQuantity) return;
    
    setUpdatingItemId(itemId);
    
    try {
      await updateCartItemQuantity(itemId, newQuantity);
      setPendingUpdate(true);
      
      // Immediately update the local input value to the new quantity
      setInputValues(prev => ({
        ...prev,
        [itemId]: newQuantity.toString()
      }));
    } catch (error) {
      console.error('Error updating quantity:', error);
      
      // Get and display the error message
      const errorMsg = getErrorMessage(error);
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      
      // Reset to the server's current value
      await fetchCart(); // Force refresh from server
      
      // Then update the input value
      const refreshedItem = cartItems.find(item => item.id === itemId);
      if (refreshedItem) {
        setInputValues(prev => ({
          ...prev,
          [itemId]: refreshedItem.quantity.toString()
        }));
      }
    } finally {
      setUpdatingItemId(null);
    }
  };
  
  // Handle key press to submit on Enter
  const handleKeyPress = (e: React.KeyboardEvent<HTMLElement>, itemId: number, stockLimit: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const target = e.target as HTMLInputElement;
      handleQuantityUpdate(itemId, target.value, stockLimit);
      target.blur();
    }
  };
  
  // If not authenticated, show a message to login
  if (!isAuthenticated) {
    return (
      <Container className="py-4">
        <h2 className="mb-4 fw-semibold">{t('cart.title')}</h2>
        <Card className="shadow-sm border-0 mb-4">
          <Card.Body className="p-5 text-center">
            <div className="empty-state">
              <div className="empty-state-icon mb-4">
                <FaTrash size={40} />
              </div>
              <h3 className="empty-state-text mb-3">{t('cart.emptyCart')}</h3>
              <p className="text-muted mb-4">{t('cart.emptyCartMessage')}</p>
              <Link to="/" className="btn btn-primary rounded-pill px-4 py-2">
                {t('cart.startShopping')}
              </Link>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }
  
  // Show loading state while fetching cart
  if (isLoading && cartItems.length === 0) {
    return (
      <Container className="py-4 text-center">
        <h2 className="mb-4 fw-semibold">{t('cart.title')}</h2>
        <Spinner animation="border" role="status" className="my-5">
          <span className="visually-hidden">{t('common.loading')}</span>
        </Spinner>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      <h2 className="mb-4 fw-semibold">{t('cart.title')}</h2>
      
      {errorMessage && (
        <Alert variant="danger" className="mb-3" onClose={() => setErrorMessage(null)} dismissible>
          {errorMessage}
        </Alert>
      )}
      
      {cartIsEmpty ? (
        <Card className="shadow-sm border-0 mb-4">
          <Card.Body className="p-5 text-center">
            <div className="empty-state">
              <div className="empty-state-icon mb-4">
                <FaTrash size={40} />
              </div>
              <h3 className="empty-state-text mb-3">{t('cart.emptyCart')}</h3>
              <p className="text-muted mb-4">{t('cart.emptyCartMessage')}</p>
              <Link to="/" className="btn btn-primary rounded-pill px-4 py-2">
                {t('cart.startShopping')}
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
                      
                      {/* Quantity Input - Mobile Only */}
                      <div className="d-sm-none">
                        <div className="d-flex align-items-center">
                          <Form.Control
                            type="number"
                            size="sm"
                            min={1}
                            max={item.stock}
                            value={inputValues[item.id] || item.quantity.toString()}
                            onChange={(e) => handleInputChange(item.id, e.target.value)}
                            onBlur={(e) => handleQuantityUpdate(item.id, e.target.value, item.stock)}
                            onKeyPress={(e) => handleKeyPress(e, item.id, item.stock)}
                            style={{ width: '80px', textAlign: 'center' }}
                            className="border rounded"
                            disabled={updatingItemId === item.id || isLoading}
                          />
                          <small className="ms-2 text-muted">
                            of {item.stock} available
                          </small>
                        </div>
                      </div>
                    </Col>
                    
                    {/* Quantity Col - Desktop Only */}
                    <Col xs={3} className="d-none d-sm-block">
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="number"
                          size="sm"
                          min={1}
                          max={item.stock}
                          value={inputValues[item.id] || item.quantity.toString()}
                          onChange={(e) => handleInputChange(item.id, e.target.value)}
                          onBlur={(e) => handleQuantityUpdate(item.id, e.target.value, item.stock)}
                          onKeyPress={(e) => handleKeyPress(e, item.id, item.stock)}
                          style={{ width: '80px', textAlign: 'center' }}
                          className="border rounded"
                          disabled={updatingItemId === item.id || isLoading}
                        />
                        <small className="ms-2 text-muted">
                          of {item.stock} available
                        </small>
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
                        disabled={isLoading}
                      >
                        <FaTrash />
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}
          </div>

          {/* Cart Footer - Summary and Buttons */}
          <div className="d-flex flex-column mt-4">
            {/* Cart Summary */}
            <div className="d-flex justify-content-end mb-3">
              <h4 className="fw-semibold">{t('common.total')}: {formatCurrency(getCartTotal())}</h4>
            </div>
            
            {/* Action Buttons */}
            <div className="d-flex flex-column flex-md-row gap-2 mt-3">
                <Button 
                  variant="outline-danger" 
                className="w-100 py-2"
                  onClick={() => clearCart()}
                  disabled={isLoading}
                >
                {t('cart.clearCart')}
                </Button>
              
                <Link 
                  to="/" 
                className="btn btn-outline-primary w-100 py-2"
                >
                {t('cart.continueShopping')}
                </Link>
              
                <Button 
                  variant="primary" 
                className="w-100 py-2"
                  onClick={handleCheckout}
                disabled={isLoading || cartIsEmpty}
                >
                {t('cart.proceedToCheckout')}
                </Button>
              </div>
          </div>
        </>
      )}
    </Container>
  );
};

export default CartPage; 