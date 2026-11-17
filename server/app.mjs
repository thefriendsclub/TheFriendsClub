import express from 'express';
import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { getRepository, createSqliteRepository } from './db.mjs';

export const hashToken = token => createHash('sha256').update(token).digest('hex');

export function createAdmin(dbOrRepo, email, password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  if (dbOrRepo && typeof dbOrRepo.prepare === 'function') {
    dbOrRepo.prepare('INSERT INTO admins(email,hash,salt) VALUES (?,?,?) ON CONFLICT(email) DO UPDATE SET hash=excluded.hash,salt=excluded.salt')
      .run(email.toLowerCase(), hash, salt);
    dbOrRepo.prepare('DELETE FROM sessions WHERE admin_id=(SELECT id FROM admins WHERE email=?)')
      .run(email.toLowerCase());
  } else if (dbOrRepo && typeof dbOrRepo.upsertAdmin === 'function') {
    return dbOrRepo.upsertAdmin(email, hash, salt);
  }
}

export function createApp(dbOrRepo) {
  const repo = (dbOrRepo && typeof dbOrRepo.getEvents === 'function')
    ? dbOrRepo
    : (dbOrRepo && typeof dbOrRepo.prepare === 'function')
      ? createSqliteRepository(dbOrRepo)
      : getRepository(dbOrRepo);

  const app = express(), limits = new Map();
  app.repo = repo;
  app.disable('x-powered-by');
  app.use(express.json({ limit: '24kb' }));

  app.use((req, res, next) => {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'same-origin',
      'X-Frame-Options': 'DENY'
    });
    if (req.path.startsWith('/api')) res.set('Cache-Control', 'no-store');
    next();
  });

  app.use('/api', (req, res, next) => {
    const expectedOrigin = process.env.APP_ORIGIN || `${req.protocol}://${req.get('host')}`;
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
        req.headers.origin &&
        req.headers.origin !== expectedOrigin &&
        !(process.env.NODE_ENV !== 'production' && req.headers.origin === 'http://127.0.0.1:5173')) {
      return res.status(403).json({ error: 'This request origin is not allowed.' });
    }
    next();
  });

  const throttle = (key, max) => (req, res, next) => {
    const now = Date.now();
    for (const [k, v] of limits) if (v.until < now) limits.delete(k);
    const id = `${key}:${req.ip}`, entry = limits.get(id) || { count: 0, until: now + 900000 };
    entry.count++;
    limits.set(id, entry);
    if (entry.count > max) {
      return res.status(429).json({ error: 'Too many attempts. Please try again in 15 minutes.' });
    }
    next();
  };

  const auth = async (req, res, next) => {
    const token = req.headers.cookie?.split(';').map(x => x.trim()).find(x => x.startsWith('club_session='))?.slice(13);
    if (!token) return res.status(401).json({ error: 'Please sign in to continue.' });
    try {
      const session = await repo.getSession(hashToken(token), Date.now());
      if (!session) return res.status(401).json({ error: 'Please sign in to continue.' });
      req.admin = session;
      next();
    } catch (err) {
      next(err);
    }
  };

  const str = (x, max = 200) => typeof x === 'string' && x.trim().length > 0 && x.trim().length <= max;
  const email = x => str(x, 254) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x);

  app.get('/api/events', async (req, res, next) => {
    try {
      const events = await repo.getEvents();
      res.json(events);
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/applications', throttle('apply', 20), async (req, res, next) => {
    const { name, email: mail, phone, reason, consent } = req.body;
    if (!str(name, 100) || !email(mail) || !str(phone, 30) || !/^[+\d\s()-]{7,30}$/.test(phone) || !str(reason, 2000) || consent !== true) {
      return res.status(400).json({ error: 'Please complete every field and accept the membership terms.' });
    }
    const cleanEmail = mail.trim().toLowerCase();
    try {
      const exists = await repo.hasApplicationEmail(cleanEmail);
      if (exists) {
        return res.status(409).json({ error: 'An application with this email already exists. Contact us for an update.' });
      }
      const result = await repo.createApplication({ name, email: cleanEmail, phone, reason });
      res.status(201).json({ id: result.id });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/newsletter', throttle('newsletter', 20), async (req, res, next) => {
    if (!email(req.body.email)) return res.status(400).json({ error: 'Enter a valid email address.' });
    try {
      await repo.addSubscriber(req.body.email);
      res.status(201).json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/admin/login', throttle('login', 10), async (req, res, next) => {
    const { email: mail, password } = req.body;
    if (!email(mail) || !str(password, 256)) {
      return res.status(400).json({ error: 'Enter your email and password.' });
    }
    try {
      const admin = await repo.getAdminByEmail(mail);
      const actual = scryptSync(password, admin?.salt || 'dummy-salt', 64);
      if (!admin || !timingSafeEqual(actual, Buffer.from(admin.hash, 'hex'))) {
        return res.status(401).json({ error: 'Email or password is incorrect.' });
      }
      const token = randomBytes(32).toString('hex');
      const now = Date.now();
      await repo.cleanExpiredSessions(now);
      await repo.createSession(hashToken(token), admin.id, now + 86400000);
      res.cookie('club_session', token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 86400000,
        path: '/'
      }).json({ email: admin.email });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/admin/me', auth, (req, res) => res.json({ email: req.admin.email, database: repo.isSupabase ? 'Supabase' : 'SQLite' }));

  app.post('/api/admin/logout', auth, async (req, res, next) => {
    const token = req.headers.cookie?.split(';').map(x => x.trim()).find(x => x.startsWith('club_session='))?.slice(13);
    try {
      if (token) await repo.deleteSession(hashToken(token));
      res.clearCookie('club_session', { path: '/' }).json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/admin/overview', auth, async (req, res, next) => {
    try {
      const [applications, subscribers] = await Promise.all([
        repo.getApplications(),
        repo.getSubscribers()
      ]);
      res.json({ applications, subscribers });
    } catch (err) {
      next(err);
    }
  });

  app.patch('/api/admin/applications/:id', auth, async (req, res, next) => {
    if (!['pending', 'approved', 'declined'].includes(req.body.status)) {
      return res.status(400).json({ error: 'Invalid application status.' });
    }
    try {
      const updated = await repo.updateApplicationStatus(req.params.id, req.body.status);
      if (!updated) return res.status(404).json({ error: 'Application not found.' });
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  const eventData = (req, res, next) => {
    const b = req.body;
    if (!str(b.title, 100) || !/^\d{4}-\d{2}-\d{2}$/.test(b.date) || isNaN(Date.parse(b.date)) || new Date(b.date).toISOString().slice(0, 10) !== b.date || !str(b.time, 100) || !str(b.location, 150) || !str(b.description, 3000) || !str(b.image, 2000) || !/^https:\/\//.test(b.image)) {
      return res.status(400).json({ error: 'Complete all event fields with a valid date and HTTPS image URL.' });
    }
    next();
  };

  app.post('/api/admin/events', auth, eventData, async (req, res, next) => {
    try {
      const result = await repo.createEvent(req.body);
      res.status(201).json({ id: result.id });
    } catch (err) {
      next(err);
    }
  });

  app.put('/api/admin/events/:id', auth, eventData, async (req, res, next) => {
    try {
      const updated = await repo.updateEvent(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Event not found.' });
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  app.delete('/api/admin/events/:id', auth, async (req, res, next) => {
    try {
      const deleted = await repo.deleteEvent(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Event not found.' });
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  app.use('/api', (req, res) => res.status(404).json({ error: 'Endpoint not found.' }));

  if (existsSync(resolve('dist/index.html'))) {
    app.use(express.static(resolve('dist'), {
      maxAge: '1y',
      setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache');
        } else if (path.includes('/assets/')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (path.match(/\.(webp|png|jpg|jpeg|svg|ico)$/)) {
          res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
        }
      }
    }));
    app.get('/{*path}', (req, res) => res.sendFile(resolve('dist/index.html')));
  }

  app.use((err, req, res, next) => {
    res.status(err.status === 400 ? 400 : 500).json({
      error: err.status === 400 ? 'Invalid request.' : 'Something went wrong. Please try again.'
    });
  });

  return app;
}
