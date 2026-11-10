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
  FaCheck,
  FaTag,
  FaTimes,
  FaPrint,
  FaFileInvoiceDollar
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

  // Cupones de descuento
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

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
        if (config?.transferEnabled) {
          setMetodoPago('transferencia');
        } else if (config?.mpEnabled) {
          setMetodoPago('mercadopago');
        } else if (config?.cashEnabled) {
          setMetodoPago('efectivo');
        }
      } catch (e) {
        // Fallback
      }
    }
    loadConfig();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Cupones disponibles
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'FIESTA10') {
      setAppliedCoupon({ code: 'FIESTA10', pct: 10, desc: '10% de descuento en tu fiesta' });
      setCouponCode('');
    } else if (code === 'BIENVENIDA') {
      setAppliedCoupon({ code: 'BIENVENIDA', pct: 15, desc: '15% de bienvenida' });
      setCouponCode('');
    } else if (code === 'COTILLON') {
      setAppliedCoupon({ code: 'COTILLON', fixed: 2500, desc: '$ 2.500 de ahorro' });
      setCouponCode('');
    } else {
      setCouponError('Cupón inválido o expirado. Probá con "FIESTA10" o "COTILLON"');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  // Descuento por cupón
  let couponDiscountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.pct) {
      couponDiscountAmount = Math.round((subtotal * appliedCoupon.pct) / 100);
    } else if (appliedCoupon.fixed) {
      couponDiscountAmount = Math.min(subtotal, appliedCoupon.fixed);
    }
  }

  // Descuento por transferencia
  const transferDiscountPct = storeConfig?.transferEnabled ? (storeConfig.transferDiscount || 0) : 0;
  const isTransfer = metodoPago === 'transferencia';
  const subtotalAfterCoupon = Math.max(0, subtotal - couponDiscountAmount);
  const transferDiscountAmount = isTransfer ? Math.round((subtotalAfterCoupon * transferDiscountPct) / 100) : 0;
  const finalTotal = Math.max(0, subtotalAfterCoupon - transferDiscountAmount);

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
        descuento_cupon: couponDiscountAmount,
        cupon: appliedCoupon ? appliedCoupon.code : null,
      };

      const res = await api.createOrder(payload, token);
      setOrderCreated({
        ...res,
        metodoPagoSeleccionado: metodoPago,
        transferDiscountAmount,
        couponDiscountAmount,
        appliedCoupon,
        itemsPurchased: [...items],
      });
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
        {/* COMPONENTE IMPRIMIBLE: REMITO / FACTURA */}
        <div className="printable-remito d-none d-print-block text-start p-4 bg-white">
          <div className="border-bottom pb-3 mb-3 d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-0" style={{ color: '#0f172a' }}>COTIFIESTA</h2>
              <div className="small text-muted">Cotillón Mayorista &amp; Minorista • Fiestas &amp; Eventos</div>
              <div className="small text-muted">Av. Corrientes 3450, Almagro, CABA • CUIT: 30-71234567-8</div>
            </div>
            <div className="text-end">
              <div className="badge bg-dark fs-6 px-3 py-2 mb-1">REMITO DE ENTREGA</div>
              <div className="fw-bold fs-5">Nº #0001-{String(orderCreated.id).padStart(6, '0')}</div>
              <div className="small text-muted">Fecha: {new Date().toLocaleDateString('es-AR')}</div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-6">
              <h6 className="fw-bold text-uppercase small text-muted">Datos del Cliente:</h6>
              <div><strong>Nombre:</strong> {orderCreated.nombre}</div>
              <div><strong>Email:</strong> {orderCreated.email}</div>
              <div><strong>Teléfono:</strong> {orderCreated.telefono || 'Sin especificar'}</div>
              <div><strong>DNI / CUIT:</strong> {orderCreated.destinatario_documento || 'Consumidor Final'}</div>
            </div>
            <div className="col-6">
              <h6 className="fw-bold text-uppercase small text-muted">Destino de Entrega:</h6>
              <div><strong>Dirección:</strong> {orderCreated.direccion}</div>
              <div><strong>Ciudad / CP:</strong> {orderCreated.ciudad} ({orderCreated.cp})</div>
              <div><strong>Forma de Pago:</strong> {orderCreated.metodoPagoSeleccionado?.toUpperCase()}</div>
            </div>
          </div>

          <table className="table table-bordered mb-4">
            <thead className="table-light">
              <tr>
                <th>Cant.</th>
                <th>Descripción del Artículo</th>
                <th className="text-end">Precio Unit.</th>
                <th className="text-end">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {(orderCreated.itemsPurchased || []).map((it, idx) => (
                <tr key={idx}>
                  <td>{it.quantity} u.</td>
                  <td>{it.name}</td>
                  <td className="text-end">{formatMoney(it.price)}</td>
                  <td className="text-end">{formatMoney(it.price * it.quantity)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              {orderCreated.couponDiscountAmount > 0 && (
                <tr>
                  <td colSpan="3" className="text-end">Descuento Cupón ({orderCreated.appliedCoupon?.code}):</td>
                  <td className="text-end text-success">-{formatMoney(orderCreated.couponDiscountAmount)}</td>
                </tr>
              )}
              {orderCreated.transferDiscountAmount > 0 && (
                <tr>
                  <td colSpan="3" className="text-end">Descuento Transferencia:</td>
                  <td className="text-end text-success">-{formatMoney(orderCreated.transferDiscountAmount)}</td>
                </tr>
              )}
              <tr>
                <td colSpan="3" className="text-end fw-bold fs-6">TOTAL FINAL:</td>
                <td className="text-end fw-bold fs-6">{formatMoney(orderCreated.total)}</td>
              </tr>
            </tfoot>
          </table>

          <div className="border-top pt-4 mt-5 d-flex justify-content-between align-items-end">
            <div className="small text-muted" style={{ maxWidth: '350px' }}>
              Comprobante no válido como factura comercial tipo A o B oficial. Para solicitar factura A con CUIT, enviar constancia por WhatsApp.
            </div>
            <div className="text-center" style={{ minWidth: '220px' }}>
              <div className="border-top border-dark pt-1" style={{ width: '180px', margin: '0 auto' }}>
                Firma y Aclaración Receptor
              </div>
            </div>
          </div>
        </div>

        {/* VISTA EN PANTALLA: CONFIRMACIÓN EXITOSA */}
        <div
          className="p-4 p-md-5 rounded-4 mx-auto d-print-none"
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
                Realizá la transferencia por <strong>{formatMoney(orderCreated.total)}</strong> a la siguiente cuenta bancaria:
              </div>
              <div className="p-3 rounded-2 bg-white border small" style={{ color: '#1e293b' }}>
                <div><strong>Banco:</strong> {storeConfig.transferBank}</div>
                <div><strong>Titular:</strong> {storeConfig.transferHolder}</div>
                <div><strong>CBU:</strong> <code className="fw-bold fs-6">{storeConfig.transferCbu}</code></div>
                <div><strong>Alias:</strong> <code className="fw-bold fs-6">{storeConfig.transferAlias}</code></div>
                <div><strong>CUIT:</strong> {storeConfig.transferCuit}</div>
              </div>
              <small className="text-muted d-block mt-2">
                Envianos tu comprobante por WhatsApp al 11 5555-0000 o respondé al email con el número de orden #{orderCreated.id}.
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
                <FaStore /> Retiro y Pago en Depósito Central
              </h6>
              <p className="small mb-0" style={{ color: '#78350f' }}>
                {storeConfig?.cashInstructions || 'Podés abonar en efectivo al retirar en Av. Corrientes 3450, Almagro.'}
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

          {/* BOTONES DE ACCIÓN: IMPRIMIR REMITO + NAVEGACIÓN */}
          <div className="d-flex flex-wrap justify-content-center gap-3">
            <Button
              variant="outline-dark"
              className="px-4 py-2 d-inline-flex align-items-center gap-2 fw-semibold"
              onClick={() => window.print()}
            >
              <FaPrint /> Imprimir Remito / Comprobante
            </Button>
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
            className="text-secondary p-0 text-decoration-none small d-inline-flex align-items-center gap-2 fw-bold"
          >
            <FaArrowLeft size={12} /> Seguir comprando en el catálogo
          </Button>
          <h1 className="h2 fw-bold mt-2" style={{ color: '#0f172a' }}>
            Finalizar Compra de Cotillón
          </h1>
          <p className="text-secondary small mb-0">
            Completá tus datos de entrega y seleccioná tu medio de pago favorito.
          </p>
        </div>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Row className="g-5">
          {/* Formulario de Checkout */}
          <Col lg={7}>
            <div
              className="p-4 p-md-5 rounded-4"
              style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid #e2e8f0',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <Form onSubmit={handleSubmit}>
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#0f172a' }}>
                  <FaTruck className="text-danger" /> 1. Datos del Destinatario y Envío
                </h5>

                <Row className="g-3 mb-4">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="small fw-bold">Nombre Completo o Razón Social *</Form.Label>
                      <Form.Control
                        type="text"
                        name="nombre"
                        required
                        value={form.nombre}
                        onChange={handleChange}
                        className="form-control-custom"
                        placeholder="Ej: Sofía Pérez"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold">Correo Electrónico *</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        className="form-control-custom"
                        placeholder="tu@email.com"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold">Teléfono / WhatsApp *</Form.Label>
                      <Form.Control
                        type="tel"
                        name="telefono"
                        required
                        value={form.telefono}
                        onChange={handleChange}
                        className="form-control-custom"
                        placeholder="11 5555 1234"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="small fw-bold">Dirección de Entrega *</Form.Label>
                      <Form.Control
                        type="text"
                        name="direccion"
                        required
                        value={form.direccion}
                        onChange={handleChange}
                        className="form-control-custom"
                        placeholder="Calle, número, piso, depto"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={5}>
                    <Form.Group>
                      <Form.Label className="small fw-bold">Ciudad / Localidad *</Form.Label>
                      <Form.Control
                        type="text"
                        name="ciudad"
                        required
                        value={form.ciudad}
                        onChange={handleChange}
                        className="form-control-custom"
                        placeholder="Ej: Rosario, CABA..."
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small fw-bold">Provincia *</Form.Label>
                      <Form.Control
                        type="text"
                        name="estado"
                        required
                        value={form.estado}
                        onChange={handleChange}
                        className="form-control-custom"
                        placeholder="Buenos Aires, Córdoba..."
                      />
                    </Form.Group>
                  </Col>

                  <Col md={3}>
                    <Form.Group>
                      <Form.Label className="small fw-bold">Código Postal *</Form.Label>
                      <Form.Control
                        type="text"
                        name="cp"
                        required
                        value={form.cp}
                        onChange={handleChange}
                        className="form-control-custom"
                        placeholder="1414"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="small fw-bold">DNI o CUIT (para Factura / Envío)</Form.Label>
                      <Form.Control
                        type="text"
                        name="destinatario_documento"
                        value={form.destinatario_documento}
                        onChange={handleChange}
                        className="form-control-custom"
                        placeholder="Número de documento para el despacho"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="small fw-bold">Notas o Aclaraciones del Pedido</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="nota"
                        value={form.nota}
                        onChange={handleChange}
                        className="form-control-custom"
                        placeholder="¿Entre calles, horario de entrega preferido o detalles del evento?"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Medio de Pago */}
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 pt-3 border-top" style={{ color: '#0f172a' }}>
                  <FaCreditCard className="text-primary" /> 2. Método de Pago
                </h5>

                <div className="d-flex flex-column gap-3 mb-4">
                  {/* Transferencia Bancaria */}
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
                          id="pay-transfer"
                          checked={metodoPago === 'transferencia'}
                          onChange={() => setMetodoPago('transferencia')}
                        />
                        <div>
                          <div className="fw-bold d-flex align-items-center gap-2" style={{ color: '#0f172a' }}>
                            <span>Transferencia Bancaria Directa</span>
                            {transferDiscountPct > 0 && (
                              <Badge bg="success" className="fw-bold">
                                ¡{transferDiscountPct}% OFF!
                              </Badge>
                            )}
                          </div>
                          <small className="text-muted">Aboná con CBU o Alias bancario y ahorrá en tu pedido.</small>
                        </div>
                      </div>
                      <FaMoneyBillWave size={22} className="text-success" />
                    </div>
                  )}

                  {/* Mercado Pago */}
                  {storeConfig?.mpEnabled !== false && (
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
                            Mercado Pago (Tarjetas de Crédito / Débito)
                          </div>
                          <small className="text-muted">
                            Visa, Mastercard, Débito en hasta {storeConfig?.mpInstallments || 3} cuotas.
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
                          <small className="text-muted">Aboná al retirar tu pedido sin cargo de flete.</small>
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

          {/* Resumen lateral con Cuponera */}
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

              <div className="d-flex flex-column gap-3 mb-4 overflow-auto pe-1" style={{ maxHeight: '250px' }}>
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

              {/* ===================================================
                  SISTEMA DE CUPÓN DE DESCUENTO
                  =================================================== */}
              <div className="p-3 rounded-3 bg-light border mb-3">
                <div className="d-flex align-items-center gap-1 small fw-bold text-dark mb-1">
                  <FaTag className="text-danger" /> ¿Tenés un cupón promocional?
                </div>
                {!appliedCoupon ? (
                  <div className="d-flex gap-2">
                    <Form.Control
                      size="sm"
                      type="text"
                      placeholder="Ej: FIESTA10"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="bg-white"
                    />
                    <Button size="sm" variant="dark" onClick={handleApplyCoupon}>
                      Aplicar
                    </Button>
                  </div>
                ) : (
                  <div className="d-flex align-items-center justify-content-between p-2 rounded bg-success-subtle text-success small border border-success-subtle">
                    <span>
                      ¡Cupón <strong>{appliedCoupon.code}</strong> aplicado! ({appliedCoupon.desc})
                    </span>
                    <button
                      type="button"
                      className="btn btn-link p-0 text-danger"
                      onClick={handleRemoveCoupon}
                      title="Quitar cupón"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                )}
                {couponError && <div className="text-danger small mt-1">{couponError}</div>}
              </div>

              {/* Totales y Descuentos */}
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small" style={{ color: '#64748b' }}>Subtotal Artículos</span>
                <span className="fw-bold" style={{ color: '#0f172a' }}>{formatMoney(subtotal)}</span>
              </div>

              {couponDiscountAmount > 0 && (
                <div className="d-flex justify-content-between align-items-center mb-2 text-success">
                  <span className="small fw-bold">Descuento Cupón ({appliedCoupon?.code})</span>
                  <span className="fw-bold">-{formatMoney(couponDiscountAmount)}</span>
                </div>
              )}

              {isTransfer && transferDiscountAmount > 0 && (
                <div className="d-flex justify-content-between align-items-center mb-2 text-success">
                  <span className="small fw-bold">Descuento Transferencia ({transferDiscountPct}%)</span>
                  <span className="fw-bold">-{formatMoney(transferDiscountAmount)}</span>
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
                <Alert variant="warning" className="small py-2 mb-3">
                  El monto mínimo de compra mayorista es de {formatMoney(minOrder)}. Te faltan {formatMoney(minOrder - subtotal)}.
                </Alert>
              )}

              <div className="p-3 rounded-3 bg-light border small text-muted d-flex flex-column gap-2">
                <div className="d-flex align-items-center gap-2">
                  <FaShieldAlt className="text-success" />
                  <span>Tu pago y datos están protegidos con encriptación SSL de 256 bits.</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <FaCheckCircle className="text-primary" />
                  <span>Comprobante de compra y remito oficial al finalizar.</span>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
