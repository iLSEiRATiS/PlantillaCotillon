import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaBolt, FaPlus, FaCheck, FaStar } from 'react-icons/fa';
import { useState } from 'react';
import { useCart } from '../context/CartContext';

const formatMoney = (val) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(val || 0);

export default function ProductCard({ product, layout = 'grid' }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const id = product.id || product._id || product.slug;
  const name = product.nombre || product.name || 'Artículo de Cotillón';
  const price = product.precio !== undefined ? product.precio : (product.price || 0);
  const originalPrice = product.precioOriginal || (price > 4000 ? Math.round(price * 1.18) : null);
  const discountPercent = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const installments = 3;
  const installmentVal = Math.round(price / installments);

  const image =
    product.imageUrl ||
    product.image_url ||
    (Array.isArray(product.images) && product.images[0]) ||
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80';

  const categoryName = product.categoria?.nombre || product.category?.name || 'Cotillón';

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (layout === 'list') {
    return (
      <Link to={`/producto/${id}`} className="ml-card-list">
        <div className="ml-card-list-img">
          <img src={image} alt={name} loading="lazy" />
        </div>

        <div className="ml-card-list-info">
          <h3 className="ml-card-list-title">{name}</h3>
          <p className="ml-card-list-desc">
            {product.descripcion || product.description || 'Artículo ideal para fiestas, cumpleaños, eventos y celebraciones temáticas.'}
          </p>

          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="badge bg-light text-secondary border">{categoryName}</span>
            <div className="d-flex align-items-center text-warning small gap-1">
              <FaStar size={12} />
              <span className="text-dark fw-bold" style={{ fontSize: '0.8rem' }}>4.8</span>
              <span className="text-muted" style={{ fontSize: '0.75rem' }}>(34)</span>
            </div>
          </div>

          <div className="ml-shipping-text">
            <span>Envío gratis</span>
            <span className="ml-full-icon">
              <FaBolt size={10} className="me-1" />FULL
            </span>
          </div>
          <span className="text-secondary small">Llega gratis mañana</span>
        </div>

        <div className="ml-card-list-pricing">
          {originalPrice && (
            <div className="ml-price-strike">{formatMoney(originalPrice)}</div>
          )}
          <div className="ml-price-main-row justify-content-end">
            <span className="ml-price-amount">{formatMoney(price)}</span>
            {discountPercent > 0 && (
              <span className="ml-discount-badge">{discountPercent}% OFF</span>
            )}
          </div>
          <div className="ml-installments-text">
            en {installments} cuotas de {formatMoney(installmentVal)} sin interés
          </div>

          <div className="mt-3">
            <button
              type="button"
              className={`ml-btn-add ${added ? 'added' : ''}`}
              onClick={handleAdd}
            >
              {added ? (
                <>
                  <FaCheck size={12} /> Agregado
                </>
              ) : (
                <>
                  <FaPlus size={10} /> Agregar al carrito
                </>
              )}
            </button>
          </div>
        </div>
      </Link>
    );
  }

  // Layout Grid (Default)
  return (
    <Card as={Link} to={`/producto/${id}`} className="ml-card-grid">
      <div className="ml-card-img-container">
        <img src={image} alt={name} loading="lazy" />
      </div>

      <div className="ml-card-content">
        {originalPrice ? (
          <div className="ml-price-strike">{formatMoney(originalPrice)}</div>
        ) : (
          <div className="ml-price-strike" style={{ visibility: 'hidden' }}>$0</div>
        )}

        <div className="ml-price-main-row">
          <span className="ml-price-amount">{formatMoney(price)}</span>
          {discountPercent > 0 && (
            <span className="ml-discount-badge">{discountPercent}% OFF</span>
          )}
        </div>

        <div className="ml-installments-text">
          en {installments}x {formatMoney(installmentVal)} sin interés
        </div>

        <div className="ml-shipping-text">
          <span>Envío gratis</span>
          <span className="ml-full-icon">
            <FaBolt size={10} className="ms-1" /> FULL
          </span>
        </div>

        <h4 className="ml-product-title" title={name}>
          {name}
        </h4>

        <div className="d-flex align-items-center justify-content-between mb-2">
          <span className="badge bg-light text-secondary border" style={{ fontSize: '0.7rem' }}>
            {categoryName}
          </span>
          <div className="d-flex align-items-center text-warning gap-1" style={{ fontSize: '0.75rem' }}>
            <FaStar size={10} />
            <span className="text-dark fw-bold">4.8</span>
          </div>
        </div>

        <div className="ml-card-footer">
          <button
            type="button"
            className={`ml-btn-add ${added ? 'added' : ''}`}
            onClick={handleAdd}
          >
            {added ? (
              <>
                <FaCheck size={12} /> Agregado
              </>
            ) : (
              <>
                <FaPlus size={10} /> Agregar
              </>
            )}
          </button>
        </div>
      </div>
    </Card>
  );
}
