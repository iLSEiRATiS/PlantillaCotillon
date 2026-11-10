import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaPlus, FaCheck } from 'react-icons/fa';
import { useState } from 'react';
import { useCart } from '../context/CartContext';

const formatMoney = (val) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val || 0);

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const id = product.id || product._id || product.slug;
  const name = product.nombre || product.name || 'Artículo de Cotillón';
  const price = product.precio !== undefined ? product.precio : (product.price || 0);
  const categoryName = product.categoria?.nombre || product.category?.name || 'Cotillón';
  const image =
    product.imageUrl ||
    product.image_url ||
    (Array.isArray(product.images) && product.images[0]) ||
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop&q=80';

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Card as={Link} to={`/producto/${id}`} className="custom-card h-100 text-decoration-none">
      <div className="card-img-wrapper">
        <img src={image} alt={name} loading="lazy" />
        <span className="card-badge">{categoryName}</span>
      </div>

      <Card.Body className="d-flex flex-column p-3">
        <h6 className="text-white fw-bold mb-1 text-truncate" title={name}>
          {name}
        </h6>
        <p className="text-dim small mb-3 text-truncate">
          {product.descripcion || product.description || 'Artículo de ambientación y fiesta.'}
        </p>

        <div className="mt-auto d-flex align-items-center justify-content-between pt-2 border-top border-secondary border-opacity-25">
          <span className="h5 fw-bold text-white mb-0">{formatMoney(price)}</span>

          <Button
            size="sm"
            className={added ? 'btn-monochrome-outline' : 'btn-monochrome'}
            onClick={handleAdd}
            aria-label="Agregar al carrito"
          >
            {added ? (
              <span className="d-flex align-items-center gap-1 small">
                <FaCheck /> Listo
              </span>
            ) : (
              <span className="d-flex align-items-center gap-1 small">
                <FaPlus size={10} /> Agregar
              </span>
            )}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
