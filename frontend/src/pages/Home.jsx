import { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Spinner, Accordion } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaTruck, 
  FaShieldAlt, 
  FaHeadset, 
  FaArrowRight, 
  FaBirthdayCake, 
  FaGift, 
  FaStar,
  FaTag,
  FaCheckCircle,
  FaQuestionCircle,
  FaQuoteLeft
} from 'react-icons/fa';
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
      {/* CINTA DE CUPÓN PROMOCIONAL */}
      <div className="py-2 text-center text-dark" style={{ backgroundColor: '#fef3c7', borderBottom: '1px solid #fde68a', fontSize: '0.86rem' }}>
        <Container>
          <span className="fw-semibold">
            <FaTag className="text-danger me-1" /> ¡Promoción Especial de Lanzamiento! Usá el cupón{' '}
            <code className="fw-bold text-danger px-1 bg-white rounded border border-warning">FIESTA10</code> y obtené un{' '}
            <strong>10% OFF</strong> en tu primer pedido.
          </span>
        </Container>
      </div>

      {/* HERO BANNER FESTIVO */}
      <section className="hero-banner text-center">
        <Container>
          <div className="mx-auto" style={{ maxWidth: '840px' }}>
            <h1 className="display-4 fw-bold mb-3 tracking-tight" style={{ color: '#000000' }}>
              ¡Todo para que tu Fiesta sea Inolvidable!
            </h1>
            <p className="lead text-secondary mb-4 mx-auto" style={{ maxWidth: '640px', fontSize: '1.15rem' }}>
              Encontrá los mejores globos, vajilla descartable, bengalas de humo, guirnaldas y artículos de carnaval carioca para tus festejos y eventos.
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

      {/* ===================================================
          TESTIMONIOS Y OPINIONES DE CLIENTES
          =================================================== */}
      <section className="py-5" style={{ backgroundColor: '#f8fafc' }}>
        <Container>
          <div className="text-center mb-5">
            <span className="text-danger small text-uppercase fw-bold tracking-wider">Social Proof</span>
            <h2 className="display-6 fw-bold mb-2" style={{ color: '#0f172a' }}>
              Lo que Dicen Quienes Festejan con Nosotros
            </h2>
            <p className="text-secondary mx-auto mb-0" style={{ maxWidth: '580px' }}>
              Más de 5.000 eventos, cumpleaños y celebraciones ambientadas con nuestros artículos en todo el país.
            </p>
          </div>

          <Row className="g-4">
            <Col lg={4} md={6}>
              <div className="p-4 rounded-4 bg-white border shadow-sm h-100 d-flex flex-column">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="d-flex text-warning">
                    <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                  </div>
                  <span className="badge bg-success-subtle text-success small">
                    <FaCheckCircle className="me-1" size={10} /> Compra Verificada
                  </span>
                </div>
                <p className="text-secondary small mb-4 flex-grow-1" style={{ lineHeight: '1.6' }}>
                  "Armé el cumpleaños de 15 de mi hija con los globos cromados y las bengalas de humo. La calidad superó ampliamente mis expectativas. ¡Llegó todo en 24hs!"
                </p>
                <div className="d-flex align-items-center gap-3 pt-3 border-top">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                    style={{ width: 42, height: 42, backgroundColor: '#e11d48' }}
                  >
                    LG
                  </div>
                  <div>
                    <div className="fw-bold small text-dark">Lorena Gómez</div>
                    <small className="text-muted">Cumpleaños de 15 • CABA</small>
                  </div>
                </div>
              </div>
            </Col>

            <Col lg={4} md={6}>
              <div className="p-4 rounded-4 bg-white border shadow-sm h-100 d-flex flex-column">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="d-flex text-warning">
                    <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                  </div>
                  <span className="badge bg-success-subtle text-success small">
                    <FaCheckCircle className="me-1" size={10} /> Compra Verificada
                  </span>
                </div>
                <p className="text-secondary small mb-4 flex-grow-1" style={{ lineHeight: '1.6' }}>
                  "Compramos todo el combo de Carnaval Carioca y vinchas LED para nuestro casamiento. La tanda temática fue un éxito total, todos los invitados sacándose fotos."
                </p>
                <div className="d-flex align-items-center gap-3 pt-3 border-top">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                    style={{ width: 42, height: 42, backgroundColor: '#6366f1' }}
                  >
                    MF
                  </div>
                  <div>
                    <div className="fw-bold small text-dark">Martín &amp; Fernanda</div>
                    <small className="text-muted">Boda y Fiesta • Rosario</small>
                  </div>
                </div>
              </div>
            </Col>

            <Col lg={4} md={6}>
              <div className="p-4 rounded-4 bg-white border shadow-sm h-100 d-flex flex-column">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="d-flex text-warning">
                    <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                  </div>
                  <span className="badge bg-success-subtle text-success small">
                    <FaCheckCircle className="me-1" size={10} /> Compra Verificada
                  </span>
                </div>
                <p className="text-secondary small mb-4 flex-grow-1" style={{ lineHeight: '1.6' }}>
                  "Tengo un salón de fiestas infantiles en Mendoza y les compro por mayor todos los meses. Los precios son inmejorables y el descuento por transferencia es real."
                </p>
                <div className="d-flex align-items-center gap-3 pt-3 border-top">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                    style={{ width: 42, height: 42, backgroundColor: '#0d9488' }}
                  >
                    CP
                  </div>
                  <div>
                    <div className="fw-bold small text-dark">Carlos Pardo</div>
                    <small className="text-muted">Salón de Fiestas • Mendoza</small>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ===================================================
          PREGUNTAS FRECUENTES (FAQ INTERACTIVO)
          =================================================== */}
      <section className="py-5 bg-white border-top border-bottom">
        <Container>
          <div className="text-center mb-5">
            <span className="text-danger small text-uppercase fw-bold tracking-wider">Ayuda &amp; Soporte</span>
            <h2 className="display-6 fw-bold mb-2" style={{ color: '#0f172a' }}>
              Preguntas Frecuentes
            </h2>
            <p className="text-secondary mx-auto mb-0" style={{ maxWidth: '560px' }}>
              Todo lo que necesitás saber sobre envíos, medios de pago, compras mayoristas y retiro en depósito.
            </p>
          </div>

          <div className="mx-auto" style={{ maxWidth: '820px' }}>
            <Accordion defaultActiveKey="0" flush className="border rounded-3 p-2 bg-light">
              <Accordion.Item eventKey="0" className="bg-transparent border-0 mb-2">
                <Accordion.Header>
                  <strong style={{ color: '#0f172a' }}>¿Hacen envíos al interior del país y cómo se despacha?</strong>
                </Accordion.Header>
                <Accordion.Body className="small text-secondary bg-white rounded-2 p-3 mt-1">
                  ¡Sí! Realizamos envíos a todo el territorio argentino a través de correo privado y expresos. Todos los artículos de cotillón van con embalaje reforzado y protección especial para globos, vajilla y luces LED. El tiempo promedio de entrega es de 48 a 96 hs hábiles.
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="1" className="bg-transparent border-0 mb-2">
                <Accordion.Header>
                  <strong style={{ color: '#0f172a' }}>¿Cuál es el monto mínimo de compra y cómo accedo a precios mayoristas?</strong>
                </Accordion.Header>
                <Accordion.Body className="small text-secondary bg-white rounded-2 p-3 mt-1">
                  Podés comprar de forma minorista sin restricción o aprovechar la lista mayorista para salones, organizadores y revendedores superando el monto mínimo de $ 15.000. Además, contás con un 10% de descuento adicional abonando mediante transferencia bancaria.
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="2" className="bg-transparent border-0 mb-2">
                <Accordion.Header>
                  <strong style={{ color: '#0f172a' }}>¿Los globos y guirnaldas vienen listos para armar?</strong>
                </Accordion.Header>
                <Accordion.Body className="small text-secondary bg-white rounded-2 p-3 mt-1">
                  Los globos se despachan desinflados para garantizar su cuidado en el flete. Los kits de arcos orgánicos incluyen la cinta de acetato guía y puntos adhesivos de silicona para que cualquier persona pueda armarlo en menos de 30 minutos sin experiencia previa.
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="3" className="bg-transparent border-0 mb-2">
                <Accordion.Header>
                  <strong style={{ color: '#0f172a' }}>¿Qué medios de pago aceptan?</strong>
                </Accordion.Header>
                <Accordion.Body className="small text-secondary bg-white rounded-2 p-3 mt-1">
                  Aceptamos todas las tarjetas de crédito y débito a través de Mercado Pago (con promociones de cuotas sin interés), transferencia bancaria con descuento directo y efectivo contra entrega al retirar por nuestro depósito central.
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="4" className="bg-transparent border-0">
                <Accordion.Header>
                  <strong style={{ color: '#0f172a' }}>¿Puedo retirar personalmente en el depósito de CABA?</strong>
                </Accordion.Header>
                <Accordion.Body className="small text-secondary bg-white rounded-2 p-3 mt-1">
                  ¡Por supuesto! Podés retirar sin cargo de envío en nuestro punto de entrega ubicado en Av. Corrientes 3450, Almagro (CABA), de lunes a viernes de 9 a 18 hs y sábados de 9 a 13 hs una vez confirmado el pedido.
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </div>
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
              Encontrá los combos de cotillón, globos temáticos, bengalas y vajilla descartable en un solo lugar con despacho inmediato.
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
