import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Spinner, Form, Badge, Accordion } from 'react-bootstrap';
import { 
  FaPlus, 
  FaMinus, 
  FaShoppingBag, 
  FaArrowLeft, 
  FaCheck, 
  FaTruck, 
  FaShieldAlt, 
  FaStar, 
  FaFire, 
  FaMapMarkerAlt, 
  FaBoxOpen,
  FaCheckCircle,
  FaShareAlt,
  FaBolt
} from 'react-icons/fa';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

const formatMoney = (val) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(val || 0);

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  // Galería de imágenes
  const [selectedImg, setSelectedImg] = useState('');

  // Simulador de Código Postal
  const [postalCode, setPostalCode] = useState('');
  const [shippingResult, setShippingResult] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getProduct(id);
        setProduct(data);
        const mainImg =
          data.imageUrl ||
          data.image_url ||
          (Array.isArray(data.images) && data.images[0]) ||
          'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80';
        setSelectedImg(mainImg);

        // Cargar productos relacionados de la misma categoría
        const catSlug = data.categoria?.slug || data.category?.slug;
        if (catSlug) {
          const res = await api.getProducts({ category: catSlug, limit: 5 });
          const items = (res.items || res.products || []).filter(
            (p) => String(p.id) !== String(data.id)
          );
          setRelatedProducts(items.slice(0, 4));
        }
      } catch (err) {
        setError(err.message || 'No se pudo cargar el producto.');
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleCalculateShipping = (e) => {
    e.preventDefault();
    if (!postalCode.trim() || postalCode.trim().length < 4) return;

    setCalcLoading(true);
    setTimeout(() => {
      setCalcLoading(false);
      const isCabaGba = postalCode.startsWith('1');
      setShippingResult({
        pickup: { title: 'Retiro en Depósito CABA', cost: 0, time: 'Listo hoy en 2 horas' },
        standard: {
          title: 'Envío a Domicilio Estándar',
          cost: isCabaGba ? 3500 : 5400,
          time: isCabaGba ? 'Llega en 24 a 48 hs' : 'Llega en 3 a 5 días hábiles',
        },
        express: {
          title: 'Envío Express Moto',
          cost: isCabaGba ? 4900 : null,
          time: isCabaGba ? 'Llega hoy antes de las 18 hs' : null,
        },
      });
    }, 450);
  };

  if (loading) {
    return (
      <div className="text-center py-5 my-5">
        <Spinner animation="border" variant="danger" />
        <p className="text-muted small mt-2">Cargando artículo de cotillón...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <Container className="py-5 text-center">
        <div className="p-5 rounded-3 bg-white border max-w-md mx-auto shadow-sm">
          <h5 className="fw-bold mb-3" style={{ color: '#0f172a' }}>Producto no encontrado</h5>
          <p className="text-muted small mb-4">{error || 'El artículo solicitado no existe o fue retirado del catálogo.'}</p>
          <Button as={Link} to="/catalogo" className="btn-festive">
            Volver al Catálogo
          </Button>
        </div>
      </Container>
    );
  }

  const name = product.nombre || product.name || 'Producto de Cotillón';
  const price = product.precio !== undefined ? product.precio : (product.price || 0);
  const originalPrice = product.precioOriginal || (price > 4000 ? Math.round(price * 1.18) : null);
  const discountPercent = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const categoryName = product.categoria?.nombre || product.category?.name || 'Cotillón';
  const categorySlug = product.categoria?.slug || product.category?.slug || '';
  const stock = product.stock !== undefined ? product.stock : 8;

  // Galería de miniaturas (usamos la principal + ángulos temáticos de apoyo)
  const gallery = [
    selectedImg,
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&auto=format&fit=crop&q=80',
  ];

  return (
    <div className="py-4" style={{ backgroundColor: '#f8fafc', minHeight: '80vh' }}>
      <Container>
        {/* Breadcrumb navegable */}
        <div className="mb-3 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2 small text-secondary">
            <Link to="/" className="text-decoration-none text-secondary">Inicio</Link>
            <span>/</span>
            <Link to="/catalogo" className="text-decoration-none text-secondary">Catálogo</Link>
            {categorySlug && (
              <>
                <span>/</span>
                <Link to={`/catalogo?cat=${categorySlug}`} className="text-decoration-none text-secondary fw-semibold">
                  {categoryName}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-dark fw-bold text-truncate" style={{ maxWidth: '280px' }}>{name}</span>
          </div>

          <Button
            variant="link"
            className="text-secondary p-0 text-decoration-none small d-inline-flex align-items-center gap-1 fw-semibold"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft size={11} /> Volver
          </Button>
        </div>

        {/* Tarjeta Principal de Producto */}
        <div className="p-4 p-lg-5 rounded-4 bg-white border shadow-sm mb-5">
          <Row className="g-5 align-items-start">
            {/* Columna Izquierda: Galería de Fotos */}
            <Col lg={6}>
              <div className="d-flex flex-column gap-3">
                {/* Imagen Principal */}
                <div className="rounded-3 border overflow-hidden bg-white p-3 text-center position-relative" style={{ minHeight: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {discountPercent > 0 && (
                    <span className="badge bg-danger position-absolute top-0 start-0 m-3 px-2 py-1 fw-bold">
                      {discountPercent}% OFF
                    </span>
                  )}
                  <img
                    src={selectedImg}
                    alt={name}
                    style={{
                      maxHeight: '380px',
                      maxWidth: '100%',
                      objectFit: 'contain',
                      transition: 'transform 0.25s ease',
                    }}
                  />
                </div>

                {/* Miniaturas de la Galería */}
                <div className="d-flex gap-2 justify-content-center">
                  {gallery.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`product-thumb-btn ${selectedImg === imgUrl ? 'active' : ''}`}
                      onClick={() => setSelectedImg(imgUrl)}
                    >
                      <img src={imgUrl} alt={`Vista ${idx + 1}`} />
                    </button>
                  ))}
                </div>
              </div>
            </Col>

            {/* Columna Derecha: Información y Compra */}
            <Col lg={6}>
              <div className="d-flex flex-column gap-3">
                {/* Categoría y Calificación */}
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <Link to={`/catalogo?cat=${categorySlug}`} className="badge bg-light text-primary border text-decoration-none px-2 py-1">
                    {categoryName}
                  </Link>

                  <div className="d-flex align-items-center text-warning gap-1 small">
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <span className="text-dark fw-bold ms-1">4.9</span>
                    <span className="text-muted">(38 opiniones)</span>
                  </div>
                </div>

                {/* Título y SKU */}
                <h1 className="h3 fw-bold mb-0" style={{ color: '#0f172a', lineHeight: '1.25' }}>
                  {name}
                </h1>
                {product.sku && (
                  <div className="text-muted small fw-semibold">
                    SKU: {product.sku} • Código de Barra Certificado
                  </div>
                )}

                {/* Badges de Urgencia y Popularidad */}
                <div className="d-flex flex-wrap gap-2 pt-1">
                  {stock <= 8 && (
                    <span className="badge bg-danger-subtle text-danger border border-danger-subtle d-inline-flex align-items-center gap-1 py-1 px-2 fw-bold">
                      <FaFire /> ¡Solo quedan {stock} unidades disponibles!
                    </span>
                  )}
                  <span className="badge bg-success-subtle text-success border border-success-subtle d-inline-flex align-items-center gap-1 py-1 px-2 fw-semibold">
                    <FaBolt /> Despacho inmediato desde depósito
                  </span>
                </div>

                {/* Precios y Cuotas */}
                <div className="pt-2">
                  {originalPrice && (
                    <div className="text-muted small text-decoration-line-through">
                      {formatMoney(originalPrice)}
                    </div>
                  )}
                  <div className="d-flex align-items-baseline gap-2">
                    <span className="display-6 fw-bold text-dark">
                      {formatMoney(price)}
                    </span>
                    {discountPercent > 0 && (
                      <span className="text-success fw-bold">
                        {discountPercent}% de ahorro
                      </span>
                    )}
                  </div>
                  <div className="text-success small fw-semibold mt-1">
                    en 3 cuotas sin interés de {formatMoney(Math.round(price / 3))} o 10% OFF por transferencia bancaria
                  </div>
                </div>

                <hr className="my-1 border-light-subtle" />

                {/* Descripción */}
                <div>
                  <h6 className="small fw-bold text-uppercase tracking-wider mb-2" style={{ color: '#0f172a' }}>
                    Descripción del Artículo
                  </h6>
                  <p className="text-secondary lh-base small mb-0" style={{ fontSize: '0.94rem' }}>
                    {product.descripcion || product.description || 'Artículo ideal para fiestas, cumpleaños, eventos y celebraciones temáticas. Calidad garantizada para ambientaciones festivas inolvidables.'}
                  </p>
                </div>

                <hr className="my-1 border-light-subtle" />

                {/* Selector de Cantidad y Botón Comprar */}
                <div className="d-flex flex-column gap-3 pt-2">
                  <div className="d-flex align-items-center gap-3">
                    <span className="small fw-bold text-dark">Cantidad:</span>
                    <div className="d-flex align-items-center border rounded p-1 bg-light">
                      <button
                        className="btn btn-sm text-dark p-0 px-2 fw-bold"
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        aria-label="Disminuir"
                      >
                        <FaMinus size={10} />
                      </button>
                      <span className="small px-3 fw-bold text-dark">{qty}</span>
                      <button
                        className="btn btn-sm text-dark p-0 px-2 fw-bold"
                        onClick={() => setQty(qty + 1)}
                        aria-label="Aumentar"
                      >
                        <FaPlus size={10} />
                      </button>
                    </div>
                    <span className="text-muted small">({stock} disponibles)</span>
                  </div>

                  <div className="d-flex gap-3">
                    <Button
                      className={`flex-grow-1 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 ${
                        added ? 'btn-festive-outline' : 'btn-festive'
                      }`}
                      onClick={handleAddToCart}
                    >
                      {added ? (
                        <>
                          <FaCheck /> ¡Agregado al Carrito!
                        </>
                      ) : (
                        <>
                          <FaShoppingBag /> Agregar al carrito
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* ===================================================
                    SIMULADOR DE ENVÍO POR CÓDIGO POSTAL (CP)
                    =================================================== */}
                <div className="p-3 rounded-3 bg-light border mt-2">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <FaTruck className="text-primary" />
                    <span className="fw-bold small text-dark">Calculá el costo y tiempo de envío</span>
                  </div>
                  <form onSubmit={handleCalculateShipping} className="d-flex gap-2">
                    <Form.Control
                      type="text"
                      placeholder="Tu Código Postal (ej: 1414)"
                      value={postalCode}
                      maxLength={8}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="form-control-sm bg-white"
                      style={{ maxWidth: '240px' }}
                    />
                    <Button type="submit" size="sm" variant="dark" disabled={calcLoading}>
                      {calcLoading ? 'Calculando...' : 'Calcular'}
                    </Button>
                  </form>

                  {shippingResult && (
                    <div className="mt-3 pt-2 border-top d-flex flex-column gap-2 small">
                      <div className="d-flex align-items-center justify-content-between">
                        <span className="text-dark fw-semibold">
                          <FaMapMarkerAlt className="text-danger me-1" />
                          {shippingResult.pickup.title}:
                        </span>
                        <span className="text-success fw-bold">¡GRATIS! ({shippingResult.pickup.time})</span>
                      </div>
                      <div className="d-flex align-items-center justify-content-between">
                        <span className="text-dark">
                          <FaTruck className="text-secondary me-1" />
                          {shippingResult.standard.title}:
                        </span>
                        <span className="fw-bold">
                          {formatMoney(shippingResult.standard.cost)} ({shippingResult.standard.time})
                        </span>
                      </div>
                      {shippingResult.express.cost && (
                        <div className="d-flex align-items-center justify-content-between">
                          <span className="text-dark">
                            <FaBolt className="text-warning me-1" />
                            {shippingResult.express.title}:
                          </span>
                          <span className="fw-bold text-primary">
                            {formatMoney(shippingResult.express.cost)} ({shippingResult.express.time})
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Sellos de Confianza */}
                <div className="d-flex flex-column gap-2 pt-2">
                  <div className="d-flex align-items-center gap-2 small text-secondary">
                    <FaShieldAlt className="text-success flex-shrink-0" />
                    <span>Compra protegida: garantía directa de calidad en todos nuestros artículos.</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 small text-secondary">
                    <FaBoxOpen className="text-primary flex-shrink-0" />
                    <span>Embalaje reforzado especial para envíos al interior del país.</span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* ===================================================
            SECCIÓN DE OPINIONES Y RESEÑAS DE CLIENTES
            =================================================== */}
        <div className="p-4 p-lg-5 rounded-4 bg-white border shadow-sm mb-5">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
            <div>
              <span className="text-danger small text-uppercase fw-bold tracking-wider">Testimonios Reales</span>
              <h2 className="h4 fw-bold mb-0" style={{ color: '#0f172a' }}>Opiniones sobre este artículo</h2>
            </div>
            <div className="d-flex align-items-center gap-2 bg-light p-2 px-3 rounded-pill border">
              <div className="d-flex text-warning">
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
              </div>
              <span className="fw-bold text-dark">4.9 / 5</span>
              <span className="text-muted small">• 100% recomendación</span>
            </div>
          </div>

          <Row className="g-4">
            <Col md={4}>
              <div className="p-3 rounded-3 bg-light border h-100 d-flex flex-column">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex text-warning small">
                    <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                  </div>
                  <span className="badge bg-success-subtle text-success small">
                    <FaCheckCircle className="me-1" size={10} /> Compra Verificada
                  </span>
                </div>
                <p className="small text-secondary mb-2 flex-grow-1">
                  "Excelente producto! Lo usamos para el cumpleaños de 15 de mi hija y quedó espectacular en las fotos. Llegó muy rápido y en perfecto estado."
                </p>
                <div className="fw-bold small text-dark">Mariana G. - CABA</div>
              </div>
            </Col>

            <Col md={4}>
              <div className="p-3 rounded-3 bg-light border h-100 d-flex flex-column">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex text-warning small">
                    <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                  </div>
                  <span className="badge bg-success-subtle text-success small">
                    <FaCheckCircle className="me-1" size={10} /> Compra Verificada
                  </span>
                </div>
                <p className="small text-secondary mb-2 flex-grow-1">
                  "Compré por mayor para mi local de eventos en Córdoba. Muy buena calidad y mejor precio que en distribuidoras locales. Sin dudas voy a volver a comprar."
                </p>
                <div className="fw-bold small text-dark">Rodrigo M. - Córdoba</div>
              </div>
            </Col>

            <Col md={4}>
              <div className="p-3 rounded-3 bg-light border h-100 d-flex flex-column">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex text-warning small">
                    <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                  </div>
                  <span className="badge bg-success-subtle text-success small">
                    <FaCheckCircle className="me-1" size={10} /> Compra Verificada
                  </span>
                </div>
                <p className="small text-secondary mb-2 flex-grow-1">
                  "Súper conforme. La atención por WhatsApp fue impecable y resolvieron todas mis dudas de cómo inflarlo. Recomendadísimo!"
                </p>
                <div className="fw-bold small text-dark">Florencia T. - La Plata</div>
              </div>
            </Col>
          </Row>
        </div>

        {/* ===================================================
            PRODUCTOS RELACIONADOS ("COMBOS PARA TU FIESTA")
            =================================================== */}
        {relatedProducts.length > 0 && (
          <div className="mb-5">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <span className="text-danger small text-uppercase fw-bold tracking-wider">Combiná tu Festejo</span>
                <h2 className="h4 fw-bold mb-0" style={{ color: '#0f172a' }}>Artículos sugeridos para esta fiesta</h2>
              </div>
              <Link to={`/catalogo?cat=${categorySlug}`} className="fw-bold text-danger small">
                Ver todos de {categoryName} &rarr;
              </Link>
            </div>

            <Row className="g-3">
              {relatedProducts.map((relProd) => (
                <Col xl={3} lg={3} sm={6} key={relProd.id}>
                  <ProductCard product={relProd} layout="grid" />
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Container>
    </div>
  );
}
