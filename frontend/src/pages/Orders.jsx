import { useEffect, useState } from 'react';
import { Container, Badge, Spinner, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaBoxOpen, FaShoppingBag, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const formatMoney = (val) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val || 0);

const statusLabels = {
  created: { text: 'A procesar', bg: 'warning', textDark: true },
  review: { text: 'En revisión', bg: 'info', textDark: false },
  shipped: { text: 'En camino', bg: 'primary', textDark: false },
  paid: { text: 'Pagado', bg: 'success', textDark: false },
  delivered: { text: 'Entregado', bg: 'success', textDark: false },
  cancelled: { text: 'Cancelado', bg: 'danger', textDark: false },
};

export default function Orders() {
  const { token, isLoggedIn } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.getMyOrders(token);
        setOrders(data.items || data.orders || []);
      } catch (err) {
        console.error('Error cargando pedidos:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [token]);

  if (!isLoggedIn) {
    return (
      <Container className="py-5 text-center my-auto">
        <div
          className="p-5 rounded-4 mx-auto"
          style={{
            maxWidth: '500px',
            backgroundColor: '#ffffff',
            border: '1.5px solid #e2e8f0',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div
            className="p-3 rounded-circle d-inline-flex mb-3"
            style={{ backgroundColor: '#ffe4e6', color: '#e11d48' }}
          >
            <FaBoxOpen size={40} />
          </div>
          <h4 className="fw-bold mb-2" style={{ color: '#0f172a' }}>Inicia Sesión</h4>
          <p className="small mb-4" style={{ color: '#64748b' }}>
            Debes iniciar sesión para consultar el estado y detalle de tus compras anteriores.
          </p>
          <Button as={Link} to="/login" className="btn-festive px-4 py-2">
            Iniciar Sesión
          </Button>
        </div>
      </Container>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-5 my-5">
        <Spinner animation="border" variant="danger" />
        <p className="small mt-2" style={{ color: '#64748b' }}>Cargando tus pedidos...</p>
      </div>
    );
  }

  return (
    <div className="py-5" style={{ minHeight: '80vh' }}>
      <Container>
        <div className="mb-4">
          <span className="festive-pill mb-2">Historial de Clientes</span>
          <h1 className="h2 fw-bold mt-2 mb-1" style={{ color: '#0f172a' }}>Mis Pedidos</h1>
          <p className="small mb-0" style={{ color: '#64748b' }}>
            Revisa el estado de tus compras y solicitudes de cotillón para tus eventos.
          </p>
        </div>

        {orders.length === 0 ? (
          <div
            className="p-5 text-center rounded-4"
            style={{
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
            <h5 className="fw-bold mb-2" style={{ color: '#0f172a' }}>Aún no tienes pedidos registrados</h5>
            <p className="small mb-4" style={{ color: '#64748b' }}>
              Cuando realices tu primer pedido, podrás seguir el despacho en tiempo real aquí.
            </p>
            <Button as={Link} to="/catalogo" className="btn-festive px-4 py-2">
              Explorar Catálogo de Artículos
            </Button>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {orders.map((ord) => {
              const statusObj = statusLabels[ord.status] || { text: ord.status, bg: 'secondary', textDark: false };
              const dateStr = ord.creado_en
                ? new Date(ord.creado_en).toLocaleDateString('es-AR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Reciente';

              return (
                <div
                  key={ord.id}
                  className="p-4 rounded-4"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #e2e8f0',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                    <div className="d-flex align-items-center gap-3">
                      <span className="h5 fw-bold mb-0" style={{ color: '#0f172a' }}>Orden #{ord.id}</span>
                      <span className="small d-inline-flex align-items-center gap-1" style={{ color: '#64748b' }}>
                        <FaCalendarAlt size={12} /> {dateStr}
                      </span>
                    </div>
                    <Badge
                      bg={statusObj.bg}
                      text={statusObj.textDark ? 'dark' : 'white'}
                      className="px-3 py-2 text-uppercase fw-bold"
                      style={{ fontSize: '0.8rem', letterSpacing: '0.04em' }}
                    >
                      {statusObj.text}
                    </Badge>
                  </div>

                  <div
                    className="p-3 rounded-3 mb-3"
                    style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
                  >
                    <div className="row g-2 small" style={{ color: '#334155' }}>
                      <div className="col-sm-4">
                        <strong style={{ color: '#0f172a' }}>Destinatario:</strong> {ord.nombre}
                      </div>
                      <div className="col-sm-4">
                        <strong style={{ color: '#0f172a' }}>Destino:</strong> {ord.direccion}, {ord.ciudad}
                      </div>
                      <div className="col-sm-4">
                        <strong style={{ color: '#0f172a' }}>Total de la Orden:</strong>{' '}
                        <span className="fw-bold fs-6" style={{ color: '#e11d48' }}>{formatMoney(ord.total)}</span>
                      </div>
                    </div>
                  </div>

                  {ord.items && ord.items.length > 0 && (
                    <div className="d-flex flex-wrap gap-2 small">
                      {ord.items.map((it, idx) => (
                        <span
                          key={idx}
                          className="py-1 px-3 rounded-pill"
                          style={{
                            backgroundColor: '#fff1f2',
                            color: '#9f1239',
                            border: '1px solid #fecdd3',
                            fontWeight: 600,
                          }}
                        >
                          {it.cantidad}x {it.product_name} ({formatMoney(it.precio_unitario)})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
}
