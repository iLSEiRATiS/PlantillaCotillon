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
        <div
          className="p-4 p-sm-5 rounded-4"
          style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02)',
          }}
        >
          <div className="text-center mb-4">
            <div
              className="p-3 rounded-circle d-inline-flex mb-3"
              style={{ backgroundColor: '#ffe4e6', color: '#e11d48' }}
            >
              <FaUserPlus size={26} />
            </div>
            <h2 className="h4 fw-bold mb-1" style={{ color: '#0f172a' }}>Crear Cuenta</h2>
            <p className="small mb-0" style={{ color: '#64748b' }}>
              Regístrate para guardar tus pedidos y agilizar tus compras en CotiFiesta.
            </p>
          </div>

          {error && <Alert variant="danger" className="py-2 small mb-3">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <div className="row g-2 mb-3">
              <div className="col-6">
                <Form.Label className="small fw-bold" style={{ color: '#334155' }}>Nombre</Form.Label>
                <Form.Control
                  className="form-control-custom"
                  required
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  placeholder="Carolina"
                />
              </div>
              <div className="col-6">
                <Form.Label className="small fw-bold" style={{ color: '#334155' }}>Apellido</Form.Label>
                <Form.Control
                  className="form-control-custom"
                  required
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  placeholder="Gómez"
                />
              </div>
            </div>

            <div className="mb-3">
              <Form.Label className="small fw-bold" style={{ color: '#334155' }}>Nombre de Usuario</Form.Label>
              <Form.Control
                className="form-control-custom"
                required
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="caro_eventos"
              />
            </div>

            <div className="mb-3">
              <Form.Label className="small fw-bold" style={{ color: '#334155' }}>Email</Form.Label>
              <Form.Control
                type="email"
                className="form-control-custom"
                required
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="caro@ejemplo.com"
              />
            </div>

            <div className="mb-4">
              <Form.Label className="small fw-bold" style={{ color: '#334155' }}>Contraseña</Form.Label>
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

            <Button type="submit" className="btn-festive w-100 py-2 fw-bold mb-3" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : 'Registrarse'}
            </Button>

            <div className="text-center">
              <span className="small" style={{ color: '#64748b' }}>¿Ya tienes una cuenta? </span>
              <Link to="/login" className="small fw-bold text-decoration-none" style={{ color: '#e11d48' }}>
                Inicia sesión aquí
              </Link>
            </div>
          </Form>
        </div>
      </Container>
    </div>
  );
}
