import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';

import Home from './pages/Home';
import Catalogo from './pages/Catalogo';
import ProductDetail from './pages/ProductDetail';
import ComoComprar from './pages/ComoComprar';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Orders from './pages/Orders';
import Admin from './pages/Admin';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-main)' }}>
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalogo" element={<Catalogo />} />
                <Route path="/productos" element={<Navigate to="/catalogo" replace />} />
                <Route path="/producto/:id" element={<ProductDetail />} />
                <Route path="/como-comprar" element={<ComoComprar />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Register />} />
                <Route path="/register" element={<Navigate to="/registro" replace />} />
                <Route path="/pedidos" element={<Orders />} />
                <Route path="/orders" element={<Navigate to="/pedidos" replace />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <CartDrawer />
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
