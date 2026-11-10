import { useState } from 'react';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserLock, FaStar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('admin@cotillon.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await login({ email: identifier, username: identifier, password });
      if (res?.user?.is_staff || res?.user?.is_superuser) {
        navigate('/admin');
      } else {
        navigate('/catalogo');
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión. Revisa tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-5 my-auto">
      <Container style={{ maxWidth: '440px' }}>
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
              <FaUserLock size={26} />
            </div>
            <h2 className="h4 fw-bold mb-1" style={{ color: '#0f172a' }}>Iniciar Sesión</h2>
            <p className="small mb-0" style={{ color: '#64748b' }}>
              Accede a tu cuenta de cliente o administración.
            </p>
          </div>

          {error && <Alert variant="danger" className="py-2 small mb-3">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <div className="mb-3">
              <Form.Label className="small fw-bold" style={{ color: '#334155' }}>
                Email o Usuario
              </Form.Label>
              <Form.Control
                className="form-control-custom"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin@cotillon.com"
              />
            </div>

            <div className="mb-4">
              <Form.Label className="small fw-bold" style={{ color: '#334155' }}>
                Contraseña
              </Form.Label>
              <Form.Control
                type="password"
                className="form-control-custom"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" className="btn-festive w-100 py-2 fw-bold mb-3" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : 'Ingresar a la Plataforma'}
            </Button>

            <div className="p-2 rounded-3 text-center mb-3" style={{ backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0' }}>
              <div className="small fw-bold" style={{ color: '#0f172a' }}>
                <FaStar className="text-warning me-1" /> Acceso Demo:
              </div>
              <div className="small text-muted" style={{ fontSize: '0.8rem' }}>
                <strong>Admin:</strong> admin@cotillon.com / admin123<br />
                <strong>Cliente:</strong> cliente@cotillon.com / cliente123
              </div>
            </div>

            <div className="text-center">
              <span className="small" style={{ color: '#64748b' }}>¿No tienes una cuenta? </span>
              <Link to="/registro" className="small fw-bold text-decoration-none" style={{ color: '#e11d48' }}>
                Regístrate aquí
              </Link>
            </div>
          </Form>
        </div>
      </Container>
    </div>
  );
}
