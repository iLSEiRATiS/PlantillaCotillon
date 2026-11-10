import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Spinner, Badge } from 'react-bootstrap';
import { FaPlus, FaMinus, FaShoppingBag, FaArrowLeft, FaCheck, FaTruck, FaShieldAlt } from 'react-icons/fa';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const formatMoney = (val) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val || 0);

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getProduct(id);
        setProduct(data);
      } catch (err) {
        setError(err.message || 'No se pudo cargar el producto.');
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-5 my-5">
        <Spinner animation="border" variant="danger" />
        <p className="text-muted small mt-2">Cargando detalles...</p>
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

  const name = product.nombre || product.name || 'Producto';
  const price = product.precio !== undefined ? product.precio : (product.price || 0);
  const categoryName = product.categoria?.nombre || product.category?.name || 'General';
  const categorySlug = product.categoria?.slug || product.category?.slug || '';
  const image =
    product.imageUrl ||
    product.image_url ||
    (Array.isArray(product.images) && product.images[0]) ||
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80';

  const handleAddToCart = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="py-5">
      <Container>
        {/* Breadcrumb de regreso */}
        <div className="mb-4">
          <Button
            variant="link"
            className="text-secondary p-0 text-decoration-none small d-inline-flex align-items-center gap-2 fw-bold"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft size={12} /> Volver al catálogo
          </Button>
        </div>

        <Row className="g-5 align-items-start">
          {/* Imagen del producto */}
          <Col lg={6}>
            <div className="rounded-4 overflow-hidden border bg-white p-2 shadow-sm">
              <div style={{ position: 'relative', paddingTop: '85%', overflow: 'hidden', borderRadius: '0.75rem', backgroundColor: '#f1f5f9' }}>
                <img
                  src={image}
                  alt={name}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
          </Col>

          {/* Detalles y compra */}
          <Col lg={6}>
            <div className="p-4 p-md-5 rounded-4 bg-white border shadow-sm d-flex flex-column gap-3">
              <div>
                {categorySlug ? (
                  <Link to={`/catalogo?cat=${categorySlug}`} className="festive-pill text-decoration-none mb-2">
                    {categoryName}
                  </Link>
                ) : (
                  <span className="festive-pill mb-2">{categoryName}</span>
                )}
                <h1 className="h2 fw-bold mb-2 mt-2" style={{ color: '#0f172a' }}>{name}</h1>
                {product.sku && <div className="text-muted small mb-3 fw-semibold">SKU: {product.sku}</div>}
                <div className="display-6 fw-bold mb-3" style={{ color: 'var(--primary)' }}>
                  {formatMoney(price)}
                </div>
              </div>

              <hr className="my-1 border-light-subtle" />

              <div>
                <h6 className="small fw-bold text-uppercase tracking-wider mb-2" style={{ color: '#0f172a' }}>Descripción</h6>
                <p className="text-secondary lh-base small mb-0" style={{ fontSize: '0.98rem' }}>
                  {product.descripcion || product.description || 'Artículo ideal para fiestas, cumpleaños y ambientación. Calidad garantizada para eventos.'}
                </p>
              </div>

              <hr className="my-1 border-light-subtle" />

              {/* Selector de Cantidad y Agregar */}
              <div className="d-flex flex-column gap-3 pt-2">
                <div className="d-flex align-items-center gap-3">
                  <span className="small fw-bold" style={{ color: '#0f172a' }}>Cantidad:</span>
                  <div className="d-flex align-items-center border rounded p-1 bg-light">
                    <button
                      className="btn btn-sm text-dark p-0 px-2 fw-bold"
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      aria-label="Disminuir"
                    >
                      <FaMinus size={10} />
                    </button>
                    <span className="small px-3 fw-bold" style={{ color: '#0f172a' }}>{qty}</span>
                    <button
                      className="btn btn-sm text-dark p-0 px-2 fw-bold"
                      onClick={() => setQty(qty + 1)}
                      aria-label="Aumentar"
                    >
                      <FaPlus size={10} />
                    </button>
                  </div>
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
                        <FaCheck /> ¡Agregado al carrito!
                      </>
                    ) : (
                      <>
                        <FaShoppingBag /> Agregar al carrito
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Sellos de confianza */}
              <div className="p-3 rounded-3 bg-light border mt-3 d-flex flex-column gap-2">
                <div className="d-flex align-items-center gap-2 small text-secondary">
                  <FaTruck size={16} className="text-danger" />
                  <span>Envíos a todo el país o retiro en depósito sin costo.</span>
                </div>
                <div className="d-flex align-items-center gap-2 small text-secondary">
                  <FaShieldAlt size={16} className="text-warning" />
                  <span>Compra protegida y confirmación inmediata con comprobante digital.</span>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
