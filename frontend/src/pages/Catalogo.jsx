import { useEffect, useState } from 'react';
import { Container, Row, Col, Form, InputGroup, Button, Spinner } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { FaSearch, FaTimes } from 'react-icons/fa';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Catalogo() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentCategory = searchParams.get('cat') || '';
  const currentSearch = searchParams.get('q') || '';
  const currentSort = searchParams.get('sort') || '';

  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          api.getProducts({
            q: currentSearch,
            category: currentCategory,
            sort: currentSort,
            limit: 48,
          }),
          api.getCategories(),
        ]);
        setProducts(prodRes.items || prodRes.products || []);
        setCategories((catRes.items || []).filter(c => c.slug !== 'ofertas'));
      } catch (err) {
        console.error('Error cargando catálogo:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentCategory, currentSearch, currentSort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      next.set('q', searchInput.trim());
    } else {
      next.delete('q');
    }
    setSearchParams(next);
  };

  const handleCategorySelect = (slug) => {
    const next = new URLSearchParams(searchParams);
    if (slug) {
      next.set('cat', slug);
    } else {
      next.delete('cat');
    }
    setSearchParams(next);
  };

  const handleSortChange = (e) => {
    const next = new URLSearchParams(searchParams);
    if (e.target.value) {
      next.set('sort', e.target.value);
    } else {
      next.delete('sort');
    }
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  return (
    <div className="py-5">
      <Container>
        {/* Cabecera del Catálogo */}
        <div className="mb-4">
          <span className="text-danger small text-uppercase fw-bold tracking-wider">Tienda Online</span>
          <h1 className="h2 fw-bold mb-1" style={{ color: '#0f172a' }}>Catálogo de Artículos</h1>
          <p className="text-secondary small mb-0">
            Explora todos nuestros productos para cumpleaños, eventos y fiestas temáticas.
          </p>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="p-3 rounded-3 bg-white border shadow-sm mb-4">
          <Row className="g-3 align-items-center">
            <Col lg={6} md={7}>
              <Form onSubmit={handleSearchSubmit}>
                <InputGroup>
                  <Form.Control
                    type="search"
                    className="form-control-custom"
                    placeholder="Buscar por nombre, SKU o cotillón..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                  <Button type="submit" className="btn-festive px-3">
                    <FaSearch size={14} /> Buscar
                  </Button>
                </InputGroup>
              </Form>
            </Col>

            <Col lg={3} md={5}>
              <Form.Select
                className="form-select-custom"
                value={currentSort}
                onChange={handleSortChange}
              >
                <option value="">Ordenar: Más recientes</option>
                <option value="precio_asc">Precio: Menor a mayor</option>
                <option value="precio_desc">Precio: Mayor a menor</option>
                <option value="nombre_asc">Nombre: A - Z</option>
              </Form.Select>
            </Col>

            {(currentCategory || currentSearch || currentSort) && (
              <Col lg={3} className="text-lg-end">
                <Button
                  variant="link"
                  className="text-danger fw-bold small p-0 text-decoration-none d-inline-flex align-items-center gap-1"
                  onClick={clearFilters}
                >
                  <FaTimes size={11} /> Limpiar filtros
                </Button>
              </Col>
            )}
          </Row>
        </div>

        {/* Píldoras de Categorías */}
        <div className="d-flex flex-wrap gap-2 mb-4">
          <Button
            size="sm"
            className={!currentCategory ? 'btn-festive' : 'btn-festive-outline'}
            onClick={() => handleCategorySelect('')}
          >
            Todas las categorías
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              size="sm"
              className={currentCategory === cat.slug ? 'btn-festive' : 'btn-festive-outline'}
              onClick={() => handleCategorySelect(cat.slug)}
            >
              {cat.nombre}
            </Button>
          ))}
        </div>

        {/* Listado de Productos */}
        {loading ? (
          <div className="text-center py-5 my-5">
            <Spinner animation="border" variant="danger" />
            <p className="text-muted small mt-2">Cargando artículos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-5 my-5 bg-white rounded-3 border p-5 shadow-sm">
            <span className="display-4 d-block mb-2">🔍</span>
            <h5 className="fw-bold mb-2" style={{ color: '#0f172a' }}>No se encontraron productos</h5>
            <p className="text-muted small mb-3">
              No hay artículos que coincidan con los criterios de búsqueda o categoría seleccionados.
            </p>
            <Button className="btn-festive small" onClick={clearFilters}>
              Ver todo el catálogo
            </Button>
          </div>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-secondary small fw-bold">Mostrando {products.length} productos</span>
            </div>
            <Row className="g-4">
              {products.map((product) => (
                <Col xl={3} lg={4} sm={6} key={product.id}>
                  <ProductCard product={product} />
                </Col>
              ))}
            </Row>
          </>
        )}
      </Container>
    </div>
  );
}
