import { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaTruck, FaShieldAlt, FaHeadset, FaArrowRight } from 'react-icons/fa';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.getProducts({ limit: 8 }),
          api.getCategories(),
        ]);
        setProducts(prodRes.items || prodRes.products || []);
        setCategories((catRes.items || []).filter(c => c.slug !== 'ofertas'));
      } catch (err) {
        console.error('Error cargando home:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div>
      {/* HERO BANNER */}
      <section className="hero-banner text-center">
        <Container>
          <div className="mx-auto" style={{ maxWidth: '820px' }}>
            <span className="custom-badge d-inline-block mb-3">
              ✦ Colección Festiva 2026
            </span>
            <h1 className="display-3 fw-bold text-white mb-3 tracking-tight">
              Cotillón & Ambientación Monocromática
            </h1>
            <p className="lead text-muted mb-4 mx-auto" style={{ maxWidth: '640px' }}>
              Plantilla moderna de comercio electrónico para cotillón mayorista y minorista.
              Artículos seleccionados con estética contemporánea en blanco, negro y plata.
            </p>
            <div className="d-flex flex-wrap justify-content-center gap-3">
              <Button as={Link} to="/catalogo" className="btn-monochrome px-4 py-3">
                Explorar Catálogo <FaArrowRight size={13} className="ms-2" />
              </Button>
              <Button as={Link} to="/como-comprar" className="btn-monochrome-outline px-4 py-3">
                ¿Cómo Comprar?
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* BENEFICIOS / VALOR */}
      <section className="py-4 border-bottom border-secondary border-opacity-25 bg-surface">
        <Container>
          <Row className="gy-3 justify-content-center">
            <Col md={4} sm={6}>
              <div className="d-flex align-items-center gap-3 p-2">
                <div className="p-3 rounded-circle bg-surface-card border border-secondary text-white">
                  <FaTruck size={20} />
                </div>
                <div>
                  <h6 className="fw-bold text-white mb-0">Envíos a todo el país</h6>
                  <small className="text-muted">Despachos diarios y retiro en depósito.</small>
                </div>
              </div>
            </Col>
            <Col md={4} sm={6}>
              <div className="d-flex align-items-center gap-3 p-2">
                <div className="p-3 rounded-circle bg-surface-card border border-secondary text-white">
                  <FaShieldAlt size={20} />
                </div>
                <div>
                  <h6 className="fw-bold text-white mb-0">Calidad garantizada</h6>
                  <small className="text-muted">Artículos testeados para eventos y fiestas.</small>
                </div>
              </div>
            </Col>
            <Col md={4} sm={6}>
              <div className="d-flex align-items-center gap-3 p-2">
                <div className="p-3 rounded-circle bg-surface-card border border-secondary text-white">
                  <FaHeadset size={20} />
                </div>
                <div>
                  <h6 className="fw-bold text-white mb-0">Atención personalizada</h6>
                  <small className="text-muted">Asesoramiento directo vía WhatsApp.</small>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CATEGORÍAS */}
      {categories.length > 0 && (
        <section className="py-5">
          <Container>
            <div className="d-flex justify-content-between align-items-end mb-4">
              <div>
                <span className="text-dim small text-uppercase fw-bold tracking-wider">Explorar</span>
                <h2 className="h3 fw-bold text-white mb-0">Categorías Destacadas</h2>
              </div>
              <Link to="/catalogo" className="text-muted small hover-white d-flex align-items-center gap-1">
                Ver todas <FaArrowRight size={11} />
              </Link>
            </div>

            <Row className="g-3">
              {categories.slice(0, 5).map((cat) => (
                <Col lg={cat.id === categories[0]?.id ? 4 : 2} md={4} sm={6} key={cat.id}>
                  <Link
                    to={`/catalogo?cat=${cat.slug}`}
                    className="p-4 rounded-3 bg-surface-card border border-secondary border-opacity-25 d-flex flex-column justify-content-between h-100 text-decoration-none custom-card"
                  >
                    <div>
                      <span className="small text-dim mb-1 d-block">Colección</span>
                      <h5 className="fw-bold text-white mb-2">{cat.nombre}</h5>
                      <p className="text-muted small mb-0 lh-sm">{cat.descripcion || 'Artículos para fiestas.'}</p>
                    </div>
                    <span className="small text-white mt-4 fw-semibold d-flex align-items-center gap-1">
                      Ver productos <FaArrowRight size={10} />
                    </span>
                  </Link>
                </Col>
              ))}
            </Row>
          </Container>
        </section>
      )}

      {/* PRODUCTOS DESTACADOS */}
      <section className="py-5 bg-surface border-top border-secondary border-opacity-25">
        <Container>
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <span className="text-dim small text-uppercase fw-bold tracking-wider">Lo más buscado</span>
              <h2 className="h3 fw-bold text-white mb-0">Artículos en Tendencia</h2>
            </div>
            <Link to="/catalogo" className="text-muted small hover-white d-flex align-items-center gap-1">
              Catálogo completo <FaArrowRight size={11} />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="light" />
              <p className="text-muted small mt-2">Cargando catálogo...</p>
            </div>
          ) : (
            <Row className="g-4">
              {products.map((product) => (
                <Col lg={3} md={4} sm={6} key={product.id}>
                  <ProductCard product={product} />
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </section>

      {/* BANNER CTA FINAL */}
      <section className="py-5">
        <Container>
          <div className="p-5 rounded-4 bg-surface-card border border-secondary border-opacity-50 text-center position-relative overflow-hidden">
            <h2 className="display-6 fw-bold text-white mb-3">¿Organizando un evento especial?</h2>
            <p className="text-muted mx-auto mb-4" style={{ maxWidth: '620px' }}>
              Encuentra todo lo que necesitas en una sola plataforma: vajilla, globos, velas y cotillón en paleta sobria y elegante.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <Button as={Link} to="/catalogo" className="btn-monochrome px-4 py-2">
                Ir a la Tienda
              </Button>
              <Button as={Link} to="/como-comprar" className="btn-monochrome-outline px-4 py-2">
                Guía Paso a Paso
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
