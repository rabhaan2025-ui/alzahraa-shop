'use strict';
/* Alzahraa shop: zero-dependency Node server using node:sqlite. */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = process.env.DATA_DIR || '/data';
const PUBLIC_DIR = process.env.PUBLIC_DIR || path.join(__dirname, 'public');
const TRUST_PROXY = process.env.TRUST_PROXY === '1';
const COOKIE_SECURE = process.env.COOKIE_SECURE === '1';
const NOINDEX = process.env.NOINDEX !== '0';
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const CATEGORIES = ['rings', 'necklaces', 'bracelets', 'earrings', 'sets'];
const STATUSES = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled'];

fs.mkdirSync(UPLOAD_DIR, { recursive: true });
const db = new DatabaseSync(path.join(DATA_DIR, 'shop.db'));
db.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;');
db.exec(`
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, name_ar TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '', description_ar TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL, price_cents INTEGER NOT NULL,
  image TEXT NOT NULL DEFAULT '', sizes TEXT NOT NULL DEFAULT '',
  stock INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL, phone TEXT NOT NULL, city TEXT NOT NULL, address TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '', total_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER NOT NULL,
  product_id INTEGER, name TEXT NOT NULL, price_cents INTEGER NOT NULL,
  qty INTEGER NOT NULL, size TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status, id);
`);

/* ---------- settings, admin credentials ---------- */
const getSetting = (k) => { const r = db.prepare('SELECT value FROM settings WHERE key = ?').get(k); return r ? r.value : null; };
const setSetting = (k, v) => db.prepare('INSERT INTO settings(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(k, String(v));
const defaults = { shop_name: 'Alzahraa', shop_name_ar: 'الزهراء', currency: 'USD', whatsapp: '' };
for (const [k, v] of Object.entries(defaults)) db.prepare('INSERT OR IGNORE INTO settings(key, value) VALUES(?, ?)').run(k, v);

function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  return salt + ':' + crypto.scryptSync(pw, salt, 64).toString('hex');
}
function verifyPassword(pw, stored) {
  const [salt, h] = String(stored).split(':');
  if (!salt || !h) return false;
  const a = crypto.scryptSync(pw, salt, 64);
  const b = Buffer.from(h, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const auth = { hash: getSetting('admin_hash'), secret: getSetting('session_secret') };
if (!auth.secret) { auth.secret = crypto.randomBytes(32).toString('hex'); setSetting('session_secret', auth.secret); }
if (!auth.hash) {
  let pw = process.env.ADMIN_PASSWORD;
  if (!pw || pw.length < 10) {
    pw = crypto.randomBytes(12).toString('base64url');
    console.log('[setup] ADMIN_PASSWORD missing or shorter than 10 characters. Generated admin password: ' + pw);
  }
  auth.hash = hashPassword(pw);
  setSetting('admin_hash', auth.hash);
}

const hmac = (s) => crypto.createHmac('sha256', auth.secret).update(s).digest('hex');
function makeToken() {
  const body = (Date.now() + 7 * 864e5) + '.' + auth.hash.slice(-12);
  return body + '.' + hmac(body);
}
function getCookie(req, name) {
  for (const part of (req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return '';
}
function isAdmin(req) {
  const parts = getCookie(req, 'az_admin').split('.');
  if (parts.length !== 3) return false;
  const body = parts[0] + '.' + parts[1];
  const want = Buffer.from(hmac(body));
  const got = Buffer.from(parts[2]);
  if (want.length !== got.length || !crypto.timingSafeEqual(want, got)) return false;
  return Number(parts[0]) > Date.now() && parts[1] === auth.hash.slice(-12);
}
const sessionCookie = (token, maxAge) =>
  'az_admin=' + token + '; HttpOnly; SameSite=Strict; Path=/; Max-Age=' + maxAge + (COOKIE_SECURE ? '; Secure' : '');

/* ---------- small utilities ---------- */
class HttpError extends Error {
  constructor(status, code, message, extra) { super(message || code); this.status = status; this.code = code; this.extra = extra || {}; }
}
const bad = (code, msg, extra) => new HttpError(400, code, msg, extra);

function tx(fn) {
  db.exec('BEGIN IMMEDIATE');
  try { const r = fn(); db.exec('COMMIT'); return r; }
  catch (e) { try { db.exec('ROLLBACK'); } catch (_) { /* already closed */ } throw e; }
}

const hits = new Map();
function limited(key, max, windowMs) {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) { hits.set(key, arr); return true; }
  arr.push(now); hits.set(key, arr);
  return false;
}
setInterval(() => {
  const now = Date.now();
  for (const [k, a] of hits) if (!a.length || now - a[a.length - 1] > 3600e3) hits.delete(k);
}, 600e3).unref();

function clientIp(req) {
  if (TRUST_PROXY && req.headers['x-forwarded-for']) return String(req.headers['x-forwarded-for']).split(',')[0].trim();
  return req.socket.remoteAddress || 'unknown';
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    let size = 0; let failed = false; const chunks = [];
    req.on('data', (c) => {
      if (failed) return;
      size += c.length;
      if (size > limit) { failed = true; reject(new HttpError(413, 'too_large', 'Request too large')); return; }
      chunks.push(c);
    });
    req.on('end', () => { if (!failed) resolve(Buffer.concat(chunks)); });
    req.on('error', reject);
  });
}
async function readJson(req) {
  if (!String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) throw bad('bad_type', 'Expected JSON');
  const buf = await readBody(req, 100 * 1024);
  try { const v = JSON.parse(buf.toString('utf8') || '{}'); return v && typeof v === 'object' ? v : {}; }
  catch (_) { throw bad('bad_json', 'Invalid JSON'); }
}

const CSP = "default-src 'self'; img-src 'self' data:; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'";
function json(res, status, obj, headers) {
  const body = JSON.stringify(obj);
  res.writeHead(status, Object.assign({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Length': Buffer.byteLength(body) }, headers || {}));
  res.end(body);
}

const normDigits = (s) => String(s)
  .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x660))
  .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x6F0));
