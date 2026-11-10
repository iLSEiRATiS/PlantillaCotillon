import { useState } from 'react';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserPlus } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await register(form);
      navigate('/catalogo');
    } catch (err) {
      setError(err.message || 'Error al crear la cuenta. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-5 my-auto">
      <Container style={{ maxWidth: '480px' }}>
        <div className="p-4 p-sm-5 rounded-4 bg-surface-card border border-secondary border-opacity-25 shadow-lg">
          <div className="text-center mb-4">
            <div className="p-3 rounded-circle bg-surface border border-secondary text-white d-inline-flex mb-3">
              <FaUserPlus size={24} />
            </div>
            <h2 className="h4 fw-bold text-white mb-1">Crear Cuenta</h2>
            <p className="text-muted small mb-0">Regístrate para guardar tus pedidos y agilizar tus compras.</p>
          </div>

          {error && <Alert variant="danger" className="py-2 small mb-3">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <div className="row g-2 mb-3">
              <div className="col-6">
                <Form.Label className="small text-muted">Nombre</Form.Label>
                <Form.Control
                  className="form-control-custom"
                  required
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  placeholder="Carlos"
                />
              </div>
              <div className="col-6">
                <Form.Label className="small text-muted">Apellido</Form.Label>
                <Form.Control
                  className="form-control-custom"
                  required
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  placeholder="López"
                />
              </div>
            </div>

            <div className="mb-3">
              <Form.Label className="small text-muted">Nombre de Usuario</Form.Label>
              <Form.Control
                className="form-control-custom"
                required
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="carlos_eventos"
              />
            </div>

            <div className="mb-3">
              <Form.Label className="small text-muted">Email</Form.Label>
              <Form.Control
                type="email"
                className="form-control-custom"
                required
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="carlos@ejemplo.com"
              />
            </div>

            <div className="mb-4">
              <Form.Label className="small text-muted">Contraseña</Form.Label>
              <Form.Control
                type="password"
                className="form-control-custom"
                required
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <Button type="submit" className="btn-monochrome w-100 py-2 fw-bold mb-3" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : 'Crear Cuenta'}
            </Button>

            <div className="text-center">
              <span className="text-muted small">¿Ya tienes una cuenta? </span>
              <Link to="/login" className="text-white small fw-bold text-decoration-none hover-white">
                Inicia sesión aquí
              </Link>
            </div>
          </Form>
        </div>
      </Container>
    </div>
  );
}
