# 🖤 PlantillaCotillón

Plantilla de comercio electrónico moderna, minimalista y de alto rendimiento orientada a tiendas de cotillón, eventos y artículos festivos.

---

## 🎨 Características de Diseño
- **Paleta Monocromática:** Diseño contemporáneo en escala de negros (`#0a0a0a`), blancos (`#ffffff`) y grises grafito (`#1c1c1c`, `#262626`, `#a3a3a3`).
- **Sección "¿Cómo comprar?":** Guía explicativa interactiva en 4 pasos (explorar catálogo, agregar al carrito, completar checkout, entrega y tracking) con sección de Preguntas Frecuentes (FAQ).
- **Catálogo Completo:** Filtros por categorías, búsqueda en tiempo real con sugerencias flotantes, ordenamiento por precio y nombre.
- **Carrito y Checkout Dinámico:** Proceso de compra claro con control de montos mínimos de pedido configurables.
- **Identidad Visual:** Logo e iconografía geométrica en SVG.

---

## 🚀 Arquitectura Técnica

Arquitectura completamente desacoplada en Node.js, eliminando Django y permitiendo una ejecución nativa, ligera y altamente concurrente:

* **Frontend:** React 18 + Vite SPA, React-Bootstrap, React Router DOM, React Icons.
* **Backend:** Node.js + Express 5, Prisma ORM 6, JWT, Bcrypt.
* **Base de datos:**
  - **Local:** SQLite (`dev.db` generado automáticamente con `prisma db push` sin instalar nada extra).
  - **VPS / Producción:** PostgreSQL listo para concurrencia masiva sin bloqueos mediante `DATABASE_URL` y `schema.postgresql.prisma`.

---

## 📂 Estructura del Proyecto

```text
PlantillaCotillón/
├── backend/                     # API REST nativa en Node.js + Express + Prisma
│   ├── prisma/
│   │   ├── schema.prisma        # Schema activo (SQLite local)
│   │   ├── schema.postgresql.prisma # Schema preparado para PostgreSQL en VPS
│   │   └── seed.js              # Datos de prueba (usuarios, categorías, productos)
│   ├── src/
│   │   ├── middleware/          # Autenticación JWT y roles
│   │   ├── routes/              # Auth, Productos, Categorías, Pedidos, Admin, Config
│   │   ├── db.js                # Singleton de Prisma Client
│   │   └── server.js            # Punto de entrada Express (puerto 8000)
│   ├── .env                     # Variables de entorno locales
│   └── package.json
│
├── frontend/                    # SPA React + Vite
│   ├── src/
│   │   ├── assets/              # Logo SVG monocromático y recursos
│   │   ├── components/          # Header, Footer, ProductCard, CarritoOffcanvas, etc.
│   │   ├── pages/               # Home, Productos, ComoComprar, Carrito, Checkout, etc.
│   │   ├── routes/              # Router con lazy-loading
│   │   └── App.css              # Estilos monocromáticos globales
│   ├── .env                     # VITE_API_URL=http://127.0.0.1:8000
│   └── package.json
│
└── _legacy_django_reference/    # Código Django original preservado como referencia
```

---

## 💻 Inicio Rápido en Local

### 1. Iniciar el Backend (Node.js)
```bash
cd backend
npm install
npm run seed     # Puebla la base de datos con categorías y productos de muestra
npm run dev      # Corre en http://localhost:8000
```

### 2. Iniciar el Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev      # Corre en http://localhost:5173
```

---

## 🔑 Credenciales de Prueba (Seed)

| Rol | Email | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | `admin@cotillon.com` | `admin123` |
| **Cliente** | `cliente@cotillon.com` | `cliente123` |

---

## 🌐 Despliegue en VPS (PostgreSQL)

Para migrar la base de datos al PostgreSQL del VPS:

1. Instala PostgreSQL en tu servidor VPS y crea la base de datos:
   ```bash
   sudo -u postgres psql -c "CREATE DATABASE plantillacotillon;"
   ```
2. En `backend/.env` configura la URL de conexión:
   ```env
   DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/plantillacotillon?schema=public"
   ```
3. Ejecuta la sincronización con el schema de PostgreSQL:
   ```bash
   npm run db:vps
   npm run seed
   ```
4. Inicia el backend con PM2:
   ```bash
   pm2 start src/server.js --name "cotillon-api"
   ```
