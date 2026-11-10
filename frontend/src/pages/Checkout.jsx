import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaCheckCircle, 
  FaShoppingBag, 
  FaArrowLeft, 
  FaShieldAlt, 
  FaTruck, 
  FaLock, 
  FaCreditCard, 
  FaMoneyBillWave, 
  FaStore,
  FaCheck
} from 'react-icons/fa';
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
  const [storeConfig, setStoreConfig] = useState(null);
  const [metodoPago, setMetodoPago] = useState('transferencia');

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
        setStoreConfig(config);
        if (config?.minOrderAmount) {
          setMinOrder(config.minOrderAmount);
        }
        // Seleccionar método activo por defecto
        if (config?.transferEnabled) {
          setMetodoPago('transferencia');
        } else if (config?.mpEnabled) {
          setMetodoPago('mercadopago');
        } else if (config?.cashEnabled) {
          setMetodoPago('efectivo');
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

  // Cálculo de descuento por transferencia
  const transferDiscountPct = storeConfig?.transferEnabled ? (storeConfig.transferDiscount || 0) : 0;
  const isTransfer = metodoPago === 'transferencia';
  const discountAmount = isTransfer ? (subtotal * transferDiscountPct) / 100 : 0;
  const finalTotal = subtotal - discountAmount;

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
        metodo_pago: metodoPago,
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
      setOrderCreated({ ...res, metodoPagoSeleccionado: metodoPago, discountAmount });
      clearCart();
    } catch (err) {
      setError(err.message || 'Error al procesar el pedido. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (orderCreated) {
    const isTransfOrder = orderCreated.metodo_pago === 'transferencia' || orderCreated.metodoPagoSeleccionado === 'transferencia';
    const isMpOrder = orderCreated.metodo_pago === 'mercadopago' || orderCreated.metodoPagoSeleccionado === 'mercadopago';
    const isCashOrder = orderCreated.metodo_pago === 'efectivo' || orderCreated.metodoPagoSeleccionado === 'efectivo';

    return (
      <Container className="py-5 text-center my-auto">
        <div
          className="p-4 p-md-5 rounded-4 mx-auto"
          style={{
            maxWidth: '680px',
            backgroundColor: '#ffffff',
            border: '1.5px solid #e2e8f0',
            boxShadow: 'var(--shadow-card-hover)',
          }}
        >
          <div
            className="p-3 rounded-circle d-inline-flex mb-3"
            style={{ backgroundColor: '#d1fae5', color: '#059669' }}
          >
            <FaCheckCircle size={44} />
          </div>
          <h2 className="fw-bold mb-2" style={{ color: '#0f172a' }}>
            ¡Felicitaciones! Pedido #{orderCreated.id} Recibido
          </h2>
          <p className="small mb-4" style={{ color: '#475569', fontSize: '1rem' }}>
            Muchas gracias por tu compra, <strong>{orderCreated.nombre}</strong>. Hemos registrado tu pedido por un total de{' '}
            <strong style={{ color: '#e11d48' }}>{formatMoney(orderCreated.total)}</strong>.
          </p>

          {/* INSTRUCCIONES SEGÚN MÉTODO DE PAGO */}
          {isTransfOrder && storeConfig && (
            <div
              className="p-4 rounded-3 text-start mb-4"
              style={{ backgroundColor: '#ecfdf5', border: '1.5px solid #a7f3d0' }}
            >
              <h6 className="fw-bold text-success mb-2 d-flex align-items-center gap-2">
                <FaMoneyBillWave /> Datos para Realizar la Transferencia (¡{transferDiscountPct}% OFF Aplicado!):
              </h6>
              <div className="small mb-2" style={{ color: '#065f46' }}>
                Realiza la transferencia por <strong>{formatMoney(orderCreated.total)}</strong> a la siguiente cuenta bancaria:
              </div>
              <div className="p-3 rounded-2 bg-white border small" style={{ color: '#1e293b' }}>
                <div><strong>Banco:</strong> {storeConfig.transferBank}</div>
                <div><strong>Titular:</strong> {storeConfig.transferHolder}</div>
                <div><strong>CBU:</strong> <code className="fw-bold fs-6">{storeConfig.transferCbu}</code></div>
                <div><strong>Alias:</strong> <code className="fw-bold fs-6">{storeConfig.transferAlias}</code></div>
                <div><strong>CUIT:</strong> {storeConfig.transferCuit}</div>
              </div>
              <small className="text-muted d-block mt-2">
                Envíanos tu comprobante por WhatsApp al 11 5555-0000 o responde al email con el # de orden.
              </small>
            </div>
          )}

          {isMpOrder && (
            <div
              className="p-4 rounded-3 text-start mb-4"
              style={{ backgroundColor: '#e0f2fe', border: '1.5px solid #bae6fd' }}
            >
              <h6 className="fw-bold text-primary mb-2 d-flex align-items-center gap-2">
                <FaCreditCard /> Pago con Mercado Pago / Tarjetas
              </h6>
              <p className="small mb-2" style={{ color: '#0369a1' }}>
                Tu orden ha sido pre-autorizada. Se enviará a tu email ({orderCreated.email}) el enlace de cobro seguro de Mercado Pago para abonar con tarjeta en hasta {storeConfig?.mpInstallments || 3} cuotas.
              </p>
            </div>
          )}

          {isCashOrder && (
            <div
              className="p-4 rounded-3 text-start mb-4"
              style={{ backgroundColor: '#fef3c7', border: '1.5px solid #fde68a' }}
            >
              <h6 className="fw-bold text-warning mb-2 d-flex align-items-center gap-2" style={{ color: '#b45309' }}>
                <FaStore /> Retiro y Pago en Depósito
              </h6>
              <p className="small mb-0" style={{ color: '#78350f' }}>
                {storeConfig?.cashInstructions || 'Puedes abonar en efectivo al retirar en Av. Corrientes 3450, Almagro.'}
              </p>
            </div>
          )}

          <div
            className="p-3 rounded-3 text-start mb-4 small"
            style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155' }}
          >
            <div className="mb-1"><strong>Email registrado:</strong> {orderCreated.email}</div>
            <div className="mb-1"><strong>Destino:</strong> {orderCreated.direccion}, {orderCreated.ciudad}</div>
            <div><strong>Estado:</strong> <span className="badge bg-warning text-dark">A procesar</span></div>
          </div>

          <div className="d-flex justify-content-center gap-3">
            <Button as={Link} to="/catalogo" className="btn-festive px-4 py-2">
              Volver al Catálogo
            </Button>
            {token && (
              <Button as={Link} to="/pedidos" className="btn-festive-outline px-4 py-2">
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
      <Container className="py-5 text-center my-auto">
        <div
          className="p-5 rounded-4 mx-auto"
          style={{
            maxWidth: '520px',
            backgroundColor: '#ffffff',
            border: '1.5px solid #e2e8f0',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div
            className="p-3 rounded-circle d-inline-flex mb-3"
            style={{ backgroundColor: '#ffe4e6', color: '#e11d48' }}
          >
            <FaShoppingBag size={40} />
          </div>
          <h4 className="fw-bold mb-2" style={{ color: '#0f172a' }}>Tu carrito está vacío</h4>
          <p className="small mb-4" style={{ color: '#64748b' }}>
            No tienes ningún producto seleccionado para procesar una compra.
          </p>
          <Button as={Link} to="/catalogo" className="btn-festive px-4 py-2">
            Explorar Catálogo
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
            className="p-0 text-decoration-none small d-inline-flex align-items-center gap-2 mb-2"
            style={{ color: '#64748b', fontWeight: 600 }}
          >
            <FaArrowLeft size={12} /> Seguir comprando en el catálogo
          </Button>
          <h1 className="h2 fw-bold mt-1 mb-1" style={{ color: '#0f172a' }}>
            Finalizar Compra
          </h1>
          <p className="small mb-0" style={{ color: '#64748b' }}>
            Ingresa los datos para la entrega y elige tu método de pago preferido.
          </p>
        </div>

        {error && <Alert variant="danger" className="py-2 small mb-4">{error}</Alert>}

        <Row className="g-5">
          {/* Formulario */}
          <Col lg={7}>
            <div
              className="p-4 p-md-5 rounded-4 mb-4"
              style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid #e2e8f0',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#0f172a' }}>
                <FaTruck className="text-danger" /> 1. Datos del Destinatario y Envío
              </h5>
              <Form onSubmit={handleSubmit}>
                <Row className="g-3 mb-3">
                  <Col sm={6}>
                    <Form.Label className="small fw-bold" style={{ color: '#334155' }}>
                      Nombre y Apellido *
                    </Form.Label>
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
                    <Form.Label className="small fw-bold" style={{ color: '#334155' }}>
                      Email de Contacto *
                    </Form.Label>
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
                    <Form.Label className="small fw-bold" style={{ color: '#334155' }}>
                      Teléfono / WhatsApp *
                    </Form.Label>
                    <Form.Control
                      className="form-control-custom"
                      required
                      name="telefono"
                      value={form.telefono}
                      onChange={handleChange}
                      placeholder="+54 9 11 1234-5678"
                    />
                  </Col>
                  <Col sm={6}>
                    <Form.Label className="small fw-bold" style={{ color: '#334155' }}>
                      DNI / CUIT (Facturación)
                    </Form.Label>
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
                  <Form.Label className="small fw-bold" style={{ color: '#334155' }}>
                    Dirección de Entrega *
                  </Form.Label>
                  <Form.Control
                    className="form-control-custom"
                    required
                    name="direccion"
                    value={form.direccion}
                    onChange={handleChange}
                    placeholder="Calle, altura, piso, departamento"
                  />
                </div>

                <Row className="g-3 mb-3">
                  <Col sm={5}>
                    <Form.Label className="small fw-bold" style={{ color: '#334155' }}>
                      Ciudad / Localidad *
                    </Form.Label>
                    <Form.Control
                      className="form-control-custom"
                      required
                      name="ciudad"
                      value={form.ciudad}
                      onChange={handleChange}
                      placeholder="Ej: Rosario"
                    />
                  </Col>
                  <Col sm={4}>
                    <Form.Label className="small fw-bold" style={{ color: '#334155' }}>
                      Provincia *
                    </Form.Label>
                    <Form.Control
                      className="form-control-custom"
                      name="estado"
                      value={form.estado}
                      onChange={handleChange}
                      placeholder="Santa Fe"
                    />
                  </Col>
                  <Col sm={3}>
                    <Form.Label className="small fw-bold" style={{ color: '#334155' }}>
                      C. Postal
                    </Form.Label>
                    <Form.Control
                      className="form-control-custom"
                      name="cp"
                      value={form.cp}
                      onChange={handleChange}
                      placeholder="S2000"
                    />
                  </Col>
                </Row>

                <div className="mb-4">
                  <Form.Label className="small fw-bold" style={{ color: '#334155' }}>
                    Nota o Aclaraciones (Opcional)
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    className="form-control-custom"
                    name="nota"
                    value={form.nota}
                    onChange={handleChange}
                    placeholder="Ej: Horario de entrega preferido, retiro en depósito..."
                  />
                </div>

                {/* 2. FORMA DE PAGO */}
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 pt-3 border-top" style={{ color: '#0f172a' }}>
                  <FaCreditCard className="text-primary" /> 2. Método de Pago
                </h5>

                <div className="d-flex flex-column gap-3 mb-4">
                  {/* Transferencia */}
                  {storeConfig?.transferEnabled !== false && (
                    <div
                      className={`p-3 rounded-3 border d-flex align-items-center justify-content-between cursor-pointer ${
                        metodoPago === 'transferencia' ? 'border-primary bg-light' : 'bg-white'
                      }`}
                      style={{ cursor: 'pointer', borderColor: metodoPago === 'transferencia' ? '#e11d48' : '#e2e8f0' }}
                      onClick={() => setMetodoPago('transferencia')}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <Form.Check
                          type="radio"
                          name="paymentRadio"
                          id="pay-transf"
                          checked={metodoPago === 'transferencia'}
                          onChange={() => setMetodoPago('transferencia')}
                        />
                        <div>
                          <div className="fw-bold" style={{ color: '#0f172a' }}>
                            Transferencia Bancaria Directa
                            {transferDiscountPct > 0 && (
                              <Badge bg="success" className="ms-2">¡{transferDiscountPct}% OFF!</Badge>
                            )}
                          </div>
                          <small className="text-muted">CBU / Alias inmediato sin comisiones adicionales.</small>
                        </div>
                      </div>
                      <FaMoneyBillWave size={22} className="text-success" />
                    </div>
                  )}

                  {/* Mercado Pago */}
                  {storeConfig?.mpEnabled && (
                    <div
                      className={`p-3 rounded-3 border d-flex align-items-center justify-content-between cursor-pointer ${
                        metodoPago === 'mercadopago' ? 'border-primary bg-light' : 'bg-white'
                      }`}
                      style={{ cursor: 'pointer', borderColor: metodoPago === 'mercadopago' ? '#e11d48' : '#e2e8f0' }}
                      onClick={() => setMetodoPago('mercadopago')}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <Form.Check
                          type="radio"
                          name="paymentRadio"
                          id="pay-mp"
                          checked={metodoPago === 'mercadopago'}
                          onChange={() => setMetodoPago('mercadopago')}
                        />
                        <div>
                          <div className="fw-bold" style={{ color: '#0f172a' }}>
                            Mercado Pago (Tarjetas & Dinero en Cuenta)
                          </div>
                          <small className="text-muted">
                            Visa, Mastercard, Cabal, Débito en hasta {storeConfig?.mpInstallments || 3} cuotas.
                          </small>
                        </div>
                      </div>
                      <FaCreditCard size={22} className="text-info" />
                    </div>
                  )}

                  {/* Efectivo */}
                  {storeConfig?.cashEnabled !== false && (
                    <div
                      className={`p-3 rounded-3 border d-flex align-items-center justify-content-between cursor-pointer ${
                        metodoPago === 'efectivo' ? 'border-primary bg-light' : 'bg-white'
                      }`}
                      style={{ cursor: 'pointer', borderColor: metodoPago === 'efectivo' ? '#e11d48' : '#e2e8f0' }}
                      onClick={() => setMetodoPago('efectivo')}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <Form.Check
                          type="radio"
                          name="paymentRadio"
                          id="pay-cash"
                          checked={metodoPago === 'efectivo'}
                          onChange={() => setMetodoPago('efectivo')}
                        />
                        <div>
                          <div className="fw-bold" style={{ color: '#0f172a' }}>
                            Efectivo al Retirar en Depósito Central
                          </div>
                          <small className="text-muted">Abona al retirar tu pedido sin cargo de flete.</small>
                        </div>
                      </div>
                      <FaStore size={22} className="text-warning" />
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="btn-festive w-100 py-3 fw-bold fs-6"
                  disabled={loading || subtotal < minOrder}
                >
                  {loading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <>
                      <FaLock size={14} className="me-1" /> Confirmar Pedido • {formatMoney(finalTotal)}
                    </>
                  )}
                </Button>
              </Form>
            </div>
          </Col>

          {/* Resumen lateral */}
          <Col lg={5}>
            <div
              className="p-4 rounded-4 position-sticky"
              style={{
                top: '100px',
                backgroundColor: '#ffffff',
                border: '1.5px solid #e2e8f0',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <h5 className="fw-bold mb-3" style={{ color: '#0f172a' }}>
                Resumen de la Orden
              </h5>

              <div className="d-flex flex-column gap-3 mb-4 overflow-auto pe-1" style={{ maxHeight: '280px' }}>
                {items.map((it) => (
                  <div
                    key={it.id}
                    className="d-flex align-items-center justify-content-between gap-2 border-bottom pb-2"
                    style={{ borderColor: '#f1f5f9' }}
                  >
                    <div className="d-flex align-items-center gap-2 min-w-0">
                      <img
                        src={it.imageUrl}
                        alt={it.name}
                        style={{ width: 44, height: 44, borderRadius: '8px', objectFit: 'cover' }}
                      />
                      <div className="min-w-0">
                        <div className="small fw-bold text-truncate" style={{ color: '#0f172a' }}>{it.name}</div>
                        <div className="small" style={{ color: '#64748b' }}>{it.quantity} x {formatMoney(it.price)}</div>
                      </div>
                    </div>
                    <span className="small fw-bold text-nowrap" style={{ color: '#0f172a' }}>
                      {formatMoney(it.price * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small" style={{ color: '#64748b' }}>Subtotal Artículos</span>
                <span className="fw-bold" style={{ color: '#0f172a' }}>{formatMoney(subtotal)}</span>
              </div>

              {isTransfer && discountAmount > 0 && (
                <div className="d-flex justify-content-between align-items-center mb-2 text-success">
                  <span className="small fw-bold">Descuento Transferencia ({transferDiscountPct}%)</span>
                  <span className="fw-bold">-{formatMoney(discountAmount)}</span>
                </div>
              )}

              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="small" style={{ color: '#64748b' }}>Costo de Envío</span>
                <span className="small fw-bold text-success">A coordinar / Retiro sin costo</span>
              </div>

              <hr className="my-2" style={{ borderColor: '#e2e8f0' }} />

              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="h6 fw-bold mb-0" style={{ color: '#0f172a' }}>Total a Pagar</span>
                <span className="h4 fw-bold mb-0" style={{ color: '#e11d48' }}>{formatMoney(finalTotal)}</span>
              </div>

              {subtotal < minOrder && (
                <Alert variant="warning" className="small py-2 mb-0">
                  El monto mínimo es de {formatMoney(minOrder)}. Agrega {formatMoney(minOrder - subtotal)} más para confirmar tu compra.
                </Alert>
              )}

              <div className="mt-3 p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div className="d-flex align-items-center gap-2 small text-muted">
                  <FaShieldAlt className="text-success" />
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
