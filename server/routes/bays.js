import { Router } from 'express';
import prisma from '../prisma.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const where = req.query.active === 'true' ? { active: true } : {};
    const bays = await prisma.bay.findMany({ where, orderBy: { id: 'asc' } });
    res.json(bays);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const bay = await prisma.bay.create({ data: req.body });
    res.status(201).json(bay);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const bay = await prisma.bay.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    });
    res.json(bay);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.bay.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
