import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem('cotillon_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('cotillon_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product, qty = 1, attributes = {}) => {
    const quantity = Math.max(1, parseInt(qty, 10) || 1);
    const productId = product.id || product._id;
    const price = parseFloat(product.price || product.precio || 0);
    const name = product.name || product.nombre || 'Producto';
    const imageUrl = product.imageUrl || product.image_url || (Array.isArray(product.images) ? product.images[0] : '');

    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => String(item.id) === String(productId));
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [
        ...prev,
        {
          id: productId,
          name,
          price,
          imageUrl,
          quantity,
          attributes,
        },
      ];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (id) => {
    setItems((prev) => prev.filter((item) => String(item.id) !== String(id)));
  };

  const updateQuantity = (id, newQty) => {
    const q = parseInt(newQty, 10);
    if (q <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (String(item.id) === String(id) ? { ...item, quantity: q } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => items.reduce((sum, item) => sum + item.quantity, 0);
  const getSubtotal = () => items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getSubtotal,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de un CartProvider');
  }
  return context;
}
