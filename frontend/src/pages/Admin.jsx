import { useState, useEffect } from 'react';
import { Container, Row, Col, Nav, Tab, Table, Form, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaChartBar, 
  FaClipboardList, 
  FaPlus, 
  FaCog, 
  FaShieldAlt, 
  FaMoneyBillWave, 
  FaShoppingBag, 
  FaBoxOpen, 
  FaUsers,
  FaCheckCircle,
  FaCalendarAlt,
  FaUserShield
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const formatMoney = (val) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val || 0);

const statusBadges = {
  created: { bg: 'warning', text: 'dark', label: 'A procesar' },
  review: { bg: 'info', text: 'white', label: 'En revisión' },
  shipped: { bg: 'primary', text: 'white', label: 'En camino' },
  paid: { bg: 'success', text: 'white', label: 'Pagado' },
  delivered: { bg: 'success', text: 'white', label: 'Entregado' },
  cancelled: { bg: 'danger', text: 'white', label: 'Cancelado' },
};

export default function Admin() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('resumen');

  // Datos
  const [overview, setOverview] = useState(null);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  // Formulario nuevo producto
  const [newProd, setNewProd] = useState({
    nombre: '',
    precio: '',
    stock: 100,
    categoriaId: '',
    imageUrl: '',
    descripcion: '',
  });
  const [savingProd, setSavingProd] = useState(false);

  // Configuración
  const [minOrder, setMinOrder] = useState(15000);
  const [savingConfig, setSavingConfig] = useState(false);

  const isStaff = user?.is_staff || user?.is_superuser;

  useEffect(() => {
    if (!token || !isStaff) {
      setLoading(false);
      return;
    }
    loadData();
  }, [token, isStaff]);

  async function loadData() {
    setLoading(true);
    try {
      const [ov, ords, cats, conf] = await Promise.all([
        api.getAdminOverview(token).catch(() => null),
        api.getAdminOrders(token).catch(() => ({ items: [] })),
        api.getCategories().catch(() => ({ items: [] })),
        api.getStoreConfig().catch(() => null),
      ]);
      setOverview(ov);
      setOrders(ords.items || ords.orders || []);
      setCategories((cats.items || []).filter((c) => c.slug !== 'ofertas'));
      if (conf?.minOrderAmount) setMinOrder(conf.minOrderAmount);
    } catch (err) {
      console.error('Error cargando panel admin:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus, token);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      setMsg({ type: 'success', text: `¡Pedido #${orderId} actualizado a "${statusBadges[newStatus]?.label || newStatus}"!` });
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      setMsg({ type: 'danger', text: 'Error al cambiar estado del pedido.' });
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setSavingProd(true);
    setMsg(null);
    try {
      await api.createProduct(
        {
          ...newProd,
          precio: parseFloat(newProd.precio),
          stock: parseInt(newProd.stock, 10),
          categoriaId: newProd.categoriaId ? parseInt(newProd.categoriaId, 10) : null,
        },
        token
      );
      setMsg({ type: 'success', text: `¡Producto "${newProd.nombre}" incorporado al catálogo exitosamente!` });
      setNewProd({ nombre: '', precio: '', stock: 100, categoriaId: '', imageUrl: '', descripcion: '' });
      loadData();
    } catch (err) {
      setMsg({ type: 'danger', text: err.message || 'Error al crear producto.' });
    } finally {
      setSavingProd(false);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      await api.updateStoreConfig({ minOrderAmount: parseFloat(minOrder) }, token);
      setMsg({ type: 'success', text: 'Políticas de la tienda actualizadas correctamente.' });
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      setMsg({ type: 'danger', text: 'Error al actualizar configuración.' });
    } finally {
      setSavingConfig(false);
    }
  };

  if (!isStaff) {
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
            <FaShieldAlt size={42} />
          </div>
          <h4 className="fw-bold mb-2" style={{ color: '#0f172a' }}>Panel de Administración Integrado</h4>
          <p className="small mb-4" style={{ color: '#64748b' }}>
            Esta sección administrativa forma parte integral de la webapp, pero requiere permisos de staff.
          </p>
          <div className="p-3 rounded-3 mb-4 text-start small" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div className="fw-bold mb-1" style={{ color: '#0f172a' }}>Credenciales de Administrador:</div>
            <div style={{ color: '#334155' }}><strong>Usuario / Email:</strong> admin@cotillon.com</div>
            <div style={{ color: '#334155' }}><strong>Contraseña:</strong> admin123</div>
          </div>
          <Button as={Link} to="/login" className="btn-festive px-4 py-2">
            Iniciar Sesión como Administrador
          </Button>
        </div>
      </Container>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-5 my-5">
        <Spinner animation="border" variant="danger" />
        <p className="small mt-2" style={{ color: '#64748b' }}>Cargando panel de administración...</p>
      </div>
    );
  }

  return (
    <div className="py-5" style={{ minHeight: '80vh' }}>
      <Container>
        {/* Cabecera */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom gap-3" style={{ borderColor: '#e2e8f0' }}>
          <div>
            <span className="festive-pill mb-2">
              <FaUserShield size={13} /> Panel de Control Integrado
            </span>
            <h1 className="h2 fw-bold mt-1 mb-0" style={{ color: '#0f172a' }}>
              Administración de la Tienda
            </h1>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="small" style={{ color: '#64748b' }}>Sesión activa:</span>
            <span
              className="py-1 px-3 rounded-pill fw-bold small"
              style={{ backgroundColor: '#e0e7ff', color: '#4338ca', border: '1px solid #c7d2fe' }}
            >
              {user?.username} (Staff)
            </span>
          </div>
        </div>

        {msg && <Alert variant={msg.type} className="py-2 small mb-4">{msg.text}</Alert>}

        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
          {/* Navegación por Pestañas */}
          <Nav variant="pills" className="gap-2 mb-4">
            <Nav.Item>
              <Nav.Link
                eventKey="resumen"
                className={activeTab === 'resumen' ? 'btn-festive' : 'btn-festive-secondary'}
                style={{ cursor: 'pointer' }}
              >
                <FaChartBar className="me-2" /> Métricas & Resumen
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="pedidos"
                className={activeTab === 'pedidos' ? 'btn-festive' : 'btn-festive-secondary'}
                style={{ cursor: 'pointer' }}
              >
                <FaClipboardList className="me-2" /> Pedidos ({orders.length})
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="productos"
                className={activeTab === 'productos' ? 'btn-festive' : 'btn-festive-secondary'}
                style={{ cursor: 'pointer' }}
              >
                <FaPlus className="me-2" /> Agregar Artículo
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="config"
                className={activeTab === 'config' ? 'btn-festive' : 'btn-festive-secondary'}
                style={{ cursor: 'pointer' }}
              >
                <FaCog className="me-2" /> Políticas & Monto Mínimo
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            {/* PESTAÑA: RESUMEN */}
            <Tab.Pane eventKey="resumen">
              <Row className="g-4 mb-4">
                <Col md={3} sm={6}>
                  <div className="admin-stat-card d-flex align-items-center gap-3">
                    <div
                      className="p-3 rounded-circle d-flex align-items-center justify-content-center"
                      style={{ backgroundColor: '#d1fae5', color: '#059669', width: 56, height: 56 }}
                    >
                      <FaMoneyBillWave size={24} />
                    </div>
                    <div>
                      <span className="small text-uppercase fw-bold" style={{ color: '#64748b', fontSize: '0.75rem' }}>
                        Facturación Total
                      </span>
                      <h3 className="fw-bold mt-1 mb-0" style={{ color: '#0f172a' }}>
                        {formatMoney(overview?.totalRevenue || 0)}
                      </h3>
                    </div>
                  </div>
                </Col>

                <Col md={3} sm={6}>
                  <div className="admin-stat-card d-flex align-items-center gap-3">
                    <div
                      className="p-3 rounded-circle d-flex align-items-center justify-content-center"
                      style={{ backgroundColor: '#ffe4e6', color: '#e11d48', width: 56, height: 56 }}
                    >
                      <FaShoppingBag size={24} />
                    </div>
                    <div>
                      <span className="small text-uppercase fw-bold" style={{ color: '#64748b', fontSize: '0.75rem' }}>
                        Órdenes Recibidas
                      </span>
                      <h3 className="fw-bold mt-1 mb-0" style={{ color: '#0f172a' }}>
                        {overview?.totalOrders || orders.length}
                      </h3>
                    </div>
                  </div>
                </Col>

                <Col md={3} sm={6}>
                  <div className="admin-stat-card d-flex align-items-center gap-3">
                    <div
                      className="p-3 rounded-circle d-flex align-items-center justify-content-center"
                      style={{ backgroundColor: '#e0e7ff', color: '#4f46e5', width: 56, height: 56 }}
                    >
                      <FaBoxOpen size={24} />
                    </div>
                    <div>
                      <span className="small text-uppercase fw-bold" style={{ color: '#64748b', fontSize: '0.75rem' }}>
                        Artículos en Catálogo
                      </span>
                      <h3 className="fw-bold mt-1 mb-0" style={{ color: '#0f172a' }}>
                        {overview?.totalProducts || 10}
                      </h3>
                    </div>
                  </div>
                </Col>

                <Col md={3} sm={6}>
                  <div className="admin-stat-card d-flex align-items-center gap-3">
                    <div
                      className="p-3 rounded-circle d-flex align-items-center justify-content-center"
                      style={{ backgroundColor: '#fef3c7', color: '#d97706', width: 56, height: 56 }}
                    >
                      <FaUsers size={24} />
                    </div>
                    <div>
                      <span className="small text-uppercase fw-bold" style={{ color: '#64748b', fontSize: '0.75rem' }}>
                        Clientes Registrados
                      </span>
                      <h3 className="fw-bold mt-1 mb-0" style={{ color: '#0f172a' }}>
                        {overview?.totalUsers || 2}
                      </h3>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Acceso rápido a pedidos recientes */}
              <div
                className="p-4 rounded-4"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0" style={{ color: '#0f172a' }}>
                    Últimas Órdenes Ingresadas
                  </h5>
                  <Button
                    variant="link"
                    className="p-0 text-decoration-none small fw-bold"
                    style={{ color: '#e11d48' }}
                    onClick={() => setActiveTab('pedidos')}
                  >
                    Ver todas las órdenes →
                  </Button>
                </div>

                <div className="table-responsive">
                  <Table className="align-middle mb-0">
                    <thead>
                      <tr style={{ color: '#64748b', fontSize: '0.85rem' }}>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Destino</th>
                        <th>Total</th>
                        <th>Estado Actual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 4).map((ord) => {
                        const badgeInfo = statusBadges[ord.status] || { bg: 'secondary', text: 'white', label: ord.status };
                        return (
                          <tr key={ord.id}>
                            <td className="fw-bold" style={{ color: '#0f172a' }}>#{ord.id}</td>
                            <td>
                              <div className="fw-bold small" style={{ color: '#0f172a' }}>{ord.nombre}</div>
                              <div className="small text-muted">{ord.email}</div>
                            </td>
                            <td className="small" style={{ color: '#475569' }}>{ord.ciudad || ord.direccion}</td>
                            <td className="fw-bold" style={{ color: '#e11d48' }}>{formatMoney(ord.total)}</td>
                            <td>
                              <Badge bg={badgeInfo.bg} text={badgeInfo.text} className="px-3 py-1">
                                {badgeInfo.label}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              </div>
            </Tab.Pane>

            {/* PESTAÑA: GESTIÓN DE PEDIDOS */}
            <Tab.Pane eventKey="pedidos">
              <div
                className="p-4 rounded-4"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
                  <div>
                    <h5 className="fw-bold mb-1" style={{ color: '#0f172a' }}>Listado General de Pedidos</h5>
                    <p className="small mb-0" style={{ color: '#64748b' }}>
                      Modifica el estado de cada orden para coordinar empaquetado, cobro y despacho.
                    </p>
                  </div>
                  <span className="badge bg-light text-dark border px-3 py-2 fw-bold">
                    Total: {orders.length} pedidos
                  </span>
                </div>

                {orders.length === 0 ? (
                  <p className="small mb-0 text-muted">No hay pedidos registrados en la plataforma.</p>
                ) : (
                  <div className="table-responsive">
                    <Table hover className="align-middle mb-0">
                      <thead style={{ backgroundColor: '#f8fafc' }}>
                        <tr style={{ color: '#475569', fontSize: '0.85rem' }}>
                          <th>#</th>
                          <th>Cliente & Contacto</th>
                          <th>Dirección de Envío</th>
                          <th>Artículos</th>
                          <th>Total</th>
                          <th>Estado</th>
                          <th>Cambiar Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((ord) => {
                          const badgeInfo = statusBadges[ord.status] || { bg: 'secondary', text: 'white', label: ord.status };
                          return (
                            <tr key={ord.id}>
                              <td className="fw-bold" style={{ color: '#0f172a' }}>#{ord.id}</td>
                              <td>
                                <div className="fw-bold small" style={{ color: '#0f172a' }}>{ord.nombre}</div>
                                <div className="small text-muted">{ord.email}</div>
                                {ord.telefono && <div className="small text-muted">{ord.telefono}</div>}
                              </td>
                              <td className="small" style={{ color: '#334155' }}>
                                <div>{ord.direccion}</div>
                                <div className="text-muted">{ord.ciudad} {ord.estado ? `(${ord.estado})` : ''}</div>
                              </td>
                              <td className="small">
                                {ord.items && ord.items.length > 0 ? (
                                  <div className="d-flex flex-column gap-1">
                                    {ord.items.map((it, idx) => (
                                      <span key={idx} className="text-truncate" style={{ maxWidth: '200px', color: '#475569' }}>
                                        {it.cantidad}x {it.product_name}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-muted">—</span>
                                )}
                              </td>
                              <td className="fw-bold" style={{ color: '#e11d48' }}>{formatMoney(ord.total)}</td>
                              <td>
                                <Badge bg={badgeInfo.bg} text={badgeInfo.text} className="px-3 py-1">
                                  {badgeInfo.label}
                                </Badge>
                              </td>
                              <td>
                                <Form.Select
                                  size="sm"
                                  className="form-select-custom py-1 px-2"
                                  style={{ width: '150px', fontSize: '0.85rem' }}
                                  value={ord.status}
                                  onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                                >
                                  <option value="created">A procesar</option>
                                  <option value="review">En revisión</option>
                                  <option value="shipped">En camino</option>
                                  <option value="paid">Pagado</option>
                                  <option value="delivered">Entregado</option>
                                  <option value="cancelled">Cancelado</option>
                                </Form.Select>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                )}
              </div>
            </Tab.Pane>

            {/* PESTAÑA: AGREGAR PRODUCTO */}
            <Tab.Pane eventKey="productos">
              <div
                className="p-4 p-md-5 rounded-4 mx-auto"
                style={{
                  maxWidth: '680px',
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div
                    className="p-2 rounded-circle"
                    style={{ backgroundColor: '#ffe4e6', color: '#e11d48' }}
                  >
                    <FaPlus size={18} />
                  </div>
                  <h5 className="fw-bold mb-0" style={{ color: '#0f172a' }}>
                    Nuevo Artículo para el Catálogo
                  </h5>
                </div>
                <p className="small mb-4" style={{ color: '#64748b' }}>
                  El producto estará disponible de inmediato en la tienda online para que los clientes lo agreguen a su carrito.
                </p>

                <Form onSubmit={handleCreateProduct}>
                  <div className="mb-3">
                    <Form.Label className="small fw-bold" style={{ color: '#334155' }}>
                      Nombre del Producto *
                    </Form.Label>
                    <Form.Control
                      className="form-control-custom"
                      required
                      value={newProd.nombre}
                      onChange={(e) => setNewProd({ ...newProd, nombre: e.target.value })}
                      placeholder="Ej: Set 50 Platos Polipapel Rosa Pastel y Dorado"
                    />
                  </div>

                  <Row className="g-3 mb-3">
                    <Col sm={6}>
                      <Form.Label className="small fw-bold" style={{ color: '#334155' }}>
                        Precio Unitario ($) *
                      </Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        className="form-control-custom"
                        required
                        value={newProd.precio}
                        onChange={(e) => setNewProd({ ...newProd, precio: e.target.value })}
                        placeholder="8500"
                      />
                    </Col>
                    <Col sm={6}>
                      <Form.Label className="small fw-bold" style={{ color: '#334155' }}>
                        Stock Inicial *
                      </Form.Label>
                      <Form.Control
                        type="number"
                        className="form-control-custom"
                        required
                        value={newProd.stock}
                        onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })}
                      />
                    </Col>
                  </Row>

                  <div className="mb-3">
                    <Form.Label className="small fw-bold" style={{ color: '#334155' }}>
                      Categoría Festiva
                    </Form.Label>
                    <Form.Select
                      className="form-select-custom"
                      value={newProd.categoriaId}
                      onChange={(e) => setNewProd({ ...newProd, categoriaId: e.target.value })}
                    >
                      <option value="">Seleccionar categoría temática...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </Form.Select>
                  </div>

                  <div className="mb-3">
                    <Form.Label className="small fw-bold" style={{ color: '#334155' }}>
                      URL de la Fotografía
                    </Form.Label>
                    <Form.Control
                      className="form-control-custom"
                      value={newProd.imageUrl}
                      onChange={(e) => setNewProd({ ...newProd, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/photo-..."
                    />
                    <small className="text-muted d-block mt-1" style={{ fontSize: '0.8rem' }}>
                      Puedes usar enlaces directos de imágenes de Unsplash, Pexels o tu servidor de almacenamiento.
                    </small>
                  </div>

                  <div className="mb-4">
                    <Form.Label className="small fw-bold" style={{ color: '#334155' }}>
                      Descripción y Especificaciones
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      className="form-control-custom"
                      value={newProd.descripcion}
                      onChange={(e) => setNewProd({ ...newProd, descripcion: e.target.value })}
                      placeholder="Medidas, contenido del paquete, combinación de colores, usos recomendados..."
                    />
                  </div>

                  <Button type="submit" className="btn-festive px-4 py-2" disabled={savingProd}>
                    {savingProd ? <Spinner animation="border" size="sm" /> : 'Publicar Producto en la Tienda'}
                  </Button>
                </Form>
              </div>
            </Tab.Pane>

            {/* PESTAÑA: CONFIGURACIÓN */}
            <Tab.Pane eventKey="config">
              <div
                className="p-4 p-md-5 rounded-4 mx-auto"
                style={{
                  maxWidth: '560px',
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div
                    className="p-2 rounded-circle"
                    style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}
                  >
                    <FaCog size={18} />
                  </div>
                  <h5 className="fw-bold mb-0" style={{ color: '#0f172a' }}>
                    Políticas Comerciales de la Tienda
                  </h5>
                </div>
                <p className="small mb-4" style={{ color: '#64748b' }}>
                  Ajusta los requisitos de compra para adaptarse a ventas mayoristas o minoristas.
                </p>

                <Form onSubmit={handleSaveConfig}>
                  <div className="mb-4">
                    <Form.Label className="small fw-bold" style={{ color: '#334155' }}>
                      Monto Mínimo de Pedido ($ ARS)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      step="500"
                      className="form-control-custom"
                      required
                      value={minOrder}
                      onChange={(e) => setMinOrder(e.target.value)}
                    />
                    <small className="d-block mt-2" style={{ color: '#64748b', fontSize: '0.85rem' }}>
                      Los clientes verán una alerta en tiempo real en el carrito y en el checkout si su subtotal es inferior a este monto.
                    </small>
                  </div>

                  <Button type="submit" className="btn-festive px-4 py-2" disabled={savingConfig}>
                    {savingConfig ? <Spinner animation="border" size="sm" /> : 'Guardar Nuevas Políticas'}
                  </Button>
                </Form>
              </div>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Container>
    </div>
  );
}
