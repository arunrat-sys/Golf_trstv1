import { Router } from 'express';
import prisma from '../prisma.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Incorrect phone or password' });
    }
    res.json(user);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, phone, password, role, coachName, nickname, birthdate } = req.body;
    const exists = await prisma.user.findUnique({ where: { phone } });
    if (exists) return res.status(400).json({ error: 'Phone already registered' });

    const user = await prisma.user.create({
      data: { name, phone, password, role: role || 'customer', coachName: coachName || null, nickname: nickname || null, birthdate: birthdate || null },
    });
    res.status(201).json(user);
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
