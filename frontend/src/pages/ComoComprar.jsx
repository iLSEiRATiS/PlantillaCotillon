import { Container, Row, Col, Card, Accordion, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaCheckCircle, FaQuestionCircle, FaFileInvoiceDollar, FaArrowRight } from 'react-icons/fa';

export default function ComoComprar() {
  const steps = [
    {
      num: '01',
      icon: <FaSearch size={22} />,
      title: 'Explora y Elige',
      desc: 'Navega por nuestro catálogo organizado por categorías (globos, vajilla, bengalas, guirnaldas). Filtra por colecciones y selecciona tus artículos favoritos.',
    },
    {
      num: '02',
      icon: <FaShoppingCart size={22} />,
      title: 'Arma tu Carrito',
      desc: 'Selecciona las cantidades necesarias. En el carrito lateral podrás revisar el subtotal y asegurarte de cumplir con las políticas de pedido.',
    },
    {
      num: '03',
      icon: <FaFileInvoiceDollar size={22} />,
      title: 'Datos de Entrega',
      desc: 'Ingresa tus datos personales, dirección de envío o solicita retiro en depósito. Puedes comprar como invitado o con tu cuenta de cliente.',
    },
    {
      num: '04',
      icon: <FaCheckCircle size={22} />,
      title: 'Confirmación y Despacho',
      desc: 'Generamos tu número de pedido al instante y te enviamos el comprobante. Nuestro equipo embala tus productos y coordina el envío.',
    },
  ];

  const faqs = [
    {
      q: '¿Tienen un monto mínimo de compra?',
      a: 'Sí, la plataforma cuenta con un mínimo de pedido ajustable desde la configuración (por defecto $15.000). En el carrito podrás ver en tiempo real si alcanzaste el monto.',
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
      a: 'Sí, emitimos factura para consumidor final o responsable inscripto. Solo debes dejar asentados tus datos fiscales en la nota del pedido.',
    },
  ];

  return (
    <div className="py-5">
      <Container>
        {/* Encabezado */}
        <div className="text-center mb-5 pb-2">
          <span className="custom-badge d-inline-block mb-3">Guía de Compra</span>
          <h1 className="display-4 fw-bold text-white mb-3">¿Cómo Comprar en Nuestra Tienda?</h1>
          <p className="lead text-muted mx-auto" style={{ maxWidth: '680px' }}>
            Un proceso ágil, intuitivo y transparente diseñado para facilitarte la selección y compra
            de cotillón y ambientación para tus festejos.
          </p>
        </div>

        {/* Pasos */}
        <Row className="g-4 mb-5 pb-3">
          {steps.map((st, i) => (
            <Col lg={3} sm={6} key={i}>
              <div className="p-4 rounded-3 bg-surface-card border border-secondary border-opacity-25 h-100 d-flex flex-column custom-card">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="p-3 rounded-circle bg-surface border border-secondary text-white">
                    {st.icon}
                  </div>
                  <span className="step-number">{st.num}</span>
                </div>
                <h5 className="fw-bold text-white mb-2">{st.title}</h5>
                <p className="text-muted small mb-0 lh-base">{st.desc}</p>
              </div>
            </Col>
          ))}
        </Row>

        {/* CTA Catálogo */}
        <div className="p-5 rounded-4 bg-surface-card border border-secondary border-opacity-50 text-center mb-5 position-relative">
          <h3 className="fw-bold text-white mb-2">¿Listo para armar tu pedido?</h3>
          <p className="text-muted small mb-4 mx-auto" style={{ maxWidth: '520px' }}>
            Ingresa a nuestro catálogo, elige los productos que necesitas y confirma tu pedido en minutos.
          </p>
          <Button as={Link} to="/catalogo" className="btn-monochrome px-4 py-2">
            Ver Catálogo de Artículos <FaArrowRight size={12} className="ms-2" />
          </Button>
        </div>

        {/* FAQ Accordion */}
        <div className="mx-auto" style={{ maxWidth: '820px' }}>
          <div className="text-center mb-4">
            <FaQuestionCircle size={28} className="text-dim mb-2" />
            <h3 className="h4 fw-bold text-white">Preguntas Frecuentes</h3>
            <p className="text-muted small">Respuestas a las dudas más comunes de nuestros clientes.</p>
          </div>

          <Accordion defaultActiveKey="0" className="d-flex flex-column gap-3">
            {faqs.map((f, idx) => (
              <Accordion.Item eventKey={String(idx)} key={idx} className="bg-surface-card border border-secondary border-opacity-25 rounded-3 overflow-hidden">
                <Accordion.Header className="text-white">
                  <strong>{f.q}</strong>
                </Accordion.Header>
                <Accordion.Body className="text-muted small lh-base bg-surface-card">
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
