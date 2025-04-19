import React, { ReactNode } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

interface IconProps {
  size?: number;
  className?: string;
}

interface EmptyStateProps {
  icon: React.ReactElement<IconProps>;
  title: string;
  message: string;
  actionButton?: ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, actionButton }) => {
  return (
    <Container className="py-4 my-4">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6} className="text-center">
          <Card className="border-0 shadow-sm p-4">
            <Card.Body className="py-5">
              <div className="empty-state-icon mb-4">
                {React.cloneElement(icon as React.ReactElement, { 
                  size: 70, 
                  className: 'text-primary opacity-75' 
                } as React.SVGProps<SVGSVGElement>)}
              </div>
              <h3 className="fw-semibold mb-3">{title}</h3>
              <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '80%' }}>{message}</p>
              {actionButton && <div className="mt-4">{actionButton}</div>}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EmptyState; 