const express = require('express');
const router = express.Router();
const prisma = require('../db');

// GET /api/store-config
router.get('/store-config', async (req, res) => {
  try {
    let settings = await prisma.storeSettings.findUnique({
      where: { id: 1 },
    });

    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {
          id: 1,
          minOrderAmount: 15000,
          showPricesToGuests: true,
          maintenanceMode: false,
          maintenanceTitle: 'Estamos preparando novedades',
          maintenanceMessage: 'Volvemos en breves minutos.',
        },
      });
    }

    res.set('Cache-Control', 'no-store, max-age=0');
    return res.json({
      minOrderAmount: parseFloat(settings.minOrderAmount),
      showPricesToGuests: settings.showPricesToGuests,
      maintenanceMode: settings.maintenanceMode,
      maintenanceTitle: settings.maintenanceTitle,
      maintenanceMessage: settings.maintenanceMessage,
      // Pasarelas de Pago
      mpEnabled: settings.mpEnabled || false,
      mpPublicKey: settings.mpPublicKey || '',
      mpSandbox: settings.mpSandbox !== undefined ? settings.mpSandbox : true,
      mpInstallments: settings.mpInstallments || 3,
      transferEnabled: settings.transferEnabled !== undefined ? settings.transferEnabled : true,
      transferDiscount: settings.transferDiscount || 10.0,
      transferBank: settings.transferBank || 'Banco Santander',
      transferHolder: settings.transferHolder || 'CotiFiesta S.A.',
      transferCbu: settings.transferCbu || '0720123488000012345678',
      transferAlias: settings.transferAlias || 'COTIFIESTA.FIESTA',
      transferCuit: settings.transferCuit || '30-71234567-9',
      cashEnabled: settings.cashEnabled !== undefined ? settings.cashEnabled : true,
      cashInstructions: settings.cashInstructions || 'Pago en efectivo al retirar en nuestro depósito central.',
    });
  } catch (error) {
    console.error('Error en /api/store-config:', error);
    return res.status(500).json({ detail: 'Error al consultar configuración.' });
  }
});

// GET /api/home-images (Banners / Carrusel para la Home en monocromo)
router.get('/home-images', (req, res) => {
  return res.json({
    banners: [
      {
        id: 1,
        title: 'Estilo & Celebración Monocromática',
        subtitle: 'Cotillón premium, globos y ambientación en negro, blanco y plata.',
        imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1600&auto=format&fit=crop&q=80',
        ctaText: 'Ver Catálogo',
        ctaLink: '/productos',
      },
      {
        id: 2,
        title: 'Kits Listos para Festejar',
        subtitle: 'Descubre nuestros packs completos para eventos y fiestas temáticas.',
        imageUrl: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=1600&auto=format&fit=crop&q=80',
        ctaText: 'Cómo Comprar',
        ctaLink: '/como-comprar',
      },
    ],
  });
});

// POST /api/supplier-contacts
router.post('/supplier-contacts', async (req, res) => {
  try {
    const { nombre, apellido, telefono, mensaje } = req.body;
    if (!nombre || !apellido || !telefono || !mensaje) {
      return res.status(400).json({ detail: 'Completa todos los campos obligatorios.' });
    }

    await prisma.supplierContact.create({
      data: {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        telefono: telefono.trim(),
        mensaje: mensaje.trim(),
      },
    });

    return res.json({ ok: true, detail: 'Mensaje de contacto recibido correctamente.' });
  } catch (error) {
    console.error('Error en /api/supplier-contacts:', error);
    return res.status(500).json({ detail: 'Error al enviar mensaje.' });
  }
});

// GET /api/offers
router.get('/offers', (req, res) => {
  return res.json({ items: [] });
});

module.exports = router;
