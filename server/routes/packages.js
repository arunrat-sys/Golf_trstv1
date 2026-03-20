import { Router } from 'express';
import prisma from '../prisma.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const where = {};
    if (req.query.active === 'true') where.active = true;
    if (req.query.machineType) where.machineType = req.query.machineType;
    const packages = await prisma.package.findMany({ where, orderBy: { price: 'asc' } });
    res.json(packages);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const pkg = await prisma.package.create({ data: req.body });
    res.status(201).json(pkg);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const pkg = await prisma.package.update({ where: { id: req.params.id }, data: req.body });
    res.json(pkg);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.package.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
