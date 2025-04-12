import { Card, Table, Dropdown, Badge, Container } from 'react-bootstrap';

const OrderManagementPage = () => {
  return (
    <Container className="mt-3">
      <h1 className="mb-4">Order Management</h1>
      
      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between mb-3">
            <div>
              <Dropdown className="d-inline-block me-2">
                <Dropdown.Toggle variant="outline-secondary" id="filter-dropdown">
                  Filter
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item>All Orders</Dropdown.Item>
                  <Dropdown.Item>Pending</Dropdown.Item>
                  <Dropdown.Item>Processing</Dropdown.Item>
                  <Dropdown.Item>Completed</Dropdown.Item>
                  <Dropdown.Item>Cancelled</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              
              <Dropdown className="d-inline-block">
                <Dropdown.Toggle variant="outline-secondary" id="sort-dropdown">
                  Sort
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item>Newest First</Dropdown.Item>
                  <Dropdown.Item>Oldest First</Dropdown.Item>
                  <Dropdown.Item>Amount (High to Low)</Dropdown.Item>
                  <Dropdown.Item>Amount (Low to High)</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
            
            <div className="d-flex">
              <input 
                type="search" 
                placeholder="Search orders..."
                className="form-control me-2"
              />
            </div>
          </div>
          
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="text-center">No orders found</td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default OrderManagementPage; 