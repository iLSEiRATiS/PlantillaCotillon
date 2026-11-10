import { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import api from '../services/api';

export default function ContactModal({ show, onHide }) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    mensaje: '',
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      await api.sendContact(formData);
      setStatus({ type: 'success', text: '¡Mensaje enviado con éxito! Nos comunicaremos a la brevedad.' });
      setFormData({ nombre: '', apellido: '', telefono: '', mensaje: '' });
      setTimeout(() => {
        onHide();
        setStatus(null);
      }, 2000);
    } catch (err) {
      setStatus({ type: 'danger', text: err.message || 'Error al enviar el mensaje. Intenta nuevamente.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered contentClassName="bg-surface border border-secondary text-white">
      <Modal.Header closeButton closeVariant="white" className="border-secondary border-opacity-25">
        <Modal.Title className="h5 fw-bold text-white">Contacto & Asesoramiento</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          {status && <Alert variant={status.type} className="small py-2">{status.text}</Alert>}

          <div className="row g-3 mb-3">
            <div className="col-6">
              <Form.Label className="small text-muted">Nombre</Form.Label>
              <Form.Control
                className="form-control-custom"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Juan"
              />
            </div>
            <div className="col-6">
              <Form.Label className="small text-muted">Apellido</Form.Label>
              <Form.Control
                className="form-control-custom"
                required
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                placeholder="Pérez"
              />
            </div>
          </div>

          <div className="mb-3">
            <Form.Label className="small text-muted">Teléfono / WhatsApp</Form.Label>
            <Form.Control
              className="form-control-custom"
              required
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              placeholder="+54 9 11 ..."
            />
          </div>

          <div className="mb-2">
            <Form.Label className="small text-muted">Mensaje o Consulta</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              className="form-control-custom"
              required
              value={formData.mensaje}
              onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
              placeholder="Consulta sobre cotillón mayorista, armado de combos..."
            />
          </div>
        </Modal.Body>

        <Modal.Footer className="border-secondary border-opacity-25 px-4 pb-4">
          <Button variant="secondary" className="btn-monochrome-outline small" onClick={onHide} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" className="btn-monochrome small" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Consulta'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