const clean = (v, max) => String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, max);

/* ---------- static assets (loaded once at boot) ---------- */
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp'
};
const assets = new Map();
const buildHash = crypto.createHash('sha256');
const fileHashes = {};
const short = (buf) => crypto.createHash('sha256').update(buf).digest('hex').slice(0, 8);
const selfBuf = fs.readFileSync(__filename);
buildHash.update(selfBuf);
fileHashes['server.js'] = short(selfBuf);
for (const f of fs.readdirSync(PUBLIC_DIR).sort()) {
  const buf = fs.readFileSync(path.join(PUBLIC_DIR, f));
  buildHash.update(buf);
  fileHashes[f] = short(buf);
  assets.set('/' + f, { buf, type: MIME[path.extname(f)] || 'application/octet-stream', etag: '"' + crypto.createHash('sha1').update(buf).digest('hex').slice(0, 16) + '"' });
}
const BUILD = buildHash.digest('hex').slice(0, 10);
if (assets.has('/index.html')) assets.set('/', assets.get('/index.html'));
if (assets.has('/admin.html')) assets.set('/admin', assets.get('/admin.html'));

/* ---------- products ---------- */
const toPublic = (p) => ({
  id: p.id, name: p.name, name_ar: p.name_ar, description: p.description, description_ar: p.description_ar,
  category: p.category, price_cents: p.price_cents, image: p.image, sizes: p.sizes ? p.sizes.split(',') : [], stock: p.stock
});
const toAdmin = (p) => Object.assign(toPublic(p), { active: p.active });

function cleanProduct(b) {
  const name = clean(b.name, 120);
  if (!name) throw bad('invalid_name', 'Name is required');
  if (!CATEGORIES.includes(b.category)) throw bad('invalid_category', 'Pick a category');
  const price = Number(b.price);
  if (!Number.isFinite(price) || price < 0 || price > 1e9) throw bad('invalid_price', 'Enter a valid price');
  const stock = Number.parseInt(b.stock, 10);
  if (!(stock >= 0 && stock <= 100000)) throw bad('invalid_stock', 'Enter a valid stock number');
  const sizes = clean(b.sizes, 200).split(',').map((s) => s.trim()).filter(Boolean);
  if (sizes.length > 30 || sizes.some((s) => s.length > 12)) throw bad('invalid_sizes', 'Sizes: up to 30, each up to 12 characters');
  const image = String(b.image || '');
  if (image && !/^[a-f0-9]{24}\.(jpg|png|webp)(?![\s\S])/.test(image)) throw bad('invalid_image', 'Invalid image');
  return {
    name, name_ar: clean(b.name_ar, 120), description: clean(b.description, 1000), description_ar: clean(b.description_ar, 1000),
    category: b.category, price_cents: Math.round(price * 100), image, sizes: [...new Set(sizes)].join(','),
    stock, active: b.active ? 1 : 0
  };
}
function dropImageIfUnused(file) {
  if (!file) return;
  const used = db.prepare('SELECT COUNT(*) AS n FROM products WHERE image = ?').get(file).n;
  if (!used) fs.unlink(path.join(UPLOAD_DIR, file), () => {});
}

