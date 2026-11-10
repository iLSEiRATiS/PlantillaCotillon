const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const identifier = (email || username || '').trim();

    if (!identifier || !password) {
      return res.status(400).json({ detail: 'Por favor ingresa usuario/email y contraseña.' });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: identifier } },
          { username: { equals: identifier } },
        ],
      },
    });

    if (!user) {
      return res.status(400).json({ detail: 'Credenciales inválidas.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ detail: 'Credenciales inválidas.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      first_name: user.firstName,
      last_name: user.lastName,
      is_staff: user.isStaff,
      is_superuser: user.isSuperuser,
    };

    return res.json({
      token,
      access: token,
      refresh: token,
      user: safeUser,
    });
  } catch (error) {
    console.error('Error en /api/auth/login:', error);
    return res.status(500).json({ detail: 'Error interno del servidor.' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, username, password, first_name, last_name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ detail: 'El email y la contraseña son obligatorios.' });
    }

    const uname = (username || email.split('@')[0]).trim();

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.trim() }, { username: uname }],
      },
    });

    if (existing) {
      return res.status(400).json({ detail: 'Ya existe un usuario con ese email o nombre de usuario.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: email.trim(),
        username: uname,
        password: hashedPassword,
        firstName: first_name || '',
        lastName: last_name || '',
      },
    });

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      access: token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        first_name: user.firstName,
        last_name: user.lastName,
        is_staff: user.isStaff,
        is_superuser: user.isSuperuser,
      },
    });
  } catch (error) {
    console.error('Error en /api/auth/register:', error);
    return res.status(500).json({ detail: 'Error al registrar usuario.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  return res.json({
    id: req.user.id,
    email: req.user.email,
    username: req.user.username,
    first_name: req.user.firstName,
    last_name: req.user.lastName,
    is_staff: req.user.isStaff,
    is_superuser: req.user.isSuperuser,
  });
});

// Forgot / Reset password mocks for template
router.post('/forgot-password', (req, res) => {
  return res.json({ ok: true, detail: 'Si el correo existe, te hemos enviado las instrucciones para restablecer tu contraseña.' });
});

router.post('/reset-password', (req, res) => {
  return res.json({ ok: true, detail: 'Tu contraseña ha sido actualizada con éxito.' });
});

module.exports = router;
