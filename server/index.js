import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import coachesRoutes from './routes/coaches.js';
import baysRoutes from './routes/bays.js';
import bookingsRoutes from './routes/bookings.js';
import membersRoutes from './routes/members.js';
import lessonNotesRoutes from './routes/lessonNotes.js';
import packagesRoutes from './routes/packages.js';
import promoCodesRoutes from './routes/promoCodes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
}));
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

app.listen(PORT, () => {
  console.log(`🏌️ Golf API server running on port ${PORT}`);
});
