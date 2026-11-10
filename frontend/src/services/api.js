const API_BASE = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    method: options.method || 'GET',
    headers,
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.detail || data.message || `Error HTTP ${response.status}`;
      throw new Error(errorMsg);
    }
    return data;
  } catch (error) {
    console.error(`Error en API [${options.method || 'GET'} ${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  // Configuración y Home
  getStoreConfig: () => request('/api/store-config'),
  getHomeImages: () => request('/api/home-images'),

  // Categorías y Productos
  getCategories: () => request('/api/categories-list'),
  getProducts: (params = {}) => {
    const sp = new URLSearchParams();
    if (params.q) sp.append('q', params.q);
    if (params.category) sp.append('category', params.category);
    if (params.category_id) sp.append('category_id', params.category_id);
    if (params.sort) sp.append('sort', params.sort);
    if (params.min_price || params.minPrice) sp.append('min_price', params.min_price || params.minPrice);
    if (params.max_price || params.maxPrice) sp.append('max_price', params.max_price || params.maxPrice);
    if (params.page) sp.append('page', params.page);
    if (params.limit) sp.append('limit', params.limit);
    const qs = sp.toString();
    return request(`/api/products${qs ? `?${qs}` : ''}`);
  },
  getProduct: (id) => request(`/api/products/${encodeURIComponent(id)}`),

  // Pedidos
  createOrder: (orderData, token) =>
    request('/api/orders', { method: 'POST', body: orderData, token }),
  getMyOrders: (token) => request('/api/orders/mine', { token }),
  getOrder: (id, token) => request(`/api/orders/${id}`, { token }),

  // Autenticación
  login: (credentials) => request('/api/auth/login', { method: 'POST', body: credentials }),
  register: (userData) => request('/api/auth/register', { method: 'POST', body: userData }),
  getMe: (token) => request('/api/auth/me', { token }),

  // Contacto
  sendContact: (data) => request('/api/supplier-contacts', { method: 'POST', body: data }),

  // Panel Administrativo
  getAdminOverview: (token) => request('/api/admin/overview', { token }),
  getAdminOrders: (token, status) =>
    request(`/api/admin/orders${status ? `?status=${status}` : ''}`, { token }),
  updateOrderStatus: (id, status, token) =>
    request(`/api/admin/orders/${id}`, { method: 'PATCH', body: { status }, token }),
  createProduct: (data, token) => request('/api/products', { method: 'POST', body: data, token }),
  updateProduct: (id, data, token) => request(`/api/products/${id}`, { method: 'PUT', body: data, token }),
  deleteProduct: (id, token) => request(`/api/products/${id}`, { method: 'DELETE', token }),
  bulkCreateProducts: (products, token) =>
    request('/api/products/bulk', { method: 'POST', body: { products }, token }),
  getAdminStoreConfig: (token) => request('/api/admin/store-config', { token }),
  updateStoreConfig: (data, token) =>
    request('/api/admin/store-config', { method: 'POST', body: data, token }),
};

export default api;
