import 'dotenv/config';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.ts';

// Prisma singleton for serverless
let prisma: InstanceType<typeof PrismaClient>;

function getPrisma() {
  if (!prisma) {
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
  }
  return prisma;
}

// Helper to parse JSON body
async function parseBody(req: any): Promise<any> {
  if (req.body) return req.body;
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk: string) => { data += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(data)); } catch { resolve({}); }
    });
  });
}

// Helper to send JSON
function json(res: any, data: any, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

export default async function handler(req: any, res: any) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  const db = getPrisma();
  const url = req.url || '';
  const method = req.method || 'GET';

  try {
    // ===== HEALTH =====
    if (url === '/api/health') {
      return json(res, { status: 'ok', timestamp: new Date().toISOString() });
    }

    // ===== AUTH =====
    if (url === '/api/auth/login' && method === 'POST') {
      const { phone, password } = await parseBody(req);
      const user = await db.user.findUnique({ where: { phone } });
      if (!user || user.password !== password) {
        return json(res, { error: 'Incorrect phone or password' }, 401);
      }
      return json(res, user);
    }

    if (url === '/api/auth/register' && method === 'POST') {
      const { name, phone, password, role, coachName } = await parseBody(req);
      const exists = await db.user.findUnique({ where: { phone } });
      if (exists) return json(res, { error: 'Phone already registered' }, 400);
      const user = await db.user.create({
        data: { name, phone, password, role: role || 'customer', coachName: coachName || null },
      });
      return json(res, user, 201);
    }

    // ===== USERS =====
    if (url === '/api/users' && method === 'GET') {
      const users = await db.user.findMany({ orderBy: { id: 'asc' } });
      return json(res, users);
    }

    const userMatch = url.match(/^\/api\/users\/(\d+)$/);
    if (userMatch) {
      const id = Number(userMatch[1]);
      if (method === 'GET') {
        const user = await db.user.findUnique({ where: { id } });
        if (!user) return json(res, { error: 'User not found' }, 404);
        return json(res, user);
      }
      if (method === 'PUT') {
        const body = await parseBody(req);
        const user = await db.user.update({ where: { id }, data: body });
        return json(res, user);
      }
    }

    // ===== COACHES =====
    if (url.startsWith('/api/coaches') && !url.match(/\/api\/coaches\/\d+/)) {
      if (method === 'GET') {
        const active = new URL(url, 'http://x').searchParams.get('active');
        const where = active === 'true' ? { active: true } : {};
        const coaches = await db.coach.findMany({ where, orderBy: { id: 'asc' } });
        return json(res, coaches);
      }
      if (method === 'POST') {
        const body = await parseBody(req);
        const coach = await db.coach.create({ data: body });
        return json(res, coach, 201);
      }
    }

    const coachMatch = url.match(/^\/api\/coaches\/(\d+)$/);
    if (coachMatch) {
      const id = Number(coachMatch[1]);
      if (method === 'PUT') {
        const body = await parseBody(req);
        const coach = await db.coach.update({ where: { id }, data: body });
        return json(res, coach);
      }
      if (method === 'DELETE') {
        await db.coach.delete({ where: { id } });
        return json(res, { success: true });
      }
    }

    // ===== BAYS =====
    if (url.startsWith('/api/bays') && !url.match(/\/api\/bays\/\d+/)) {
      if (method === 'GET') {
        const active = new URL(url, 'http://x').searchParams.get('active');
        const where = active === 'true' ? { active: true } : {};
        const bays = await db.bay.findMany({ where, orderBy: { id: 'asc' } });
        return json(res, bays);
      }
      if (method === 'POST') {
        const body = await parseBody(req);
        const bay = await db.bay.create({ data: body });
        return json(res, bay, 201);
      }
    }

    const bayMatch = url.match(/^\/api\/bays\/(\d+)$/);
    if (bayMatch) {
      const id = Number(bayMatch[1]);
      if (method === 'PUT') {
        const body = await parseBody(req);
        const bay = await db.bay.update({ where: { id }, data: body });
        return json(res, bay);
      }
      if (method === 'DELETE') {
        await db.bay.delete({ where: { id } });
        return json(res, { success: true });
      }
    }

    // ===== BOOKINGS =====
    if (url.startsWith('/api/bookings') && !url.match(/\/api\/bookings\/\d+/)) {
      if (method === 'GET') {
        const params = new URL(url, 'http://x').searchParams;
        const where: any = {};
        if (params.get('date')) where.date = params.get('date');
        if (params.get('phone')) where.phone = params.get('phone');
        if (params.get('coachName')) where.coachName = params.get('coachName');
        if (params.get('status')) where.status = params.get('status');
        if (params.get('dateFrom') || params.get('dateTo')) {
          where.date = {};
          if (params.get('dateFrom')) where.date.gte = params.get('dateFrom');
          if (params.get('dateTo')) where.date.lte = params.get('dateTo');
        }
        const bookings = await db.booking.findMany({ where, orderBy: [{ date: 'desc' }, { time: 'asc' }] });
        return json(res, bookings);
      }
      if (method === 'POST') {
        const body = await parseBody(req);
        const booking = await db.booking.create({ data: body });
        return json(res, booking, 201);
      }
    }

    const bookingMatch = url.match(/^\/api\/bookings\/(\d+)$/);
    if (bookingMatch) {
      const id = Number(bookingMatch[1]);
      if (method === 'GET') {
        const booking = await db.booking.findUnique({ where: { id } });
        if (!booking) return json(res, { error: 'Booking not found' }, 404);
        return json(res, booking);
      }
      if (method === 'PUT') {
        const body = await parseBody(req);
        const booking = await db.booking.update({ where: { id }, data: body });
        return json(res, booking);
      }
      if (method === 'DELETE') {
        await db.booking.delete({ where: { id } });
        return json(res, { success: true });
      }
    }

    // ===== MEMBERS =====
    if (url.startsWith('/api/members') && !url.match(/\/api\/members\/.+/)) {
      if (method === 'GET') {
        const params = new URL(url, 'http://x').searchParams;
        const where: any = {};
        if (params.get('phone')) where.phone = params.get('phone');
        const members = await db.member.findMany({ where, orderBy: { id: 'asc' } });
        return json(res, members);
      }
      if (method === 'POST') {
        const body = await parseBody(req);
        try {
          const member = await db.member.create({ data: body });
          return json(res, member, 201);
        } catch (err: any) {
          if (err.code === 'P2002') return json(res, { error: 'Phone already exists' }, 400);
          throw err;
        }
      }
    }

    const memberMatch = url.match(/^\/api\/members\/(.+)$/);
    if (memberMatch) {
      const phone = decodeURIComponent(memberMatch[1]);
      if (method === 'GET') {
        const member = await db.member.findUnique({ where: { phone } });
        if (!member) return json(res, { error: 'Member not found' }, 404);
        return json(res, member);
      }
      if (method === 'PUT') {
        const body = await parseBody(req);
        const member = await db.member.update({ where: { phone }, data: body });
        return json(res, member);
      }
    }

    // ===== LESSON NOTES =====
    if (url.startsWith('/api/lesson-notes') && !url.match(/\/api\/lesson-notes\/\d+/)) {
      if (method === 'GET') {
        const params = new URL(url, 'http://x').searchParams;
        const where: any = {};
        if (params.get('customerPhone')) where.customerPhone = params.get('customerPhone');
        if (params.get('coachName')) where.coachName = params.get('coachName');
        if (params.get('bookingId')) where.bookingId = params.get('bookingId');
        const notes = await db.lessonNote.findMany({
          where,
          include: { attachments: true },
          orderBy: { lessonNumber: 'asc' },
        });
        return json(res, notes);
      }
      if (method === 'POST') {
        const { attachments, ...noteData } = await parseBody(req);
        const note = await db.lessonNote.create({
          data: {
            ...noteData,
            attachments: attachments?.length > 0 ? { create: attachments } : undefined,
          },
          include: { attachments: true },
        });
        return json(res, note, 201);
      }
    }

    const noteMatch = url.match(/^\/api\/lesson-notes\/(\d+)$/);
    if (noteMatch) {
      const id = Number(noteMatch[1]);
      if (method === 'GET') {
        const note = await db.lessonNote.findUnique({
          where: { id },
          include: { attachments: true },
        });
        if (!note) return json(res, { error: 'Note not found' }, 404);
        return json(res, note);
      }
      if (method === 'PUT') {
        const { attachments, ...noteData } = await parseBody(req);
        if (attachments) {
          await db.attachment.deleteMany({ where: { lessonNoteId: id } });
        }
        const note = await db.lessonNote.update({
          where: { id },
          data: {
            ...noteData,
            attachments: attachments?.length > 0 ? { create: attachments } : undefined,
          },
          include: { attachments: true },
        });
        return json(res, note);
      }
      if (method === 'DELETE') {
        await db.lessonNote.delete({ where: { id } });
        return json(res, { success: true });
      }
    }

    // ===== PACKAGES =====
    if (url.startsWith('/api/packages') && !url.match(/\/api\/packages\/.+/)) {
      if (method === 'GET') {
        const params = new URL(url, 'http://x').searchParams;
        const where: any = {};
        if (params.get('active') === 'true') where.active = true;
        if (params.get('machineType')) where.machineType = params.get('machineType');
        const packages = await db.package.findMany({ where, orderBy: { price: 'asc' } });
        return json(res, packages);
      }
      if (method === 'POST') {
        const body = await parseBody(req);
        const pkg = await db.package.create({ data: body });
        return json(res, pkg, 201);
      }
    }

    const pkgMatch = url.match(/^\/api\/packages\/(.+)$/);
    if (pkgMatch) {
      const id = pkgMatch[1];
      if (method === 'PUT') {
        const body = await parseBody(req);
        const pkg = await db.package.update({ where: { id }, data: body });
        return json(res, pkg);
      }
      if (method === 'DELETE') {
        await db.package.delete({ where: { id } });
        return json(res, { success: true });
      }
    }

    // ===== PROMO CODES =====
    if (url === '/api/promo-codes' && method === 'GET') {
      const promos = await db.promoCode.findMany({ orderBy: { id: 'asc' } });
      return json(res, promos);
    }

    if (url === '/api/promo-codes' && method === 'POST') {
      const body = await parseBody(req);
      try {
        const promo = await db.promoCode.create({ data: { ...body, code: body.code.toUpperCase() } });
        return json(res, promo, 201);
      } catch (err: any) {
        if (err.code === 'P2002') return json(res, { error: 'Code already exists' }, 400);
        throw err;
      }
    }

    const promoValidateMatch = url.match(/^\/api\/promo-codes\/validate\/(.+)$/);
    if (promoValidateMatch && method === 'GET') {
      const code = decodeURIComponent(promoValidateMatch[1]).toUpperCase();
      const promo = await db.promoCode.findUnique({ where: { code } });
      if (!promo || !promo.active) return json(res, { error: 'Invalid promo code' }, 404);
      if (promo.expiryDate && new Date(promo.expiryDate) < new Date()) {
        return json(res, { error: 'Promo code expired' }, 400);
      }
      return json(res, promo);
    }

    const promoMatch = url.match(/^\/api\/promo-codes\/(\d+)$/);
    if (promoMatch) {
      const id = Number(promoMatch[1]);
      if (method === 'PUT') {
        const body = await parseBody(req);
        const promo = await db.promoCode.update({ where: { id }, data: body });
        return json(res, promo);
      }
      if (method === 'DELETE') {
        await db.promoCode.delete({ where: { id } });
        return json(res, { success: true });
      }
    }

    // 404
    return json(res, { error: 'Not found' }, 404);

  } catch (err: any) {
    console.error('API Error:', err);
    return json(res, { error: 'Internal server error' }, 500);
  }
}
