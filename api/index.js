import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from '../server/routes/auth.js';
import usersRoutes from '../server/routes/users.js';
import coachesRoutes from '../server/routes/coaches.js';
import baysRoutes from '../server/routes/bays.js';
import bookingsRoutes from '../server/routes/bookings.js';
import membersRoutes from '../server/routes/members.js';
import lessonNotesRoutes from '../server/routes/lessonNotes.js';
import packagesRoutes from '../server/routes/packages.js';
import promoCodesRoutes from '../server/routes/promoCodes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/coaches', coachesRoutes);
app.use('/api/bays', baysRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/lesson-notes', lessonNotesRoutes);
app.use('/api/packages', packagesRoutes);
app.use('/api/promo-codes', promoCodesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
