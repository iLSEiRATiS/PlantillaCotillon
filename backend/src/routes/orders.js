const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { authenticateToken } = require('../middleware/auth');

function formatOrder(order) {
  return {
    id: order.id,
    _id: order.id,
    nombre: order.nombre,
    email: order.email,
    direccion: order.direccion,
    ciudad: order.ciudad,
    estado: order.estado || '',
    cp: order.cp || '',
    telefono: order.telefono || '',
    destinatario_documento: order.destinatarioDocumento || '',
    nota: order.nota || '',
    metodo_pago: order.metodoPago || 'transferencia',
    status: order.status,
    envio: parseFloat(order.envio || 0),
    total: parseFloat(order.total || 0),
    creado_en: order.creadoEn ? order.creadoEn.toISOString() : null,
    items: (order.items || []).map((it) => ({
      id: it.id,
      product_id: it.productId,
      product_name: it.productName,
      cantidad: it.cantidad,
      precio_unitario: parseFloat(it.precioUnitario),
      subtotal: parseFloat(it.precioUnitario) * it.cantidad,
      atributos: it.atributos ? JSON.parse(it.atributos) : {},
    })),
  };
}

// POST /api/orders (Crear pedido)
router.post('/', async (req, res) => {
  try {
    const {
      nombre,
      email,
      direccion,
      ciudad,
      estado,
      cp,
      telefono,
      destinatario_documento,
      nota,
      metodo_pago,
      metodoPago,
      envio = 0,
      items = [],
    } = req.body;

    if (!nombre || !email || !direccion || !ciudad || !items || !items.length) {
      return res.status(400).json({ detail: 'Por favor completa todos los campos requeridos y al menos un producto.' });
    }

    // Calcular total
    let calculatedTotal = parseFloat(envio) || 0;
    const formattedItems = [];

    for (const item of items) {
      const prodId = item.id || item.product_id;
      const cant = Math.max(1, parseInt(item.cantidad || item.qty || 1, 10));
      const price = parseFloat(item.price || item.precio || item.precio_unitario || 0);

      calculatedTotal += price * cant;
      formattedItems.push({
        productId: prodId ? parseInt(prodId, 10) : null,
        productName: item.name || item.nombre || item.product_name || 'Producto Cotillón',
        cantidad: cant,
        precioUnitario: price,
        atributos: JSON.stringify(item.attributes || item.atributos || {}),
      });
    }

    // Verificar si viene con usuario autenticado opcional
    let userId = null;
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      try {
        const parts = authHeader.split(' ');
        const token = parts.length === 2 ? parts[1] : parts[0];
        const jwt = require('jsonwebtoken');
        const { JWT_SECRET } = require('../middleware/auth');
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch (e) {
        // Ignorar si el token es inválido para no bloquear compra invitada
      }
    }

    const order = await prisma.order.create({
      data: {
        nombre,
        email,
        direccion,
        ciudad,
        estado: estado || '',
        cp: cp || '',
        telefono: telefono || '',
        destinatarioDocumento: destinatario_documento || '',
        nota: nota || '',
        metodoPago: metodo_pago || metodoPago || 'transferencia',
        envio: parseFloat(envio) || 0,
        total: calculatedTotal,
        userId,
        items: {
          create: formattedItems,
        },
      },
      include: {
        items: true,
      },
    });

    return res.status(201).json(formatOrder(order));
  } catch (error) {
    console.error('Error al crear pedido:', error);
    return res.status(500).json({ detail: 'Error al procesar el pedido.' });
  }
});

// GET /api/orders/mine (Pedidos del usuario logueado)
router.get('/mine', authenticateToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { userId: req.user.id },
          { email: req.user.email },
        ],
      },
      include: { items: true },
      orderBy: { creadoEn: 'desc' },
    });

    return res.json({
      items: orders.map(formatOrder),
      orders: orders.map(formatOrder),
    });
  } catch (error) {
    console.error('Error en /api/orders/mine:', error);
    return res.status(500).json({ detail: 'Error al obtener pedidos.' });
  }
});

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ detail: 'Pedido no encontrado.' });
    }

    return res.json(formatOrder(order));
  } catch (error) {
    console.error('Error al consultar pedido:', error);
    return res.status(500).json({ detail: 'Error al consultar pedido.' });
  }
});

// POST /api/orders/:id/pay
router.post('/:id/pay', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const order = await prisma.order.update({
      where: { id },
      data: { status: 'paid' },
      include: { items: true },
    });

    return res.json({ ok: true, order: formatOrder(order) });
  } catch (error) {
    console.error('Error al pagar pedido:', error);
    return res.status(500).json({ detail: 'Error al registrar pago.' });
  }
});

module.exports = router;
