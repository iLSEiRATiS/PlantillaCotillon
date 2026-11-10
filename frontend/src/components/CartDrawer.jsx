import { Offcanvas, Button, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
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
      <Offcanvas.Header closeButton closeVariant="white">
        <Offcanvas.Title className="fw-bold d-flex align-items-center gap-2 text-white h5 mb-0">
          <FaShoppingBag size={18} /> Tu Carrito
          {items.length > 0 && <Badge bg="secondary">{items.length}</Badge>}
        </Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body className="d-flex flex-column p-4">
        {items.length === 0 ? (
          <div className="text-center my-auto py-5">
            <FaShoppingBag size={48} className="text-dim mb-3 opacity-50" />
            <h6 className="text-white fw-bold mb-2">Tu carrito está vacío</h6>
            <p className="text-muted small mb-4">
              Agrega artículos desde nuestro catálogo para comenzar a armar tu pedido.
            </p>
            <Button
              className="btn-monochrome"
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
                  className="p-3 rounded-3 bg-surface-card border border-secondary border-opacity-25 d-flex gap-3 align-items-center"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: '0.375rem' }}
                  />
                  <div className="flex-grow-1 min-w-0">
                    <h6 className="text-white small fw-bold mb-1 text-truncate">{item.name}</h6>
                    <div className="text-muted small mb-2">{formatMoney(item.price)}</div>

                    <div className="d-flex align-items-center gap-2">
                      <div className="d-flex align-items-center border border-secondary rounded p-1">
                        <button
                          className="btn btn-sm text-white p-0 px-2"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Restar unidad"
                        >
                          <FaMinus size={9} />
                        </button>
                        <span className="small px-2 text-white fw-bold">{item.quantity}</span>
                        <button
                          className="btn btn-sm text-white p-0 px-2"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Sumar unidad"
                        >
                          <FaPlus size={9} />
                        </button>
                      </div>

                      <button
                        className="btn btn-sm text-dim hover-white p-1 ms-auto"
                        onClick={() => removeFromCart(item.id)}
                        title="Eliminar producto"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-top border-secondary border-opacity-25 mt-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-muted small">Subtotal</span>
                <span className="text-white fw-bold h5 mb-0">{formatMoney(subtotal)}</span>
              </div>
              <p className="text-dim small mb-4">Los costos de envío se calculan en el siguiente paso.</p>

              <div className="d-flex flex-column gap-2">
                <Button className="btn-monochrome w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2" onClick={handleCheckout}>
                  Continuar al Checkout <FaArrowRight size={14} />
                </Button>
                <Button variant="link" className="text-dim small text-decoration-none" onClick={clearCart}>
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