if (getSetting('seeded') !== '1') {
  if (db.prepare('SELECT COUNT(*) AS n FROM products').get().n === 0) {
    const ins = db.prepare('INSERT INTO products(name, name_ar, description, description_ar, category, price_cents, sizes, stock) VALUES(?,?,?,?,?,?,?,?)');
    const S = [
      ['Crescent Ring', 'خاتم الهلال', 'A simple silver band with a soft crescent profile.', 'خاتم فضة بسيط بتصميم هلال ناعم.', 'rings', 3500, '6,7,8,9', 8],
      ['Twisted Band Ring', 'خاتم مجدول', 'Two twisted strands of silver, light enough for daily wear.', 'ضفيرة من خيطين من الفضة، خفيف ومناسب للارتداء اليومي.', 'rings', 3000, '6,7,8,9,10', 12],
      ['Lapis Signet Ring', 'خاتم بفص لازورد', 'A broad silver ring set with a polished lapis stone.', 'خاتم فضة عريض بفص لازورد مصقول.', 'rings', 5500, '7,8,9,10,11', 5],
      ['Fine Chain Necklace', 'سلسلة رفيعة', 'A thin silver chain that sits close to the collarbone.', 'سلسلة فضة رفيعة تلامس عظمة الترقوة.', 'necklaces', 4200, '', 10],
      ['Moon Pendant', 'قلادة هلال', 'A small crescent pendant on a silver chain.', 'قلادة هلال صغيرة على سلسلة فضة.', 'necklaces', 4800, '', 6],
      ['Cuff Bracelet', 'سوار عريض', 'An open silver cuff that adjusts to the wrist.', 'سوار فضة مفتوح يتكيف مع حجم المعصم.', 'bracelets', 6000, '', 4],
      ['Drop Earrings', 'حلق متدلي', 'Lightweight silver drops with a polished finish.', 'حلق فضة متدلي خفيف بلمسة مصقولة.', 'earrings', 3800, '', 9],
      ['Stud Earrings Set', 'طقم حلق صغير', 'Three pairs of small silver studs.', 'ثلاثة أزواج من الحلق الفضي الصغير.', 'earrings', 2200, '', 15]
    ];
    tx(() => { for (const s of S) ins.run(...s); });
  }
  setSetting('seeded', '1');
}

/* ---------- orders ---------- */
const PHONE_RE = /^\+?[0-9][0-9 \-]{6,18}(?![\s\S])/;
function cleanOrder(b) {
  const name = clean(b.name, 80);
  if (name.length < 2) throw bad('invalid_name', 'Enter your name');
  const phone = normDigits(clean(b.phone, 24));
  if (!PHONE_RE.test(phone)) throw bad('invalid_phone', 'Enter a valid phone number');
  const city = clean(b.city, 60);
  if (city.length < 2) throw bad('invalid_city', 'Enter your city');
  const address = clean(b.address, 300);
  if (address.length < 5) throw bad('invalid_address', 'Enter your address');
  if (!Array.isArray(b.items) || !b.items.length || b.items.length > 30) throw bad('empty_cart', 'Your cart is empty');
  const items = b.items.map((i) => ({ id: Number(i && i.id), qty: Number(i && i.qty), size: clean(i && i.size, 12) }));
  for (const i of items) {
    if (!Number.isInteger(i.id) || i.id < 1 || !Number.isInteger(i.qty) || i.qty < 1 || i.qty > 20) throw bad('invalid_items', 'Invalid cart');
  }
  return { name, phone, city, address, notes: clean(b.notes, 500), items };
}

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function newCode() {
  let s = 'AZ-';
  for (const b of crypto.randomBytes(6)) s += CODE_CHARS[b % CODE_CHARS.length];
  return s;
}

