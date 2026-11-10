import { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { FaComments } from 'react-icons/fa';
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
      setStatus({ type: 'success', text: '¡Consulta enviada con éxito! Nos contactaremos a la brevedad.' });
      setFormData({ nombre: '', apellido: '', telefono: '', mensaje: '' });
      setTimeout(() => {
        onHide();
        setStatus(null);
      }, 2000);
    } catch (err) {
      setStatus({ type: 'danger', text: err.message || 'Error al enviar la consulta. Intenta nuevamente.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
        <Modal.Title className="h5 fw-bold d-flex align-items-center gap-2" style={{ color: '#0f172a' }}>
          <FaComments className="text-danger" /> Asesoramiento para tu Evento
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4" style={{ backgroundColor: '#ffffff' }}>
          {status && <Alert variant={status.type} className="small py-2">{status.text}</Alert>}

          <div className="row g-3 mb-3">
            <div className="col-6">
              <Form.Label className="small fw-bold" style={{ color: '#334155' }}>Nombre</Form.Label>
              <Form.Control
                className="form-control-custom"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Juan"
              />
            </div>
            <div className="col-6">
              <Form.Label className="small fw-bold" style={{ color: '#334155' }}>Apellido</Form.Label>
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
            <Form.Label className="small fw-bold" style={{ color: '#334155' }}>Teléfono / WhatsApp</Form.Label>
            <Form.Control
              className="form-control-custom"
              required
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              placeholder="+54 9 11 5555-5555"
            />
          </div>

          <div className="mb-2">
            <Form.Label className="small fw-bold" style={{ color: '#334155' }}>Consulta o Idea para tu Fiesta</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              className="form-control-custom"
              required
              value={formData.mensaje}
              onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
              placeholder="¿Qué tipo de evento estás preparando? Cantidad de invitados, temática..."
            />
          </div>
        </Modal.Body>

        <Modal.Footer style={{ borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', padding: '1rem 1.5rem' }}>
          <Button variant="light" className="btn-festive-outline px-3 py-2 small" onClick={onHide} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" className="btn-festive px-4 py-2 small" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Consulta'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
