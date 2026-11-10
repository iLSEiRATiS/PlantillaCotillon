import { useState } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserLock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login({ email: identifier, username: identifier, password });
      navigate('/catalogo');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión. Revisa tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-5 my-auto">
      <Container style={{ maxWidth: '440px' }}>
        <div className="p-4 p-sm-5 rounded-4 bg-surface-card border border-secondary border-opacity-25 shadow-lg">
          <div className="text-center mb-4">
            <div className="p-3 rounded-circle bg-surface border border-secondary text-white d-inline-flex mb-3">
              <FaUserLock size={24} />
            </div>
            <h2 className="h4 fw-bold text-white mb-1">Iniciar Sesión</h2>
            <p className="text-muted small mb-0">Accede para gestionar tus pedidos y compras.</p>
          </div>

          {error && <Alert variant="danger" className="py-2 small mb-3">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <div className="mb-3">
              <Form.Label className="small text-muted">Email o Usuario</Form.Label>
              <Form.Control
                className="form-control-custom"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin@cotillon.com"
              />
            </div>

            <div className="mb-4">
              <Form.Label className="small text-muted">Contraseña</Form.Label>
              <Form.Control
                type="password"
                className="form-control-custom"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" className="btn-monochrome w-100 py-2 fw-bold mb-3" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : 'Ingresar'}
            </Button>

            <div className="text-center">
              <span className="text-muted small">¿No tienes cuenta? </span>
              <Link to="/registro" className="text-white small fw-bold text-decoration-none hover-white">
                Regístrate aquí
              </Link>
            </div>
          </Form>
        </div>
      </Container>
    </div>
  );
}