function createOrder(o) {
  return tx(() => {
    const getP = db.prepare('SELECT * FROM products WHERE id = ? AND active = 1');
    const merged = new Map(); const perProduct = new Map();
    for (const it of o.items) {
      const p = getP.get(it.id);
      if (!p) throw new HttpError(409, 'unavailable', 'An item is no longer available', { productId: it.id });
      const sizes = p.sizes ? p.sizes.split(',') : [];
      let size = '';
      if (sizes.length) {
        if (!sizes.includes(it.size)) throw bad('choose_size', 'Choose a size', { productId: p.id });
        size = it.size;
      }
      const key = p.id + '|' + size;
      const line = merged.get(key) || { p, size, qty: 0 };
      line.qty += it.qty;
      merged.set(key, line);
      perProduct.set(p.id, (perProduct.get(p.id) || 0) + it.qty);
    }
    for (const line of merged.values()) {
      if (perProduct.get(line.p.id) > line.p.stock) {
        throw new HttpError(409, 'out_of_stock', 'Not enough stock', { productId: line.p.id, left: Math.max(0, line.p.stock) });
      }
    }
    let total = 0;
    for (const l of merged.values()) total += l.p.price_cents * l.qty;

    let orderId = 0; let code = '';
    for (let attempt = 0; attempt < 6 && !orderId; attempt++) {
      code = newCode();
      try {
        orderId = Number(db.prepare('INSERT INTO orders(code, name, phone, city, address, notes, total_cents) VALUES(?,?,?,?,?,?,?)')
          .run(code, o.name, o.phone, o.city, o.address, o.notes, total).lastInsertRowid);
      } catch (e) { if (!/UNIQUE/i.test(String(e.message))) throw e; }
    }
    if (!orderId) throw new HttpError(500, 'generic', 'Could not create order');
    const insItem = db.prepare('INSERT INTO order_items(order_id, product_id, name, price_cents, qty, size) VALUES(?,?,?,?,?,?)');
    const dec = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');
    for (const l of merged.values()) { insItem.run(orderId, l.p.id, l.p.name, l.p.price_cents, l.qty, l.size); dec.run(l.qty, l.p.id); }
    return { code, total_cents: total };
  });
}

function setOrderStatus(id, status) {
  return tx(() => {
    const o = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    if (!o) throw new HttpError(404, 'not_found', 'Order not found');
    if (o.status === status) return o;
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);
    if (status === 'cancelled') {
      for (const it of items) if (it.product_id) db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').run(it.qty, it.product_id);
    } else if (o.status === 'cancelled') {
      for (const it of items) {
        if (!it.product_id) continue;
        const p = db.prepare('SELECT stock FROM products WHERE id = ?').get(it.product_id);
        if (!p) continue;
        if (p.stock < it.qty) throw new HttpError(409, 'out_of_stock', 'Not enough stock to reopen this order: ' + it.name, { productId: it.product_id, left: p.stock });
        db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(it.qty, it.product_id);
      }
    }
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
    return db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  });
}

function publicSettings() {
  const out = {};
  for (const k of Object.keys(defaults)) out[k] = getSetting(k) || '';
  return out;
}

