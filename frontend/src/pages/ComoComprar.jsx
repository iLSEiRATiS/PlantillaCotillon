import { Container, Row, Col, Card, Accordion, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaTruck, FaCheckCircle, FaQuestionCircle, FaFileInvoiceDollar } from 'react-icons/fa';

const ComoComprar = () => {
  const steps = [
    {
      step: '01',
      icon: <FaSearch size={28} className="text-white" />,
      title: 'Explora el Catálogo',
      description:
        'Recorre nuestras categorías de cotillón (globos, vajilla descartable, bengalas, guirnaldas y accesorios). Usa los filtros y la barra de búsqueda para encontrar los artículos que necesitas para tu evento.',
    },
    {
      step: '02',
      icon: <FaShoppingCart size={28} className="text-white" />,
      title: 'Agrega al Carrito',
      description:
        'Selecciona las unidades deseadas. Verifica que tu pedido alcance el monto mínimo de compra si aplica según la política mayorista configurada en la tienda.',
    },
    {
      step: '03',
      icon: <FaFileInvoiceDollar size={28} className="text-white" />,
      title: 'Completa tus Datos',
      description:
        'Ingresa tu dirección de entrega, ciudad, número de teléfono y notas específicas para el despacho. Puedes comprar como invitado o creando una cuenta para guardar tu historial.',
    },
    {
      step: '04',
      icon: <FaCheckCircle size={28} className="text-white" />,
      title: 'Confirmación y Despacho',
      description:
        'Recibirás el número de orden y comprobante en PDF al instante. Nuestro equipo prepara el pedido y coordina el envío express o la entrega según lo acordado.',
    },
  ];

  const faqs = [
    {
      q: '¿Tienen un monto mínimo de compra?',
      a: 'Sí, la plataforma cuenta con un mínimo de pedido ajustable desde el panel administrativo (por defecto $15.000). En el carrito podrás ver en tiempo real cuánto te falta para completarlo.',
    },
    {
      q: '¿Cómo se realizan los envíos?',
      a: 'Despachamos a todo el país a través de expresos y correos de confianza. También disponemos de punto de retiro sin cargo en nuestro depósito central.',
    },
    {
      q: '¿Cuáles son los medios de pago aceptados?',
      a: 'Aceptamos transferencias bancarias directas, depósitos, pagos al retirar en local o plataformas de cobro online.',
    },
    {
      q: '¿Cuánto demora la preparación del pedido?',
      a: 'Una vez confirmado el pedido, el tiempo promedio de empaquetado y control de calidad es de 24 a 48 horas hábiles.',
    },
    {
      q: '¿Puedo solicitar factura A o B?',
      a: 'Sí, emitimos factura para consumidor final o responsable inscripto. Solo debes dejar asentados tus datos fiscales en la nota del pedido o en tu perfil.',
    },
  ];

  return (
    <div className="como-comprar-page py-5">
      <Container>
        {/* Header Hero */}
        <div className="text-center mb-5 pb-3">
          <span className="badge bg-secondary text-light px-3 py-2 mb-3 text-uppercase tracking-wider">
            Guía de Compra
          </span>
          <h1 className="display-4 fw-bold text-white mb-3">¿Cómo Comprar en Nuestra Tienda?</h1>
          <p className="text-muted lead mx-auto" style={{ maxWidth: '720px' }}>
            Un proceso simple, ágil y transparente diseñado para facilitarte la compra de cotillón,
            artículos festivos y ambientación para tus eventos.
          </p>
        </div>

        {/* Pasos de compra */}
        <Row className="g-4 mb-5 pb-4">
          {steps.map((item, idx) => (
            <Col lg={3} sm={6} key={`step-${idx}`}>
              <Card className="h-100 bg-surface border-secondary text-light p-3 position-relative overflow-hidden step-card">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="p-3 bg-secondary rounded-3 d-inline-flex align-items-center justify-content-center">
                    {item.icon}
                  </div>
                  <span className="display-6 fw-bold text-muted opacity-25">{item.step}</span>
                </div>
                <Card.Body className="p-0">
                  <Card.Title className="h5 fw-bold text-white mb-2">{item.title}</Card.Title>
                  <Card.Text className="text-muted small lh-base">{item.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Banner intermedio Call to Action */}
        <div className="bg-surface border border-secondary rounded-4 p-4 p-md-5 mb-5 text-center position-relative">
          <Row className="align-items-center justify-content-center">
            <Col md={8}>
              <h2 className="fw-bold text-white mb-3">¿Listo para armar tu pedido?</h2>
              <p className="text-muted mb-4">
                Explora todo nuestro catálogo organizado por categorías con stock y precios actualizados.
              </p>
              <div className="d-flex flex-wrap justify-content-center gap-3">
                <Button as={Link} to="/productos" variant="light" size="lg" className="fw-bold px-4">
                  Ver Catálogo de Productos
                </Button>
                <Button as={Link} to="/register" variant="outline-light" size="lg" className="px-4">
                  Crear Cuenta
                </Button>
              </div>
            </Col>
          </Row>
        </div>

        {/* Preguntas frecuentes (FAQ) */}
        <div className="faq-section mx-auto" style={{ maxWidth: '860px' }}>
          <div className="text-center mb-4">
            <FaQuestionCircle size={32} className="text-muted mb-2" />
            <h3 className="fw-bold text-white">Preguntas Frecuentes</h3>
            <p className="text-muted small">Respuestas rápidas a las consultas más habituales de nuestros clientes.</p>
          </div>

          <Accordion defaultActiveKey="0" className="faq-accordion">
            {faqs.map((faq, i) => (
              <Accordion.Item eventKey={String(i)} key={`faq-${i}`} className="bg-surface border-secondary mb-3 rounded overflow-hidden">
                <Accordion.Header className="text-white">
                  <strong>{faq.q}</strong>
                </Accordion.Header>
                <Accordion.Body className="text-muted small lh-base bg-surface">
                  {faq.a}
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </div>
      </Container>
    </div>
  );
};

export default ComoComprar;
