import React, { ReactNode } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

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
    <Container className="py-5 my-5">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6} className="text-center">
          <div className="empty-state-icon mb-4">
            {React.cloneElement(icon, { size: 50, className: 'text-muted' })}
          </div>
          <h4 className="fw-bold mb-2">{title}</h4>
          <p className="text-muted mb-4">{message}</p>
          {actionButton && <div className="mt-2">{actionButton}</div>}
        </Col>
      </Row>
    </Container>
  );
};

export default EmptyState; 