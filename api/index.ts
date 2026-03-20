import pg from 'pg';

let pool: InstanceType<typeof pg.Pool>;

function getPool() {
  if (!pool) {
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

async function query(sql: string, params: any[] = []) {
  const result = await getPool().query(sql, params);
  return result.rows;
}

async function queryOne(sql: string, params: any[] = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

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
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  const url = req.url || '';
  const method = req.method || 'GET';
  const params = new URL(url, 'http://x').searchParams;

  try {
    // ===== HEALTH =====
    if (url === '/api/health') {
      return json(res, { status: 'ok', timestamp: new Date().toISOString() });
    }

    // ===== AUTH =====
    if (url === '/api/auth/login' && method === 'POST') {
      const { phone, password } = await parseBody(req);
      const user = await queryOne('SELECT * FROM "User" WHERE phone = $1', [phone]);
      if (!user || user.password !== password) {
        return json(res, { error: 'Incorrect phone or password' }, 401);
      }
      return json(res, user);
    }

    if (url === '/api/auth/register' && method === 'POST') {
      const { name, phone, password, role, coachName } = await parseBody(req);
      const exists = await queryOne('SELECT id FROM "User" WHERE phone = $1', [phone]);
      if (exists) return json(res, { error: 'Phone already registered' }, 400);
      const user = await queryOne(
        'INSERT INTO "User" (name, phone, password, role, "coachName") VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, phone, password, role || 'customer', coachName || null]
      );
      return json(res, user, 201);
    }

    // ===== USERS =====
    if (url === '/api/users' && method === 'GET') {
      const users = await query('SELECT * FROM "User" ORDER BY id ASC');
      return json(res, users);
    }

    const userMatch = url.match(/^\/api\/users\/(\d+)$/);
    if (userMatch) {
      const id = Number(userMatch[1]);
      if (method === 'GET') {
        const user = await queryOne('SELECT * FROM "User" WHERE id = $1', [id]);
        if (!user) return json(res, { error: 'User not found' }, 404);
        return json(res, user);
      }
      if (method === 'PUT') {
        const body = await parseBody(req);
        const sets: string[] = [];
        const vals: any[] = [];
        let i = 1;
        for (const [k, v] of Object.entries(body)) {
          sets.push(`"${k}" = $${i}`);
          vals.push(v);
          i++;
        }
        vals.push(id);
        const user = await queryOne(`UPDATE "User" SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
        return json(res, user);
      }
    }

    // ===== COACHES =====
    if (url.startsWith('/api/coaches') && !url.match(/\/api\/coaches\/\d+/)) {
      if (method === 'GET') {
        const active = params.get('active');
        const where = active === 'true' ? 'WHERE active = true' : '';
        const coaches = await query(`SELECT * FROM "Coach" ${where} ORDER BY id ASC`);
        return json(res, coaches);
      }
      if (method === 'POST') {
        const b = await parseBody(req);
        const coach = await queryOne(
          'INSERT INTO "Coach" (name, price, education, expertise, bio, avatar, active) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
          [b.name, b.price || 1500, b.education || null, b.expertise || null, b.bio || null, b.avatar || null, b.active !== false]
        );
        return json(res, coach, 201);
      }
    }

    const coachMatch = url.match(/^\/api\/coaches\/(\d+)$/);
    if (coachMatch) {
      const id = Number(coachMatch[1]);
      if (method === 'PUT') {
        const body = await parseBody(req);
        const sets: string[] = []; const vals: any[] = []; let i = 1;
        for (const [k, v] of Object.entries(body)) { sets.push(`"${k}" = $${i}`); vals.push(v); i++; }
        vals.push(id);
        const coach = await queryOne(`UPDATE "Coach" SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
        return json(res, coach);
      }
      if (method === 'DELETE') {
        await query('DELETE FROM "Coach" WHERE id = $1', [id]);
        return json(res, { success: true });
      }
    }

    // ===== BAYS =====
    if (url.startsWith('/api/bays') && !url.match(/\/api\/bays\/\d+/)) {
      if (method === 'GET') {
        const active = params.get('active');
        const where = active === 'true' ? 'WHERE active = true' : '';
        const bays = await query(`SELECT * FROM "Bay" ${where} ORDER BY id ASC`);
        return json(res, bays);
      }
      if (method === 'POST') {
        const b = await parseBody(req);
        const bay = await queryOne(
          'INSERT INTO "Bay" (name, type, price, active) VALUES ($1,$2,$3,$4) RETURNING *',
          [b.name, b.type || null, b.price || 1000, b.active !== false]
        );
        return json(res, bay, 201);
      }
    }

    const bayMatch = url.match(/^\/api\/bays\/(\d+)$/);
    if (bayMatch) {
      const id = Number(bayMatch[1]);
      if (method === 'PUT') {
        const body = await parseBody(req);
        const sets: string[] = []; const vals: any[] = []; let i = 1;
        for (const [k, v] of Object.entries(body)) { sets.push(`"${k}" = $${i}`); vals.push(v); i++; }
        vals.push(id);
        const bay = await queryOne(`UPDATE "Bay" SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
        return json(res, bay);
      }
      if (method === 'DELETE') {
        await query('DELETE FROM "Bay" WHERE id = $1', [id]);
        return json(res, { success: true });
      }
    }

    // ===== BOOKINGS =====
    if (url.startsWith('/api/bookings') && !url.match(/\/api\/bookings\/\d+/)) {
      if (method === 'GET') {
        const conditions: string[] = [];
        const vals: any[] = [];
        let i = 1;
        if (params.get('date')) { conditions.push(`date = $${i}`); vals.push(params.get('date')); i++; }
        if (params.get('phone')) { conditions.push(`phone = $${i}`); vals.push(params.get('phone')); i++; }
        if (params.get('coachName')) { conditions.push(`"coachName" = $${i}`); vals.push(params.get('coachName')); i++; }
        if (params.get('status')) { conditions.push(`status = $${i}`); vals.push(params.get('status')); i++; }
        if (params.get('dateFrom')) { conditions.push(`date >= $${i}`); vals.push(params.get('dateFrom')); i++; }
        if (params.get('dateTo')) { conditions.push(`date <= $${i}`); vals.push(params.get('dateTo')); i++; }
        const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
        const bookings = await query(`SELECT * FROM "Booking" ${where} ORDER BY date DESC, time ASC`, vals);
        return json(res, bookings);
      }
      if (method === 'POST') {
        const b = await parseBody(req);
        const booking = await queryOne(
          `INSERT INTO "Booking" (date, machine, time, "customerName", phone, email, "lineId", "withCoach", "coachName", status, price, discount, "usedQuota")
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
          [b.date, b.machine, b.time, b.customerName, b.phone, b.email||null, b.lineId||null,
           b.withCoach||false, b.coachName||null, b.status||'booked', b.price||0, b.discount||0, b.usedQuota||false]
        );
        return json(res, booking, 201);
      }
    }

    const bookingMatch = url.match(/^\/api\/bookings\/(\d+)$/);
    if (bookingMatch) {
      const id = Number(bookingMatch[1]);
      if (method === 'GET') {
        const booking = await queryOne('SELECT * FROM "Booking" WHERE id = $1', [id]);
        if (!booking) return json(res, { error: 'Booking not found' }, 404);
        return json(res, booking);
      }
      if (method === 'PUT') {
        const body = await parseBody(req);
        const sets: string[] = []; const vals: any[] = []; let i = 1;
        for (const [k, v] of Object.entries(body)) { sets.push(`"${k}" = $${i}`); vals.push(v); i++; }
        vals.push(id);
        const booking = await queryOne(`UPDATE "Booking" SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
        return json(res, booking);
      }
      if (method === 'DELETE') {
        await query('DELETE FROM "Booking" WHERE id = $1', [id]);
        return json(res, { success: true });
      }
    }

    // ===== MEMBERS =====
    if (url.startsWith('/api/members') && !url.match(/\/api\/members\/.+/)) {
      if (method === 'GET') {
        const phone = params.get('phone');
        if (phone) {
          const members = await query('SELECT * FROM "Member" WHERE phone = $1 ORDER BY id ASC', [phone]);
          return json(res, members);
        }
        const members = await query('SELECT * FROM "Member" ORDER BY id ASC');
        return json(res, members);
      }
      if (method === 'POST') {
        const b = await parseBody(req);
        try {
          const member = await queryOne(
            `INSERT INTO "Member" (phone, name, "lineId", email, "trackmanHours", "trackmanBought", "trackmanCoach", "foresightHours", "foresightBought", "foresightCoach")
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
            [b.phone, b.name, b.lineId||null, b.email||null, b.trackmanHours||0, b.trackmanBought||0, b.trackmanCoach||null, b.foresightHours||0, b.foresightBought||0, b.foresightCoach||null]
          );
          return json(res, member, 201);
        } catch (err: any) {
          if (err.code === '23505') return json(res, { error: 'Phone already exists' }, 400);
          throw err;
        }
      }
    }

    const memberMatch = url.match(/^\/api\/members\/([^/]+)$/);
    if (memberMatch) {
      const phone = decodeURIComponent(memberMatch[1]);
      if (method === 'GET') {
        const member = await queryOne('SELECT * FROM "Member" WHERE phone = $1', [phone]);
        if (!member) return json(res, { error: 'Member not found' }, 404);
        return json(res, member);
      }
      if (method === 'PUT') {
        const body = await parseBody(req);
        const sets: string[] = []; const vals: any[] = []; let i = 1;
        for (const [k, v] of Object.entries(body)) { sets.push(`"${k}" = $${i}`); vals.push(v); i++; }
        vals.push(phone);
        const member = await queryOne(`UPDATE "Member" SET ${sets.join(', ')} WHERE phone = $${i} RETURNING *`, vals);
        return json(res, member);
      }
    }

    // ===== LESSON NOTES =====
    if (url.startsWith('/api/lesson-notes') && !url.match(/\/api\/lesson-notes\/\d+/)) {
      if (method === 'GET') {
        const conditions: string[] = [];
        const vals: any[] = [];
        let i = 1;
        if (params.get('customerPhone')) { conditions.push(`ln."customerPhone" = $${i}`); vals.push(params.get('customerPhone')); i++; }
        if (params.get('coachName')) { conditions.push(`ln."coachName" = $${i}`); vals.push(params.get('coachName')); i++; }
        if (params.get('bookingId')) { conditions.push(`ln."bookingId" = $${i}`); vals.push(params.get('bookingId')); i++; }
        const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
        const notes = await query(
          `SELECT ln.*, COALESCE(json_agg(a.*) FILTER (WHERE a.id IS NOT NULL), '[]') as attachments
           FROM "LessonNote" ln LEFT JOIN "Attachment" a ON a."lessonNoteId" = ln.id
           ${where} GROUP BY ln.id ORDER BY ln."lessonNumber" ASC`, vals
        );
        return json(res, notes);
      }
      if (method === 'POST') {
        const { attachments, ...nd } = await parseBody(req);
        const note = await queryOne(
          `INSERT INTO "LessonNote" ("bookingId", "coachName", "customerPhone", "customerName", date, "lessonNumber", topic, homework, notes, "updatedAt")
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, NOW()) RETURNING *`,
          [nd.bookingId, nd.coachName, nd.customerPhone, nd.customerName, nd.date, nd.lessonNumber, nd.topic||null, nd.homework||null, nd.notes||null]
        );
        if (attachments?.length > 0) {
          for (const att of attachments) {
            await query('INSERT INTO "Attachment" (name, type, "dataUrl", "lessonNoteId") VALUES ($1,$2,$3,$4)', [att.name, att.type, att.dataUrl, note.id]);
          }
        }
        const atts = await query('SELECT * FROM "Attachment" WHERE "lessonNoteId" = $1', [note.id]);
        return json(res, { ...note, attachments: atts }, 201);
      }
    }

    const noteMatch = url.match(/^\/api\/lesson-notes\/(\d+)$/);
    if (noteMatch) {
      const id = Number(noteMatch[1]);
      if (method === 'GET') {
        const note = await queryOne('SELECT * FROM "LessonNote" WHERE id = $1', [id]);
        if (!note) return json(res, { error: 'Note not found' }, 404);
        const atts = await query('SELECT * FROM "Attachment" WHERE "lessonNoteId" = $1', [id]);
        return json(res, { ...note, attachments: atts });
      }
      if (method === 'PUT') {
        const { attachments, ...nd } = await parseBody(req);
        const sets: string[] = []; const vals: any[] = []; let i = 1;
        for (const [k, v] of Object.entries(nd)) { sets.push(`"${k}" = $${i}`); vals.push(v); i++; }
        sets.push(`"updatedAt" = NOW()`);
        vals.push(id);
        const note = await queryOne(`UPDATE "LessonNote" SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
        if (attachments) {
          await query('DELETE FROM "Attachment" WHERE "lessonNoteId" = $1', [id]);
          for (const att of attachments) {
            await query('INSERT INTO "Attachment" (name, type, "dataUrl", "lessonNoteId") VALUES ($1,$2,$3,$4)', [att.name, att.type, att.dataUrl, id]);
          }
        }
        const atts = await query('SELECT * FROM "Attachment" WHERE "lessonNoteId" = $1', [id]);
        return json(res, { ...note, attachments: atts });
      }
      if (method === 'DELETE') {
        await query('DELETE FROM "LessonNote" WHERE id = $1', [id]);
        return json(res, { success: true });
      }
    }

    // ===== PACKAGES =====
    if (url.startsWith('/api/packages') && !url.match(/\/api\/packages\/.+/)) {
      if (method === 'GET') {
        const conditions: string[] = [];
        const vals: any[] = [];
        let i = 1;
        if (params.get('active') === 'true') { conditions.push(`active = true`); }
        if (params.get('machineType')) { conditions.push(`"machineType" = $${i}`); vals.push(params.get('machineType')); i++; }
        const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
        const packages = await query(`SELECT * FROM "Package" ${where} ORDER BY price ASC`, vals);
        return json(res, packages);
      }
      if (method === 'POST') {
        const b = await parseBody(req);
        const pkg = await queryOne(
          `INSERT INTO "Package" (id, name, hours, price, "machineType", highlight, save, "desc", active)
           VALUES (gen_random_uuid()::text, $1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
          [b.name, b.hours, b.price, b.machineType, b.highlight||false, b.save||null, b.desc||null, b.active!==false]
        );
        return json(res, pkg, 201);
      }
    }

    const pkgMatch = url.match(/^\/api\/packages\/([^/]+)$/);
    if (pkgMatch) {
      const id = pkgMatch[1];
      if (method === 'PUT') {
        const body = await parseBody(req);
        const sets: string[] = []; const vals: any[] = []; let i = 1;
        for (const [k, v] of Object.entries(body)) { sets.push(`"${k}" = $${i}`); vals.push(v); i++; }
        vals.push(id);
        const pkg = await queryOne(`UPDATE "Package" SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
        return json(res, pkg);
      }
      if (method === 'DELETE') {
        await query('DELETE FROM "Package" WHERE id = $1', [id]);
        return json(res, { success: true });
      }
    }

    // ===== PROMO CODES =====
    if (url === '/api/promo-codes' && method === 'GET') {
      const promos = await query('SELECT * FROM "PromoCode" ORDER BY id ASC');
      return json(res, promos);
    }

    if (url === '/api/promo-codes' && method === 'POST') {
      const b = await parseBody(req);
      try {
        const promo = await queryOne(
          'INSERT INTO "PromoCode" (code, type, value, active, "expiryDate") VALUES ($1,$2,$3,$4,$5) RETURNING *',
          [b.code.toUpperCase(), b.type, b.value, b.active!==false, b.expiryDate||null]
        );
        return json(res, promo, 201);
      } catch (err: any) {
        if (err.code === '23505') return json(res, { error: 'Code already exists' }, 400);
        throw err;
      }
    }

    const promoValidateMatch = url.match(/^\/api\/promo-codes\/validate\/(.+)$/);
    if (promoValidateMatch && method === 'GET') {
      const code = decodeURIComponent(promoValidateMatch[1]).toUpperCase();
      const promo = await queryOne('SELECT * FROM "PromoCode" WHERE code = $1', [code]);
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
        const sets: string[] = []; const vals: any[] = []; let i = 1;
        for (const [k, v] of Object.entries(body)) { sets.push(`"${k}" = $${i}`); vals.push(v); i++; }
        vals.push(id);
        const promo = await queryOne(`UPDATE "PromoCode" SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
        return json(res, promo);
      }
      if (method === 'DELETE') {
        await query('DELETE FROM "PromoCode" WHERE id = $1', [id]);
        return json(res, { success: true });
      }
    }

    return json(res, { error: 'Not found' }, 404);

  } catch (err: any) {
    console.error('API Error:', err);
    return json(res, { error: err.message || 'Internal server error' }, 500);
  }
}
