import { Container, Row, Col, Accordion, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaCheckCircle, FaQuestionCircle, FaFileInvoiceDollar, FaArrowRight, FaStar } from 'react-icons/fa';

export default function ComoComprar() {
  const steps = [
    {
      icon: <FaSearch size={22} className="text-danger" />,
      bgIcon: '#ffe4e6',
      title: 'Explora el Catálogo',
      desc: 'Navega por nuestras categorías temáticas: globos, vajilla descartable, bengalas luminosas y guirnaldas. Puedes filtrar por estilo o buscar artículos específicos.',
    },
    {
      icon: <FaShoppingCart size={22} className="text-primary" />,
      bgIcon: '#e0e7ff',
      title: 'Arma tu Pedido',
      desc: 'Selecciona las cantidades deseadas para tu evento o cumpleaños. En el carrito lateral puedes verificar el subtotal y el progreso hacia el monto mínimo.',
    },
    {
      icon: <FaFileInvoiceDollar size={22} className="text-warning" />,
      bgIcon: '#fef3c7',
      title: 'Datos de Entrega',
      desc: 'Indica tu dirección de despacho o selecciona retiro gratuito en depósito central. Puedes comprar como invitado o creando una cuenta para guardar tu historial.',
    },
    {
      icon: <FaCheckCircle size={22} className="text-success" />,
      bgIcon: '#d1fae5',
      title: '¡Listo para Festejar!',
      desc: 'Te asignamos un número de pedido al instante. Empaquetamos todo con el mayor cuidado y te avisamos por WhatsApp o email cuando esté en camino.',
    },
  ];

  const faqs = [
    {
      q: '¿Tienen un monto mínimo de compra?',
      a: 'Sí, la plataforma cuenta con un monto mínimo de pedido para acceder a precios mayoristas y directos de fábrica (configurable desde el panel de administración). En el carrito podrás verificar en tiempo real si alcanzaste la cifra.',
    },
    {
      q: '¿Cómo se coordinan los envíos?',
      a: 'Despachamos a todo el país mediante transporte expreso y correos de confianza. Si estás en la zona, también puedes optar por retiro sin cargo en nuestro depósito central.',
    },
    {
      q: '¿Cuáles son los medios de pago disponibles?',
      a: 'Aceptamos transferencias bancarias directas, depósitos, cobro en efectivo al retirar en depósito, y las principales billeteras virtuales.',
    },
    {
      q: '¿Cuánto demora el armado del pedido?',
      a: 'Los pedidos se preparan y embalan cuidadosamente en un plazo de 24 a 48 horas hábiles tras la confirmación de la orden.',
    },
    {
      q: '¿Emiten factura para empresas o eventos?',
      a: 'Sí, emitimos facturas tipo A y B según corresponda. Puedes dejar tu CUIT o DNI al completar tus datos en el checkout.',
    },
  ];

  return (
    <div className="py-5" style={{ minHeight: '80vh' }}>
      <Container>
        {/* Encabezado */}
        <div className="text-center mb-5 pb-2">
          <span className="festive-pill mb-3">
            <FaStar size={13} className="text-warning" /> Guía Paso a Paso
          </span>
          <h1 className="display-5 fw-bold mb-3" style={{ color: '#0f172a' }}>
            ¿Cómo Comprar en CotiFiesta?
          </h1>
          <p className="lead mx-auto" style={{ maxWidth: '680px', color: '#475569', fontSize: '1.1rem' }}>
            Un proceso ágil, intuitivo y alegre para que elijas todo lo que necesitas para tu evento, cumpleaños o celebración en minutos.
          </p>
        </div>

        {/* Pasos */}
        <Row className="g-3 g-sm-4 mb-5 pb-3">
          {steps.map((st, i) => (
            <Col lg={3} sm={6} xs={12} key={i}>
              <div className="step-card h-100 d-flex flex-column text-center text-sm-start">
                <div className="mb-3 mb-sm-4 mx-auto mx-sm-0">
                  <div
                    className="p-3 rounded-circle d-inline-flex align-items-center justify-content-center"
                    style={{ backgroundColor: st.bgIcon, width: 54, height: 54 }}
                  >
                    {st.icon}
                  </div>
                </div>
                <h5 className="fw-bold mb-2" style={{ color: '#0f172a' }}>{st.title}</h5>
                <p className="small mb-0 lh-base" style={{ color: '#475569' }}>{st.desc}</p>
              </div>
            </Col>
          ))}
        </Row>

        {/* CTA Catálogo */}
        <div
          className="p-4 p-sm-5 rounded-4 text-center mb-5 position-relative"
          style={{
            background: 'linear-gradient(135deg, #fff1f2 0%, #e0e7ff 50%, #fef3c7 100%)',
            border: '1.5px solid #fecdd3',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <h3 className="fw-bold mb-2" style={{ color: '#0f172a' }}>
            ¿Listo para armar tu festejo?
          </h3>
          <p className="small mb-4 mx-auto" style={{ maxWidth: '520px', color: '#334155', fontSize: '1rem' }}>
            Ingresa a nuestro catálogo, agrega tus artículos favoritos al carrito y confirma tu pedido con total seguridad.
          </p>
          <Button as={Link} to="/catalogo" className="btn-festive px-4 py-2.5 fs-6 w-100 w-sm-auto">
            Ver Catálogo de Artículos <FaArrowRight size={13} className="ms-2" />
          </Button>
        </div>

        {/* FAQ Accordion */}
        <div className="mx-auto" style={{ maxWidth: '820px' }}>
          <div className="text-center mb-4">
            <FaQuestionCircle size={32} className="text-danger mb-2" />
            <h3 className="h4 fw-bold" style={{ color: '#0f172a' }}>Preguntas Frecuentes</h3>
            <p className="small" style={{ color: '#64748b' }}>
              Respuestas a las dudas más comunes sobre compras, envíos y pagos.
            </p>
          </div>

          <Accordion defaultActiveKey="0" className="d-flex flex-column gap-2">
            {faqs.map((f, idx) => (
              <Accordion.Item eventKey={String(idx)} key={idx}>
                <Accordion.Header>
                  <span style={{ color: '#0f172a', fontWeight: 700 }}>{f.q}</span>
                </Accordion.Header>
                <Accordion.Body>
                  {f.a}
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </div>
      </Container>
    </div>
  );
}
