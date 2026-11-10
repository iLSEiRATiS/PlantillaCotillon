const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando seed de datos para PlantillaCotillón (Estilo Genuino Cotillón) ---');

  // Limpiar datos existentes
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.storeSettings.deleteMany();

  // Usuarios
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@cotillon.com',
      username: 'admin',
      password: hashedPassword,
      firstName: 'Administrador',
      lastName: 'Tienda',
      isStaff: true,
      isSuperuser: true,
    },
  });

  const clientHashed = await bcrypt.hash('cliente123', 10);
  const clientUser = await prisma.user.create({
    data: {
      email: 'cliente@cotillon.com',
      username: 'cliente',
      password: clientHashed,
      firstName: 'Mariana',
      lastName: 'Fernández',
      isStaff: false,
      isSuperuser: false,
    },
  });

  // Configuración de tienda
  await prisma.storeSettings.create({
    data: {
      id: 1,
      minOrderAmount: 15000,
      showPricesToGuests: true,
      maintenanceMode: false,
      maintenanceTitle: 'Estamos preparando novedades',
      maintenanceMessage: 'Volvemos en breves minutos con más artículos para fiestas.',
    },
  });

  // Categorías de Cotillón festivo
  const catGlobos = await prisma.category.create({
    data: {
      nombre: 'Globos & Arreglos',
      slug: 'globos-arreglos',
      descripcion: 'Globos látex, perlados, pastel, metalizados, números gigantes y bouquets.',
    },
  });

  const catVajilla = await prisma.category.create({
    data: {
      nombre: 'Vajilla & Deco de Mesa',
      slug: 'vajilla-deco-mesa',
      descripcion: 'Platos, vasos descartables, servilletas temáticas, manteles y sorbetes ecológicos.',
    },
  });

  const catVelas = await prisma.category.create({
    data: {
      nombre: 'Velas & Bengalas',
      slug: 'velas-bengalas',
      descripcion: 'Velas numéricas, volcán con chispas, bengalas de humo y fuentes frías.',
    },
  });

  const catGuirnaldas = await prisma.category.create({
    data: {
      nombre: 'Guirnaldas & Fondos',
      slug: 'guirnaldas-fondos',
      descripcion: 'Banderines Feliz Cumpleaños, cortinas metalizadas holográficas y pompones.',
    },
  });

  const catAccesorios = await prisma.category.create({
    data: {
      nombre: 'Carnaval Carioca & Props',
      slug: 'carnaval-carioca-props',
      descripcion: 'Vinchas luminosas, antifaces con plumas, gafas divertidas, sombreros y maracas.',
    },
  });

  // Productos con fotos reales, alegres y vibrantes
  const products = [
    {
      nombre: 'Pack 50 Globos Perlados Multicolor Pastel 12"',
      slug: 'pack-50-globos-perlados-multicolor-pastel',
      sku: 'GLO-001-PAS',
      precio: 8900,
      descripcion: 'Set de 50 globos de látex premium en tonos pastel (rosa, lila, menta, amarillo y celeste). Aptos para helio o aire.',
      imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80',
      stock: 150,
      categoriaId: catGlobos.id,
    },
    {
      nombre: 'Kit Arco Orgánico 100 Globos Confeti & Dorado',
      slug: 'kit-arco-organico-100-globos-confeti-dorado',
      sku: 'GLO-002-ARC',
      precio: 16500,
      descripcion: 'Kit completo para armar arco de globos. Incluye cinta guía de 5 metros, puntos de pegamento y globos con confeti brillante.',
      imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop&q=80',
      stock: 60,
      categoriaId: catGlobos.id,
    },
    {
      nombre: 'Globo Número Gigante Metalizado Oro Rosa 80cm',
      slug: 'globo-numero-gigante-oro-rosa-80cm',
      sku: 'GLO-003-NUM',
      precio: 6200,
      descripcion: 'Globo metalizado gigante acabado brillante Oro Rosa de 80 cm. Válvula con autosellado, ideal para aniversarios y cumpleaños.',
      imageUrl: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&auto=format&fit=crop&q=80',
      stock: 85,
      categoriaId: catGlobos.id,
    },
    {
      nombre: 'Combo Vajilla Polipapel Party Neón (24 Personas)',
      slug: 'combo-vajilla-polipapel-party-neon',
      sku: 'VAJ-001-NEO',
      precio: 19800,
      descripcion: 'Pack completo para 24 invitados: 24 platos de 23cm, 24 vasos térmicos de 240cc y 40 servilletas estampadas de triple hoja.',
      imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&auto=format&fit=crop&q=80',
      stock: 40,
      categoriaId: catVajilla.id,
    },
    {
      nombre: 'Mantel Plástico Descartable Confeti Festivo 1.40x2.40m',
      slug: 'mantel-plastico-confeti-festivo',
      sku: 'VAJ-002-MNT',
      precio: 4500,
      descripcion: 'Mantel impermeable con estampado de confeti y serpentinas multicolores. Fácil de limpiar y reutilizable.',
      imageUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&auto=format&fit=crop&q=80',
      stock: 90,
      categoriaId: catVajilla.id,
    },
    {
      nombre: 'Bengalas de Humo Festivo x6 Colores Flúo',
      slug: 'bengalas-humo-festivo-x6-colores-fluo',
      sku: 'VEL-001-HUM',
      precio: 14500,
      descripcion: 'Tubos de efecto humo denso en colores vibrantes (azul, magenta, verde, naranja, amarillo y violeta). Duración 60 segundos.',
      imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
      stock: 70,
      categoriaId: catVelas.id,
    },
    {
      nombre: 'Pack 4 Velas Volcán Fuente Fría para Torta',
      slug: 'pack-4-velas-volcan-fuente-fria-torta',
      sku: 'VEL-002-VOL',
      precio: 7800,
      descripcion: 'Velas de chispas frías de seguridad para interiores. Duración 45 segundos, no desprenden humo negro ni alteran el sabor de la torta.',
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
      stock: 120,
      categoriaId: catVelas.id,
    },
    {
      nombre: 'Cortina Metalizada Holográfica Multicolor 1x2m',
      slug: 'cortina-metalizada-holografica-multicolor',
      sku: 'GUI-001-COR',
      precio: 5800,
      descripcion: 'Cortina de flecos con reflejos prismáticos arcoíris. Trae banda adhesiva incorporada para fijación rápida en pared o photocall.',
      imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80',
      stock: 95,
      categoriaId: catGuirnaldas.id,
    },
    {
      nombre: 'Guirnalda Letras Glitter "FELIZ CUMPLEAÑOS" 2.5m',
      slug: 'guirnalda-letras-glitter-feliz-cumpleanos',
      sku: 'GUI-002-CUM',
      precio: 5200,
      descripcion: 'Banderines en cartulina metalizada dorada con purpurina encapsulada que no se desprende. Incluye cinta satinada para colgar.',
      imageUrl: 'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=800&auto=format&fit=crop&q=80',
      stock: 110,
      categoriaId: catGuirnaldas.id,
    },
    {
      nombre: 'Kit Carnaval Carioca 50 Artículos Surtidos',
      slug: 'kit-carnaval-carioca-50-articulos-surtidos',
      sku: 'ACC-001-CAR',
      precio: 24900,
      descripcion: 'Combo fiesta: 15 vinchas con plumas, 15 collares hawaianos multicolores, 10 antifaces venecianos y 10 maracas sonoras.',
      imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
      stock: 50,
      categoriaId: catAccesorios.id,
    },
  ];

  for (const item of products) {
    await prisma.product.create({
      data: item,
    });
  }

  // Crear 2 pedidos de ejemplo para que el panel de administración tenga datos reales para mostrar
  await prisma.order.create({
    data: {
      nombre: 'Mariana Fernández',
      email: 'mariana.eventos@gmail.com',
      telefono: '11 4455-8899',
      direccion: 'Av. Corrientes 3450, Piso 4B',
      ciudad: 'CABA',
      estado: 'Buenos Aires',
      cp: '1193',
      destinatarioDocumento: '32.445.678',
      nota: 'Entregar preferentemente por la tarde.',
      status: 'review',
      envio: 3500,
      total: 39200,
      userId: clientUser.id,
      items: {
        create: [
          {
            productName: 'Kit Carnaval Carioca 50 Artículos Surtidos',
            cantidad: 1,
            precioUnitario: 24900,
          },
          {
            productName: 'Pack 50 Globos Perlados Multicolor Pastel 12"',
            cantidad: 1,
            precioUnitario: 8900,
          },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      nombre: 'Esteban Morales',
      email: 'esteban.fiestas@hotmail.com',
      telefono: '11 6789-1234',
      direccion: 'Calle San Martín 1240',
      ciudad: 'San Isidro',
      estado: 'Buenos Aires',
      cp: '1642',
      status: 'created',
      envio: 0,
      total: 24300,
      items: {
        create: [
          {
            productName: 'Combo Vajilla Polipapel Party Neón (24 Personas)',
            cantidad: 1,
            precioUnitario: 19800,
          },
          {
            productName: 'Mantel Plástico Descartable Confeti Festivo',
            cantidad: 1,
            precioUnitario: 4500,
          },
        ],
      },
    },
  });

  console.log(`✅ Seed festivo completado con éxito:`);
  console.log(`- 2 usuarios creados (admin@cotillon.com, cliente@cotillon.com)`);
  console.log(`- 5 categorías festivas creadas`);
  console.log(`- 10 productos de cotillón cargados`);
  console.log(`- 2 pedidos de prueba para el panel de administración`);
}

main()
  .catch((e) => {
    console.error('Error ejecutando seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
