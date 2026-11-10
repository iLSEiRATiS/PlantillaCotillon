const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { requireAdmin } = require('../middleware/auth');

function formatProduct(prod) {
  let attrs = {};
  try {
    attrs = prod.atributos ? JSON.parse(prod.atributos) : {};
  } catch (e) {
    attrs = {};
  }

  const categoryObj = prod.categoria ? {
    id: prod.categoria.id,
    name: prod.categoria.nombre,
    nombre: prod.categoria.nombre,
    slug: prod.categoria.slug,
    path_name: prod.categoria.nombre,
    path_slug: prod.categoria.slug,
  } : null;

  const images = prod.imageUrl ? [prod.imageUrl] : [];

  return {
    _id: prod.id,
    id: prod.id,
    slug: prod.slug,
    name: prod.nombre,
    nombre: prod.nombre,
    sku: prod.sku || '',
    price: parseFloat(prod.precio),
    priceOriginal: parseFloat(prod.precio),
    imageUrl: prod.imageUrl || '',
    videoUrl: prod.videoUrl || '',
    discount: null,
    description: prod.descripcion || '',
    descripcion: prod.descripcion || '',
    images,
    attributes: attrs,
    attributes_stock: {},
    attributes_price: {},
    atributos_sin_stock: {},
    category: categoryObj,
    categoria: categoryObj,
    stock: prod.stock,
    sin_stock: prod.sinStock,
    active: prod.activo,
    activo: prod.activo,
    createdAt: prod.createdAt ? prod.createdAt.toISOString() : null,
    updatedAt: prod.updatedAt ? prod.updatedAt.toISOString() : null,
  };
}

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const {
      q,
      search,
      category,
      category_id,
      cat,
      sort,
      page = 1,
      limit = 24,
      all,
    } = req.query;

    const searchTerm = (q || search || '').trim().toLowerCase();
    const catSlug = (category || cat || '').trim();
    const catId = category_id ? parseInt(category_id, 10) : null;
    const includeInactive = all === '1' || all === 'true';

    const where = {};
    if (!includeInactive) {
      where.activo = true;
    }

    if (searchTerm) {
      where.OR = [
        { nombre: { contains: searchTerm } },
        { descripcion: { contains: searchTerm } },
        { sku: { contains: searchTerm } },
      ];
    }

    if (catId && catId !== 9999) {
      where.categoriaId = catId;
    } else if (catSlug && catSlug !== 'ofertas') {
      const foundCategory = await prisma.category.findUnique({
        where: { slug: catSlug },
      });
      if (foundCategory) {
        where.categoriaId = foundCategory.id;
      }
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'precio_asc' || sort === 'price_asc') {
      orderBy = { precio: 'asc' };
    } else if (sort === 'precio_desc' || sort === 'price_desc') {
      orderBy = { precio: 'desc' };
    } else if (sort === 'nombre_asc' || sort === 'name_asc') {
      orderBy = { nombre: 'asc' };
    } else if (sort === 'nombre_desc' || sort === 'name_desc') {
      orderBy = { nombre: 'desc' };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.max(1, Math.min(100, parseInt(limit, 10) || 24));
    const skip = (pageNum - 1) * take;

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: { categoria: true },
        orderBy,
        skip,
        take,
      }),
    ]);

    const items = products.map(formatProduct);
    const totalPages = Math.ceil(total / take) || 1;

    return res.json({
      items,
      products: items, // Compatibilidad dual
      total,
      page: pageNum,
      pages: totalPages,
      limit: take,
    });
  } catch (error) {
    console.error('Error en /api/products:', error);
    return res.status(500).json({ detail: 'Error al listar productos.' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const isNum = !isNaN(id);

    const product = await prisma.product.findFirst({
      where: isNum ? { id: parseInt(id, 10) } : { slug: id },
      include: { categoria: true },
    });

    if (!product) {
      return res.status(404).json({ detail: 'Producto no encontrado.' });
    }

    return res.json(formatProduct(product));
  } catch (error) {
    console.error('Error en /api/products/:id:', error);
    return res.status(500).json({ detail: 'Error al consultar producto.' });
  }
});

// Admin: crear producto
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { nombre, precio, descripcion, categoriaId, sku, stock, imageUrl } = req.body;
    if (!nombre || precio === undefined) {
      return res.status(400).json({ detail: 'El nombre y el precio son obligatorios.' });
    }

    const slug = nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);

    const product = await prisma.product.create({
      data: {
        nombre,
        slug,
        sku: sku || '',
        precio: parseFloat(precio),
        descripcion: descripcion || '',
        stock: parseInt(stock, 10) || 100,
        imageUrl: imageUrl || '',
        categoriaId: categoriaId ? parseInt(categoriaId, 10) : null,
      },
      include: { categoria: true },
    });

    return res.status(201).json(formatProduct(product));
  } catch (error) {
    console.error('Error al crear producto:', error);
    return res.status(500).json({ detail: 'Error al crear producto.' });
  }
});

// Admin: editar producto
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { nombre, precio, descripcion, categoriaId, sku, stock, imageUrl, activo } = req.body;

    const data = {};
    if (nombre !== undefined) data.nombre = nombre;
    if (precio !== undefined) data.precio = parseFloat(precio);
    if (descripcion !== undefined) data.descripcion = descripcion;
    if (sku !== undefined) data.sku = sku;
    if (stock !== undefined) data.stock = parseInt(stock, 10);
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (activo !== undefined) data.activo = Boolean(activo);
    if (categoriaId !== undefined) data.categoriaId = categoriaId ? parseInt(categoriaId, 10) : null;

    const product = await prisma.product.update({
      where: { id },
      data,
      include: { categoria: true },
    });

    return res.json(formatProduct(product));
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return res.status(500).json({ detail: 'Error al actualizar producto.' });
  }
});

// Admin: eliminar producto
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.product.delete({ where: { id } });
    return res.json({ ok: true });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    return res.status(500).json({ detail: 'Error al eliminar producto.' });
  }
});

module.exports = router;
