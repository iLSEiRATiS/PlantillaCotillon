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
        <FaStar size={11} className="text-warning me-2 flex-shrink-0" />
        <span className="text-truncate">
          ¡Bienvenidos a <strong>CotiFiesta</strong>! • Envíos a todo el país • Atención WhatsApp: 11 5555-0000
        </span>
      </div>

      <Navbar expand="lg" className="app-navbar py-2" variant="light">
        <Container>
          {/* Top Row en Mobile: Logo a la izquierda, Carrito + Menú a la derecha */}
          <div className="d-flex align-items-center justify-content-between w-100 d-lg-contents">
            {/* Logo */}
            <Navbar.Brand as={Link} to="/" className="d-flex align-items-center me-2 me-lg-3 py-0">
              <img src={logo} alt="CotiFiesta" className="brand-logo-img" />
            </Navbar.Brand>

            {/* Acciones Rápidas en Móvil (Visible solo en < 992px) */}
            <div className="d-flex align-items-center gap-2 d-lg-none">
              <Button
                variant="link"
                className="position-relative text-dark p-2 text-decoration-none d-flex align-items-center justify-content-center"
                onClick={openCart}
                aria-label="Abrir carrito de compras"
              >
                <FaShoppingBag size={21} className="text-dark" />
                {totalItems > 0 && (
                  <Badge
                    bg="danger"
                    pill
                    className="position-absolute top-0 start-100 translate-middle fw-bold"
                    style={{ fontSize: '0.68rem', backgroundColor: 'var(--primary)' }}
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>

              <Navbar.Toggle
                aria-controls="main-navbar-nav"
                className="border-0 p-1 text-dark focus-ring-none"
              >
                <FaBars size={22} />
              </Navbar.Toggle>
            </div>
          </div>

          {/* Buscador Interactivo: En móvil ocupa fila completa debajo; en desktop se centra */}
          <form
            onSubmit={handleNavSearch}
            className="navbar-search-container flex-grow-1 w-100 w-lg-auto my-2 my-lg-0 mx-lg-3 order-3 order-lg-2"
          >
            <div className="navbar-search-wrapper">
              <input
                type="search"
                className="navbar-search-input"
                placeholder="Buscar globos, bengalas, vajilla, cotillón..."
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
                <FaSearch size={13} />
              </button>
            </div>
          </form>

          {/* Menú y Acciones de Usuario (Desktop & Mobile Drawer) */}
          <Navbar.Collapse id="main-navbar-nav" className="order-4 order-lg-3">
            <Nav className="me-auto my-2 my-lg-0 gap-1 pt-2 pt-lg-0 border-top border-lg-0">
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

            <div className="d-flex align-items-center gap-2 pt-3 pt-lg-0 border-top border-lg-0">
              {isLoggedIn ? (
                <div className="d-flex flex-wrap align-items-center gap-2 w-100 w-lg-auto">
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
                    className="text-muted p-2 text-decoration-none hover-primary ms-auto ms-lg-0"
                    onClick={logout}
                    title="Cerrar sesión"
                  >
                    <FaSignOutAlt size={16} />
                  </Button>
                </div>
              ) : (
                <div className="d-flex align-items-center gap-2 w-100 w-lg-auto">
                  <Link to="/login" className="btn-monochrome-outline text-decoration-none py-2 px-3 small flex-grow-1 flex-lg-grow-0 text-center">
                    Ingresar
                  </Link>
                  <Link to="/registro" className="btn-festive text-decoration-none py-2 px-3 small flex-grow-1 flex-lg-grow-0 text-center">
                    Registro
                  </Link>
                </div>
              )}

              {/* Botón Carrito en Desktop (Oculto en móvil porque ya está arriba) */}
              <Button
                variant="link"
                className="position-relative text-dark p-2 ms-2 text-decoration-none d-none d-lg-flex align-items-center justify-content-center"
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
