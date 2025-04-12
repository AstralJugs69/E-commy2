import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Navbar, Nav, Offcanvas } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const Layout = () => {
  return (
    <div className="app-wrapper">
      <Navbar bg="light" expand={false} fixed="top" className="shadow-sm">
        <Container fluid>
          <LinkContainer to="/">
            <Navbar.Brand>Hybrid Store</Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="offcanvasNavbar-expand-false" />
          <Navbar.Offcanvas
            id="offcanvasNavbar-expand-false"
            aria-labelledby="offcanvasNavbarLabel-expand-false"
            placement="end"
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title id="offcanvasNavbarLabel-expand-false">
                Menu
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="justify-content-end flex-grow-1 pe-3">
                <LinkContainer to="/">
                  <Nav.Link>Home</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/cart">
                  <Nav.Link>Cart</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/login">
                  <Nav.Link>Login</Nav.Link>
                </LinkContainer>
                {/* Add more links later as needed */}
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
      
      <main className="pt-5 mt-3">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout; 