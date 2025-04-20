import React from 'react';
import { Button, ButtonProps } from 'react-bootstrap';
import { Link, LinkProps } from 'react-router-dom';

interface LinkButtonProps extends Omit<ButtonProps, 'as' | 'href'> {
  to: LinkProps['to'];
  children: React.ReactNode;
}

/**
 * LinkButton component combines React Bootstrap Button with React Router Link
 * This solves TypeScript issues when using Button with as={Link} by properly typing the component
 */
const LinkButton: React.FC<LinkButtonProps> = ({ 
  to, 
  children, 
  ...buttonProps 
}) => {
  return (
    <Button
      {...buttonProps}
      as={Link as any}
      to={to}
    >
      {children}
    </Button>
  );
};

export default LinkButton; 