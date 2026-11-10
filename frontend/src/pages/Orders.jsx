import { useEffect, useState } from 'react';
import { Container, Row, Col, Badge, Spinner, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaBoxOpen, FaShoppingBag } from 'react-icons/fa';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const formatMoney = (val) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val || 0);

const statusLabels = {
  created: { text: 'A procesar', bg: 'secondary' },
  review: { text: 'A revisar', bg: 'secondary' },
  shipped: { text: 'A entregar', bg: 'light', textDark: true },
  paid: { text: 'Pagado', bg: 'light', textDark: true },
  delivered: { text: 'Entregado', bg: 'light', textDark: true },
  cancelled: { text: 'Cancelado', bg: 'danger' },
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
        <div className="p-5 rounded-4 bg-surface-card border border-secondary border-opacity-25 mx-auto" style={{ maxWidth: '480px' }}>
          <FaBoxOpen size={48} className="text-dim mb-3" />
          <h4 className="text-white fw-bold mb-2">Inicia Sesión</h4>
          <p className="text-muted small mb-4">Debes estar logueado para consultar tu historial de pedidos.</p>
          <Button as={Link} to="/login" className="btn-monochrome px-4 py-2">
            Iniciar Sesión
          </Button>
        </div>
      </Container>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-5 my-5">
        <Spinner animation="border" variant="light" />
        <p className="text-muted small mt-2">Cargando tus pedidos...</p>
      </div>
    );
  }

  return (
    <div className="py-5">
      <Container>
        <div className="mb-4">
          <span className="text-dim small text-uppercase fw-bold tracking-wider">Historial</span>
          <h1 className="h2 fw-bold text-white mb-1">Mis Pedidos</h1>
          <p className="text-muted small mb-0">Revisa el estado de tus compras y solicitudes de cotillón.</p>
        </div>

        {orders.length === 0 ? (
          <div className="p-5 text-center bg-surface-card rounded-4 border border-secondary border-opacity-25">
            <FaShoppingBag size={48} className="text-dim mb-3" />
            <h5 className="text-white fw-bold mb-2">Aún no tienes pedidos registrados</h5>
            <p className="text-muted small mb-4">Cuando realices una compra, podrás seguir el estado de la entrega aquí.</p>
            <Button as={Link} to="/catalogo" className="btn-monochrome px-4 py-2">
              Explorar Catálogo
            </Button>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {orders.map((ord) => {
              const statusObj = statusLabels[ord.status] || { text: ord.status, bg: 'secondary' };
              const dateStr = ord.creado_en
                ? new Date(ord.creado_en).toLocaleDateString('es-AR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Fecha reciente';

              return (
                <div key={ord.id} className="p-4 rounded-3 bg-surface-card border border-secondary border-opacity-25">
                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                    <div>
                      <span className="h5 fw-bold text-white mb-0 me-3">Orden #{ord.id}</span>
                      <span className="text-dim small">{dateStr}</span>
                    </div>
                    <Badge bg={statusObj.bg} text={statusObj.textDark ? 'dark' : 'white'} className="px-3 py-2 text-uppercase">
                      {statusObj.text}
                    </Badge>
                  </div>

                  <div className="p-3 rounded-2 bg-surface border border-secondary border-opacity-25 mb-3">
                    <div className="row g-2 small text-muted">
                      <div className="col-sm-4"><strong>Destinatario:</strong> {ord.nombre}</div>
                      <div className="col-sm-4"><strong>Destino:</strong> {ord.direccion}, {ord.ciudad}</div>
                      <div className="col-sm-4"><strong>Total:</strong> <span className="text-white fw-bold">{formatMoney(ord.total)}</span></div>
                    </div>
                  </div>

                  {ord.items && ord.items.length > 0 && (
                    <div className="d-flex flex-wrap gap-2 small text-dim">
                      {ord.items.map((it, idx) => (
                        <span key={idx} className="p-1 px-2 rounded bg-surface border border-secondary border-opacity-25">
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
