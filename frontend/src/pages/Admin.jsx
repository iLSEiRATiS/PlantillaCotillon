import { useState, useEffect } from 'react';
import { Container, Row, Col, Nav, Tab, Card, Table, Form, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaChartBar, FaBoxes, FaClipboardList, FaCog, FaPlus, FaCheck, FaTrash, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const formatMoney = (val) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val || 0);

export default function Admin() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('resumen');

  // Estados de datos
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
      setCategories((cats.items || []).filter(c => c.slug !== 'ofertas'));
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
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      setMsg({ type: 'success', text: `Pedido #${orderId} actualizado a "${newStatus}".` });
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      setMsg({ type: 'danger', text: 'Error al cambiar estado.' });
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
      setMsg({ type: 'success', text: `¡Producto "${newProd.nombre}" creado con éxito!` });
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
      setMsg({ type: 'success', text: 'Configuración de tienda actualizada.' });
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
        <div className="p-5 rounded-4 bg-surface-card border border-secondary border-opacity-25 mx-auto" style={{ maxWidth: '480px' }}>
          <FaShieldAlt size={48} className="text-dim mb-3" />
          <h4 className="text-white fw-bold mb-2">Acceso Restringido</h4>
          <p className="text-muted small mb-4">
            Esta sección es exclusiva para el equipo administrador de la tienda.
          </p>
          <Button as={Link} to="/login" className="btn-monochrome px-4 py-2">
            Iniciar con Cuenta Admin
          </Button>
        </div>
      </Container>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-5 my-5">
        <Spinner animation="border" variant="light" />
        <p className="text-muted small mt-2">Cargando panel administrativo...</p>
      </div>
    );
  }

  return (
    <div className="py-5">
      <Container>
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom border-secondary border-opacity-25 gap-3">
          <div>
            <span className="custom-badge d-inline-block mb-1">Panel de Control</span>
            <h1 className="h2 fw-bold text-white mb-0">Administración de la Tienda</h1>
          </div>
          <span className="text-muted small">
            Conectado como: <strong className="text-white">{user?.username}</strong>
          </span>
        </div>

        {msg && <Alert variant={msg.type} className="py-2 small mb-4">{msg.text}</Alert>}

        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
          <Nav variant="pills" className="gap-2 mb-4">
            <Nav.Item>
              <Nav.Link eventKey="resumen" className={activeTab === 'resumen' ? 'btn-monochrome' : 'btn-monochrome-dark'}>
                <FaChartBar className="me-2" /> Resumen
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="pedidos" className={activeTab === 'pedidos' ? 'btn-monochrome' : 'btn-monochrome-dark'}>
                <FaClipboardList className="me-2" /> Pedidos ({orders.length})
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="productos" className={activeTab === 'productos' ? 'btn-monochrome' : 'btn-monochrome-dark'}>
                <FaPlus className="me-2" /> Agregar Producto
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="config" className={activeTab === 'config' ? 'btn-monochrome' : 'btn-monochrome-dark'}>
                <FaCog className="me-2" /> Configuración
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            {/* PESTAÑA: RESUMEN */}
            <Tab.Pane eventKey="resumen">
              <Row className="g-4 mb-4">
                <Col md={3} sm={6}>
                  <div className="p-4 rounded-3 bg-surface-card border border-secondary border-opacity-25">
                    <span className="text-dim small text-uppercase fw-bold">Ventas Totales</span>
                    <h3 className="text-white fw-bold mt-2 mb-0">{formatMoney(overview?.totalRevenue || 0)}</h3>
                  </div>
                </Col>
                <Col md={3} sm={6}>
                  <div className="p-4 rounded-3 bg-surface-card border border-secondary border-opacity-25">
                    <span className="text-dim small text-uppercase fw-bold">Pedidos Recibidos</span>
                    <h3 className="text-white fw-bold mt-2 mb-0">{overview?.totalOrders || orders.length}</h3>
                  </div>
                </Col>
                <Col md={3} sm={6}>
                  <div className="p-4 rounded-3 bg-surface-card border border-secondary border-opacity-25">
                    <span className="text-dim small text-uppercase fw-bold">Productos Activos</span>
                    <h3 className="text-white fw-bold mt-2 mb-0">{overview?.totalProducts || 10}</h3>
                  </div>
                </Col>
                <Col md={3} sm={6}>
                  <div className="p-4 rounded-3 bg-surface-card border border-secondary border-opacity-25">
                    <span className="text-dim small text-uppercase fw-bold">Usuarios Registrados</span>
                    <h3 className="text-white fw-bold mt-2 mb-0">{overview?.totalUsers || 2}</h3>
                  </div>
                </Col>
              </Row>
            </Tab.Pane>

            {/* PESTAÑA: PEDIDOS */}
            <Tab.Pane eventKey="pedidos">
              <div className="p-4 rounded-3 bg-surface-card border border-secondary border-opacity-25">
                <h5 className="text-white fw-bold mb-3">Gestión de Pedidos</h5>
                {orders.length === 0 ? (
                  <p className="text-muted small mb-0">No hay pedidos registrados en la plataforma.</p>
                ) : (
                  <div className="table-responsive">
                    <Table hover variant="dark" className="align-middle mb-0 bg-transparent">
                      <thead>
                        <tr className="border-secondary border-opacity-25 text-dim small">
                          <th>#</th>
                          <th>Cliente</th>
                          <th>Destino</th>
                          <th>Total</th>
                          <th>Estado</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((ord) => (
                          <tr key={ord.id} className="border-secondary border-opacity-25">
                            <td className="fw-bold text-white">#{ord.id}</td>
                            <td>
                              <div className="text-white small fw-bold">{ord.nombre}</div>
                              <div className="text-dim small">{ord.email}</div>
                            </td>
                            <td className="small text-muted">{ord.ciudad || ord.direccion}</td>
                            <td className="fw-bold text-white">{formatMoney(ord.total)}</td>
                            <td>
                              <Badge bg={ord.status === 'paid' ? 'light' : 'secondary'} text={ord.status === 'paid' ? 'dark' : 'white'} className="text-uppercase small">
                                {ord.status}
                              </Badge>
                            </td>
                            <td>
                              <Form.Select
                                size="sm"
                                className="form-select-custom py-1 px-2"
                                style={{ width: '140px' }}
                                value={ord.status}
                                onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                              >
                                <option value="created">A procesar</option>
                                <option value="review">A revisar</option>
                                <option value="shipped">A entregar</option>
                                <option value="paid">Pagado</option>
                                <option value="delivered">Entregado</option>
                                <option value="cancelled">Cancelado</option>
                              </Form.Select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </div>
            </Tab.Pane>

            {/* PESTAÑA: AGREGAR PRODUCTO */}
            <Tab.Pane eventKey="productos">
              <div className="p-4 rounded-3 bg-surface-card border border-secondary border-opacity-25 max-w-lg" style={{ maxWidth: '640px' }}>
                <h5 className="text-white fw-bold mb-3">Nuevo Artículo para el Catálogo</h5>
                <Form onSubmit={handleCreateProduct}>
                  <div className="mb-3">
                    <Form.Label className="small text-muted">Nombre del Producto</Form.Label>
                    <Form.Control
                      className="form-control-custom"
                      required
                      value={newProd.nombre}
                      onChange={(e) => setNewProd({ ...newProd, nombre: e.target.value })}
                      placeholder="Ej: Set 20 Vasos Polipapel Negro Mate"
                    />
                  </div>

                  <Row className="g-3 mb-3">
                    <Col sm={6}>
                      <Form.Label className="small text-muted">Precio ($)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        className="form-control-custom"
                        required
                        value={newProd.precio}
                        onChange={(e) => setNewProd({ ...newProd, precio: e.target.value })}
                        placeholder="7500"
                      />
                    </Col>
                    <Col sm={6}>
                      <Form.Label className="small text-muted">Stock Inicial</Form.Label>
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
                    <Form.Label className="small text-muted">Categoría</Form.Label>
                    <Form.Select
                      className="form-select-custom"
                      value={newProd.categoriaId}
                      onChange={(e) => setNewProd({ ...newProd, categoriaId: e.target.value })}
                    >
                      <option value="">Selecciona una categoría...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </Form.Select>
                  </div>

                  <div className="mb-3">
                    <Form.Label className="small text-muted">URL de Imagen</Form.Label>
                    <Form.Control
                      className="form-control-custom"
                      value={newProd.imageUrl}
                      onChange={(e) => setNewProd({ ...newProd, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/photo-..."
                    />
                  </div>

                  <div className="mb-4">
                    <Form.Label className="small text-muted">Descripción</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      className="form-control-custom"
                      value={newProd.descripcion}
                      onChange={(e) => setNewProd({ ...newProd, descripcion: e.target.value })}
                      placeholder="Detalles sobre materiales, cantidad de unidades, colores..."
                    />
                  </div>

                  <Button type="submit" className="btn-monochrome px-4 py-2" disabled={savingProd}>
                    {savingProd ? <Spinner animation="border" size="sm" /> : 'Guardar Producto'}
                  </Button>
                </Form>
              </div>
            </Tab.Pane>

            {/* PESTAÑA: CONFIGURACIÓN */}
            <Tab.Pane eventKey="config">
              <div className="p-4 rounded-3 bg-surface-card border border-secondary border-opacity-25" style={{ maxWidth: '520px' }}>
                <h5 className="text-white fw-bold mb-3">Políticas de la Tienda</h5>
                <Form onSubmit={handleSaveConfig}>
                  <div className="mb-4">
                    <Form.Label className="small text-muted">Monto Mínimo de Pedido ($)</Form.Label>
                    <Form.Control
                      type="number"
                      step="100"
                      className="form-control-custom"
                      required
                      value={minOrder}
                      onChange={(e) => setMinOrder(e.target.value)}
                    />
                    <small className="text-dim d-block mt-1">
                      Los clientes no podrán avanzar en el checkout si su subtotal es inferior a este monto.
                    </small>
                  </div>

                  <Button type="submit" className="btn-monochrome px-4 py-2" disabled={savingConfig}>
                    {savingConfig ? <Spinner animation="border" size="sm" /> : 'Actualizar Políticas'}
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
