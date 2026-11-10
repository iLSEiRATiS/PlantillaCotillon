import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Nav, 
  Tab, 
  Table, 
  Form, 
  Button, 
  Badge, 
  Alert, 
  Spinner, 
  Modal, 
  InputGroup,
  ProgressBar 
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaChartBar, 
  FaClipboardList, 
  FaBoxes, 
  FaPlus, 
  FaCog, 
  FaCreditCard, 
  FaFileExcel, 
  FaFileCsv, 
  FaDownload, 
  FaUpload, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaWhatsapp, 
  FaSearch, 
  FaShieldAlt, 
  FaMoneyBillWave, 
  FaShoppingBag, 
  FaBoxOpen, 
  FaUsers,
  FaCheck,
  FaTimes,
  FaStore,
  FaCalendarAlt,
  FaInfoCircle
} from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const formatMoney = (val) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val || 0);

const statusBadges = {
  created: { bg: 'warning', text: 'dark', label: 'A procesar' },
  review: { bg: 'info', text: 'white', label: 'En revisión' },
  shipped: { bg: 'primary', text: 'white', label: 'En camino' },
  paid: { bg: 'success', text: 'white', label: 'Pagado' },
  delivered: { bg: 'success', text: 'white', label: 'Entregado' },
  cancelled: { bg: 'danger', text: 'white', label: 'Cancelado' },
};

