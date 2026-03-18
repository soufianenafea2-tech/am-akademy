/**
 * AM Academy – Backend Server
 * Node.js + Express + SQLite
 * 
 * تشغيل:  node server.js
 * المنفذ: http://localhost:3000
 */

const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// ── MIDDLEWARE ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── DATABASE SETUP ──────────────────────────────────────────
const db = new Database('./am_academy.db');

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS inscriptions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nom         TEXT    NOT NULL,
    telephone   TEXT    NOT NULL,
    email       TEXT,
    niveau      TEXT    NOT NULL,
    notes       TEXT,
    statut      TEXT    DEFAULT 'جديد',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nom         TEXT    NOT NULL,
    telephone   TEXT    NOT NULL,
    message     TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Insert default settings if not present
const defaultSettings = {
  academy_name: 'AM Academy',
  address: 'حي مولاي رشيد، الدار البيضاء',
  instagram: '@centre_am_academy',
};
const insertSetting = db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`);
Object.entries(defaultSettings).forEach(([k, v]) => insertSetting.run(k, v));

console.log('✅ Database initialized: am_academy.db');

// ── ROUTES ─────────────────────────────────────────────────

// GET all inscriptions
app.get('/api/inscriptions', (req, res) => {
  try {
    const { statut, niveau, search } = req.query;
    let query = 'SELECT * FROM inscriptions WHERE 1=1';
    const params = [];
    if (statut) { query += ' AND statut = ?'; params.push(statut); }
    if (niveau) { query += ' AND niveau = ?'; params.push(niveau); }
    if (search) {
      query += ' AND (nom LIKE ? OR telephone LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY created_at DESC';
    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET one inscription
app.get('/api/inscriptions/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM inscriptions WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'غير موجود' });
  res.json(row);
});

// POST new inscription
app.post('/api/inscriptions', (req, res) => {
  try {
    const { nom, telephone, email, niveau, notes } = req.body;
    if (!nom || !telephone || !niveau) {
      return res.status(400).json({ error: 'الحقول المطلوبة: nom, telephone, niveau' });
    }
    const stmt = db.prepare(
      `INSERT INTO inscriptions (nom, telephone, email, niveau, notes)
       VALUES (?, ?, ?, ?, ?)`
    );
    const result = stmt.run(nom.trim(), telephone.trim(), email?.trim() || null, niveau, notes?.trim() || null);
    const newRecord = db.prepare('SELECT * FROM inscriptions WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: newRecord });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update statut
app.patch('/api/inscriptions/:id', (req, res) => {
  try {
    const { statut } = req.body;
    const validStatuts = ['جديد', 'تم التواصل', 'معلق', 'ملغى'];
    if (!validStatuts.includes(statut)) {
      return res.status(400).json({ error: 'حالة غير صالحة' });
    }
    db.prepare(
      `UPDATE inscriptions SET statut = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    ).run(statut, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE inscription
app.delete('/api/inscriptions/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM inscriptions WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET stats
app.get('/api/stats', (req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as n FROM inscriptions').get().n;
    const nouveau = db.prepare("SELECT COUNT(*) as n FROM inscriptions WHERE statut='جديد'").get().n;
    const contacted = db.prepare("SELECT COUNT(*) as n FROM inscriptions WHERE statut='تم التواصل'").get().n;
    const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
    const thisWeek = db.prepare('SELECT COUNT(*) as n FROM inscriptions WHERE created_at >= ?').get(weekAgo).n;
    const byNiveau = db.prepare(
      'SELECT niveau, COUNT(*) as count FROM inscriptions GROUP BY niveau'
    ).all();
    res.json({
      total_inscriptions: total,
      nouveau,
      contacted,
      this_week: thisWeek,
      by_niveau: byNiveau,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET settings
app.get('/api/settings', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const obj = Object.fromEntries(rows.map(r => [r.key, r.value]));
  res.json(obj);
});

// PUT settings
app.put('/api/settings', (req, res) => {
  try {
    const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    const tx = db.transaction((entries) => {
      for (const [k, v] of entries) upsert.run(k, v);
    });
    tx(Object.entries(req.body));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Catch-all: serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── START SERVER ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   🎓 AM Academy Server Running       ║
  ║   http://localhost:${PORT}              ║
  ║   Dashboard: /dashboard.html         ║
  ╚══════════════════════════════════════╝
  `);
});

module.exports = app;
