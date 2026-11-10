import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaShoppingBag, FaArrowLeft, FaShieldAlt } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const formatMoney = (val) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val || 0);

export default function Checkout() {
  const { items, getSubtotal, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const subtotal = getSubtotal();
  const [minOrder, setMinOrder] = useState(15000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderCreated, setOrderCreated] = useState(null);

  const [form, setForm] = useState({
    nombre: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username : '',
    email: user ? user.email : '',
    telefono: '',
    direccion: '',
    ciudad: '',
    estado: '',
    cp: '',
    destinatario_documento: '',
    nota: '',
  });

  useEffect(() => {
    async function loadConfig() {
      try {
        const config = await api.getStoreConfig();
        if (config?.minOrderAmount) {
          setMinOrder(config.minOrderAmount);
        }
      } catch (e) {
        // Fallback default
      }
    }
    loadConfig();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError('Tu carrito está vacío.');
      return;
    }

    if (subtotal < minOrder) {
      setError(`El monto mínimo de pedido es de ${formatMoney(minOrder)}. Te faltan ${formatMoney(minOrder - subtotal)}.`);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        envio: 0,
        items: items.map((it) => ({
          product_id: it.id,
          product_name: it.name,
          cantidad: it.quantity,
          precio_unitario: it.price,
          atributos: it.attributes || {},
        })),
      };

      const res = await api.createOrder(payload, token);
      setOrderCreated(res);
      clearCart();
    } catch (err) {
      setError(err.message || 'Error al procesar el pedido. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (orderCreated) {
    return (
      <Container className="py-5 text-center">
        <div className="p-5 rounded-4 bg-surface-card border border-secondary border-opacity-50 mx-auto max-w-lg" style={{ maxWidth: '600px' }}>
          <div className="p-3 rounded-circle bg-surface border border-secondary text-white d-inline-flex mb-3">
            <FaCheckCircle size={40} />
          </div>
          <h2 className="text-white fw-bold mb-2">¡Pedido #{orderCreated.id} Confirmado!</h2>
          <p className="text-muted small mb-4">
            Gracias por tu compra, <strong>{orderCreated.nombre}</strong>. Hemos registrado tu pedido con un total de{' '}
            <strong className="text-white">{formatMoney(orderCreated.total)}</strong>.
          </p>

          <div className="p-3 rounded-3 bg-surface border border-secondary border-opacity-25 text-start mb-4 small text-muted">
            <div className="mb-1"><strong>Email de contacto:</strong> {orderCreated.email}</div>
            <div className="mb-1"><strong>Destino:</strong> {orderCreated.direccion}, {orderCreated.ciudad}</div>
            <div><strong>Estado:</strong> A procesar</div>
          </div>

          <div className="d-flex justify-content-center gap-3">
            <Button as={Link} to="/catalogo" className="btn-monochrome px-4 py-2">
              Volver al Catálogo
            </Button>
            {token && (
              <Button as={Link} to="/pedidos" className="btn-monochrome-outline px-4 py-2">
                Ver mis pedidos
              </Button>
            )}
          </div>
        </div>
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container className="py-5 text-center">
        <div className="p-5 rounded-4 bg-surface-card border border-secondary border-opacity-25 mx-auto" style={{ maxWidth: '500px' }}>
          <FaShoppingBag size={48} className="text-dim mb-3" />
          <h4 className="text-white fw-bold mb-2">Tu carrito está vacío</h4>
          <p className="text-muted small mb-4">No tienes ningún artículo en el carrito para procesar una compra.</p>
          <Button as={Link} to="/catalogo" className="btn-monochrome px-4 py-2">
            Ver Catálogo
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <div className="py-5">
      <Container>
        <div className="mb-4">
          <Button
            as={Link}
            to="/catalogo"
            variant="link"
            className="text-muted hover-white p-0 text-decoration-none small d-inline-flex align-items-center gap-2"
          >
            <FaArrowLeft size={12} /> Seguir comprando
          </Button>
          <h1 className="h2 fw-bold text-white mt-2 mb-1">Finalizar Compra</h1>
          <p className="text-muted small mb-0">Completa tus datos para confirmar el pedido y coordinar el despacho.</p>
        </div>

        {error && <Alert variant="danger" className="py-2 small mb-4">{error}</Alert>}

        <Row className="g-5">
          {/* Formulario */}
          <Col lg={7}>
            <div className="p-4 rounded-3 bg-surface-card border border-secondary border-opacity-25">
              <h5 className="text-white fw-bold mb-3">Datos del Destinatario</h5>
              <Form onSubmit={handleSubmit}>
                <Row className="g-3 mb-3">
                  <Col sm={6}>
                    <Form.Label className="small text-muted">Nombre y Apellido</Form.Label>
                    <Form.Control
                      className="form-control-custom"
                      required
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      placeholder="Ej: Laura Martínez"
                    />
                  </Col>
                  <Col sm={6}>
                    <Form.Label className="small text-muted">Email</Form.Label>
                    <Form.Control
                      type="email"
                      className="form-control-custom"
                      required
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="laura@ejemplo.com"
                    />
                  </Col>
                </Row>

                <Row className="g-3 mb-3">
                  <Col sm={6}>
                    <Form.Label className="small text-muted">Teléfono / Celular</Form.Label>
                    <Form.Control
                      className="form-control-custom"
                      required
                      name="telefono"
                      value={form.telefono}
                      onChange={handleChange}
                      placeholder="+54 9 11 ..."
                    />
                  </Col>
                  <Col sm={6}>
                    <Form.Label className="small text-muted">DNI / CUIT (Facturación)</Form.Label>
                    <Form.Control
                      className="form-control-custom"
                      name="destinatario_documento"
                      value={form.destinatario_documento}
                      onChange={handleChange}
                      placeholder="Número de documento"
                    />
                  </Col>
                </Row>

                <div className="mb-3">
                  <Form.Label className="small text-muted">Dirección de Entrega</Form.Label>
                  <Form.Control
                    className="form-control-custom"
                    required
                    name="direccion"
                    value={form.direccion}
                    onChange={handleChange}
                    placeholder="Calle, número, piso/depto"
                  />
                </div>

                <Row className="g-3 mb-3">
                  <Col sm={5}>
                    <Form.Label className="small text-muted">Ciudad / Localidad</Form.Label>
                    <Form.Control
                      className="form-control-custom"
                      required
                      name="ciudad"
                      value={form.ciudad}
                      onChange={handleChange}
                      placeholder="Ciudad"
                    />
                  </Col>
                  <Col sm={4}>
                    <Form.Label className="small text-muted">Provincia</Form.Label>
                    <Form.Control
                      className="form-control-custom"
                      name="estado"
                      value={form.estado}
                      onChange={handleChange}
                      placeholder="Provincia"
                    />
                  </Col>
                  <Col sm={3}>
                    <Form.Label className="small text-muted">Código Postal</Form.Label>
                    <Form.Control
                      className="form-control-custom"
                      name="cp"
                      value={form.cp}
                      onChange={handleChange}
                      placeholder="CP"
                    />
                  </Col>
                </Row>

                <div className="mb-4">
                  <Form.Label className="small text-muted">Nota del Pedido (Opcional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    className="form-control-custom"
                    name="nota"
                    value={form.nota}
                    onChange={handleChange}
                    placeholder="Aclaraciones sobre horario de entrega, transporte o retiro..."
                  />
                </div>

                <Button
                  type="submit"
                  className="btn-monochrome w-100 py-3 fw-bold"
                  disabled={loading || subtotal < minOrder}
                >
                  {loading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    `Confirmar Pedido - ${formatMoney(subtotal)}`
                  )}
                </Button>
              </Form>
            </div>
          </Col>

          {/* Resumen lateral */}
          <Col lg={5}>
            <div className="p-4 rounded-3 bg-surface-card border border-secondary border-opacity-25 position-sticky" style={{ top: '100px' }}>
              <h5 className="text-white fw-bold mb-3">Resumen de la Orden</h5>

              <div className="d-flex flex-column gap-3 mb-4 max-h-60 overflow-auto pe-1" style={{ maxHeight: '280px' }}>
                {items.map((it) => (
                  <div key={it.id} className="d-flex align-items-center justify-content-between gap-2 border-bottom border-secondary border-opacity-25 pb-2">
                    <div className="d-flex align-items-center gap-2 min-w-0">
                      <img src={it.imageUrl} alt={it.name} style={{ width: 44, height: 44, borderRadius: '0.375rem', objectFit: 'cover' }} />
                      <div className="min-w-0">
                        <div className="text-white small fw-bold text-truncate">{it.name}</div>
                        <div className="text-dim small">{it.quantity} x {formatMoney(it.price)}</div>
                      </div>
                    </div>
                    <span className="text-white small fw-bold">{formatMoney(it.price * it.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small">Subtotal</span>
                <span className="text-white fw-bold">{formatMoney(subtotal)}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted small">Envío</span>
                <span className="text-dim small">A coordinar / Sin cargo retiro</span>
              </div>

              <hr className="border-secondary border-opacity-25 my-2" />

              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="h6 text-white fw-bold mb-0">Total</span>
                <span className="h4 text-white fw-bold mb-0">{formatMoney(subtotal)}</span>
              </div>

              {subtotal < minOrder && (
                <Alert variant="warning" className="small py-2 mb-0">
                  El monto mínimo es de {formatMoney(minOrder)}. Agrega {formatMoney(minOrder - subtotal)} más para confirmar tu orden.
                </Alert>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
