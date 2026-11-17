import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { photos } from '../src/data.js';
import { createSupabaseRepository } from './supabase.mjs';

export function openDatabase(path = process.env.DB_PATH || resolve('data/club.sqlite')) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS admins (id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, hash TEXT NOT NULL, salt TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, admin_id INTEGER NOT NULL REFERENCES admins(id), expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS applications (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, phone TEXT NOT NULL, reason TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS subscribers (id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY, title TEXT NOT NULL, date TEXT NOT NULL, time TEXT NOT NULL, location TEXT NOT NULL, description TEXT NOT NULL, image TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);`);
  if (!db.prepare("SELECT value FROM metadata WHERE key='seeded'").get()) {
    const insert = db.prepare('INSERT INTO events(title,date,time,location,description,image) VALUES (?,?,?,?,?,?)');
    insert.run('Bonfire Night', '2026-10-26', '5:00 PM – 10:00 PM', 'Rooftop, Bhubaneswar', 'An evening of acoustic music, warm conversations, and stories around the fire. Bring a friend and your favourite story. Light refreshments included.', photos.bonfire);
    insert.run('Annual Get Together', '2026-11-15', '4:00 PM – 9:00 PM', 'The Club House', 'Our favourite tradition: a whole evening together. Meet familiar faces and new friends over dinner, games, music, and a celebration of our community.', photos.party);
    insert.run('Adventure Trip', '2026-12-05', '7:00 AM – 8:00 PM', 'Daringbadi', 'Take the scenic route with us. A day of fresh mountain air, gentle trails, and unforgettable views. Wear comfortable shoes and bring water.', photos.mountain);
    db.prepare("INSERT INTO metadata VALUES ('seeded','1')").run();
  }
  db.prepare('UPDATE events SET image=? WHERE image=?').run(photos.bonfire, 'https://images.unsplash.com/photo-1478131143081-fd1d858f6f1f?auto=format&fit=crop&w=1000&q=85');
  return db;
}

export function createSqliteRepository(db) {
  return {
    isSupabase: false,
    rawDb: db,

    async getEvents() {
      return db.prepare('SELECT * FROM events ORDER BY date').all();
    },

    async createEvent(event) {
      const res = db.prepare('INSERT INTO events(title,date,time,location,description,image) VALUES (?,?,?,?,?,?)')
        .run(event.title, event.date, event.time, event.location, event.description, event.image);
      return { id: Number(res.lastInsertRowid) };
    },

    async updateEvent(id, event) {
      const res = db.prepare('UPDATE events SET title=?,date=?,time=?,location=?,description=?,image=? WHERE id=?')
        .run(event.title, event.date, event.time, event.location, event.description, event.image, id);
      return res.changes > 0;
    },

    async deleteEvent(id) {
      const res = db.prepare('DELETE FROM events WHERE id=?').run(id);
      return res.changes > 0;
    },

    async getApplications() {
      return db.prepare('SELECT * FROM applications ORDER BY created DESC, id DESC').all();
    },

    async hasApplicationEmail(email) {
      return Boolean(db.prepare('SELECT id FROM applications WHERE email=?').get(email.trim().toLowerCase()));
    },

    async createApplication({ name, email, phone, reason }) {
      const res = db.prepare('INSERT INTO applications(name,email,phone,reason) VALUES (?,?,?,?)')
        .run(name.trim(), email.trim().toLowerCase(), phone.trim(), reason.trim());
      return { id: Number(res.lastInsertRowid) };
    },

    async updateApplicationStatus(id, status) {
      const res = db.prepare('UPDATE applications SET status=? WHERE id=?').run(status, id);
      return res.changes > 0;
    },

    async addSubscriber(email) {
      db.prepare('INSERT OR IGNORE INTO subscribers(email) VALUES (?)').run(email.trim().toLowerCase());
      return true;
    },

    async getSubscribers() {
      return db.prepare('SELECT * FROM subscribers ORDER BY created DESC').all();
    },

    async getAdminByEmail(email) {
      return db.prepare('SELECT * FROM admins WHERE email=?').get(email.trim().toLowerCase()) || null;
    },

    async upsertAdmin(email, hash, salt) {
      const normalized = email.trim().toLowerCase();
      db.prepare('INSERT INTO admins(email,hash,salt) VALUES (?,?,?) ON CONFLICT(email) DO UPDATE SET hash=excluded.hash,salt=excluded.salt')
        .run(normalized, hash, salt);
      const admin = db.prepare('SELECT * FROM admins WHERE email=?').get(normalized);
      db.prepare('DELETE FROM sessions WHERE admin_id=?').run(admin.id);
      return admin;
    },

    async createSession(tokenHash, adminId, expires) {
      db.prepare('INSERT INTO sessions VALUES (?,?,?)').run(tokenHash, adminId, expires);
    },

    async getSession(tokenHash, now) {
      return db.prepare('SELECT admins.email,sessions.admin_id FROM sessions JOIN admins ON admins.id=sessions.admin_id WHERE token=? AND expires>?')
        .get(tokenHash, now) || null;
    },

    async deleteSession(tokenHash) {
      db.prepare('DELETE FROM sessions WHERE token=?').run(tokenHash);
    },

    async cleanExpiredSessions(now) {
      db.prepare('DELETE FROM sessions WHERE expires<=?').run(now);
    },

    async close() {
      try {
        db.close();
      } catch {
        // Safe to ignore if already closed
      }
    }
  };
}

export function getRepository(dbOrPath) {
  if (dbOrPath && typeof dbOrPath.getEvents === 'function') {
    return dbOrPath;
  }
  if (dbOrPath && typeof dbOrPath.prepare === 'function') {
    return createSqliteRepository(dbOrPath);
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

  if (supabaseUrl && supabaseKey) {
    return createSupabaseRepository({ url: supabaseUrl, key: supabaseKey });
  }

  return createSqliteRepository(openDatabase(typeof dbOrPath === 'string' ? dbOrPath : undefined));
}
