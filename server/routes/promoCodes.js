import { Router } from 'express';
import prisma from '../prisma.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const promos = await prisma.promoCode.findMany({ orderBy: { id: 'asc' } });
    res.json(promos);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/validate/:code', async (req, res) => {
  try {
    const promo = await prisma.promoCode.findUnique({ where: { code: req.params.code.toUpperCase() } });
    if (!promo || !promo.active) return res.status(404).json({ error: 'Invalid promo code' });
    if (promo.expiryDate && new Date(promo.expiryDate) < new Date()) {
      return res.status(400).json({ error: 'Promo code expired' });
    }
    res.json(promo);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const promo = await prisma.promoCode.create({ data: { ...req.body, code: req.body.code.toUpperCase() } });
    res.status(201).json(promo);
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Code already exists' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const promo = await prisma.promoCode.update({ where: { id: Number(req.params.id) }, data: req.body });
    res.json(promo);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.promoCode.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
