const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { requireAdmin } = require('../middleware/auth');

router.use(requireAdmin);

// GET /api/admin/overview
router.get('/overview', async (req, res) => {
  try {
    const [totalProducts, totalOrders, totalUsers, orders] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.order.findMany({ select: { total: true } }),
    ]);

    const totalRevenue = orders.reduce((acc, curr) => acc + (curr.total || 0), 0);

    return res.json({
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
    });
  } catch (error) {
    console.error('Error en /api/admin/overview:', error);
    return res.status(500).json({ detail: 'Error al cargar resumen administrativo.' });
  }
});

// GET /api/admin/store-config
router.get('/store-config', async (req, res) => {
  try {
    const settings = await prisma.storeSettings.findUnique({ where: { id: 1 } });
    return res.json(settings);
  } catch (error) {
    return res.status(500).json({ detail: 'Error al consultar configuración.' });
  }
});

// POST or PUT /api/admin/store-config
const updateStoreConfig = async (req, res) => {
  try {
    const { minOrderAmount, showPricesToGuests, maintenanceMode, maintenanceTitle, maintenanceMessage } = req.body;
    const settings = await prisma.storeSettings.upsert({
      where: { id: 1 },
      update: {
        minOrderAmount: minOrderAmount !== undefined ? parseFloat(minOrderAmount) : undefined,
        showPricesToGuests: showPricesToGuests !== undefined ? Boolean(showPricesToGuests) : undefined,
        maintenanceMode: maintenanceMode !== undefined ? Boolean(maintenanceMode) : undefined,
        maintenanceTitle: maintenanceTitle !== undefined ? maintenanceTitle : undefined,
        maintenanceMessage: maintenanceMessage !== undefined ? maintenanceMessage : undefined,
      },
      create: {
        id: 1,
        minOrderAmount: parseFloat(minOrderAmount || 15000),
        showPricesToGuests: Boolean(showPricesToGuests),
        maintenanceMode: Boolean(maintenanceMode),
        maintenanceTitle: maintenanceTitle || '',
        maintenanceMessage: maintenanceMessage || '',
      },
    });

    return res.json(settings);
  } catch (error) {
    console.error('Error en updateStoreConfig:', error);
    return res.status(500).json({ detail: 'Error al actualizar configuración.' });
  }
};
router.post('/store-config', updateStoreConfig);
router.put('/store-config', updateStoreConfig);

// GET /api/admin/orders
router.get('/orders', async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { creadoEn: 'desc' },
    });

    return res.json({
      items: orders,
      orders,
      total: orders.length,
    });
  } catch (error) {
    console.error('Error en /api/admin/orders:', error);
    return res.status(500).json({ detail: 'Error al listar pedidos.' });
  }
});

// GET /api/admin/orders/:id
router.get('/orders/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) return res.status(404).json({ detail: 'Pedido no encontrado.' });
    return res.json(order);
  } catch (error) {
    return res.status(500).json({ detail: 'Error al consultar pedido.' });
  }
});

// PATCH /api/admin/orders/:id
router.patch('/orders/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });
    return res.json(order);
  } catch (error) {
    return res.status(500).json({ detail: 'Error al actualizar estado del pedido.' });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        isStaff: true,
        isSuperuser: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ items: users, users });
  } catch (error) {
    return res.status(500).json({ detail: 'Error al consultar usuarios.' });
  }
});

module.exports = router;
