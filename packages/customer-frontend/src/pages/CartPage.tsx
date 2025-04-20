import { Container, Row, Col, Table, Button, Alert, Card, Form, Image } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FaTrash, FaShoppingCart } from 'react-icons/fa';
import EmptyState from '../components/EmptyState';
import { getImageUrl } from '../utils/imageUrl';

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
            <Table hover responsive className="mb-0 shadow-sm rounded">
              <thead>
                <tr className="bg-light">
                  <th className="py-3 px-4">Product</th>
                  <th className="text-center py-3">Price</th>
                  <th className="text-center py-3">Quantity</th>
                  <th className="text-center py-3">Total</th>
                  <th className="text-center py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 px-4">
                      <div className="d-flex align-items-center">
                        {/* Use the first image URL if available, fall back to imageUrl for compatibility */}
                        {(item.images?.[0]?.url || item.imageUrl) && (
                          <img 
                            src={getImageUrl(item.images?.[0]?.url || item.imageUrl)}
                            alt={item.name} 
                            style={{ width: '70px', height: '70px', objectFit: 'contain' }}
                            className="me-3 border rounded p-1"
                            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                              if (e.currentTarget.src !== '/placeholder-image.svg') {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/placeholder-image.svg';
                              }
                            }}
                          />
                        )}
                        <div>
                          <div className="fw-semibold text-truncate" style={{ maxWidth: '180px' }}>{item.name}</div>
                          <small className="text-muted d-none d-md-inline">{item.id}</small>
                        </div>
                      </div>
                    </td>
                    <td className="text-center align-middle py-3 fw-medium">{formatCurrency(item.price)}</td>
                    <td className="text-center align-middle py-3" style={{ minWidth: '120px' }}>
                      <div className="d-flex align-items-center justify-content-center">
                        <Button
                          variant="light"
                          size="sm"
                          className="border rounded-start px-2"
                          onClick={() => {
                            const newQuantity = Math.max(1, item.quantity - 1);
                            updateCartItemQuantity(item.id, newQuantity);
                          }}
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
                              updateCartItemQuantity(item.id, newQuantity);
                            }
                          }}
                          style={{ width: '50px', textAlign: 'center', borderRadius: 0 }}
                          className="border-start-0 border-end-0"
                          aria-label={`Quantity for ${item.name}`}
                        />
                        <Button
                          variant="light"
                          size="sm"
                          className="border rounded-end px-2"
                          onClick={() => {
                            const newQuantity = Math.min(item.stock, item.quantity + 1);
                            updateCartItemQuantity(item.id, newQuantity);
                          }}
                        >
                          +
                        </Button>
                      </div>
                    </td>
                    <td className="text-center align-middle py-3 fw-bold">
                      {formatCurrency(item.price * item.quantity)}
                    </td>
                    <td className="text-center align-middle py-3 px-4">
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        className="rounded-pill px-3 py-1"
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <FaTrash className="me-1" /> Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-light">
                  <td colSpan={3} className="text-end fw-bold py-3 px-4">Total:</td>
                  <td className="text-center tfoot-total py-3 fw-bold">{formatCurrency(getCartTotal())}</td>
                  <td></td>
                </tr>
              </tfoot>
            </Table>
          </div>
          
          {/* Mobile Cart Items View */}
          <div className="d-block d-lg-none mb-3">
            {cartItems.map((item) => (
              <Card key={item.id} className="mb-3 shadow-sm border-0">
                <Card.Body className="p-3">
                  <Row className="g-3 align-items-center">
                    {/* Image Col */}
                    <Col xs={3} sm={2}>
                      <Image
                        src={getImageUrl(item.images?.[0]?.url || item.imageUrl)}
                        alt={item.name}
                        fluid
                        className="rounded border p-1"
                        style={{ objectFit: 'cover', height: '70px', width: '70px' }}
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
                      <div className="fw-bold small text-truncate mb-1">{item.name}</div>
                      <div className="text-muted small mb-2">{formatCurrency(item.price)}</div>
                      <div className="d-flex align-items-center">
                        <Button
                          variant="light"
                          size="sm"
                          className="border rounded-start p-0"
                          style={{ width: '24px', height: '24px' }}
                          onClick={() => {
                            const newQuantity = Math.max(1, item.quantity - 1);
                            updateCartItemQuantity(item.id, newQuantity);
                          }}
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
                              updateCartItemQuantity(item.id, newQuantity);
                            }
                          }}
                          style={{ width: '35px', textAlign: 'center', borderRadius: 0, height: '24px', padding: '0' }}
                          className="border-start-0 border-end-0"
                        />
                        <Button
                          variant="light"
                          size="sm"
                          className="border rounded-end p-0"
                          style={{ width: '24px', height: '24px' }}
                          onClick={() => {
                            const newQuantity = Math.min(item.stock, item.quantity + 1);
                            updateCartItemQuantity(item.id, newQuantity);
                          }}
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
          <Card className="mb-4 shadow-sm border-0">
            <Card.Body className="p-4">
              <h4 className="mb-4 fw-semibold text-end">Total: {formatCurrency(getCartTotal())}</h4>
              <div className="d-grid gap-3 d-md-flex justify-content-md-end">
                <Button 
                  variant="outline-secondary" 
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