import { Card, Table, Button, Badge, Container } from 'react-bootstrap';

const ZoneManagementPage = () => {
  return (
    <Container className="mt-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Zone Management</h1>
        <Button variant="primary">Add New Zone</Button>
      </div>
      
      <Card>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Zone ID</th>
                <th>Name</th>
                <th>City</th>
                <th>Coverage</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="text-center">No zones found</td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      
      <div className="mt-4">
        <Card>
          <Card.Body>
            <Card.Title>Zone Mapping</Card.Title>
            <div className="text-center p-5 bg-light border">
              <p className="mb-0">Map visualization placeholder</p>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default ZoneManagementPage; 