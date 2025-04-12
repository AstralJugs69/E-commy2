import { Card, Table, Button, Container } from 'react-bootstrap';

const PhoneManagementPage = () => {
  return (
    <Container className="mt-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Phone Management</h1>
        <Button variant="primary">Add New Phone</Button>
      </div>
      
      <Card>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Brand</th>
                <th>Model</th>
                <th>Price</th>
                <th>Storage</th>
                <th>Color</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={8} className="text-center">No phones found</td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PhoneManagementPage; 