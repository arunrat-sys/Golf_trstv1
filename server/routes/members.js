import { Router } from 'express';
import prisma from '../prisma.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const where = {};
    if (req.query.phone) where.phone = req.query.phone;
    const members = await prisma.member.findMany({ where, orderBy: { id: 'asc' } });
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:phone', async (req, res) => {
  try {
    const member = await prisma.member.findUnique({ where: { phone: req.params.phone } });
    if (!member) return res.status(404).json({ error: 'Member not found' });
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const member = await prisma.member.create({ data: req.body });
    res.status(201).json(member);
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Phone already exists' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:phone', async (req, res) => {
  try {
    const member = await prisma.member.update({
      where: { phone: req.params.phone },
      data: req.body,
    });
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
