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
        {/* ===================================================
            FRANJA DE CONFIANZA Y BENEFICIOS
            Simétrica, equilibrada y con alturas idénticas
            =================================================== */}
        <div className="row g-2 g-sm-3 mb-4 mb-lg-5 justify-content-center">
          <div className="col-6 col-lg-3 d-flex">
            <div className="footer-trust-badge w-100 h-100">
              <div className="footer-trust-icon-box">
                <FaTruck size={22} className="text-danger flex-shrink-0" />
              </div>
              <div className="footer-trust-text">
                <div className="text-white fw-bold footer-trust-title">Envíos a Todo el País</div>
                <div className="footer-trust-sub">Expresos y transporte seguro</div>
              </div>
            </div>
          </div>

          <div className="col-6 col-lg-3 d-flex">
            <div className="footer-trust-badge w-100 h-100">
              <div className="footer-trust-icon-box">
                <FaStore size={22} className="text-warning flex-shrink-0" />
              </div>
              <div className="footer-trust-text">
                <div className="text-white fw-bold footer-trust-title">Retiro en Depósito</div>
                <div className="footer-trust-sub">Sin costo de despacho</div>
              </div>
            </div>
          </div>

          <div className="col-6 col-lg-3 d-flex">
            <div className="footer-trust-badge w-100 h-100">
              <div className="footer-trust-icon-box">
                <FaFileInvoiceDollar size={22} className="text-info flex-shrink-0" />
              </div>
              <div className="footer-trust-text">
                <div className="text-white fw-bold footer-trust-title">Facturación A y B</div>
                <div className="footer-trust-sub">Para eventos y empresas</div>
              </div>
            </div>
          </div>

          <div className="col-6 col-lg-3 d-flex">
            <div className="footer-trust-badge w-100 h-100">
              <div className="footer-trust-icon-box">
                <FaShieldAlt size={22} className="text-success flex-shrink-0" />
              </div>
              <div className="footer-trust-text">
                <div className="text-white fw-bold footer-trust-title">Compra Garantizada</div>
                <div className="footer-trust-sub">Artículos de primera calidad</div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            COLUMNAS PRINCIPALES DEL FOOTER
            En móvil: Marca centrada, Enlaces en 2 columnas simétricas, Contactos centrados
            =================================================== */}
        <Row className="gy-4 gx-lg-5 justify-content-between">
          {/* Columna 1: Marca y Redes Sociales */}
          <Col lg={4} md={12} className="text-center text-lg-start mb-2 mb-lg-0">
            <div className="mb-3">
              <Link to="/" className="d-inline-block mb-3">
                <img src={logoLight} alt="CotiFiesta" style={{ height: '44px', width: 'auto' }} />
              </Link>
              <p className="mx-auto mx-lg-0" style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: '1.6', maxWidth: '380px' }}>
                Tu tienda de cotillón, ambientación y repostería festiva. Encontrá todo lo necesario
                para cumpleaños, bodas, aniversarios y eventos temáticos con venta mayorista y minorista.
              </p>
            </div>

            <div className="d-flex justify-content-center justify-content-lg-start gap-2 pt-1">
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

          {/* Columna 2: Navegación Rápida (50% en móvil, 2 cols en desktop) */}
          <Col xs={6} sm={6} lg={2} className="text-start">
            <h6 className="fw-bold mb-3 text-uppercase footer-col-heading">
              Navegación
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              <li>
                <Link to="/" className="footer-link">Inicio</Link>
              </li>
              <li>
                <Link to="/catalogo" className="footer-link">Catálogo</Link>
              </li>
              <li>
                <Link to="/como-comprar" className="footer-link">¿Cómo Comprar?</Link>
              </li>
              <li>
                <Link to="/pedidos" className="footer-link">Mis Pedidos</Link>
              </li>
              <li>
                <Link to="/login" className="footer-link">Acceso Clientes</Link>
              </li>
            </ul>
          </Col>

          {/* Columna 3: Festividades & Rubros (50% en móvil, 3 cols en desktop) */}
          <Col xs={6} sm={6} lg={3} className="text-start">
            <h6 className="fw-bold mb-3 text-uppercase footer-col-heading">
              Rubros Festivos
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              <li>
                <Link to="/catalogo?cat=halloween" className="footer-link">
                  Halloween
                </Link>
              </li>
              <li>
                <Link to="/catalogo?cat=navidad" className="footer-link">
                  Navidad &amp; Fin de Año
                </Link>
              </li>
              <li>
                <Link to="/catalogo?cat=egresados" className="footer-link">
                  Egresados
                </Link>
              </li>
              <li>
                <Link to="/catalogo?cat=comuniones" className="footer-link">
                  Comuniones
                </Link>
              </li>
              <li>
                <Link to="/catalogo?cat=san-patricio" className="footer-link">
                  San Patricio
                </Link>
              </li>
              <li>
                <Link to="/catalogo?cat=cumpleanos" className="footer-link">
                  Cumpleaños
                </Link>
              </li>
              <li>
                <Link to="/catalogo?cat=carnaval-carioca" className="footer-link">
                  Carnaval Carioca
                </Link>
              </li>
            </ul>
          </Col>

          {/* Columna 4: Contacto & Retiro */}
          <Col xs={12} sm={12} lg={3} className="mt-4 mt-lg-0">
            <div className="footer-contact-box mx-auto mx-lg-0">
              <h6 className="fw-bold mb-3 text-uppercase footer-col-heading text-center text-lg-start">
                Atención &amp; Retiros
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
                    <strong>Ventas &amp; WhatsApp:</strong><br />
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
            </div>
          </Col>
        </Row>

        {/* ===================================================
            BARRA INFERIOR DE COPYRIGHT Y POLÍTICAS
            Centrada en móvil, distribuida en desktop
            =================================================== */}
        <div className="footer-bottom-bar d-flex flex-column flex-md-row justify-content-between align-items-center text-center text-md-start gap-2 gap-md-3">
          <span>
            © {currentYear} <strong>CotiFiesta</strong>. Todos los derechos reservados.
          </span>
          <div className="d-flex flex-wrap justify-content-center align-items-center gap-2 gap-md-3">
            <span>Precios expresados en Pesos Argentinos (ARS)</span>
            <span className="d-none d-sm-inline">•</span>
            <Link to="/como-comprar" className="text-secondary text-decoration-none hover-white">
              Términos &amp; Políticas de Envíos
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
