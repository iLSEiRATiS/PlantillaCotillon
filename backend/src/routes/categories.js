const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { requireAdmin } = require('../middleware/auth');

// Helper to format category as expected by the frontend
function formatCategory(cat) {
  return {
    id: cat.id,
    nombre: cat.nombre,
    name: cat.nombre,
    slug: cat.slug,
    path_name: cat.nombre,
    path_slug: cat.slug,
    descripcion: cat.descripcion || '',
    parent: cat.parentId,
    children: cat.children ? cat.children.map(formatCategory) : [],
  };
}

// GET /api/categories-list
router.get('/categories-list', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { nombre: 'asc' },
    });

    const items = categories.map(formatCategory);

    // Ofertas virtuales (opcional para el frontend)
    items.push({
      id: 9999,
      nombre: 'Ofertas & Promos',
      name: 'Ofertas & Promos',
      slug: 'ofertas',
      path_name: 'Ofertas & Promos',
      path_slug: 'ofertas',
      descripcion: 'Precios especiales en combos monocromáticos y cotillón.',
      parent: null,
      children: [],
    });

    return res.json({ items });
  } catch (error) {
    console.error('Error en /api/categories-list:', error);
    return res.status(500).json({ detail: 'Error al obtener categorías.' });
  }
});

// Admin: crear categoría
router.post('/categories', requireAdmin, async (req, res) => {
  try {
    const { nombre, slug, descripcion, parentId } = req.body;
    if (!nombre) {
      return res.status(400).json({ detail: 'El nombre es obligatorio.' });
    }
    const catSlug = (slug || nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    const category = await prisma.category.create({
      data: {
        nombre,
        slug: catSlug,
        descripcion: descripcion || '',
        parentId: parentId ? parseInt(parentId, 10) : null,
      },
    });
    return res.status(201).json(formatCategory(category));
  } catch (error) {
    console.error('Error al crear categoría:', error);
    return res.status(500).json({ detail: 'Error al crear categoría.' });
  }
});

module.exports = router;
