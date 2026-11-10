import { Offcanvas, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaPlus, FaMinus, FaShoppingBag, FaArrowRight } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

const formatMoney = (val) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val || 0);

export default function CartDrawer() {
  const { items, isCartOpen, closeCart, removeFromCart, updateQuantity, getSubtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const subtotal = getSubtotal();

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <Offcanvas show={isCartOpen} onHide={closeCart} placement="end" className="custom-drawer">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title className="fw-bold d-flex align-items-center gap-2 h5 mb-0" style={{ color: '#0f172a' }}>
          <FaShoppingBag size={18} className="text-danger" /> Tu Carrito de Cotillón
          {items.length > 0 && (
            <Badge pill bg="danger" className="ms-1" style={{ fontSize: '0.75rem' }}>
              {items.length}
            </Badge>
          )}
        </Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body className="d-flex flex-column p-4" style={{ backgroundColor: '#ffffff' }}>
        {items.length === 0 ? (
          <div className="text-center my-auto py-5">
            <div
              className="p-3 rounded-circle d-inline-flex mb-3"
              style={{ backgroundColor: '#ffe4e6', color: '#e11d48' }}
            >
              <FaShoppingBag size={36} />
            </div>
            <h6 className="fw-bold mb-2" style={{ color: '#0f172a' }}>Tu carrito está vacío</h6>
            <p className="small mb-4" style={{ color: '#64748b' }}>
              Agrega artículos coloridos desde nuestro catálogo para comenzar a armar tu fiesta.
            </p>
            <Button
              className="btn-festive px-4 py-2"
              onClick={() => {
                closeCart();
                navigate('/catalogo');
              }}
            >
              Explorar Catálogo
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-grow-1 overflow-auto pe-1 d-flex flex-column gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-3 d-flex gap-3 align-items-center"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: '8px' }}
                  />
                  <div className="flex-grow-1 min-w-0">
                    <h6 className="small fw-bold mb-1 text-truncate" style={{ color: '#0f172a' }}>
                      {item.name}
                    </h6>
                    <div className="small fw-bold mb-2" style={{ color: '#e11d48' }}>
                      {formatMoney(item.price)}
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="d-flex align-items-center rounded p-1"
                        style={{ border: '1.5px solid #cbd5e1', backgroundColor: '#f8fafc' }}
                      >
                        <button
                          className="btn btn-sm p-0 px-2"
                          style={{ color: '#334155' }}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Restar unidad"
                        >
                          <FaMinus size={9} />
                        </button>
                        <span className="small px-2 fw-bold" style={{ color: '#0f172a' }}>
                          {item.quantity}
                        </span>
                        <button
                          className="btn btn-sm p-0 px-2"
                          style={{ color: '#334155' }}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Sumar unidad"
                        >
                          <FaPlus size={9} />
                        </button>
                      </div>

                      <button
                        className="btn btn-sm text-muted p-1 ms-auto"
                        onClick={() => removeFromCart(item.id)}
                        title="Eliminar producto"
                        style={{ transition: 'color 0.2s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#e11d48')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-top mt-3" style={{ borderColor: '#e2e8f0' }}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="small" style={{ color: '#64748b' }}>Subtotal estimado</span>
                <span className="fw-bold h5 mb-0" style={{ color: '#0f172a' }}>{formatMoney(subtotal)}</span>
              </div>
              <p className="small mb-4" style={{ color: '#94a3b8' }}>
                Los envíos y notas se coordinan en el checkout.
              </p>

              <div className="d-flex flex-column gap-2">
                <Button
                  className="btn-festive w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 fs-6"
                  onClick={handleCheckout}
                >
                  Ir al Checkout <FaArrowRight size={14} />
                </Button>
                <Button
                  variant="link"
                  className="small text-decoration-none"
                  style={{ color: '#94a3b8' }}
                  onClick={clearCart}
                >
                  Vaciar carrito
                </Button>
              </div>
            </div>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
}
