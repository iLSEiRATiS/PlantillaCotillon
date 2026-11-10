const jwt = require('jsonwebtoken');
const prisma = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'plantilla_cotillon_super_secret_jwt_key_2026';

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ detail: 'No se proveyó token de autenticación.' });
  }

  const parts = authHeader.split(' ');
  const token = parts.length === 2 ? parts[1] : parts[0];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        isStaff: true,
        isSuperuser: true,
      },
    });

    if (!user) {
      return res.status(401).json({ detail: 'Usuario no encontrado o token inválido.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ detail: 'Token inválido o expirado.' });
  }
}

function requireAdmin(req, res, next) {
  authenticateToken(req, res, () => {
    if (!req.user || (!req.user.isStaff && !req.user.isSuperuser)) {
      return res.status(403).json({ detail: 'Acceso denegado: se requieren permisos de administrador.' });
    }
    next();
  });
}

module.exports = {
  authenticateToken,
  requireAdmin,
  JWT_SECRET,
};
