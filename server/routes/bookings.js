import { Router } from 'express';
import prisma from '../prisma.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const where = {};
    if (req.query.date) where.date = req.query.date;
    if (req.query.phone) where.phone = req.query.phone;
    if (req.query.coachName) where.coachName = req.query.coachName;
    if (req.query.status) where.status = req.query.status;
    if (req.query.dateFrom || req.query.dateTo) {
      where.date = {};
      if (req.query.dateFrom) where.date.gte = req.query.dateFrom;
      if (req.query.dateTo) where.date.lte = req.query.dateTo;
    }
    const bookings = await prisma.booking.findMany({ where, orderBy: [{ date: 'desc' }, { time: 'asc' }] });
    res.json(bookings);
  } catch (err) {
    console.error('GET bookings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: Number(req.params.id) } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const booking = await prisma.booking.create({ data: req.body });
    res.status(201).json(booking);
  } catch (err) {
    console.error('POST booking error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const booking = await prisma.booking.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.booking.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
