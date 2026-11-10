import { useState } from 'react';
import { FaWhatsapp, FaTimes } from 'react-icons/fa';

export default function FloatingWhatsApp() {
  const [showTooltip, setShowTooltip] = useState(true);

  const phone = '5491155550000';
  const defaultMessage = encodeURIComponent(
    '¡Hola CotiFiesta! Quisiera consultar por stock y combos para un evento o fiesta.'
  );
  const whatsappUrl = `https://wa.me/${phone}?text=${defaultMessage}`;

  return (
    <div className="floating-whatsapp-container">
      {/* Tooltip de Asesoramiento */}
      {showTooltip && (
        <div className="floating-whatsapp-tooltip shadow-sm">
          <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
            <span className="fw-bold" style={{ fontSize: '0.8rem', color: '#0f172a' }}>
              ¿Necesitás ayuda con tu fiesta?
            </span>
            <button
              type="button"
              className="btn btn-link p-0 text-muted"
              style={{ fontSize: '0.75rem', lineHeight: 1 }}
              onClick={() => setShowTooltip(false)}
              aria-label="Cerrar tooltip"
            >
              <FaTimes size={10} />
            </button>
          </div>
          <p className="small mb-0 text-secondary" style={{ fontSize: '0.75rem', lineHeight: '1.3' }}>
            Chateá por WhatsApp con un asesor y armá tu combo.
          </p>
        </div>
      )}

      {/* Botón flotante */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-whatsapp-btn"
        aria-label="Contactar por WhatsApp"
        title="Contactar por WhatsApp"
      >
        <FaWhatsapp size={32} />
      </a>
    </div>
  );
}