function sniffImage(buf) {
  if (buf.length > 12 && buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return 'jpg';
  if (buf.length > 12 && buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) return 'png';
  if (buf.length > 12 && buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP') return 'webp';
  return null;
}

/* ---------- request handling ---------- */
async function handle(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('Content-Security-Policy', CSP);
  if (NOINDEX) res.setHeader('X-Robots-Tag', 'noindex, nofollow');

  const url = new URL(req.url, 'http://localhost');
  const p = url.pathname;
  const m = req.method;

  if (m === 'GET' || m === 'HEAD') {
    if (assets.has(p)) {
      const a = assets.get(p);
      if (req.headers['if-none-match'] === a.etag) { res.writeHead(304, { ETag: a.etag }); return res.end(); }
      res.writeHead(200, { 'Content-Type': a.type, 'Content-Length': a.buf.length, ETag: a.etag, 'Cache-Control': 'no-cache' });
      return res.end(m === 'HEAD' ? undefined : a.buf);
    }
    const up = /^\/uploads\/([a-f0-9]{24}\.(jpg|png|webp))(?![\s\S])/.exec(p);
    if (up) {
      return fs.readFile(path.join(UPLOAD_DIR, up[1]), (err, buf) => {
        if (err) return json(res, 404, { error: 'not_found' });
        res.writeHead(200, { 'Content-Type': MIME['.' + up[2]], 'Content-Length': buf.length, 'Cache-Control': 'public, max-age=31536000, immutable' });
        res.end(m === 'HEAD' ? undefined : buf);
      });
    }
  }

  if (!p.startsWith('/api/')) return json(res, 404, { error: 'not_found' });

  if (m !== 'GET') {
    const origin = req.headers.origin;
    if (origin) {
      let ok = false;
      try { ok = new URL(origin).host === req.headers.host; } catch (_) { ok = false; }
      if (!ok) throw new HttpError(403, 'forbidden', 'Cross-origin request blocked');
    }
  }

  if (m === 'GET' && p === '/api/health') return json(res, 200, { ok: true, build: BUILD, node: process.version, files: fileHashes });

  if (m === 'GET' && p === '/api/shop') {
    const rows = db.prepare('SELECT * FROM products WHERE active = 1 ORDER BY id DESC').all();
    return json(res, 200, { settings: publicSettings(), products: rows.map(toPublic) });
  }

  if (m === 'POST' && p === '/api/orders') {
    if (limited('order:' + clientIp(req), 12, 3600e3)) throw new HttpError(429, 'rate_limited', 'Too many orders');
    const order = cleanOrder(await readJson(req));
    const r = createOrder(order);
    console.log('[order] ' + r.code + ' total_cents=' + r.total_cents);
    return json(res, 201, r);
  }

  /* ----- admin ----- */
  if (m === 'POST' && p === '/api/admin/login') {
    if (limited('login:' + clientIp(req), 8, 15 * 60e3)) throw new HttpError(429, 'rate_limited', 'Too many attempts. Try again in 15 minutes.');
    const b = await readJson(req);
    if (typeof b.password !== 'string' || !verifyPassword(b.password, auth.hash)) throw new HttpError(401, 'bad_password', 'Wrong password');
    return json(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie(makeToken(), 604800) });
  }
  if (m === 'POST' && p === '/api/admin/logout') return json(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie('', 0) });
  if (!p.startsWith('/api/admin/')) throw new HttpError(404, 'not_found', 'Not found');
  if (!isAdmin(req)) throw new HttpError(401, 'unauthorized', 'Sign in required');

  if (m === 'GET' && p === '/api/admin/me') return json(res, 200, { ok: true, settings: publicSettings(), categories: CATEGORIES, statuses: STATUSES });

  if (m === 'GET' && p === '/api/admin/stats') {
    const counts = {};
    for (const s of STATUSES) counts[s] = 0;
    for (const r of db.prepare('SELECT status, COUNT(*) AS n FROM orders GROUP BY status').all()) counts[r.status] = r.n;
    return json(res, 200, { counts });
  }

  if (m === 'GET' && p === '/api/admin/orders') {
    const st = url.searchParams.get('status');
    const base = 'SELECT o.*, (SELECT COALESCE(SUM(qty), 0) FROM order_items WHERE order_id = o.id) AS item_count FROM orders o';
    const rows = STATUSES.includes(st)
      ? db.prepare(base + ' WHERE o.status = ? ORDER BY o.id DESC LIMIT 300').all(st)
      : db.prepare(base + ' ORDER BY o.id DESC LIMIT 300').all();
    return json(res, 200, { orders: rows });
  }

  let mm = /^\/api\/admin\/orders\/(\d+)(?![\s\S])/.exec(p);
  if (mm) {
    const id = Number(mm[1]);
    if (m === 'GET') {
      const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
      if (!order) throw new HttpError(404, 'not_found', 'Order not found');
      return json(res, 200, { order, items: db.prepare('SELECT * FROM order_items WHERE order_id = ? ORDER BY id').all(id) });
    }
    if (m === 'PATCH') {
      const b = await readJson(req);
      if (!STATUSES.includes(b.status)) throw bad('invalid_status', 'Invalid status');
      return json(res, 200, { order: setOrderStatus(id, b.status) });
    }
  }

  if (m === 'GET' && p === '/api/admin/products') {
    return json(res, 200, { products: db.prepare('SELECT * FROM products ORDER BY id DESC').all().map(toAdmin) });
  }
  if (m === 'POST' && p === '/api/admin/products') {
    const c = cleanProduct(await readJson(req));
    const r = db.prepare('INSERT INTO products(name, name_ar, description, description_ar, category, price_cents, image, sizes, stock, active) VALUES(?,?,?,?,?,?,?,?,?,?)')
      .run(c.name, c.name_ar, c.description, c.description_ar, c.category, c.price_cents, c.image, c.sizes, c.stock, c.active);
    return json(res, 201, { id: Number(r.lastInsertRowid) });
  }
  mm = /^\/api\/admin\/products\/(\d+)(?![\s\S])/.exec(p);
  if (mm) {
    const id = Number(mm[1]);
    const old = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!old) throw new HttpError(404, 'not_found', 'Product not found');
    if (m === 'PUT') {
      const c = cleanProduct(await readJson(req));
      db.prepare('UPDATE products SET name=?, name_ar=?, description=?, description_ar=?, category=?, price_cents=?, image=?, sizes=?, stock=?, active=? WHERE id=?')
        .run(c.name, c.name_ar, c.description, c.description_ar, c.category, c.price_cents, c.image, c.sizes, c.stock, c.active, id);
      if (old.image !== c.image) dropImageIfUnused(old.image);
      return json(res, 200, { ok: true });
    }
    if (m === 'DELETE') {
      db.prepare('DELETE FROM products WHERE id = ?').run(id);
      dropImageIfUnused(old.image);
      return json(res, 200, { ok: true });
    }
  }

  if (m === 'POST' && p === '/api/admin/upload') {
    if (req.headers['x-requested-with'] !== 'fetch') throw new HttpError(403, 'forbidden', 'Missing header');
    const buf = await readBody(req, 6 * 1024 * 1024);
    const ext = sniffImage(buf);
    if (!ext) throw bad('invalid_image', 'Upload a JPG, PNG or WebP image');
    const file = crypto.randomBytes(12).toString('hex') + '.' + ext;
    fs.writeFileSync(path.join(UPLOAD_DIR, file), buf);
    return json(res, 201, { file });
  }

  if (m === 'PUT' && p === '/api/admin/settings') {
    const b = await readJson(req);
    const name = clean(b.shop_name, 60);
    if (!name) throw bad('invalid_name', 'Shop name is required');
    const currency = String(b.currency || '').trim().toUpperCase();
    if (!/^[A-Z]{3}(?![\s\S])/.test(currency)) throw bad('invalid_currency', 'Currency must be a 3-letter code, e.g. USD or IQD');
    const wa = normDigits(String(b.whatsapp || '')).replace(/\D/g, '');
    if (wa.length > 20) throw bad('invalid_whatsapp', 'WhatsApp number is too long');
    setSetting('shop_name', name); setSetting('shop_name_ar', clean(b.shop_name_ar, 60));
    setSetting('currency', currency); setSetting('whatsapp', wa);
    return json(res, 200, { settings: publicSettings() });
  }

  if (m === 'POST' && p === '/api/admin/password') {
    const b = await readJson(req);
    if (typeof b.current !== 'string' || !verifyPassword(b.current, auth.hash)) throw new HttpError(403, 'bad_password', 'Current password is wrong');
    if (typeof b.next !== 'string' || b.next.length < 10 || b.next.length > 200) throw bad('weak_password', 'New password must be at least 10 characters');
    auth.hash = hashPassword(b.next);
    setSetting('admin_hash', auth.hash);
    return json(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie(makeToken(), 604800) });
  }

  throw new HttpError(404, 'not_found', 'Not found');
}

const server = http.createServer((req, res) => {
  handle(req, res).catch((e) => {
    if (res.headersSent) return res.end();
    if (e instanceof HttpError) return json(res, e.status, Object.assign({ error: e.code, message: e.message }, e.extra));
    console.error('[error]', e);
    json(res, 500, { error: 'generic', message: 'Server error' });
  });
});
server.keepAliveTimeout = 5000;
server.listen(PORT, '0.0.0.0', () => console.log('[shop] listening on ' + PORT + ' build=' + BUILD));
for (const sig of ['SIGTERM', 'SIGINT']) process.on(sig, () => { server.close(); try { db.close(); } catch (_) { /* ignore */ } process.exit(0); });
