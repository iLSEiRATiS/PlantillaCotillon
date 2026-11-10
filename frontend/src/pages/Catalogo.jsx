import { useEffect, useState, useMemo } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FaSearch,
  FaTimes,
  FaThLarge,
  FaList,
  FaChevronRight,
  FaChevronLeft,
  FaCreditCard,
} from 'react-icons/fa';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Catalogo() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const currentCategory = searchParams.get('cat') || '';
  const currentSearch = searchParams.get('q') || '';
  const currentSort = searchParams.get('sort') || '';
  const currentMinPrice = searchParams.get('min_price') || '';
  const currentMaxPrice = searchParams.get('max_price') || '';
  const currentInstallments = searchParams.get('installments') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Local inputs for price range
  const [minInput, setMinInput] = useState(currentMinPrice);
  const [maxInput, setMaxInput] = useState(currentMaxPrice);

  useEffect(() => {
    setMinInput(currentMinPrice);
    setMaxInput(currentMaxPrice);
  }, [currentMinPrice, currentMaxPrice]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          api.getProducts({
            q: currentSearch,
            category: currentCategory,
            sort: currentSort,
            min_price: currentMinPrice,
            max_price: currentMaxPrice,
            limit: 48,
          }),
          api.getCategories(),
        ]);
        setProducts(prodRes.items || prodRes.products || []);
        setCategories((catRes.items || []).filter((c) => c.slug !== 'ofertas'));
      } catch (err) {
        console.error('Error cargando catálogo:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentCategory, currentSearch, currentSort, currentMinPrice, currentMaxPrice]);

  // Client-side filtering for installments (if active)
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (currentInstallments === 'yes') {
      // Products with installment promotion
      result = result.filter((p) => (p.precio || p.price || 0) >= 4000);
    }

    return result;
  }, [products, currentInstallments]);

  // Current category object
  const activeCategoryObj = categories.find((c) => c.slug === currentCategory);

  // Helper to update query params
  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === undefined || val === '') {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    });
    // Reset page to 1 on filter changes
    if (!('page' in updates)) {
      next.delete('page');
    }
    setSearchParams(next);
  };

  const handlePriceSubmit = (e) => {
    e.preventDefault();
    updateParams({
      min_price: minInput.trim(),
      max_price: maxInput.trim(),
    });
  };

  const handlePricePreset = (min, max) => {
    updateParams({
      min_price: min || '',
      max_price: max || '',
    });
  };

  const handleSortChange = (e) => {
    updateParams({ sort: e.target.value });
  };

  const clearAllFilters = () => {
    setSearchParams({});
    setMinInput('');
    setMaxInput('');
  };

  // Pagination calculation
  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="ml-catalog-page">
      <Container>
        {/* Breadcrumb estilo Mercado Libre */}
        <nav aria-label="breadcrumb" className="ml-breadcrumb">
          <Link to="/">Inicio</Link>
          <span className="ml-breadcrumb-divider">&gt;</span>
          <Link to="/catalogo">Cotillón &amp; Fiestas</Link>
          {activeCategoryObj && (
            <>
              <span className="ml-breadcrumb-divider">&gt;</span>
              <span>{activeCategoryObj.nombre}</span>
            </>
          )}
          {currentSearch && (
            <>
              <span className="ml-breadcrumb-divider">&gt;</span>
              <span className="text-dark fw-semibold">"{currentSearch}"</span>
            </>
          )}
        </nav>

        <Row>
          {/* ===================================================
              SIDEBAR DE FILTROS ESTILO MERCADO LIBRE (COL IZQUIERDA)
              =================================================== */}
          <Col lg={3} md={4} className="ml-sidebar mb-4 mb-md-0">
            {/* Título de Categoría / Búsqueda activa */}
            <div className="mb-3">
              <h1 className="ml-query-title">
                {activeCategoryObj
                  ? activeCategoryObj.nombre
                  : currentSearch
                  ? currentSearch
                  : 'Cotillón para Fiestas'}
              </h1>
              <div className="ml-results-count">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'resultado' : 'resultados'}
              </div>
            </div>

            {/* Chips de Filtros Aplicados */}
            {(currentCategory || currentSearch || currentMinPrice || currentMaxPrice || currentInstallments) && (
              <div className="ml-filter-group pt-2">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="small text-secondary fw-bold text-uppercase">Filtros aplicados</span>
                  <button
                    type="button"
                    className="btn btn-link p-0 small text-danger text-decoration-none"
                    onClick={clearAllFilters}
                    style={{ fontSize: '0.8rem' }}
                  >
                    Borrar todos
                  </button>
                </div>
                <div className="ml-chips-container">
                  {activeCategoryObj && (
                    <span className="ml-chip">
                      {activeCategoryObj.nombre}
                      <button
                        type="button"
                        className="ml-chip-btn"
                        onClick={() => updateParams({ cat: '' })}
                        title="Quitar categoría"
                      >
                        <FaTimes size={10} />
                      </button>
                    </span>
                  )}

                  {currentSearch && (
                    <span className="ml-chip">
                      "{currentSearch}"
                      <button
                        type="button"
                        className="ml-chip-btn"
                        onClick={() => updateParams({ q: '' })}
                        title="Quitar búsqueda"
                      >
                        <FaTimes size={10} />
                      </button>
                    </span>
                  )}

                  {(currentMinPrice || currentMaxPrice) && (
                    <span className="ml-chip">
                      ${currentMinPrice || '0'} - ${currentMaxPrice || '∞'}
                      <button
                        type="button"
                        className="ml-chip-btn"
                        onClick={() => {
                          setMinInput('');
                          setMaxInput('');
                          updateParams({ min_price: '', max_price: '' });
                        }}
                        title="Quitar rango de precio"
                      >
                        <FaTimes size={10} />
                      </button>
                    </span>
                  )}

                  {currentInstallments && (
                    <span className="ml-chip">
                      Cuotas sin interés
                      <button
                        type="button"
                        className="ml-chip-btn"
                        onClick={() => updateParams({ installments: '' })}
                        title="Quitar cuotas sin interés"
                      >
                        <FaTimes size={10} />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Grupo 1: Categorías / Festividades */}
            <div className="ml-filter-group">
              <h3 className="ml-filter-heading">Festividades &amp; Temáticas</h3>
              <ul className="ml-filter-list">
                <li className="ml-filter-item">
                  <span
                    className={`ml-filter-link ${!currentCategory ? 'active' : ''}`}
                    onClick={() => updateParams({ cat: '' })}
                  >
                    <span>Todas las festividades</span>
                    <span className="ml-filter-count">({products.length})</span>
                  </span>
                </li>
                {categories.map((cat) => {
                  const isActive = currentCategory === cat.slug;
                  return (
                    <li className="ml-filter-item" key={cat.id}>
                      <span
                        className={`ml-filter-link ${isActive ? 'active' : ''}`}
                        onClick={() => updateParams({ cat: cat.slug })}
                      >
                        <span>{cat.nombre}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Grupo 2: Pago y Financiación */}
            <div className="ml-filter-group">
              <h3 className="ml-filter-heading">Pago</h3>
              <label className="ml-switch-label">
                <input
                  type="checkbox"
                  className="ml-switch-input"
                  checked={currentInstallments === 'yes'}
                  onChange={(e) =>
                    updateParams({ installments: e.target.checked ? 'yes' : '' })
                  }
                />
                <span className="d-flex align-items-center gap-1">
                  <FaCreditCard size={13} className="text-primary" /> Mismo precio en cuotas
                </span>
              </label>
              <div className="text-secondary small mt-1" style={{ fontSize: '0.78rem' }}>
                Hasta 3 y 6 cuotas sin interés
              </div>
            </div>

            {/* Grupo 3: Precio */}
            <div className="ml-filter-group">
              <h3 className="ml-filter-heading">Precio</h3>
              <ul className="ml-filter-list mb-3">
                <li className="ml-filter-item">
                  <span
                    className="ml-filter-link"
                    onClick={() => handlePricePreset('', '5000')}
                  >
                    <span>Hasta $ 5.000</span>
                  </span>
                </li>
                <li className="ml-filter-item">
                  <span
                    className="ml-filter-link"
                    onClick={() => handlePricePreset('5000', '15000')}
                  >
                    <span>$ 5.000 a $ 15.000</span>
                  </span>
                </li>
                <li className="ml-filter-item">
                  <span
                    className="ml-filter-link"
                    onClick={() => handlePricePreset('15000', '')}
                  >
                    <span>Más de $ 15.000</span>
                  </span>
                </li>
              </ul>

              {/* Rango Manual */}
              <form onSubmit={handlePriceSubmit} className="ml-price-filter-box">
                <input
                  type="number"
                  placeholder="Mínimo"
                  className="ml-price-input"
                  value={minInput}
                  onChange={(e) => setMinInput(e.target.value)}
                />
                <span className="text-muted">-</span>
                <input
                  type="number"
                  placeholder="Máximo"
                  className="ml-price-input"
                  value={maxInput}
                  onChange={(e) => setMaxInput(e.target.value)}
                />
                <button type="submit" className="ml-price-submit-btn" title="Aplicar rango de precio">
                  <FaChevronRight size={11} />
                </button>
              </form>
            </div>

            {/* Grupo 4: Ubicación */}
            <div className="ml-filter-group">
              <h3 className="ml-filter-heading">Ubicación de despacho</h3>
              <ul className="ml-filter-list">
                <li className="ml-filter-item">
                  <span className="ml-filter-link">Capital Federal</span>
                </li>
                <li className="ml-filter-item">
                  <span className="ml-filter-link">Buenos Aires</span>
                </li>
                <li className="ml-filter-item">
                  <span className="ml-filter-link">Envíos a todo el país</span>
                </li>
              </ul>
            </div>
          </Col>

          {/* ===================================================
              SECCIÓN PRINCIPAL DE PRODUCTOS (COL DERECHA)
              =================================================== */}
          <Col lg={9} md={8}>
            {/* Barra superior de controles (Ordenamiento y Vista) */}
            <div className="ml-controls-bar">
              <div className="d-flex align-items-center gap-2">
                <span className="small text-secondary">Ordenar por</span>
                <select
                  className="ml-sort-select"
                  value={currentSort}
                  onChange={handleSortChange}
                >
                  <option value="">Más relevantes</option>
                  <option value="precio_asc">Menor precio</option>
                  <option value="precio_desc">Mayor precio</option>
                  <option value="nombre_asc">Nombre: A - Z</option>
                </select>
              </div>

              {/* Botones de Vista Cuadrícula / Lista */}
              <div className="ml-view-toggle">
                <button
                  type="button"
                  className={`ml-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Vista en cuadrícula"
                  aria-label="Vista en cuadrícula"
                >
                  <FaThLarge size={14} />
                </button>
                <button
                  type="button"
                  className={`ml-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="Vista en lista"
                  aria-label="Vista en lista"
                >
                  <FaList size={14} />
                </button>
              </div>
            </div>

            {/* Renderizado de Artículos */}
            {loading ? (
              <div className="text-center py-5 my-5 bg-white rounded border">
                <Spinner animation="border" variant="primary" />
                <p className="text-secondary small mt-3 mb-0">Cargando publicaciones de cotillón...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-5 bg-white rounded border p-4 shadow-sm">
                <div
                  className="p-3 rounded-circle d-inline-flex mb-3"
                  style={{ backgroundColor: '#f5f5f5', color: '#999' }}
                >
                  <FaSearch size={32} />
                </div>
                <h4 className="fw-semibold mb-2" style={{ color: '#333' }}>
                  No hay publicaciones que coincidan con tu búsqueda
                </h4>
                <ul className="list-unstyled text-secondary small mb-4" style={{ lineHeight: '1.8' }}>
                  <li>• Revisá la ortografía de la palabra.</li>
                  <li>• Utilizá términos más genéricos o menos filtros.</li>
                  <li>• Navegá por las festividades en el menú lateral.</li>
                </ul>
                <button
                  type="button"
                  className="btn btn-primary px-4 py-2"
                  style={{ backgroundColor: '#3483fa', borderColor: '#3483fa' }}
                  onClick={clearAllFilters}
                >
                  Ver todos los productos de Cotillón
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              /* MODO CUADRÍCULA (GRID) */
              <Row className="g-3">
                {paginatedProducts.map((product) => (
                  <Col xl={4} lg={4} sm={6} key={product.id}>
                    <ProductCard product={product} layout="grid" />
                  </Col>
                ))}
              </Row>
            ) : (
              /* MODO LISTA (HORIZONTAL) */
              <div className="d-flex flex-column">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} layout="list" />
                ))}
              </div>
            )}

            {/* Paginación estilo Mercado Libre */}
            {!loading && totalPages > 1 && (
              <div className="ml-pagination-bar">
                <button
                  type="button"
                  className="ml-page-btn"
                  disabled={currentPage <= 1}
                  onClick={() => updateParams({ page: currentPage - 1 })}
                >
                  <FaChevronLeft size={10} className="me-1" /> Anterior
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    type="button"
                    className={`ml-page-btn ${num === currentPage ? 'active' : ''}`}
                    onClick={() => updateParams({ page: num })}
                  >
                    {num}
                  </button>
                ))}

                <button
                  type="button"
                  className="ml-page-btn"
                  disabled={currentPage >= totalPages}
                  onClick={() => updateParams({ page: currentPage + 1 })}
                >
                  Siguiente <FaChevronRight size={10} className="ms-1" />
                </button>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}
