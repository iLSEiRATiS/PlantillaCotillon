import { useState } from 'react';
import { Navbar, Nav, Container, Button, Badge } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaShoppingBag, FaUser, FaSignOutAlt, FaBars, FaEnvelope } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo-plantilla.svg';
import ContactModal from './ContactModal';

export default function AppNavbar() {
  const { getTotalItems, openCart } = useCart();
  const { user, isLoggedIn, logout } = useAuth();
  const [showContact, setShowContact] = useState(false);
  const totalItems = getTotalItems();
  const navigate = useNavigate();

  return (
    <>
      <Navbar expand="lg" className="app-navbar" variant="dark">
        <Container>
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <img src={logo} alt="PlantillaCotillón" className="brand-logo-img" />
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="main-navbar-nav" className="border-0 text-white">
            <FaBars />
          </Navbar.Toggle>

          <Navbar.Collapse id="main-navbar-nav">
            <Nav className="mx-auto my-2 my-lg-0 gap-1">
              <Nav.Link as={NavLink} to="/" className="nav-link-custom">
                Inicio
              </Nav.Link>
              <Nav.Link as={NavLink} to="/catalogo" className="nav-link-custom">
                Catálogo
              </Nav.Link>
              <Nav.Link as={NavLink} to="/como-comprar" className="nav-link-custom">
                ¿Cómo Comprar?
              </Nav.Link>
              <Nav.Link as="button" onClick={() => setShowContact(true)} className="nav-link-custom bg-transparent border-0 text-start">
                Contacto
              </Nav.Link>
            </Nav>

            <div className="d-flex align-items-center gap-3">
              {isLoggedIn ? (
                <div className="d-flex align-items-center gap-2">
                  <Link to="/pedidos" className="btn-monochrome-dark d-flex align-items-center gap-2 text-decoration-none py-2 px-3">
                    <FaUser size={13} />
                    <span className="small">{user?.username || 'Mi Cuenta'}</span>
                  </Link>
                  <Button
                    variant="link"
                    className="text-muted p-2 text-decoration-none"
                    onClick={logout}
                    title="Cerrar sesión"
                  >
                    <FaSignOutAlt size={16} />
                  </Button>
                </div>
              ) : (
                <div className="d-flex align-items-center gap-2">
                  <Link to="/login" className="btn-monochrome-dark text-decoration-none py-2 px-3 small">
                    Ingresar
                  </Link>
                  <Link to="/registro" className="btn-monochrome text-decoration-none py-2 px-3 small">
                    Registro
                  </Link>
                </div>
              )}

              {/* Botón Carrito Flotante */}
              <Button
                variant="link"
                className="position-relative text-white p-2 text-decoration-none d-flex align-items-center justify-content-center"
                onClick={openCart}
                aria-label="Abrir carrito"
              >
                <FaShoppingBag size={20} />
                {totalItems > 0 && (
                  <Badge
                    bg="light"
                    text="dark"
                    pill
                    className="position-absolute top-0 start-100 translate-middle fw-bold"
                    style={{ fontSize: '0.7rem' }}
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <ContactModal show={showContact} onHide={() => setShowContact(false)} />
    </>
  );
}
