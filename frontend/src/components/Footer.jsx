import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaInstagram, 
  FaWhatsapp, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaClock, 
  FaTruck, 
  FaStore, 
  FaFileInvoiceDollar, 
  FaShieldAlt,
  FaFacebookF
} from 'react-icons/fa';
import logoLight from '../assets/logo-plantilla-light.svg';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer mt-auto">
      <Container>
        {/* Franja de Confianza y Beneficios */}
        <div className="row g-3 mb-5">
          <div className="col-lg-3 col-sm-6">
            <div className="footer-trust-badge">
              <FaTruck size={22} className="text-danger flex-shrink-0" />
              <div>
                <div className="text-white fw-bold">Envíos a Todo el País</div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Expresos y transporte seguro</div>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-sm-6">
            <div className="footer-trust-badge">
              <FaStore size={22} className="text-warning flex-shrink-0" />
              <div>
                <div className="text-white fw-bold">Retiro en Depósito</div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Sin costo de despacho</div>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-sm-6">
            <div className="footer-trust-badge">
              <FaFileInvoiceDollar size={22} className="text-info flex-shrink-0" />
              <div>
                <div className="text-white fw-bold">Facturación A y B</div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Para eventos y empresas</div>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-sm-6">
            <div className="footer-trust-badge">
              <FaShieldAlt size={22} className="text-success flex-shrink-0" />
              <div>
                <div className="text-white fw-bold">Compra Garantizada</div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Artículos de primera calidad</div>
              </div>
            </div>
          </div>
        </div>

        {/* Columnas Principales */}
        <Row className="gy-4 gx-lg-5 justify-content-between">
          {/* Columna 1: Marca y Redes */}
          <Col lg={4} md={6}>
            <div className="mb-3">
              <Link to="/" className="d-inline-block mb-3">
                <img src={logoLight} alt="CotiFiesta" style={{ height: '46px', width: 'auto' }} />
              </Link>
              <p style={{ color: '#cbd5e1', fontSize: '0.94rem', lineHeight: '1.6', maxWidth: '360px' }}>
                Tu tienda de cotillón, ambientación y repostería festiva. Encontrá todo lo necesario
                para cumpleaños, bodas, aniversarios y eventos temáticos con venta mayorista y minorista.
              </p>
            </div>

            <div className="d-flex gap-2 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="footer-social-btn"
                aria-label="Instagram de CotiFiesta"
              >
                <FaInstagram size={18} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="footer-social-btn"
                aria-label="Facebook de CotiFiesta"
              >
                <FaFacebookF size={16} />
              </a>
              <a
                href="https://wa.me/5491155550000"
                target="_blank"
                rel="noreferrer"
                className="footer-social-btn"
                aria-label="WhatsApp de CotiFiesta"
              >
                <FaWhatsapp size={18} />
              </a>
              <a
                href="mailto:ventas@cotifiesta.com"
                className="footer-social-btn"
                aria-label="Email de CotiFiesta"
              >
                <FaEnvelope size={17} />
              </a>
            </div>
          </Col>

          {/* Columna 2: Navegación Rápida */}
          <Col lg={2} sm={6}>
            <h6 className="fw-bold mb-3 text-uppercase" style={{ fontSize: '0.85rem', letterSpacing: '0.08em', color: '#ffffff' }}>
              Navegación
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              <li>
                <Link to="/" className="footer-link">Inicio</Link>
              </li>
              <li>
                <Link to="/catalogo" className="footer-link">Catálogo Completo</Link>
              </li>
              <li>
                <Link to="/como-comprar" className="footer-link">¿Cómo Comprar?</Link>
              </li>
              <li>
                <Link to="/pedidos" className="footer-link">Seguimiento de Pedidos</Link>
              </li>
              <li>
                <Link to="/login" className="footer-link">Acceso Clientes / Admin</Link>
              </li>
            </ul>
          </Col>

          {/* Columna 3: Festividades & Eventos */}
          <Col lg={3} sm={6}>
            <h6 className="fw-bold mb-3 text-uppercase" style={{ fontSize: '0.85rem', letterSpacing: '0.08em', color: '#ffffff' }}>
              Rubros Festivos
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              <li>
                <Link to="/catalogo?cat=halloween" className="footer-link">
                  Halloween & Noche de Brujas
                </Link>
              </li>
              <li>
                <Link to="/catalogo?cat=navidad" className="footer-link">
                  Navidad & Fin de Año
                </Link>
              </li>
              <li>
                <Link to="/catalogo?cat=egresados" className="footer-link">
                  Egresados & Graduaciones
                </Link>
              </li>
              <li>
                <Link to="/catalogo?cat=comuniones" className="footer-link">
                  Comuniones & Bautismos
                </Link>
              </li>
              <li>
                <Link to="/catalogo?cat=san-patricio" className="footer-link">
                  San Patricio & Temáticas
                </Link>
              </li>
              <li>
                <Link to="/catalogo?cat=cumpleanos" className="footer-link">
                  Cumpleaños & Aniversarios
                </Link>
              </li>
              <li>
                <Link to="/catalogo?cat=carnaval-carioca" className="footer-link">
                  Carnaval Carioca & Despedidas
                </Link>
              </li>
            </ul>
          </Col>

          {/* Columna 4: Contacto & Retiro */}
          <Col lg={3} md={6}>
            <h6 className="fw-bold mb-3 text-uppercase" style={{ fontSize: '0.85rem', letterSpacing: '0.08em', color: '#ffffff' }}>
              Atención & Retiros
            </h6>
            <div className="d-flex flex-column gap-3">
              <div className="footer-contact-item">
                <FaMapMarkerAlt size={18} className="text-warning flex-shrink-0 mt-1" />
                <span>
                  <strong>Depósito Central:</strong><br />
                  Av. Corrientes 3450, Almagro, CABA
                </span>
              </div>

              <div className="footer-contact-item">
                <FaClock size={16} className="text-info flex-shrink-0 mt-1" />
                <span>
                  <strong>Horario de Atención:</strong><br />
                  Lunes a Viernes 09:00 a 19:00 hs<br />
                  Sábados 09:30 a 14:00 hs
                </span>
              </div>

              <div className="footer-contact-item">
                <FaWhatsapp size={18} className="text-success flex-shrink-0 mt-1" />
                <span>
                  <strong>Ventas & WhatsApp:</strong><br />
                  <a href="https://wa.me/5491155550000" target="_blank" rel="noreferrer">
                    +54 9 11 5555-0000
                  </a>
                </span>
              </div>

              <div className="footer-contact-item">
                <FaEnvelope size={16} className="text-danger flex-shrink-0 mt-1" />
                <span>
                  <strong>Email Comercial:</strong><br />
                  <a href="mailto:ventas@cotifiesta.com">
                    ventas@cotifiesta.com
                  </a>
                </span>
              </div>
            </div>
          </Col>
        </Row>

        {/* Barra Inferior de Copyright */}
        <div className="footer-bottom-bar d-flex flex-wrap justify-content-between align-items-center gap-3">
          <span>
            © {currentYear} <strong>CotiFiesta</strong>. Todos los derechos reservados.
          </span>
          <span className="d-flex align-items-center gap-3">
            <span>Precios expresados en Pesos Argentinos (ARS)</span>
            <span>•</span>
            <Link to="/como-comprar" className="text-secondary text-decoration-none hover-white">
              Términos & Políticas de Envíos
            </Link>
          </span>
        </div>
      </Container>
    </footer>
  );
}
