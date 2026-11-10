import { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaTruck, FaShieldAlt, FaHeadset, FaArrowRight, FaBirthdayCake, FaGift, FaStar } from 'react-icons/fa';
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

  const categoryThemes = [
    { bg: '#fff1f2', border: '#fecdd3', text: '#e11d48' },
    { bg: '#f5f3ff', border: '#ddd6fe', text: '#6366f1' },
    { bg: '#fef3c7', border: '#fde68a', text: '#d97706' },
    { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a' },
    { bg: '#f0fdfa', border: '#99f6e4', text: '#0d9488' },
  ];

  return (
    <div>
      {/* HERO BANNER FESTIVO */}
      <section className="hero-banner text-center">
        <Container>
          <div className="mx-auto" style={{ maxWidth: '840px' }}>
            <h1 className="display-4 fw-bold mb-3 tracking-tight" style={{ color: '#000000' }}>
              ¡Todo para que tu Fiesta sea Inolvidable!
            </h1>
            <p className="lead text-secondary mb-4 mx-auto" style={{ maxWidth: '640px', fontSize: '1.15rem' }}>
              Encuentra los mejores globos, vajilla descartable, bengalas de humo, guirnaldas y artículos de carnaval carioca para tus festejos y eventos.
            </p>
            <div className="d-flex flex-wrap justify-content-center gap-3">
              <Button as={Link} to="/catalogo" className="btn-festive px-4 py-3">
                Explorar Catálogo <FaArrowRight size={13} className="ms-1" />
              </Button>
              <Button as={Link} to="/como-comprar" className="btn-festive-outline px-4 py-3">
                ¿Cómo Comprar?
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* BENEFICIOS / VALOR */}
      <section className="py-4 border-bottom bg-white">
        <Container>
          <Row className="gy-3 justify-content-center">
            <Col md={4} sm={6}>
              <div className="d-flex align-items-center gap-3 p-3 rounded-3 bg-light border">
                <div className="p-3 rounded-circle bg-white text-danger shadow-sm border">
                  <FaTruck size={22} style={{ color: '#e11d48' }} />
                </div>
                <div>
                  <h6 className="fw-bold mb-0" style={{ color: '#0f172a' }}>Envíos a Todo el País</h6>
                  <small className="text-muted">Despachos rápidos y retiro en depósito.</small>
                </div>
              </div>
            </Col>
            <Col md={4} sm={6}>
              <div className="d-flex align-items-center gap-3 p-3 rounded-3 bg-light border">
                <div className="p-3 rounded-circle bg-white text-warning shadow-sm border">
                  <FaShieldAlt size={22} style={{ color: '#f59e0b' }} />
                </div>
                <div>
                  <h6 className="fw-bold mb-0" style={{ color: '#0f172a' }}>Precios Mayoristas</h6>
                  <small className="text-muted">Precios especiales para revendedores y eventos.</small>
                </div>
              </div>
            </Col>
            <Col md={4} sm={6}>
              <div className="d-flex align-items-center gap-3 p-3 rounded-3 bg-light border">
                <div className="p-3 rounded-circle bg-white text-primary shadow-sm border">
                  <FaHeadset size={22} style={{ color: '#6366f1' }} />
                </div>
                <div>
                  <h6 className="fw-bold mb-0" style={{ color: '#0f172a' }}>Asesoramiento WhatsApp</h6>
                  <small className="text-muted">Te ayudamos a calcular y armar tu combo.</small>
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
                <span className="text-danger small text-uppercase fw-bold tracking-wider">Festividades</span>
                <h2 className="h3 fw-bold mb-0" style={{ color: '#0f172a' }}>Explora por Festividad</h2>
              </div>
              <Link to="/catalogo" className="fw-bold text-danger small d-flex align-items-center gap-1">
                Ver todas <FaArrowRight size={11} />
              </Link>
            </div>

            <Row className="g-3">
              {categories.slice(0, 5).map((cat, idx) => {
                const theme = categoryThemes[idx % categoryThemes.length];
                return (
                  <Col lg={cat.id === categories[0]?.id ? 4 : 2} md={4} sm={6} key={cat.id}>
                    <Link
                      to={`/catalogo?cat=${cat.slug}`}
                      className="p-4 rounded-3 d-flex flex-column justify-content-between h-100 text-decoration-none custom-card"
                      style={{
                        backgroundColor: theme.bg,
                        borderColor: theme.border,
                      }}
                    >
                      <div>
                        <span className="small fw-bold mb-1 d-block" style={{ color: theme.text }}>
                          Festividad
                        </span>
                        <h5 className="fw-bold mb-2" style={{ color: '#0f172a' }}>{cat.nombre}</h5>
                        <p className="text-muted small mb-0 lh-sm">{cat.descripcion || 'Artículos festivos y cotillón.'}</p>
                      </div>
                      <span className="small fw-bold mt-4 d-flex align-items-center gap-1" style={{ color: theme.text }}>
                        Ver productos <FaArrowRight size={10} />
                      </span>
                    </Link>
                  </Col>
                );
              })}
            </Row>
          </Container>
        </section>
      )}

      {/* PRODUCTOS DESTACADOS */}
      <section className="py-5 bg-white border-top border-bottom">
        <Container>
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <span className="text-danger small text-uppercase fw-bold tracking-wider">Destacados</span>
              <h2 className="h3 fw-bold mb-0" style={{ color: '#0f172a' }}>Artículos Más Vendidos</h2>
            </div>
            <Link to="/catalogo" className="fw-bold text-danger small d-flex align-items-center gap-1">
              Catálogo completo <FaArrowRight size={11} />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="danger" />
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
          <div className="p-5 rounded-4 text-center position-relative overflow-hidden bg-white border shadow-sm">
            <div className="p-3 rounded-circle d-inline-flex mb-3 shadow-sm border" style={{ backgroundColor: '#fff1f2', color: '#e11d48' }}>
              <FaBirthdayCake size={36} />
            </div>
            <h2 className="display-6 fw-bold mb-3" style={{ color: '#0f172a' }}>¿Planeando un Cumpleaños o Festejo?</h2>
            <p className="text-secondary mx-auto mb-4" style={{ maxWidth: '620px', fontSize: '1.05rem' }}>
              Encuentra los combos de cotillón, globos temáticos, bengalas y vajilla descartable en un solo lugar con despacho inmediato.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <Button as={Link} to="/catalogo" className="btn-festive px-4 py-2">
                Ver Catálogo de Artículos
              </Button>
              <Button as={Link} to="/como-comprar" className="btn-festive-outline px-4 py-2">
                Guía Paso a Paso
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
