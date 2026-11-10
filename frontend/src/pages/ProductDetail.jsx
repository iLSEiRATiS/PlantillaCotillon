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
        <Spinner animation="border" variant="light" />
        <p className="text-muted small mt-2">Cargando detalles...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <Container className="py-5 text-center">
        <div className="p-5 rounded-3 bg-surface-card border border-secondary border-opacity-25 max-w-md mx-auto">
          <h5 className="text-white fw-bold mb-3">Producto no encontrado</h5>
          <p className="text-muted small mb-4">{error || 'El artículo solicitado no existe o fue retirado del catálogo.'}</p>
          <Button as={Link} to="/catalogo" className="btn-monochrome">
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
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop&q=80';

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
            className="text-muted hover-white p-0 text-decoration-none small d-inline-flex align-items-center gap-2"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft size={12} /> Volver
          </Button>
        </div>

        <Row className="g-5 align-items-start">
          {/* Imagen del producto */}
          <Col lg={6}>
            <div className="rounded-4 overflow-hidden border border-secondary border-opacity-25 bg-surface-card p-2">
              <div style={{ position: 'relative', paddingTop: '85%', overflow: 'hidden', borderRadius: '0.5rem' }}>
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
            <div className="d-flex flex-column gap-3">
              <div>
                {categorySlug ? (
                  <Link to={`/catalogo?cat=${categorySlug}`} className="custom-badge d-inline-block text-decoration-none mb-2">
                    {categoryName}
                  </Link>
                ) : (
                  <span className="custom-badge d-inline-block mb-2">{categoryName}</span>
                )}
                <h1 className="h2 fw-bold text-white mb-2">{name}</h1>
                {product.sku && <div className="text-dim small mb-3">SKU: {product.sku}</div>}
                <div className="display-6 fw-bold text-white mb-3">{formatMoney(price)}</div>
              </div>

              <hr className="border-secondary border-opacity-25 my-1" />

              <div>
                <h6 className="text-white small fw-bold text-uppercase tracking-wider mb-2">Descripción</h6>
                <p className="text-muted lh-base small mb-0">
                  {product.descripcion || product.description || 'Artículo ideal para ambientación y festejos. Materiales de alta durabilidad y estética minimalista.'}
                </p>
              </div>

              <hr className="border-secondary border-opacity-25 my-1" />

              {/* Selector de Cantidad y Agregar */}
              <div className="d-flex flex-column gap-3 pt-2">
                <div className="d-flex align-items-center gap-3">
                  <span className="text-white small fw-bold">Cantidad:</span>
                  <div className="d-flex align-items-center border border-secondary rounded p-1 bg-surface-card">
                    <button
                      className="btn btn-sm text-white p-0 px-2"
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      aria-label="Disminuir"
                    >
                      <FaMinus size={10} />
                    </button>
                    <span className="small px-3 text-white fw-bold">{qty}</span>
                    <button
                      className="btn btn-sm text-white p-0 px-2"
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
                      added ? 'btn-monochrome-outline' : 'btn-monochrome'
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

              {/* Sellos de garantía */}
              <div className="p-3 rounded-3 bg-surface-card border border-secondary border-opacity-25 mt-3 d-flex flex-column gap-2">
                <div className="d-flex align-items-center gap-2 text-dim small">
                  <FaTruck size={14} className="text-white" />
                  <span>Envíos a todo el país o retiro en depósito sin costo.</span>
                </div>
                <div className="d-flex align-items-center gap-2 text-dim small">
                  <FaShieldAlt size={14} className="text-white" />
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
