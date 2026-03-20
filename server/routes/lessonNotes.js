import { Router } from 'express';
import prisma from '../prisma.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const where = {};
    if (req.query.customerPhone) where.customerPhone = req.query.customerPhone;
    if (req.query.coachName) where.coachName = req.query.coachName;
    if (req.query.bookingId) where.bookingId = req.query.bookingId;
    const notes = await prisma.lessonNote.findMany({
      where,
      include: { attachments: true },
      orderBy: { lessonNumber: 'asc' },
    });
    res.json(notes);
  } catch (err) {
    console.error('GET lesson-notes error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const note = await prisma.lessonNote.findUnique({
      where: { id: Number(req.params.id) },
      include: { attachments: true },
    });
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { attachments, ...noteData } = req.body;
    const note = await prisma.lessonNote.create({
      data: {
        ...noteData,
        attachments: attachments?.length > 0 ? { create: attachments } : undefined,
      },
      include: { attachments: true },
    });
    res.status(201).json(note);
  } catch (err) {
    console.error('POST lesson-note error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { attachments, ...noteData } = req.body;
    // Delete old attachments and recreate
    if (attachments) {
      await prisma.attachment.deleteMany({ where: { lessonNoteId: Number(req.params.id) } });
    }
    const note = await prisma.lessonNote.update({
      where: { id: Number(req.params.id) },
      data: {
        ...noteData,
        attachments: attachments?.length > 0 ? { create: attachments } : undefined,
      },
      include: { attachments: true },
    });
    res.json(note);
  } catch (err) {
    console.error('PUT lesson-note error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.lessonNote.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
