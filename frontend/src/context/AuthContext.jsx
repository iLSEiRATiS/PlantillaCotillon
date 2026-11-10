import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('cotillon_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cotillon_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const profile = await api.getMe(token);
        setUser(profile);
        localStorage.setItem('cotillon_user', JSON.stringify(profile));
      } catch (err) {
        console.warn('Sesión expirada o token inválido:', err);
        logout();
      } finally {
        setLoading(false);
      }
    }
    verifyUser();
  }, [token]);

  const login = async (credentials) => {
    const data = await api.login(credentials);
    const authToken = data.token || data.access;
    setToken(authToken);
    setUser(data.user);
    localStorage.setItem('cotillon_token', authToken);
    localStorage.setItem('cotillon_user', JSON.stringify(data.user));
    return data;
  };

  const register = async (userData) => {
    const data = await api.register(userData);
    const authToken = data.token || data.access;
    setToken(authToken);
    setUser(data.user);
    localStorage.setItem('cotillon_token', authToken);
    localStorage.setItem('cotillon_user', JSON.stringify(data.user));
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('cotillon_token');
    localStorage.removeItem('cotillon_user');
  };

  return (
    <AuthContext.Provider value={{ token, user, isLoggedIn: !!token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