export default function Admin() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('resumen');

  // Estados de datos
  const [overview, setOverview] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  // Filtros de órdenes
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Filtros de productos
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState('');

  // Modales de producto (Crear / Editar / Eliminar)
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    nombre: '',
    precio: '',
    stock: 100,
    categoriaId: '',
    imageUrl: '',
    descripcion: '',
    sku: '',
    activo: true,
  });
  const [savingProduct, setSavingProduct] = useState(false);
  const [deleteProductTarget, setDeleteProductTarget] = useState(null);

  // Estados para importador de archivos (XLSX / CSV)
  const fileInputRef = useRef(null);
  const [importFileName, setImportFileName] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importStats, setImportStats] = useState(null);

  // Estados de Pasarelas de Pago
  const [paymentConfig, setPaymentConfig] = useState({
    mpEnabled: false,
    mpPublicKey: '',
    mpAccessToken: '',
    mpSandbox: true,
    mpInstallments: 3,
    transferEnabled: true,
    transferDiscount: 10.0,
    transferBank: 'Banco Santander',
    transferHolder: 'CotiFiesta S.A.',
    transferCbu: '0720123488000012345678',
    transferAlias: 'COTIFIESTA.FIESTA',
    transferCuit: '30-71234567-9',
    cashEnabled: true,
    cashInstructions: 'Pago en efectivo al retirar en nuestro depósito central.',
  });
  const [savingPayments, setSavingPayments] = useState(false);

  // Políticas de tienda
  const [storePolicy, setStorePolicy] = useState({
    minOrderAmount: 15000,
    maintenanceMode: false,
    maintenanceTitle: 'Estamos preparando novedades',
    maintenanceMessage: 'Volvemos en breves minutos.',
  });
  const [savingPolicy, setSavingPolicy] = useState(false);

  const isStaff = user?.is_staff || user?.is_superuser;

  useEffect(() => {
    if (!token || !isStaff) {
      setLoading(false);
      return;
    }
    loadAllData();
  }, [token, isStaff]);

  async function loadAllData() {
    setLoading(true);
    try {
      const [ov, ords, prods, cats, conf] = await Promise.all([
        api.getAdminOverview(token).catch(() => null),
        api.getAdminOrders(token).catch(() => ({ items: [] })),
        api.getProducts({ limit: 100, all: 'true' }).catch(() => ({ items: [] })),
        api.getCategories().catch(() => ({ items: [] })),
        api.getAdminStoreConfig(token).catch(() => null),
      ]);

      setOverview(ov);
      setOrders(ords.items || ords.orders || []);
      setProducts(prods.items || prods.products || []);
      setCategories((cats.items || []).filter((c) => c.slug !== 'ofertas'));

      if (conf) {
        setPaymentConfig({
          mpEnabled: Boolean(conf.mpEnabled),
          mpPublicKey: conf.mpPublicKey || '',
          mpAccessToken: conf.mpAccessToken || '',
          mpSandbox: conf.mpSandbox !== undefined ? conf.mpSandbox : true,
          mpInstallments: conf.mpInstallments || 3,
          transferEnabled: conf.transferEnabled !== undefined ? conf.transferEnabled : true,
          transferDiscount: conf.transferDiscount !== undefined ? conf.transferDiscount : 10.0,
          transferBank: conf.transferBank || 'Banco Santander',
          transferHolder: conf.transferHolder || 'CotiFiesta S.A.',
          transferCbu: conf.transferCbu || '0720123488000012345678',
          transferAlias: conf.transferAlias || 'COTIFIESTA.FIESTA',
          transferCuit: conf.transferCuit || '30-71234567-9',
          cashEnabled: conf.cashEnabled !== undefined ? conf.cashEnabled : true,
          cashInstructions: conf.cashInstructions || 'Pago en efectivo al retirar en depósito.',
        });

        setStorePolicy({
          minOrderAmount: conf.minOrderAmount || 15000,
          maintenanceMode: Boolean(conf.maintenanceMode),
          maintenanceTitle: conf.maintenanceTitle || 'Estamos preparando novedades',
          maintenanceMessage: conf.maintenanceMessage || 'Volvemos en breves minutos.',
        });
      }
    } catch (err) {
      console.error('Error cargando panel admin:', err);
    } finally {
      setLoading(false);
    }
  }

  // Feedback helper
  const showToast = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  // --- GESTIÓN DE PEDIDOS ---
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus, token);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
      showToast('success', `Pedido #${orderId} actualizado a "${statusBadges[newStatus]?.label || newStatus}".`);
    } catch (err) {
      showToast('danger', 'Error al cambiar estado del pedido.');
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const matchSearch =
        !orderSearch ||
        ord.id.toString().includes(orderSearch.trim()) ||
        ord.nombre.toLowerCase().includes(orderSearch.toLowerCase()) ||
        ord.email.toLowerCase().includes(orderSearch.toLowerCase());
      const matchStatus = !orderStatusFilter || ord.status === orderStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  // --- GESTIÓN DE PRODUCTOS ---
  const handleOpenProductModal = (prod = null) => {
    if (prod) {
      setEditingProduct(prod);
      setProductForm({
        nombre: prod.nombre || prod.name || '',
        precio: prod.precio !== undefined ? prod.precio : prod.price,
        stock: prod.stock !== undefined ? prod.stock : 100,
        categoriaId: prod.categoria?.id || prod.category?.id || '',
        imageUrl: prod.imageUrl || '',
        descripcion: prod.descripcion || prod.description || '',
        sku: prod.sku || '',
        activo: prod.activo !== undefined ? prod.activo : true,
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        nombre: '',
        precio: '',
        stock: 100,
        categoriaId: categories[0]?.id || '',
        imageUrl: '',
        descripcion: '',
        sku: `COT-${Math.floor(1000 + Math.random() * 9000)}`,
        activo: true,
      });
    }
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSavingProduct(true);
    try {
      const payload = {
        ...productForm,
        precio: parseFloat(productForm.precio),
        stock: parseInt(productForm.stock, 10),
        categoriaId: productForm.categoriaId ? parseInt(productForm.categoriaId, 10) : null,
      };

      if (editingProduct) {
        const updated = await api.updateProduct(editingProduct.id, payload, token);
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updated : p)));
        showToast('success', `Artículo "${payload.nombre}" modificado con éxito.`);
      } else {
        const created = await api.createProduct(payload, token);
        setProducts((prev) => [created, ...prev]);
        showToast('success', `¡Artículo "${payload.nombre}" incorporado al catálogo!`);
      }
      setShowProductModal(false);
    } catch (err) {
      showToast('danger', err.message || 'Error al guardar producto.');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteProductTarget) return;
    try {
      await api.deleteProduct(deleteProductTarget.id, token);
      setProducts((prev) => prev.filter((p) => p.id !== deleteProductTarget.id));
      showToast('success', `Producto "${deleteProductTarget.nombre}" eliminado del catálogo.`);
      setDeleteProductTarget(null);
    } catch (err) {
      showToast('danger', 'Error al eliminar el producto.');
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const nameMatch =
        !productSearch ||
        (p.nombre || p.name || '').toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.sku || '').toLowerCase().includes(productSearch.toLowerCase());
      const catMatch =
        !productCatFilter ||
        p.categoria?.slug === productCatFilter ||
        p.category?.slug === productCatFilter;
      return nameMatch && catMatch;
    });
  }, [products, productSearch, productCatFilter]);

  // --- IMPORTADOR DE EXCEL / CSV ---
  const handleDownloadSampleTemplate = (format = 'xlsx') => {
    const sampleData = [
      {
        Nombre: 'Globo Metalizado Número 40cm Plateado',
        Precio: 3200,
        Stock: 150,
        Categoría: 'Globos & Arreglos',
        SKU: 'GLO-NUM-SILV',
        ImagenURL: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800',
        Descripción: 'Globo metalizado inflable con helio o aire común. Ideal cumpleaños.',
      },
      {
        Nombre: 'Set 20 Platos Polipapel Rosa Pastel y Borde Dorado',
        Precio: 4500,
        Stock: 80,
        Categoría: 'Vajilla & Deco',
        SKU: 'VAJ-PLA-ROSA',
        ImagenURL: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',
        Descripción: 'Platos descartables ecológicos de polipapel resistente. 23cm de diámetro.',
      },
      {
        Nombre: 'Pack 4 Bengalas de Humo Colores Varios',
        Precio: 7800,
        Stock: 45,
        Categoría: 'Velas & Bengalas',
        SKU: 'BEN-HUM-MIX',
        ImagenURL: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
        Descripción: 'Bengalas de humo ideales para sesiones de fotos, egresados y revelación de género.',
      },
      {
        Nombre: 'Guirnalda Feliz Cumpleaños Glitter Dorado',
        Precio: 3900,
        Stock: 120,
        Categoría: 'Guirnaldas & Fondos',
        SKU: 'GUI-FC-GOLD',
        ImagenURL: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800',
        Descripción: 'Guirnalda decorativa de 2 metros con letras en cartulina glitter premium.',
      },
      {
        Nombre: 'Combo 50 Artículos Carnaval Carioca Flúo',
        Precio: 24500,
        Stock: 30,
        Categoría: 'Carnaval Carioca & Props',
        SKU: 'CAR-CAR-50F',
        ImagenURL: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
        Descripción: 'Incluye vinchas LED, collares hawaianos, antifaces y silbatos luminosos.',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Productos Cotillon');

    if (format === 'xlsx') {
      XLSX.writeFile(wb, 'plantilla_productos_cotillon.xlsx');
    } else {
      XLSX.writeFile(wb, 'plantilla_productos_cotillon.csv', { bookType: 'csv' });
    }
    showToast('info', `Plantilla modelo de ejemplo descargada en formato .${format}.`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportFileName(file.name);
    setImportStats(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = wb.SheetNames[0];
        const ws = wb.Sheets[firstSheetName];
        const data = XLSX.utils.sheet_to_json(ws);

        // Validar y normalizar filas
        const normalized = data.map((row, idx) => {
          const nombre = (row.Nombre || row.nombre || row.name || row.articulo || '').toString().trim();
          const rawPrice = row.Precio !== undefined ? row.Precio : (row.precio !== undefined ? row.precio : row.price);
          const precio = parseFloat(rawPrice);
          const rawStock = row.Stock !== undefined ? row.Stock : (row.stock !== undefined ? row.stock : 100);
          const stock = parseInt(rawStock, 10);
          const categoria = (row.Categoría || row.categoria || row.category || row.Rubro || '').toString().trim();
          const sku = (row.SKU || row.sku || row.codigo || '').toString().trim();
          const imageUrl = (row.ImagenURL || row.imageUrl || row.image_url || row.imagen || '').toString().trim();
          const descripcion = (row.Descripción || row.descripcion || row.description || '').toString().trim();

          const isValid = Boolean(nombre && !isNaN(precio) && precio >= 0);
          return {
            _index: idx + 1,
            nombre,
            precio: isNaN(precio) ? 0 : precio,
            stock: isNaN(stock) ? 100 : stock,
            categoria,
            sku,
            imageUrl,
            descripcion,
            isValid,
            error: !nombre ? 'Falta el nombre' : isNaN(precio) ? 'Precio no numérico' : null,
          };
        });

        setParsedRows(normalized);
      } catch (err) {
        showToast('danger', 'Error al leer el archivo. Asegúrate de que sea un XLSX o CSV válido.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleExecuteImport = async () => {
    const validItems = parsedRows.filter((r) => r.isValid);
    if (validItems.length === 0) {
      showToast('warning', 'No hay artículos válidos para importar en la lista.');
      return;
    }

    setImporting(true);
    try {
      const res = await api.bulkCreateProducts(validItems, token);
      setImportStats(res);
      showToast('success', `¡Éxito! Se importaron ${res.count || validItems.length} artículos al catálogo.`);
      setParsedRows([]);
      setImportFileName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadAllData();
    } catch (err) {
      showToast('danger', err.message || 'Error al importar productos.');
    } finally {
      setImporting(false);
    }
  };

  // --- GUARDADO DE PASARELAS DE PAGO ---
  const handleSavePayments = async (e) => {
    e.preventDefault();
    setSavingPayments(true);
    try {
      await api.updateStoreConfig(paymentConfig, token);
      showToast('success', '¡Configuración de pasarelas de pago y cuotas actualizada con éxito!');
    } catch (err) {
      showToast('danger', 'Error al guardar configuración de pagos.');
    } finally {
      setSavingPayments(false);
    }
  };

  // --- GUARDADO DE POLÍTICAS ---
  const handleSavePolicy = async (e) => {
    e.preventDefault();
    setSavingPolicy(true);
    try {
      await api.updateStoreConfig(
        {
          minOrderAmount: parseFloat(storePolicy.minOrderAmount),
          maintenanceMode: storePolicy.maintenanceMode,
          maintenanceTitle: storePolicy.maintenanceTitle,
          maintenanceMessage: storePolicy.maintenanceMessage,
        },
        token
      );
      showToast('success', 'Políticas comerciales de la tienda actualizadas.');
    } catch (err) {
      showToast('danger', 'Error al actualizar políticas.');
    } finally {
      setSavingPolicy(false);
    }
  };

  if (!isStaff) {
    return (
      <Container className="py-5 text-center my-auto">
        <div
          className="p-5 rounded-4 mx-auto"
          style={{
            maxWidth: '520px',
            backgroundColor: '#ffffff',
            border: '1.5px solid #e2e8f0',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div
            className="p-3 rounded-circle d-inline-flex mb-3"
            style={{ backgroundColor: '#ffe4e6', color: '#e11d48' }}
          >
            <FaShieldAlt size={42} />
          </div>
          <h4 className="fw-bold mb-2" style={{ color: '#0f172a' }}>Acceso Administrativo</h4>
          <p className="small mb-4" style={{ color: '#64748b' }}>
            Este panel de gestión comercial requiere permisos de staff.
          </p>
          <div className="p-3 rounded-3 mb-4 text-start small" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div className="fw-bold mb-1" style={{ color: '#0f172a' }}>Credenciales de Administrador:</div>
            <div style={{ color: '#334155' }}><strong>Usuario / Email:</strong> admin@cotillon.com</div>
            <div style={{ color: '#334155' }}><strong>Contraseña:</strong> admin123</div>
          </div>
          <Button as={Link} to="/login" className="btn-festive px-4 py-2">
            Iniciar Sesión como Administrador
          </Button>
        </div>
      </Container>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-5 my-5">
        <Spinner animation="border" variant="danger" />
        <p className="small mt-2" style={{ color: '#64748b' }}>Cargando panel de control...</p>
      </div>
    );
  }

  return (
    <div className="py-5" style={{ minHeight: '85vh' }}>
      <Container>
        {/* Cabecera Principal */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom gap-3" style={{ borderColor: '#e2e8f0' }}>
          <div>
            <span className="festive-pill mb-2">
              <FaShieldAlt size={13} /> Panel de Control Comercial
            </span>
            <h1 className="h2 fw-bold mt-1 mb-0" style={{ color: '#0f172a' }}>
              Administración de la Tienda
            </h1>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="small" style={{ color: '#64748b' }}>Operador:</span>
            <span
              className="py-1 px-3 rounded-pill fw-bold small"
              style={{ backgroundColor: '#e0e7ff', color: '#4338ca', border: '1px solid #c7d2fe' }}
            >
              {user?.username} (Staff)
            </span>
          </div>
        </div>

        {msg && <Alert variant={msg.type} className="py-2 small mb-4">{msg.text}</Alert>}

        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
          {/* Navegación por Pestañas */}
          <Nav variant="pills" className="gap-2 mb-4 flex-wrap">
            <Nav.Item>
              <Nav.Link
                eventKey="resumen"
                className={activeTab === 'resumen' ? 'btn-festive' : 'btn-festive-secondary'}
                style={{ cursor: 'pointer' }}
              >
                <FaChartBar className="me-2" /> Resumen & Métricas
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="pedidos"
                className={activeTab === 'pedidos' ? 'btn-festive' : 'btn-festive-secondary'}
                style={{ cursor: 'pointer' }}
              >
                <FaClipboardList className="me-2" /> Pedidos ({orders.length})
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="catalogo"
                className={activeTab === 'catalogo' ? 'btn-festive' : 'btn-festive-secondary'}
                style={{ cursor: 'pointer' }}
              >
                <FaBoxes className="me-2" /> Catálogo & Stock ({products.length})
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="importador"
                className={activeTab === 'importador' ? 'btn-festive' : 'btn-festive-secondary'}
                style={{ cursor: 'pointer' }}
              >
                <FaFileExcel className="me-2 text-success" /> Importar XLSX / CSV
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="pagos"
                className={activeTab === 'pagos' ? 'btn-festive' : 'btn-festive-secondary'}
                style={{ cursor: 'pointer' }}
              >
                <FaCreditCard className="me-2 text-info" /> Pasarelas & Tarjetas (MP)
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="politicas"
                className={activeTab === 'politicas' ? 'btn-festive' : 'btn-festive-secondary'}
                style={{ cursor: 'pointer' }}
              >
                <FaCog className="me-2" /> Políticas & Monto Mínimo
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            {/* =======================================================
                PESTAÑA 1: RESUMEN Y MÉTRICAS
                ======================================================= */}
            <Tab.Pane eventKey="resumen">
              <Row className="g-4 mb-4">
                <Col lg={3} sm={6}>
                  <div className="admin-stat-card d-flex align-items-center gap-3">
                    <div
                      className="p-3 rounded-circle d-flex align-items-center justify-content-center"
                      style={{ backgroundColor: '#d1fae5', color: '#059669', width: 56, height: 56 }}
                    >
                      <FaMoneyBillWave size={24} />
                    </div>
                    <div>
                      <span className="small text-uppercase fw-bold" style={{ color: '#64748b', fontSize: '0.75rem' }}>
                        Facturación Total
                      </span>
                      <h3 className="fw-bold mt-1 mb-0" style={{ color: '#0f172a' }}>
                        {formatMoney(overview?.totalRevenue || 0)}
                      </h3>
                    </div>
                  </div>
                </Col>

                <Col lg={3} sm={6}>
                  <div className="admin-stat-card d-flex align-items-center gap-3">
                    <div
                      className="p-3 rounded-circle d-flex align-items-center justify-content-center"
                      style={{ backgroundColor: '#ffe4e6', color: '#e11d48', width: 56, height: 56 }}
                    >
                      <FaShoppingBag size={24} />
                    </div>
                    <div>
                      <span className="small text-uppercase fw-bold" style={{ color: '#64748b', fontSize: '0.75rem' }}>
                        Órdenes Registradas
                      </span>
                      <h3 className="fw-bold mt-1 mb-0" style={{ color: '#0f172a' }}>
                        {overview?.totalOrders || orders.length}
                      </h3>
                    </div>
                  </div>
                </Col>

                <Col lg={3} sm={6}>
                  <div className="admin-stat-card d-flex align-items-center gap-3">
                    <div
                      className="p-3 rounded-circle d-flex align-items-center justify-content-center"
                      style={{ backgroundColor: '#e0e7ff', color: '#4f46e5', width: 56, height: 56 }}
                    >
                      <FaBoxOpen size={24} />
                    </div>
                    <div>
                      <span className="small text-uppercase fw-bold" style={{ color: '#64748b', fontSize: '0.75rem' }}>
                        Artículos en Catálogo
                      </span>
                      <h3 className="fw-bold mt-1 mb-0" style={{ color: '#0f172a' }}>
                        {overview?.totalProducts || products.length}
                      </h3>
                    </div>
                  </div>
                </Col>

                <Col lg={3} sm={6}>
                  <div className="admin-stat-card d-flex align-items-center gap-3">
                    <div
                      className="p-3 rounded-circle d-flex align-items-center justify-content-center"
                      style={{ backgroundColor: '#fef3c7', color: '#d97706', width: 56, height: 56 }}
                    >
                      <FaUsers size={24} />
                    </div>
                    <div>
                      <span className="small text-uppercase fw-bold" style={{ color: '#64748b', fontSize: '0.75rem' }}>
                        Clientes Registrados
                      </span>
                      <h3 className="fw-bold mt-1 mb-0" style={{ color: '#0f172a' }}>
                        {overview?.totalUsers || 2}
                      </h3>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Estado de Pedidos & Alertas */}
              <Row className="g-4 mb-4">
                <Col lg={7}>
                  <div className="admin-stat-card h-100">
                    <h6 className="fw-bold mb-3" style={{ color: '#0f172a' }}>Distribución de Pedidos por Estado</h6>
                    <div className="d-flex flex-column gap-3">
                      {Object.keys(statusBadges).map((stKey) => {
                        const count = orders.filter((o) => o.status === stKey).length;
                        const pct = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;
                        const info = statusBadges[stKey];
                        return (
                          <div key={stKey}>
                            <div className="d-flex justify-content-between small fw-bold mb-1">
                              <span style={{ color: '#334155' }}>{info.label} ({count})</span>
                              <span style={{ color: '#64748b' }}>{pct}%</span>
                            </div>
                            <ProgressBar now={pct} variant={info.bg} style={{ height: '8px' }} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Col>

                <Col lg={5}>
                  <div className="admin-stat-card h-100">
                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#0f172a' }}>
                      <FaExclamationTriangle className="text-warning" /> Alertas Operativas de Inventario
                    </h6>
                    <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: '240px' }}>
                      {products.filter((p) => (p.stock || 0) < 15).length === 0 ? (
                        <p className="small text-muted mb-0">Todos los productos tienen niveles adecuados de stock (&gt; 15 u.).</p>
                      ) : (
                        products
                          .filter((p) => (p.stock || 0) < 15)
                          .map((p) => (
                            <div
                              key={p.id}
                              className="p-2 px-3 rounded-3 d-flex justify-content-between align-items-center small"
                              style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3' }}
                            >
                              <div className="min-w-0 me-2">
                                <div className="fw-bold text-truncate" style={{ color: '#9f1239' }}>{p.nombre}</div>
                                <div style={{ color: '#64748b', fontSize: '0.78rem' }}>SKU: {p.sku || 'S/N'}</div>
                              </div>
                              <Badge bg="danger" pill>Stock: {p.stock}</Badge>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </Col>
              </Row>
            </Tab.Pane>

            {/* =======================================================
                PESTAÑA 2: GESTIÓN DE PEDIDOS
                ======================================================= */}
            <Tab.Pane eventKey="pedidos">
              <div
                className="p-4 rounded-4"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                  <div>
                    <h5 className="fw-bold mb-1" style={{ color: '#0f172a' }}>Control de Órdenes & Despachos</h5>
                    <p className="small mb-0" style={{ color: '#64748b' }}>
                      Gestiona cobros, revisa comprobantes y cambia el estado de cada orden.
                    </p>
                  </div>
                  <Badge bg="light" text="dark" className="border px-3 py-2 fw-bold">
                    {filteredOrders.length} pedidos encontrados
                  </Badge>
                </div>

                {/* Filtros de Pedidos */}
                <Row className="g-3 mb-4">
                  <Col md={6}>
                    <InputGroup>
                      <InputGroup.Text style={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1' }}>
                        <FaSearch size={14} className="text-muted" />
                      </InputGroup.Text>
                      <Form.Control
                        className="form-control-custom"
                        placeholder="Buscar por ID (#), nombre de cliente o email..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                      />
                    </InputGroup>
                  </Col>
                  <Col md={6}>
                    <div className="d-flex flex-wrap gap-1">
                      <Button
                        size="sm"
                        className={!orderStatusFilter ? 'btn-festive' : 'btn-festive-secondary'}
                        onClick={() => setOrderStatusFilter('')}
                      >
                        Todos
                      </Button>
                      {Object.keys(statusBadges).map((k) => (
                        <Button
                          key={k}
                          size="sm"
                          className={orderStatusFilter === k ? 'btn-festive' : 'btn-festive-secondary'}
                          onClick={() => setOrderStatusFilter(k)}
                        >
                          {statusBadges[k].label}
                        </Button>
                      ))}
                    </div>
                  </Col>
                </Row>

                {filteredOrders.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted small mb-0">No se encontraron pedidos con los filtros aplicados.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table hover className="align-middle mb-0 admin-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Fecha</th>
                          <th>Cliente & Contacto</th>
                          <th>Pago</th>
                          <th>Total</th>
                          <th>Estado</th>
                          <th>Cambiar Estado</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((ord) => {
                          const badgeInfo = statusBadges[ord.status] || { bg: 'secondary', text: 'white', label: ord.status };
                          const dateStr = ord.creado_en
                            ? new Date(ord.creado_en).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                            : 'Reciente';

                          return (
                            <tr key={ord.id}>
                              <td className="fw-bold" style={{ color: '#0f172a' }}>#{ord.id}</td>
                              <td className="small text-muted">{dateStr}</td>
                              <td>
                                <div className="fw-bold small" style={{ color: '#0f172a' }}>{ord.nombre}</div>
                                <div className="small text-muted">{ord.email}</div>
                              </td>
                              <td>
                                {ord.metodo_pago === 'mercadopago' ? (
                                  <span className="badge badge-payment-mp px-2 py-1">Mercado Pago</span>
                                ) : ord.metodo_pago === 'efectivo' ? (
                                  <span className="badge badge-payment-cash px-2 py-1">Efectivo / Retiro</span>
                                ) : (
                                  <span className="badge badge-payment-transfer px-2 py-1">Transferencia</span>
                                )}
                              </td>
                              <td className="fw-bold" style={{ color: '#e11d48' }}>{formatMoney(ord.total)}</td>
                              <td>
                                <Badge bg={badgeInfo.bg} text={badgeInfo.text} className="px-3 py-1">
                                  {badgeInfo.label}
                                </Badge>
                              </td>
                              <td>
                                <Form.Select
                                  size="sm"
                                  className="form-select-custom py-1 px-2"
                                  style={{ width: '140px', fontSize: '0.85rem' }}
                                  value={ord.status}
                                  onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                                >
                                  <option value="created">A procesar</option>
                                  <option value="review">En revisión</option>
                                  <option value="shipped">En camino</option>
                                  <option value="paid">Pagado</option>
                                  <option value="delivered">Entregado</option>
                                  <option value="cancelled">Cancelado</option>
                                </Form.Select>
                              </td>
                              <td>
                                <Button
                                  size="sm"
                                  variant="light"
                                  className="btn-festive-outline py-1 px-2 small d-inline-flex align-items-center gap-1"
                                  onClick={() => setSelectedOrder(ord)}
                                >
                                  <FaEye size={12} /> Detalle
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                )}
              </div>
            </Tab.Pane>

            {/* =======================================================
                PESTAÑA 3: CATÁLOGO & INVENTARIO
                ======================================================= */}
            <Tab.Pane eventKey="catalogo">
              <div
                className="p-4 rounded-4"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                  <div>
                    <h5 className="fw-bold mb-1" style={{ color: '#0f172a' }}>Control de Productos & Stock</h5>
                    <p className="small mb-0" style={{ color: '#64748b' }}>
                      Modifica precios, stock y datos de cada producto o publica nuevos artículos.
                    </p>
                  </div>
                  <Button
                    className="btn-festive d-inline-flex align-items-center gap-2"
                    onClick={() => handleOpenProductModal(null)}
                  >
                    <FaPlus size={13} /> Agregar Producto
                  </Button>
                </div>

                {/* Filtros de Catálogo */}
                <Row className="g-3 mb-4">
                  <Col md={6}>
                    <InputGroup>
                      <InputGroup.Text style={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1' }}>
                        <FaSearch size={14} className="text-muted" />
                      </InputGroup.Text>
                      <Form.Control
                        className="form-control-custom"
                        placeholder="Buscar artículo por nombre o SKU..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                      />
                    </InputGroup>
                  </Col>
                  <Col md={4}>
                    <Form.Select
                      className="form-select-custom"
                      value={productCatFilter}
                      onChange={(e) => setProductCatFilter(e.target.value)}
                    >
                      <option value="">Todas las categorías...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.slug}>{c.nombre}</option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={2} className="text-end">
                    <span className="badge bg-light text-dark border p-2 w-100 fw-bold">
                      {filteredProducts.length} productos
                    </span>
                  </Col>
                </Row>

                <div className="table-responsive">
                  <Table hover className="align-middle mb-0 admin-table">
                    <thead>
                      <tr>
                        <th>Artículo</th>
                        <th>Categoría</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Estado</th>
                        <th className="text-end">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((p) => {
                        const stockVal = p.stock || 0;
                        const stockBadge =
                          stockVal > 20 ? (
                            <Badge bg="success">En stock ({stockVal})</Badge>
                          ) : stockVal > 0 ? (
                            <Badge bg="warning" text="dark">Bajo stock ({stockVal})</Badge>
                          ) : (
                            <Badge bg="danger">Sin stock (0)</Badge>
                          );

                        return (
                          <tr key={p.id}>
                            <td>
                              <div className="d-flex align-items-center gap-3">
                                <img
                                  src={p.imageUrl || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=200'}
                                  alt={p.nombre}
                                  style={{ width: 44, height: 44, borderRadius: '8px', objectFit: 'cover' }}
                                />
                                <div>
                                  <div className="fw-bold small" style={{ color: '#0f172a' }}>{p.nombre}</div>
                                  <div className="text-muted" style={{ fontSize: '0.78rem' }}>SKU: {p.sku || 'S/N'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="small" style={{ color: '#475569' }}>
                              {p.categoria?.nombre || p.category?.name || 'General'}
                            </td>
                            <td className="fw-bold" style={{ color: '#0f172a' }}>
                              {formatMoney(p.precio !== undefined ? p.precio : p.price)}
                            </td>
                            <td>{stockBadge}</td>
                            <td>
                              {p.activo !== false ? (
                                <Badge bg="success" className="px-2 py-1">Activo</Badge>
                              ) : (
                                <Badge bg="secondary" className="px-2 py-1">Inactivo</Badge>
                              )}
                            </td>
                            <td className="text-end">
                              <div className="d-inline-flex gap-2">
                                <Button
                                  size="sm"
                                  variant="light"
                                  className="btn-festive-outline p-1 px-2"
                                  onClick={() => handleOpenProductModal(p)}
                                  title="Editar producto"
                                >
                                  <FaEdit size={13} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="light"
                                  className="p-1 px-2 text-danger border"
                                  onClick={() => setDeleteProductTarget(p)}
                                  title="Eliminar producto"
                                >
                                  <FaTrash size={13} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              </div>
            </Tab.Pane>

            {/* =======================================================
                PESTAÑA 4: IMPORTADOR MASIVO (XLSX / CSV)
                ======================================================= */}
            <Tab.Pane eventKey="importador">
              <div
                className="p-4 p-md-5 rounded-4"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                  <div>
                    <h5 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: '#0f172a' }}>
                      <FaFileExcel className="text-success" /> Importador Masivo de Catálogo (Excel / CSV)
                    </h5>
                    <p className="small mb-0" style={{ color: '#64748b' }}>
                      Carga cientos de artículos de cotillón de una sola vez desde una planilla Excel (.xlsx) o archivo separado por comas (.csv).
                    </p>
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      variant="light"
                      className="btn-festive-outline py-2 px-3 small d-inline-flex align-items-center gap-2"
                      onClick={() => handleDownloadSampleTemplate('xlsx')}
                    >
                      <FaDownload size={12} /> Plantilla (.xlsx)
                    </Button>
                    <Button
                      variant="light"
                      className="btn-festive-outline py-2 px-3 small d-inline-flex align-items-center gap-2"
                      onClick={() => handleDownloadSampleTemplate('csv')}
                    >
                      <FaFileCsv size={12} /> Plantilla (.csv)
                    </Button>
                  </div>
                </div>

                {/* Zona de Dropzone */}
                <div
                  className="import-dropzone mb-4"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".xlsx, .xls, .csv"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                  <FaUpload size={40} className="text-danger mb-3" />
                  <h6 className="fw-bold mb-1" style={{ color: '#0f172a' }}>
                    {importFileName ? `Archivo seleccionado: ${importFileName}` : 'Arrastra o haz clic para subir tu planilla Excel o CSV'}
                  </h6>
                  <p className="small text-muted mb-0">
                    Formatos admitidos: <strong>.xlsx, .xls, .csv</strong> con columnas <em>Nombre, Precio, Stock, Categoría, SKU, ImagenURL, Descripción</em>.
                  </p>
                </div>

                {/* Previsualización de Filas Parseadas */}
                {parsedRows.length > 0 && (
                  <div className="mt-4 pt-3 border-top">
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                      <div>
                        <h6 className="fw-bold mb-0" style={{ color: '#0f172a' }}>
                          Vista Previa de Artículos ({parsedRows.length} detectados)
                        </h6>
                        <small className="text-muted">
                          {parsedRows.filter((r) => r.isValid).length} listos para importar •{' '}
                          {parsedRows.filter((r) => !r.isValid).length} con advertencias
                        </small>
                      </div>

                      <Button
                        className="btn-festive py-2 px-4 fw-bold d-inline-flex align-items-center gap-2"
                        disabled={importing || parsedRows.filter((r) => r.isValid).length === 0}
                        onClick={handleExecuteImport}
                      >
                        {importing ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          <>
                            <FaCheck /> Confirmar e Importar {parsedRows.filter((r) => r.isValid).length} Productos
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="table-responsive" style={{ maxHeight: '340px' }}>
                      <Table hover className="align-middle mb-0 admin-table" style={{ fontSize: '0.88rem' }}>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Estado</th>
                            <th>Nombre</th>
                            <th>Precio ($)</th>
                            <th>Stock</th>
                            <th>Categoría</th>
                            <th>SKU</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsedRows.map((r, i) => (
                            <tr key={i} style={{ backgroundColor: r.isValid ? 'transparent' : '#fff1f2' }}>
                              <td>{r._index}</td>
                              <td>
                                {r.isValid ? (
                                  <Badge bg="success" pill className="d-inline-flex align-items-center gap-1">
                                    <FaCheck size={9} /> Válido
                                  </Badge>
                                ) : (
                                  <Badge bg="danger" pill title={r.error} className="d-inline-flex align-items-center gap-1">
                                    <FaExclamationTriangle size={9} /> {r.error}
                                  </Badge>
                                )}
                              </td>
                              <td className="fw-bold" style={{ color: '#0f172a' }}>{r.nombre || '—'}</td>
                              <td className="fw-bold text-danger">{formatMoney(r.precio)}</td>
                              <td>{r.stock}</td>
                              <td>{r.categoria || 'General'}</td>
                              <td className="text-muted">{r.sku || 'Auto'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            </Tab.Pane>

            {/* =======================================================
                PESTAÑA 5: PASARELAS DE PAGO (MERCADO PAGO & TARJETAS)
                ======================================================= */}
            <Tab.Pane eventKey="pagos">
              <Form onSubmit={handleSavePayments}>
                <Row className="g-4 mb-4">
                  {/* Mercado Pago */}
                  <Col lg={6}>
                    <div
                      className="p-4 rounded-4 h-100"
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1.5px solid #e2e8f0',
                        boxShadow: 'var(--shadow-card)',
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="p-2 rounded-circle"
                            style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}
                          >
                            <FaCreditCard size={20} />
                          </div>
                          <div>
                            <h5 className="fw-bold mb-0" style={{ color: '#0f172a' }}>Mercado Pago</h5>
                            <small className="text-muted">Tarjetas de Crédito, Débito y Dinero en Cuenta</small>
                          </div>
                        </div>

                        <Form.Check
                          type="switch"
                          id="mp-switch"
                          label={paymentConfig.mpEnabled ? 'Activo' : 'Inactivo'}
                          className="fw-bold"
                          checked={paymentConfig.mpEnabled}
                          onChange={(e) => setPaymentConfig({ ...paymentConfig, mpEnabled: e.target.checked })}
                        />
                      </div>

                      <div className="mb-3">
                        <Form.Label className="small fw-bold" style={{ color: '#334155' }}>
                          Public Key (Clave Pública)
                        </Form.Label>
                        <Form.Control
                          className="form-control-custom"
                          placeholder="APP_USR-xxxx-xxxx-xxxx..."
                          value={paymentConfig.mpPublicKey}
                          onChange={(e) => setPaymentConfig({ ...paymentConfig, mpPublicKey: e.target.value })}
                        />
                      </div>

                      <div className="mb-3">
                        <Form.Label className="small fw-bold" style={{ color: '#334155' }}>
                          Access Token (Clave Privada)
                        </Form.Label>
                        <Form.Control
                          type="password"
                          className="form-control-custom"
                          placeholder="APP_USR-xxxx-xxxx-xxxx..."
                          value={paymentConfig.mpAccessToken}
                          onChange={(e) => setPaymentConfig({ ...paymentConfig, mpAccessToken: e.target.value })}
                        />
                      </div>

                      <Row className="g-3 mb-3">
                        <Col sm={6}>
                          <Form.Label className="small fw-bold" style={{ color: '#334155' }}>Entorno</Form.Label>
                          <Form.Select
                            className="form-select-custom"
                            value={paymentConfig.mpSandbox ? 'sandbox' : 'prod'}
                            onChange={(e) => setPaymentConfig({ ...paymentConfig, mpSandbox: e.target.value === 'sandbox' })}
                          >
                            <option value="sandbox">Sandbox (Modo Pruebas)</option>
                            <option value="prod">Producción (Real)</option>
                          </Form.Select>
                        </Col>
                        <Col sm={6}>
                          <Form.Label className="small fw-bold" style={{ color: '#334155' }}>Cuotas Máximas</Form.Label>
                          <Form.Select
                            className="form-select-custom"
                            value={paymentConfig.mpInstallments}
                            onChange={(e) => setPaymentConfig({ ...paymentConfig, mpInstallments: parseInt(e.target.value, 10) })}
                          >
                            <option value={1}>1 Cuota</option>
                            <option value={3}>Hasta 3 Cuotas</option>
                            <option value={6}>Hasta 6 Cuotas</option>
                            <option value={12}>Hasta 12 Cuotas</option>
                          </Form.Select>
                        </Col>
                      </Row>

                      <div className="p-3 rounded-3 d-flex align-items-center" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.82rem', color: '#64748b' }}>
                        <FaInfoCircle className="text-info me-2 flex-shrink-0" size={15} />
                        <span>En modo Sandbox puedes probar compras con tarjetas de prueba sin generar cargos reales en Mercado Pago.</span>
                      </div>
                    </div>
                  </Col>

                  {/* Transferencia Bancaria Directa */}
                  <Col lg={6}>
                    <div
                      className="p-4 rounded-4 h-100"
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1.5px solid #e2e8f0',
                        boxShadow: 'var(--shadow-card)',
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="p-2 rounded-circle"
                            style={{ backgroundColor: '#d1fae5', color: '#059669' }}
                          >
                            <FaMoneyBillWave size={20} />
                          </div>
                          <div>
                            <h5 className="fw-bold mb-0" style={{ color: '#0f172a' }}>Transferencia Bancaria</h5>
                            <small className="text-muted">CBU / Alias directo con descuento</small>
                          </div>
                        </div>

                        <Form.Check
                          type="switch"
                          id="transfer-switch"
                          label={paymentConfig.transferEnabled ? 'Activo' : 'Inactivo'}
                          className="fw-bold"
                          checked={paymentConfig.transferEnabled}
                          onChange={(e) => setPaymentConfig({ ...paymentConfig, transferEnabled: e.target.checked })}
                        />
                      </div>

                      <Row className="g-3 mb-3">
                        <Col sm={6}>
                          <Form.Label className="small fw-bold" style={{ color: '#334155' }}>
                            Descuento por Transferencia (%)
                          </Form.Label>
                          <Form.Control
                            type="number"
                            step="0.5"
                            className="form-control-custom"
                            value={paymentConfig.transferDiscount}
                            onChange={(e) => setPaymentConfig({ ...paymentConfig, transferDiscount: parseFloat(e.target.value) || 0 })}
                          />
                        </Col>
                        <Col sm={6}>
                          <Form.Label className="small fw-bold" style={{ color: '#334155' }}>Banco</Form.Label>
                          <Form.Control
                            className="form-control-custom"
                            value={paymentConfig.transferBank}
                            onChange={(e) => setPaymentConfig({ ...paymentConfig, transferBank: e.target.value })}
                          />
                        </Col>
                      </Row>

                      <div className="mb-3">
                        <Form.Label className="small fw-bold" style={{ color: '#334155' }}>Titular de la Cuenta</Form.Label>
                        <Form.Control
                          className="form-control-custom"
                          value={paymentConfig.transferHolder}
                          onChange={(e) => setPaymentConfig({ ...paymentConfig, transferHolder: e.target.value })}
                        />
                      </div>

                      <Row className="g-3 mb-3">
                        <Col sm={7}>
                          <Form.Label className="small fw-bold" style={{ color: '#334155' }}>CBU (22 dígitos)</Form.Label>
                          <Form.Control
                            className="form-control-custom"
                            value={paymentConfig.transferCbu}
                            onChange={(e) => setPaymentConfig({ ...paymentConfig, transferCbu: e.target.value })}
                          />
                        </Col>
                        <Col sm={5}>
                          <Form.Label className="small fw-bold" style={{ color: '#334155' }}>Alias</Form.Label>
                          <Form.Control
                            className="form-control-custom"
                            value={paymentConfig.transferAlias}
                            onChange={(e) => setPaymentConfig({ ...paymentConfig, transferAlias: e.target.value })}
                          />
                        </Col>
                      </Row>

                      <div className="mb-0">
                        <Form.Label className="small fw-bold" style={{ color: '#334155' }}>CUIT / CUIL</Form.Label>
                        <Form.Control
                          className="form-control-custom"
                          value={paymentConfig.transferCuit}
                          onChange={(e) => setPaymentConfig({ ...paymentConfig, transferCuit: e.target.value })}
                        />
                      </div>
                    </div>
                  </Col>

                  {/* Efectivo / Retiro en Depósito */}
                  <Col lg={12}>
                    <div
                      className="p-4 rounded-4"
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1.5px solid #e2e8f0',
                        boxShadow: 'var(--shadow-card)',
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="p-2 rounded-circle"
                            style={{ backgroundColor: '#fef3c7', color: '#d97706' }}
                          >
                            <FaStore size={20} />
                          </div>
                          <div>
                            <h5 className="fw-bold mb-0" style={{ color: '#0f172a' }}>Efectivo al Retirar en Depósito</h5>
                            <small className="text-muted">Cobro presencial en el local central</small>
                          </div>
                        </div>

                        <Form.Check
                          type="switch"
                          id="cash-switch"
                          label={paymentConfig.cashEnabled ? 'Activo' : 'Inactivo'}
                          className="fw-bold"
                          checked={paymentConfig.cashEnabled}
                          onChange={(e) => setPaymentConfig({ ...paymentConfig, cashEnabled: e.target.checked })}
                        />
                      </div>

                      <Form.Label className="small fw-bold" style={{ color: '#334155' }}>Instrucciones para el Cliente</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        className="form-control-custom"
                        value={paymentConfig.cashInstructions}
                        onChange={(e) => setPaymentConfig({ ...paymentConfig, cashInstructions: e.target.value })}
                      />
                    </div>
                  </Col>
                </Row>

                <div className="text-end">
                  <Button type="submit" className="btn-festive px-4 py-2 fw-bold fs-6" disabled={savingPayments}>
                    {savingPayments ? <Spinner animation="border" size="sm" /> : 'Guardar Configuración de Pasarelas'}
                  </Button>
                </div>
              </Form>
            </Tab.Pane>

            {/* =======================================================
                PESTAÑA 6: POLÍTICAS & MONTO MÍNIMO
                ======================================================= */}
            <Tab.Pane eventKey="politicas">
              <div
                className="p-4 p-md-5 rounded-4 mx-auto"
                style={{
                  maxWidth: '640px',
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div
                    className="p-2 rounded-circle"
                    style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}
                  >
                    <FaCog size={18} />
                  </div>
                  <h5 className="fw-bold mb-0" style={{ color: '#0f172a' }}>
                    Políticas Comerciales de la Tienda
                  </h5>
                </div>
                <p className="small mb-4" style={{ color: '#64748b' }}>
                  Ajusta los requisitos de compra para adaptarse a ventas mayoristas o minoristas.
                </p>

                <Form onSubmit={handleSavePolicy}>
                  <div className="mb-4">
                    <Form.Label className="small fw-bold" style={{ color: '#334155' }}>
                      Monto Mínimo de Pedido ($ ARS)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      step="500"
                      className="form-control-custom"
                      required
                      value={storePolicy.minOrderAmount}
                      onChange={(e) => setStorePolicy({ ...storePolicy, minOrderAmount: e.target.value })}
                    />
                    <small className="d-block mt-2" style={{ color: '#64748b', fontSize: '0.85rem' }}>
                      Los clientes verán una alerta en tiempo real en el carrito y en el checkout si su subtotal es inferior a este monto.
                    </small>
                  </div>

                  <div className="p-3 rounded-3 mb-4" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <Form.Check
                      type="switch"
                      id="maint-switch"
                      label="Modo Mantenimiento (Cierra temporalmente la tienda al público)"
                      className="fw-bold mb-2"
                      checked={storePolicy.maintenanceMode}
                      onChange={(e) => setStorePolicy({ ...storePolicy, maintenanceMode: e.target.checked })}
                    />
                    {storePolicy.maintenanceMode && (
                      <div className="mt-3">
                        <Form.Label className="small fw-bold" style={{ color: '#334155' }}>Título del Aviso</Form.Label>
                        <Form.Control
                          className="form-control-custom mb-2"
                          value={storePolicy.maintenanceTitle}
                          onChange={(e) => setStorePolicy({ ...storePolicy, maintenanceTitle: e.target.value })}
                        />
                        <Form.Label className="small fw-bold" style={{ color: '#334155' }}>Mensaje</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          className="form-control-custom"
                          value={storePolicy.maintenanceMessage}
                          onChange={(e) => setStorePolicy({ ...storePolicy, maintenanceMessage: e.target.value })}
                        />
                      </div>
                    )}
                  </div>

                  <Button type="submit" className="btn-festive px-4 py-2" disabled={savingPolicy}>
                    {savingPolicy ? <Spinner animation="border" size="sm" /> : 'Guardar Políticas'}
                  </Button>
                </Form>
              </div>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>

        {/* =======================================================
            MODAL DE DETALLE DE PEDIDO & WHATSAPP DIRECTO
            ======================================================= */}
        {selectedOrder && (
          <Modal show={Boolean(selectedOrder)} onHide={() => setSelectedOrder(null)} size="lg" centered>
            <Modal.Header closeButton style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <Modal.Title className="h5 fw-bold" style={{ color: '#0f172a' }}>
                Orden #{selectedOrder.id} • {selectedOrder.nombre}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4" style={{ backgroundColor: '#ffffff' }}>
              <Row className="g-3 mb-4">
                <Col sm={6}>
                  <div className="p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div className="fw-bold small mb-2" style={{ color: '#0f172a' }}>Datos del Destinatario:</div>
                    <div className="small"><strong>Email:</strong> {selectedOrder.email}</div>
                    <div className="small"><strong>Teléfono:</strong> {selectedOrder.telefono || 'Sin registrar'}</div>
                    <div className="small"><strong>DNI / CUIT:</strong> {selectedOrder.destinatario_documento || 'No especificado'}</div>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div className="fw-bold small mb-2" style={{ color: '#0f172a' }}>Dirección de Entrega:</div>
                    <div className="small"><strong>Calle:</strong> {selectedOrder.direccion}</div>
                    <div className="small"><strong>Ciudad:</strong> {selectedOrder.ciudad} {selectedOrder.estado ? `(${selectedOrder.estado})` : ''}</div>
                    <div className="small"><strong>Código Postal:</strong> {selectedOrder.cp || 'S/N'}</div>
                  </div>
                </Col>
              </Row>

              <h6 className="fw-bold mb-2" style={{ color: '#0f172a' }}>Artículos del Pedido:</h6>
              <div className="table-responsive mb-3">
                <Table className="align-middle mb-0 admin-table" style={{ fontSize: '0.88rem' }}>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio Unitario</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedOrder.items || []).map((it, idx) => (
                      <tr key={idx}>
                        <td className="fw-bold" style={{ color: '#0f172a' }}>{it.product_name}</td>
                        <td>{it.cantidad} u.</td>
                        <td>{formatMoney(it.precio_unitario)}</td>
                        <td className="fw-bold text-danger">{formatMoney(it.subtotal || it.precio_unitario * it.cantidad)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              <div className="d-flex justify-content-between align-items-center p-3 rounded-3 mb-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <span className="fw-bold" style={{ color: '#0f172a' }}>Total de la Orden:</span>
                <span className="h4 fw-bold mb-0" style={{ color: '#e11d48' }}>{formatMoney(selectedOrder.total)}</span>
              </div>

              {selectedOrder.nota && (
                <div className="p-3 rounded-3 mb-3" style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a', color: '#92400e', fontSize: '0.88rem' }}>
                  <strong>Nota del cliente:</strong> "{selectedOrder.nota}"
                </div>
              )}
            </Modal.Body>
            <Modal.Footer style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
              {selectedOrder.telefono && (
                <Button
                  variant="success"
                  className="d-inline-flex align-items-center gap-2 small"
                  href={`https://wa.me/${selectedOrder.telefono.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `¡Hola ${selectedOrder.nombre}! Te escribimos de CotiFiesta con respecto a tu pedido #${selectedOrder.id} por un total de ${formatMoney(selectedOrder.total)}. ¿Cómo estás?`
                  )}`}
                  target="_blank"
                >
                  <FaWhatsapp size={16} /> Contactar por WhatsApp
                </Button>
              )}
              <Button variant="light" className="btn-festive-outline small" onClick={() => setSelectedOrder(null)}>
                Cerrar
              </Button>
            </Modal.Footer>
          </Modal>
        )}

        {/* =======================================================
            MODAL DE AGREGAR / EDITAR PRODUCTO
            ======================================================= */}
        <Modal show={showProductModal} onHide={() => setShowProductModal(false)} size="lg" centered>
          <Modal.Header closeButton style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <Modal.Title className="h5 fw-bold" style={{ color: '#0f172a' }}>
              {editingProduct ? `Editar Artículo #${editingProduct.id}` : 'Nuevo Artículo para el Catálogo'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSaveProduct}>
            <Modal.Body className="p-4" style={{ backgroundColor: '#ffffff' }}>
              <div className="mb-3">
                <Form.Label className="small fw-bold" style={{ color: '#334155' }}>Nombre del Producto *</Form.Label>
                <Form.Control
                  className="form-control-custom"
                  required
                  value={productForm.nombre}
                  onChange={(e) => setProductForm({ ...productForm, nombre: e.target.value })}
                  placeholder="Ej: Set 50 Platos Polipapel Rosa Pastel y Dorado"
                />
              </div>

              <Row className="g-3 mb-3">
                <Col sm={4}>
                  <Form.Label className="small fw-bold" style={{ color: '#334155' }}>Precio Unitario ($) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    className="form-control-custom"
                    required
                    value={productForm.precio}
                    onChange={(e) => setProductForm({ ...productForm, precio: e.target.value })}
                    placeholder="8500"
                  />
                </Col>
                <Col sm={4}>
                  <Form.Label className="small fw-bold" style={{ color: '#334155' }}>Stock Disponible *</Form.Label>
                  <Form.Control
                    type="number"
                    className="form-control-custom"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                  />
                </Col>
                <Col sm={4}>
                  <Form.Label className="small fw-bold" style={{ color: '#334155' }}>Código SKU</Form.Label>
                  <Form.Control
                    className="form-control-custom"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    placeholder="COT-1234"
                  />
                </Col>
              </Row>

              <Row className="g-3 mb-3">
                <Col sm={6}>
                  <Form.Label className="small fw-bold" style={{ color: '#334155' }}>Categoría Festiva</Form.Label>
                  <Form.Select
                    className="form-select-custom"
                    value={productForm.categoriaId}
                    onChange={(e) => setProductForm({ ...productForm, categoriaId: e.target.value })}
                  >
                    <option value="">Seleccionar rubro...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </Form.Select>
                </Col>
                <Col sm={6}>
                  <Form.Label className="small fw-bold" style={{ color: '#334155' }}>URL de Fotografía</Form.Label>
                  <Form.Control
                    className="form-control-custom"
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                </Col>
              </Row>

              <div className="mb-3">
                <Form.Label className="small fw-bold" style={{ color: '#334155' }}>Descripción y Detalles</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  className="form-control-custom"
                  value={productForm.descripcion}
                  onChange={(e) => setProductForm({ ...productForm, descripcion: e.target.value })}
                  placeholder="Medidas, unidades por paquete, materiales..."
                />
              </div>

              <Form.Check
                type="switch"
                id="active-prod-switch"
                label="Artículo activo y visible en la tienda online"
                className="fw-bold small"
                checked={productForm.activo}
                onChange={(e) => setProductForm({ ...productForm, activo: e.target.checked })}
              />
            </Modal.Body>
            <Modal.Footer style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
              <Button variant="light" className="btn-festive-outline small" onClick={() => setShowProductModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="btn-festive small" disabled={savingProduct}>
                {savingProduct ? <Spinner animation="border" size="sm" /> : 'Guardar Artículo'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* =======================================================
            MODAL DE CONFIRMACIÓN DE ELIMINACIÓN
            ======================================================= */}
        {deleteProductTarget && (
          <Modal show={Boolean(deleteProductTarget)} onHide={() => setDeleteProductTarget(null)} centered>
            <Modal.Header closeButton style={{ backgroundColor: '#fff1f2', borderBottom: '1px solid #fecdd3' }}>
              <Modal.Title className="h5 fw-bold text-danger">Eliminar Artículo</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4" style={{ backgroundColor: '#ffffff' }}>
              <p className="mb-0">
                ¿Estás seguro de que deseas eliminar permanentemente <strong>"{deleteProductTarget.nombre}"</strong>?
                Esta acción no se puede deshacer.
              </p>
            </Modal.Body>
            <Modal.Footer style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
              <Button variant="light" className="btn-festive-outline small" onClick={() => setDeleteProductTarget(null)}>
                Cancelar
              </Button>
              <Button variant="danger" className="small" onClick={handleDeleteProduct}>
                Sí, Eliminar Producto
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </Container>
    </div>
  );
}
