import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaInstagram, FaWhatsapp, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer mt-auto">
      <Container>
        <Row className="gy-4 justify-content-between">
          <Col lg={4} md={6}>
            <div className="mb-3">
              <h5 className="fw-bold text-white mb-2">PlantillaCotillón</h5>
              <p className="text-muted small lh-base" style={{ maxWidth: '340px' }}>
                Plantilla modular de e-commerce moderna para tiendas de cotillón, eventos y ambientación.
                Diseñada con arquitectura React 18 y backend nativo Node.js Express.
              </p>
            </div>
            <div className="d-flex gap-3 text-white">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-muted hover-white">
                <FaInstagram size={18} />
              </a>
              <a href="https://whatsapp.com" target="_blank" rel="noreferrer" className="text-muted hover-white">
                <FaWhatsapp size={18} />
              </a>
              <a href="mailto:info@cotillon.com" className="text-muted hover-white">
                <FaEnvelope size={18} />
              </a>
            </div>
          </Col>

          <Col lg={2} sm={6}>
            <h6 className="text-white fw-bold mb-3 small text-uppercase tracking-wider">Explorar</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li>
                <Link to="/" className="text-muted hover-white">Inicio</Link>
              </li>
              <li>
                <Link to="/catalogo" className="text-muted hover-white">Catálogo Completo</Link>
              </li>
              <li>
                <Link to="/como-comprar" className="text-muted hover-white">¿Cómo Comprar?</Link>
              </li>
              <li>
                <Link to="/pedidos" className="text-muted hover-white">Mis Pedidos</Link>
              </li>
            </ul>
          </Col>

          <Col lg={3} sm={6}>
            <h6 className="text-white fw-bold mb-3 small text-uppercase tracking-wider">Categorías</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li>
                <Link to="/catalogo?cat=globos-arreglos" className="text-muted hover-white">Globos & Inflables</Link>
              </li>
              <li>
                <Link to="/catalogo?cat=vajilla-deco-mesa" className="text-muted hover-white">Vajilla Descartable</Link>
              </li>
              <li>
                <Link to="/catalogo?cat=velas-bengalas" className="text-muted hover-white">Velas & Bengalas</Link>
              </li>
              <li>
                <Link to="/catalogo?cat=guirnaldas-banners" className="text-muted hover-white">Guirnaldas & Fondos</Link>
              </li>
            </ul>
          </Col>

          <Col lg={3} md={6}>
            <h6 className="text-white fw-bold mb-3 small text-uppercase tracking-wider">Contacto & Retiros</h6>
            <div className="d-flex flex-column gap-2 small text-muted">
              <div className="d-flex align-items-center gap-2">
                <FaMapMarkerAlt />
                <span>Depósito Central - Buenos Aires, Argentina</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <FaWhatsapp />
                <span>+54 9 11 5555-0000</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <FaEnvelope />
                <span>ventas@plantillacotillon.com</span>
              </div>
            </div>
          </Col>
        </Row>

        <hr className="my-4 border-secondary opacity-25" />

        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 small text-dim">
          <span>© {currentYear} PlantillaCotillón. Todos los derechos reservados.</span>
          <span>Desarrollado con arquitectura moderna desacoplada.</span>
        </div>
      </Container>
    </footer>
  );
}
