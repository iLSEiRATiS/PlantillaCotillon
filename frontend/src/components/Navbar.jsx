import { useState } from 'react';
import { Navbar, Nav, Container, Button, Badge } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { 
  FaShoppingBag, 
  FaUser, 
  FaSignOutAlt, 
  FaBars, 
  FaCrown, 
  FaStar,
  FaSearch,
  FaTimes
} from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo-plantilla.svg';
import ContactModal from './ContactModal';

export default function AppNavbar() {
  const { getTotalItems, openCart } = useCart();
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const [showContact, setShowContact] = useState(false);
  const [navSearch, setNavSearch] = useState('');

  const totalItems = getTotalItems();
  const isStaff = user?.is_staff || user?.is_superuser;

  const handleNavSearch = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/catalogo?q=${encodeURIComponent(navSearch.trim())}`);
    } else {
      navigate('/catalogo');
    }
  };

  return (
    <>
      {/* Barra de anuncio festiva */}
      <div className="announcement-bar d-flex align-items-center justify-content-center">
        <FaStar size={11} className="text-warning me-2" />
        <span>¡Bienvenidos a <strong>CotiFiesta</strong>! • Envíos a todo el país • Atención WhatsApp: 11 5555-0000</span>
      </div>

      <Navbar expand="lg" className="app-navbar py-2" variant="light">
        <Container>
          {/* Logo */}
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center me-3">
            <img src={logo} alt="CotiFiesta" className="brand-logo-img" />
          </Navbar.Brand>

          {/* Buscador Interactivo Centrado */}
          <form
            onSubmit={handleNavSearch}
            className="navbar-search-container flex-grow-1 mx-2 mx-lg-4 order-3 order-lg-2"
          >
            <div className="navbar-search-wrapper">
              <input
                type="search"
                className="navbar-search-input"
                placeholder="Buscar globos, bengalas, vajilla, disfraces, cotillón..."
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                aria-label="Buscar en la tienda"
              />
              {navSearch && (
                <button
                  type="button"
                  className="navbar-search-clear"
                  onClick={() => setNavSearch('')}
                  aria-label="Limpiar búsqueda"
                >
                  <FaTimes size={12} />
                </button>
              )}
              <button
                type="submit"
                className="navbar-search-btn"
                aria-label="Ejecutar búsqueda"
              >
                <FaSearch size={14} />
              </button>
            </div>
          </form>

          {/* Toggle Mobile */}
          <Navbar.Toggle aria-controls="main-navbar-nav" className="border-0 text-dark order-2 order-lg-4">
            <FaBars size={20} />
          </Navbar.Toggle>

          {/* Menú y Acciones de Usuario */}
          <Navbar.Collapse id="main-navbar-nav" className="order-4 order-lg-3">
            <Nav className="me-auto my-2 my-lg-0 gap-1">
              <Nav.Link as={NavLink} to="/" className="nav-link-custom">
                Inicio
              </Nav.Link>
              <Nav.Link as={NavLink} to="/catalogo" className="nav-link-custom">
                Catálogo
              </Nav.Link>
              <Nav.Link as={NavLink} to="/como-comprar" className="nav-link-custom">
                ¿Cómo Comprar?
              </Nav.Link>
              <Nav.Link
                as="button"
                onClick={() => setShowContact(true)}
                className="nav-link-custom bg-transparent border-0 text-start"
              >
                Contacto
              </Nav.Link>
              {isStaff && (
                <Nav.Link as={NavLink} to="/admin" className="nav-link-custom text-primary fw-bold">
                  Panel Admin
                </Nav.Link>
              )}
            </Nav>

            <div className="d-flex align-items-center gap-2 pt-2 pt-lg-0">
              {isLoggedIn ? (
                <div className="d-flex align-items-center gap-2">
                  {isStaff && (
                    <Link to="/admin" className="btn-admin-nav text-decoration-none py-2 px-3 small">
                      <FaCrown size={12} /> Admin
                    </Link>
                  )}
                  <Link
                    to="/pedidos"
                    className="btn-monochrome-dark d-flex align-items-center gap-2 text-decoration-none py-2 px-3"
                  >
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
