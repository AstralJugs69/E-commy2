import { Card, Row, Col, Container } from 'react-bootstrap';

const DashboardPage = () => {
  return (
    <Container className="mt-3">
      <h1 className="mb-4">Admin Dashboard</h1>
      
      <Row>
        <Col md={6} lg={3} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Orders</Card.Title>
              <Card.Text className="display-4">0</Card.Text>
              <Card.Text>Total orders</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={3} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Phones</Card.Title>
              <Card.Text className="display-4">0</Card.Text>
              <Card.Text>Total phones</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={3} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Zones</Card.Title>
              <Card.Text className="display-4">0</Card.Text>
              <Card.Text>Active zones</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={3} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Revenue</Card.Title>
              <Card.Text className="display-4">$0</Card.Text>
              <Card.Text>Total revenue</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col md={12} lg={8} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Recent Orders</Card.Title>
              <Card.Text>No orders yet</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={12} lg={4}>
          <Card>
            <Card.Body>
              <Card.Title>System Status</Card.Title>
              <Card.Text>All systems operational</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardPage; 