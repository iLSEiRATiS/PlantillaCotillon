const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando seed de datos para PlantillaCotillón ---');

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
      firstName: 'Admin',
      lastName: 'Plantilla',
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
      firstName: 'Lucas',
      lastName: 'Gómez',
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
      maintenanceMessage: 'Volvemos en breves minutos.',
    },
  });

  // Categorías de Cotillón
  const catGlobos = await prisma.category.create({
    data: {
      nombre: 'Globos & Arreglos',
      slug: 'globos-arreglos',
      descripcion: 'Globos látex, perlados, números gigantes y bouquets monocromáticos para ambientación.',
    },
  });

  const catVajilla = await prisma.category.create({
    data: {
      nombre: 'Vajilla & Deco de Mesa',
      slug: 'vajilla-deco-mesa',
      descripcion: 'Vasos, platos de polipapel, servilletas y mantelería en tonalidades blanco, negro y plata.',
    },
  });

  const catVelas = await prisma.category.create({
    data: {
      nombre: 'Velas & Bengalas',
      slug: 'velas-bengalas',
      descripcion: 'Velas de número, chispas de bengala, fuentes frías y toppers modernos.',
    },
  });

  const catGuirnaldas = await prisma.category.create({
    data: {
      nombre: 'Guirnaldas & Banners',
      slug: 'guirnaldas-banners',
      descripcion: 'Banderines, borlas, flecos metalizados y fondos de photocall minimalistas.',
    },
  });

  const catAccesorios = await prisma.category.create({
    data: {
      nombre: 'Accesorios & Props',
      slug: 'accesorios-props',
      descripcion: 'Antifaces, gafas divertidas, vinchas temáticas y sombreros de fiesta.',
    },
  });

  // Productos de prueba con estética monocromática
  const products = [
    {
      nombre: 'Pack 50 Globos Látex Negro Mate 12"',
      slug: 'pack-50-globos-latex-negro-mate',
      sku: 'GLO-001-BLK',
      precio: 8500,
      descripcion: 'Set de 50 globos de látex de alta resistencia acabado negro mate. Aptos para inflar con aire o helio.',
      imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop&q=80',
      stock: 120,
      categoriaId: catGlobos.id,
    },
    {
      nombre: 'Bouquet Globos Metalizados Plata & Cromo',
      slug: 'bouquet-globos-metalizados-plata-cromo',
      sku: 'GLO-002-SLV',
      precio: 14200,
      descripcion: 'Kit de 10 globos combinados: 4 cromo plata, 3 confeti gris humo y 3 negros perlados.',
      imageUrl: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&auto=format&fit=crop&q=80',
      stock: 45,
      categoriaId: catGlobos.id,
    },
    {
      nombre: 'Globo Número Gigante 80cm - Black Foil',
      slug: 'globo-numero-gigante-80cm-black-foil',
      sku: 'GLO-003-NUM',
      precio: 6500,
      descripcion: 'Globo de lámina metálica en color negro azabache de 80 cm de alto. Válvula de autosellado.',
      imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80',
      stock: 80,
      categoriaId: catGlobos.id,
    },
    {
      nombre: 'Set Vajilla Polipapel Black & White (16 personas)',
      slug: 'set-vajilla-polipapel-black-white',
      sku: 'VAJ-001-BW',
      precio: 18900,
      descripcion: 'Incluye 16 platos grandes, 16 vasos térmicos y 20 servilletas de triple hoja con diseño geométrico sobrio.',
      imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&auto=format&fit=crop&q=80',
      stock: 30,
      categoriaId: catVajilla.id,
    },
    {
      nombre: 'Mantel Plástico Descartable Negro Grafito 1.40x2.50m',
      slug: 'mantel-plastico-descartable-negro-grafito',
      sku: 'VAJ-002-MNT',
      precio: 4200,
      descripcion: 'Mantel impermeable extra grueso para mesas principales o de candy bar. Reutilizable o descartable.',
      imageUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&auto=format&fit=crop&q=80',
      stock: 95,
      categoriaId: catVajilla.id,
    },
    {
      nombre: 'Bengalas de Humo Blanco para Fotografía (x4)',
      slug: 'bengalas-humo-blanco-fotografia',
      sku: 'VEL-001-HUM',
      precio: 12500,
      descripcion: 'Tubos de efecto humo denso blanco puro. Duración aproximada: 60 segundos continuos. Ideal eventos diurnos.',
      imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
      stock: 50,
      categoriaId: catVelas.id,
    },
    {
      nombre: 'Pack 12 Velas Estilizadas Charcoal Grey 25cm',
      slug: 'pack-12-velas-estilizadas-charcoal-grey',
      sku: 'VEL-002-CHG',
      precio: 9800,
      descripcion: 'Velas cónicas sin goteo color gris carbón. Tiempo de quemado aproximado: 7 horas por unidad.',
      imageUrl: 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b8?w=800&auto=format&fit=crop&q=80',
      stock: 65,
      categoriaId: catVelas.id,
    },
    {
      nombre: 'Cortina Metalizada Fondo de Photocall Negro / Plata',
      slug: 'cortina-metalizada-photocall-negro-plata',
      sku: 'GUI-001-COR',
      precio: 5600,
      descripcion: 'Cortina de flecos brillantes de 1 metro de ancho por 2 metros de alto. Autoadhesiva en la parte superior.',
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
      stock: 110,
      categoriaId: catGuirnaldas.id,
    },
    {
      nombre: 'Banderines Tipográficos "CELEBRATE" Minimalistas',
      slug: 'banderines-tipograficos-celebrate-minimalistas',
      sku: 'GUI-002-BAN',
      precio: 4900,
      descripcion: 'Guirnalda en cartulina texturada blanca con tipografía sans-serif negra e hilo encerado de 3 metros.',
      imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80',
      stock: 75,
      categoriaId: catGuirnaldas.id,
    },
    {
      nombre: 'Kit 20 Props y Gafas Photocall Monocromo',
      slug: 'kit-20-props-gafas-photocall-monocromo',
      sku: 'ACC-001-PRP',
      precio: 7800,
      descripcion: 'Accesorios rígidos con palillo para fotos divertidas: bigotes, gafas estilo aviador, corbatas y sombreros.',
      imageUrl: 'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=800&auto=format&fit=crop&q=80',
      stock: 60,
      categoriaId: catAccesorios.id,
    },
  ];

  for (const item of products) {
    await prisma.product.create({
      data: item,
    });
  }

  console.log(`✅ Seed completado con éxito:`);
  console.log(`- 2 usuarios creados (admin@cotillon.com, cliente@cotillon.com)`);
  console.log(`- 5 categorías creadas`);
  console.log(`- ${products.length} productos monocromáticos cargados`);
}

main()
  .catch((e) => {
    console.error('Error ejecutando seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
