import { Container, Row, Col, Table, Button, Alert, Card, Form, Image } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FaTrash, FaShoppingCart } from 'react-icons/fa';
import EmptyState from '../components/EmptyState';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:3001/uploads';

const CartPage = () => {
  // Get all required functions from cart context in one place
  const { cartItems, removeFromCart, clearCart, getCartTotal, updateCartItemQuantity } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const cartIsEmpty = cartItems.length === 0;
  
  const handleCheckout = () => {
    navigate('/checkout');
  };
  
  // Helper function to format currency
  const formatCurrency = (value: number): string => {
    return `€${value.toFixed(2)}`;
  };
  
  // If not authenticated, show a message and login button
  if (!isAuthenticated) {
    return (
      <Container className="py-4">
        <h2 className="mb-4 fw-semibold">Your Shopping Cart</h2>
        <EmptyState
          icon={<FaShoppingCart />}
          title="Please Log In to View Your Cart"
          message="You need to be logged in to view and manage your shopping cart."
          actionButton={<Link to="/login" className="btn btn-primary px-4 rounded-pill">Log In</Link>}
        />
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      <h2 className="mb-4 fw-semibold">Your Shopping Cart</h2>
      
      {cartIsEmpty ? (
        <EmptyState
          icon={<FaShoppingCart />}
          title="Your cart is empty"
          message="Looks like you haven't added anything yet. Start exploring now!"
          actionButton={<Link to="/" className="btn btn-primary px-4 rounded-pill">Start Shopping</Link>}
        />
      ) : (
        <>
          {/* Desktop/Tablet Cart Table - Hidden on small screens */}
          <div className="table-responsive mb-4 d-none d-lg-block">
            <Table hover responsive className="mb-0 shadow-sm">
              <thead>
                <tr className="bg-light">
                  <th className="py-3">Product</th>
                  <th className="text-center py-3">Price</th>
                  <th className="text-center py-3">Quantity</th>
                  <th className="text-center py-3">Total</th>
                  <th className="text-center py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3">
                      <div className="d-flex align-items-center">
                        {/* Use the first image URL if available, fall back to imageUrl for compatibility */}
                        {(item.images?.[0]?.url || item.imageUrl) && (
                          <img 
                            src={item.images?.[0]?.url 
                              ? (item.images[0].url.startsWith('/uploads/') 
                                ? `${UPLOADS_URL}${item.images[0].url.substring(8)}`
                                : item.images[0].url)
                              : (item.imageUrl && item.imageUrl.startsWith('/uploads/') 
                                ? `${UPLOADS_URL}${item.imageUrl.substring(8)}`
                                : item.imageUrl || '/placeholder-image.svg')} 
                            alt={item.name} 
                            style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                            className="me-3"
                            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                              if (e.currentTarget.src !== '/placeholder-image.svg') {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/placeholder-image.svg';
                              }
                            }}
                          />
                        )}
                        <div>
                          <div className="fw-semibold text-truncate" style={{ maxWidth: '150px' }}>{item.name}</div>
                          <small className="text-muted d-none d-md-inline">{item.id}</small>
                        </div>
                      </div>
                    </td>
                    <td className="text-center align-middle py-3">{formatCurrency(item.price)}</td>
                    <td className="text-center align-middle py-3" style={{ minWidth: '100px' }}>
                      <Form.Control
                        type="number"
                        size="sm"
                        min={1} // Minimum quantity
                        max={item.stock} // Set max based on available stock
                        value={item.quantity}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const newQuantityStr = e.target.value;
                          // Allow empty string temporarily while typing, but treat as 0 for validation
                          const newQuantity = newQuantityStr === '' ? 0 : parseInt(newQuantityStr, 10);

                          // Update only if it's a valid integer (prevents partial input like '1.')
                          // Let the context handle the logic for quantity < 1 (removal)
                          if (!isNaN(newQuantity)) {
                            updateCartItemQuantity(item.id, newQuantity);
                          }
                          // If input becomes empty or invalid temporarily, onChange still fires,
                          // but the context/backend call might wait or handle it.
                        }}
                        style={{ width: '70px', margin: 'auto', textAlign: 'center' }} // Center text in input
                        aria-label={`Quantity for ${item.name}`}
                      />
                    </td>
                    <td className="text-center align-middle py-3 fw-semibold">
                      {formatCurrency(item.price * item.quantity)}
                    </td>
                    <td className="text-center align-middle py-3">
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        className="rounded-pill px-2 py-1"
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-light">
                  <td colSpan={3} className="text-end fw-bold py-3">Total:</td>
                  <td className="text-center tfoot-total py-3 fw-bold">{formatCurrency(getCartTotal())}</td>
                  <td></td>
                </tr>
              </tfoot>
            </Table>
          </div>
          
          {/* Mobile Cart Items View */}
          <div className="d-block d-lg-none mb-3">
            {cartItems.map((item) => (
              <Card key={item.id} className="mb-3 shadow-sm">
                <Card.Body className="p-3">
                  <Row className="g-3 align-items-center">
                    {/* Image Col */}
                    <Col xs={3} sm={2}>
                      <Image
                        src={(item.images?.[0]?.url) 
                          ? (item.images[0].url.startsWith('/uploads/') 
                            ? `${UPLOADS_URL}${item.images[0].url.substring(8)}`
                            : item.images[0].url)
                          : (item.imageUrl && item.imageUrl.startsWith('/uploads/') 
                            ? `${UPLOADS_URL}${item.imageUrl.substring(8)}`
                            : item.imageUrl || '/placeholder-image.svg')}
                        alt={item.name}
                        fluid
                        rounded
                        style={{ objectFit: 'cover', height: '60px', width: '60px' }}
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                          if (e.currentTarget.src !== '/placeholder-image.svg') {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/placeholder-image.svg';
                          }
                        }}
                      />
                    </Col>
                    {/* Details Col */}
                    <Col xs={6} sm={7}>
                      <div className="fw-bold small text-truncate">{item.name}</div>
                      <div className="text-muted small">{formatCurrency(item.price)}</div>
                      <div className="mt-1">
                        <Form.Control
                          type="number"
                          size="sm"
                          min={1}
                          max={item.stock}
                          value={item.quantity}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const newQuantityStr = e.target.value;
                            // Allow empty string temporarily while typing, but treat as 0 for validation
                            const newQuantity = newQuantityStr === '' ? 0 : parseInt(newQuantityStr, 10);
                            
                            // Update only if it's a valid integer
                            if (!isNaN(newQuantity)) {
                              updateCartItemQuantity(item.id, newQuantity);
                            }
                          }}
                          style={{ width: '60px', display: 'inline-block', padding: '0.2rem 0.5rem' }}
                          className="me-2"
                        />
                      </div>
                    </Col>
                    {/* Price/Remove Col */}
                    <Col xs={3} sm={3} className="text-end">
                      <div className="fw-semibold small mb-2">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                      <Button
                        variant="outline-danger"
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
          <Card className="mb-4 shadow-sm">
            <Card.Body className="p-4">
              <h4 className="mb-4 fw-semibold text-end">Total: {formatCurrency(getCartTotal())}</h4>
              <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                <Button variant="outline-secondary" className="rounded-pill px-3 py-2 fw-medium" onClick={() => clearCart()}>Clear Cart</Button>
                <Link to="/" className="btn btn-secondary rounded-pill px-3 py-2 fw-medium">Continue Shopping</Link>
                <Button variant="success" className="rounded-pill px-4 py-2 fw-medium" onClick={handleCheckout}>Proceed to Checkout</Button>
              </div>
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
};

export default CartPage; 