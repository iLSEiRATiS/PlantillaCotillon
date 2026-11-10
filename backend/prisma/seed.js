const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando seed de datos para CotiFiesta (Festividades y Cotillón) ---');

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

  // Configuración de tienda con pagos
  await prisma.storeSettings.create({
    data: {
      id: 1,
      minOrderAmount: 15000,
      showPricesToGuests: true,
      maintenanceMode: false,
      maintenanceTitle: 'Estamos preparando novedades',
      maintenanceMessage: 'Volvemos en breves minutos con más artículos para fiestas.',
      mpEnabled: true,
      mpPublicKey: 'TEST-78945612-45a8-48b2-9a00-123456789abc',
      mpAccessToken: 'TEST-12345678-09az-54b2-9a00-987654321cba',
      mpSandbox: true,
      mpInstallments: 6,
      transferEnabled: true,
      transferDiscount: 10.0,
      transferBank: 'Banco Santander',
      transferHolder: 'CotiFiesta S.A.',
      transferCbu: '0720123488000012345678',
      transferAlias: 'COTIFIESTA.FIESTA',
      transferCuit: '30-71234567-9',
      cashEnabled: true,
      cashInstructions: 'Abona en efectivo al retirar en depósito central (Av. Corrientes 3450, Almagro).',
    },
  });

  // Categorías basadas en FESTIVIDADES REALES
  const catHalloween = await prisma.category.create({
    data: {
      nombre: 'Halloween & Noche de Brujas',
      slug: 'halloween',
      descripcion: 'Máscaras de terror, calabazas LED, telarañas con arañas, sangre artificial y disfraces.',
    },
  });

  const catNavidad = await prisma.category.create({
    data: {
      nombre: 'Navidad & Fin de Año',
      slug: 'navidad',
      descripcion: 'Gorros de Papá Noel, guirnaldas nevadas, bengalas navideñas, luces microLED y cotillón año nuevo.',
    },
  });

  const catEgresados = await prisma.category.create({
    data: {
      nombre: 'Egresados & Graduaciones',
      slug: 'egresados',
      descripcion: 'Humo de colores para fotos, birretes con borla, cañones de serpentinas, pintura flúo y props egresados.',
    },
  });

  const catComuniones = await prisma.category.create({
    data: {
      nombre: 'Comunión & Bautismo',
      slug: 'comuniones',
      descripcion: 'Vajilla dorada y blanca, ángeles decorativos, velas torneadas aromáticas y globos perlados.',
    },
  });

  const catSanPatricio = await prisma.category.create({
    data: {
      nombre: 'San Patricio & Temáticas',
      slug: 'san-patricio',
      descripcion: 'Galeras verdes con lentejuelas, collares de trébol luminosos, boas de plumas y banderas temáticas.',
    },
  });

  const catCumpleanos = await prisma.category.create({
    data: {
      nombre: 'Cumpleaños & Aniversarios',
      slug: 'cumpleanos',
      descripcion: 'Números gigantes metalizados, cortinas shimmer, vajilla party pastel, velas volcán y piñatas.',
    },
  });

  const catCarnaval = await prisma.category.create({
    data: {
      nombre: 'Carnaval Carioca & Despedidas',
      slug: 'carnaval-carioca',
      descripcion: 'Combos flúo LED, maracas luminosas, anteojos gigantes, vinchas hawaianas y silbatos.',
    },
  });

  // Productos por Festividad
  const products = [
    // --- HALLOWEEN ---
    {
      nombre: 'Máscara LED Purga Neón Halloween Luminosa',
      slug: 'mascara-led-purga-neon-halloween',
      sku: 'HAL-001-PUR',
      precio: 8500,
      descripcion: 'Máscara plástica con cable LED de 3 modos de luz (fijo, parpadeo lento y rápido). Funciona con pilas AA.',
      imageUrl: 'https://images.unsplash.com/photo-1509557965875-b88c97052f0e?w=800&auto=format&fit=crop&q=80',
      stock: 65,
      categoriaId: catHalloween.id,
    },
    {
      nombre: 'Pack 4 Telarañas Gigantes con 16 Arañas Flúo',
      slug: 'pack-telaranas-gigantes-arana-fluo',
      sku: 'HAL-002-TEL',
      precio: 4200,
      descripcion: 'Telaraña sintética extensible cubre hasta 20m² para ambientación de vidrieras, casas y bares temáticos.',
      imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80',
      stock: 110,
      categoriaId: catHalloween.id,
    },
    {
      nombre: 'Calabaza Balde Naranja con Luz LED y Sonido Terror',
      slug: 'calabaza-balde-naranja-luz-led-terror',
      sku: 'HAL-003-CAL',
      precio: 6800,
      descripcion: 'Calabaza para recolección de dulces (Dulce o Truco) con iluminación LED interna multicolor.',
      imageUrl: 'https://images.unsplash.com/photo-1508361001413-7a9dca21d08a?w=800&auto=format&fit=crop&q=80',
      stock: 45,
      categoriaId: catHalloween.id,
    },

    // --- NAVIDAD & AÑO NUEVO ---
    {
      nombre: 'Pack 12 Gorros Papá Noel Felpa Suave con Pompón',
      slug: 'pack-12-gorros-papa-noel-felpa',
      sku: 'NAV-001-GOR',
      precio: 9600,
      descripcion: 'Gorros clásicos rojos de Papá Noel en felpa suave y borde blanco afelpado. Medida universal adultos y niños.',
      imageUrl: 'https://images.unsplash.com/photo-1543257580-7269da773bf5?w=800&auto=format&fit=crop&q=80',
      stock: 120,
      categoriaId: catNavidad.id,
    },
    {
      nombre: 'Cortina Luces MicroLED Cálidas 3x2 Metros USB',
      slug: 'cortina-luces-microled-calidas-navidad',
      sku: 'NAV-002-LUC',
      precio: 14500,
      descripcion: 'Cortina de 300 luces microLED con 8 efectos lumínicos programables y control remoto para vidrieras y fondos.',
      imageUrl: 'https://images.unsplash.com/photo-1512474932049-78ac69eed37c?w=800&auto=format&fit=crop&q=80',
      stock: 35,
      categoriaId: catNavidad.id,
    },
    {
      nombre: 'Kit Cotillón Año Nuevo Dorado & Negro Metalizado (20 Personas)',
      slug: 'kit-cotillon-ano-nuevo-dorado-negro',
      sku: 'NAV-003-FIN',
      precio: 26000,
      descripcion: 'Incluye 20 sombreros galera foil, 20 collares metalizados, 20 cornetas matracas y 1 cañón de confeti metalizado.',
      imageUrl: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800&auto=format&fit=crop&q=80',
      stock: 25,
      categoriaId: catNavidad.id,
    },

    // --- EGRESADOS & GRADUACIONES ---
    {
      nombre: 'Pack 4 Bengalas de Humo Colores Varios Egresados',
      slug: 'pack-4-bengalas-humo-colores-egresados',
      sku: 'EGR-001-HUM',
      precio: 8200,
      descripcion: 'Bengalas de humo denso y duradero (60 segundos). Ideales para sesiones fotográficas de egresados, UPD y eventos.',
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
      stock: 80,
      categoriaId: catEgresados.id,
    },
    {
      nombre: 'Birrete de Graduación Negro Clásico con Borla Dorada',
      slug: 'birrete-graduacion-negro-borla-dorada',
      sku: 'EGR-002-BIR',
      precio: 5400,
      descripcion: 'Sombrero birrete tradicional confeccionado en tela semi-rígida con borla colgante dorada de alta terminación.',
      imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
      stock: 140,
      categoriaId: catEgresados.id,
    },
    {
      nombre: 'Cañón Lanzador de Serpentinas Metálicas 60cm',
      slug: 'canon-lanzador-serpentinas-metalicas-60cm',
      sku: 'EGR-003-CAN',
      precio: 4900,
      descripcion: 'Disparo a base de aire comprimido (sin pólvora) que alcanza 8 metros de altura con lluvia de serpentinas metalizadas.',
      imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
      stock: 95,
      categoriaId: catEgresados.id,
    },

    // --- COMUNIONES & BAUTISMOS ---
    {
      nombre: 'Set Vajilla Descartable Blanco & Cruz Dorada (30 Personas)',
      slug: 'set-vajilla-blanco-cruz-dorada-comunion',
      sku: 'COM-001-VAJ',
      precio: 21500,
      descripcion: '30 platos principales de 23cm, 30 vasos de polipapel con filo dorado y 40 servilletas triple hoja con estampa cruz foil.',
      imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop&q=80',
      stock: 30,
      categoriaId: catComuniones.id,
    },
    {
      nombre: 'Pack 12 Ángeles de Porcelana Fría Centro de Mesa',
      slug: 'pack-angeles-porcelana-fria-centro-mesa',
      sku: 'COM-002-ANG',
      precio: 16800,
      descripcion: 'Souvenirs delicados pintados a mano con detalles nacarados y aureola dorada. 12 cm de altura.',
      imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
      stock: 40,
      categoriaId: catComuniones.id,
    },

    // --- SAN PATRICIO & TEMÁTICAS ---
    {
      nombre: 'Galera Verde San Patricio Glitter con Trébol Brillante',
      slug: 'galera-verde-san-patricio-glitter-trebol',
      sku: 'PAT-001-GAL',
      precio: 6500,
      descripcion: 'Sombrero copa galera cubierto en glitter verde esmeralda con cinta negra y hebilla dorada St. Patrick.',
      imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80',
      stock: 50,
      categoriaId: catSanPatricio.id,
    },
    {
      nombre: 'Pack 6 Boas de Plumas Verdes y Guirnalda Tréboles',
      slug: 'pack-boas-plumas-verdes-guirnalda-treboles',
      sku: 'PAT-002-BOA',
      precio: 12900,
      descripcion: 'Boas de plumas sintéticas tupidas de 1.80m de largo y guirnalda foil trébol de la suerte para tabernas y fiestas.',
      imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop&q=80',
      stock: 35,
      categoriaId: catSanPatricio.id,
    },

    // --- CUMPLEAÑOS & ANIVERSARIOS ---
    {
      nombre: 'Globo Número Gigante Metalizado Oro Rosa 80cm',
      slug: 'globo-numero-gigante-oro-rosa-80cm',
      sku: 'CUM-001-NUM',
      precio: 6200,
      descripcion: 'Globo metalizado gigante acabado brillante Oro Rosa de 80 cm. Válvula con autosellado para inflar con helio o aire.',
      imageUrl: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&auto=format&fit=crop&q=80',
      stock: 85,
      categoriaId: catCumpleanos.id,
    },
    {
      nombre: 'Kit Arco Orgánico 100 Globos Confeti & Dorado',
      slug: 'kit-arco-organico-100-globos-confeti-dorado',
      sku: 'CUM-002-ARC',
      precio: 16500,
      descripcion: 'Kit completo para armar arco de globos. Incluye cinta guía de 5 metros, puntos de pegamento y globos con confeti.',
      imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80',
      stock: 60,
      categoriaId: catCumpleanos.id,
    },
    {
      nombre: 'Pack 4 Velas Volcán para Torta con Chispas Frías Sin Humo',
      slug: 'pack-velas-volcan-chispas-frias-sin-humo',
      sku: 'CUM-003-VEL',
      precio: 5200,
      descripcion: 'Velas pirotécnicas de interior homologadas, con duración de 45 segundos y emisión de chispas doradas frías.',
      imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&auto=format&fit=crop&q=80',
      stock: 120,
      categoriaId: catCumpleanos.id,
    },

    // --- CARNAVAL CARIOCA ---
    {
      nombre: 'Combo 50 Artículos Carnaval Carioca Flúo Neón & LED',
      slug: 'combo-50-articulos-carnaval-carioca-fluo-led',
      sku: 'CAR-001-COM',
      precio: 29500,
      descripcion: 'Incluye 10 vinchas con luz LED, 10 anteojos flúo gigantes, 10 collares hawaianos, 10 silbatos y 10 maracas.',
      imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
      stock: 35,
      categoriaId: catCarnaval.id,
    },
    {
      nombre: 'Pack 12 Vinchas Orejas de Conejo Luminosas LED',
      slug: 'pack-12-vinchas-orejas-conejo-luminosas-led',
      sku: 'CAR-002-VIN',
      precio: 14800,
      descripcion: 'Vinchas con luces LED intermitentes de alta potencia en colores rosa, azul, amarillo y verde. Baterías incluidas.',
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
      stock: 70,
      categoriaId: catCarnaval.id,
    },
  ];

  for (const prod of products) {
    await prisma.product.create({ data: prod });
  }

  // Órdenes de prueba para el panel administrativo
  const order1 = await prisma.order.create({
    data: {
      nombre: 'Mariana Fernández',
      email: 'cliente@cotillon.com',
      direccion: 'Av. Santa Fe 2450, Piso 4 B',
      ciudad: 'CABA',
      estado: 'Buenos Aires',
      cp: '1425',
      telefono: '+54 9 11 4455-8899',
      destinatarioDocumento: '34.567.890',
      nota: 'Por favor entregar por la tarde después de las 14:00.',
      status: 'paid',
      metodoPago: 'transferencia',
      envio: 0,
      total: 26000,
      userId: clientUser.id,
      items: {
        create: [
          {
            productName: 'Kit Cotillón Año Nuevo Dorado & Negro Metalizado',
            cantidad: 1,
            precioUnitario: 26000,
          },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      nombre: 'Lucas Benítez Eventos',
      email: 'lucas.eventos@ejemplo.com',
      direccion: 'Mitre 780',
      ciudad: 'Rosario',
      estado: 'Santa Fe',
      cp: '2000',
      telefono: '+54 9 341 5566-7788',
      destinatarioDocumento: '30-71889900-4',
      nota: 'Factura A por favor. Transporte Expreso Rosario.',
      status: 'created',
      metodoPago: 'mercadopago',
      envio: 0,
      total: 37700,
      items: {
        create: [
          {
            productName: 'Combo 50 Artículos Carnaval Carioca Flúo Neón & LED',
            cantidad: 1,
            precioUnitario: 29500,
          },
          {
            productName: 'Pack 4 Bengalas de Humo Colores Varios Egresados',
            cantidad: 1,
            precioUnitario: 8200,
          },
        ],
      },
    },
  });

  console.log(`✅ Seed festivo completado con éxito:`);
  console.log(`- 7 Categorías de Festividades creadas`);
  console.log(`- ${products.length} Productos de Cotillón creados`);
  console.log(`- 2 Órdenes de prueba creadas`);
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
