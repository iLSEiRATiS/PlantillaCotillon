import { useState } from 'react';
import { Navbar, Nav, Container, Button, Badge } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';
import { FaShoppingBag, FaUser, FaSignOutAlt, FaBars, FaCog, FaCrown, FaStar } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo-plantilla.svg';
import ContactModal from './ContactModal';

export default function AppNavbar() {
  const { getTotalItems, openCart } = useCart();
  const { user, isLoggedIn, logout } = useAuth();
  const [showContact, setShowContact] = useState(false);
  const totalItems = getTotalItems();
  const isStaff = user?.is_staff || user?.is_superuser;

  return (
    <>
      {/* Barra de anuncio festiva */}
      <div className="announcement-bar d-flex align-items-center justify-content-center">
        <FaStar size={11} className="text-warning me-2" />
        <span>¡Bienvenidos a <strong>CotiFiesta</strong>! • Cotillón Mayorista & Minorista • Envíos a todo el país • Atención WhatsApp: 11 5555-0000</span>
      </div>

      <Navbar expand="lg" className="app-navbar" variant="light">
        <Container>
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <img src={logo} alt="CotiFiesta" className="brand-logo-img" />
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="main-navbar-nav" className="border-0 text-dark">
            <FaBars size={20} />
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
              {isStaff && (
                <Nav.Link as={NavLink} to="/admin" className="nav-link-custom text-primary fw-bold">
                  Panel Admin
                </Nav.Link>
              )}
            </Nav>

            <div className="d-flex align-items-center gap-2">
              {isLoggedIn ? (
                <div className="d-flex align-items-center gap-2">
                  {isStaff && (
                    <Link to="/admin" className="btn-admin-nav text-decoration-none py-2 px-3 small">
                      <FaCrown size={12} /> Admin
                    </Link>
                  )}
                  <Link to="/pedidos" className="btn-monochrome-dark d-flex align-items-center gap-2 text-decoration-none py-2 px-3">
                    <FaUser size={13} />
                    <span className="small">{user?.username || 'Mi Cuenta'}</span>
                  </Link>
                  <Button
                    variant="link"
                    className="text-muted p-2 text-decoration-none hover-primary"
                    onClick={logout}
                    title="Cerrar sesión"
                  >
                    <FaSignOutAlt size={16} />
                  </Button>
                </div>
              ) : (
                <div className="d-flex align-items-center gap-2">
                  <Link to="/login" className="btn-monochrome-outline text-decoration-none py-2 px-3 small">
                    Ingresar
                  </Link>
                  <Link to="/registro" className="btn-festive text-decoration-none py-2 px-3 small">
                    Registro
                  </Link>
                </div>
              )}

              {/* Botón Carrito */}
              <Button
                variant="link"
                className="position-relative text-dark p-2 ms-2 text-decoration-none d-flex align-items-center justify-content-center"
                onClick={openCart}
                aria-label="Abrir carrito"
              >
                <FaShoppingBag size={22} className="text-dark" />
                {totalItems > 0 && (
                  <Badge
                    bg="danger"
                    pill
                    className="position-absolute top-0 start-100 translate-middle fw-bold"
                    style={{ fontSize: '0.72rem', backgroundColor: 'var(--primary)' }}
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
