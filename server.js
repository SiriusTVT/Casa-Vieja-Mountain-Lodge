const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { promisify } = require('node:util');
const { MongoClient, ObjectId } = require('mongodb');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const PUBLIC_ROOT = path.join(__dirname, 'public');
const MONGODB_URI = process.env.MONGODB_URI;
const mongoClient = MONGODB_URI ? new MongoClient(MONGODB_URI) : null;
let databasePromise;
const sessions = new Map();
const scryptAsync = promisify(crypto.scrypt);

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8', '.gif': 'image/gif', '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json; charset=utf-8', '.webp': 'image/webp'
};

function send(response, statusCode, contentType, body) {
  response.writeHead(statusCode, { 'Content-Type': contentType });
  response.end(body);
}

function sendJson(response, statusCode, body, headers = {}) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
  response.end(JSON.stringify(body));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 100000) reject(new Error('Payload demasiado grande'));
    });
    request.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); } catch { reject(new Error('JSON inválido')); }
    });
    request.on('error', reject);
  });
}

function validateQuote(data) {
  const requiredFields = ['nombre', 'email', 'telefono', 'llegada', 'huespedes', 'experiencia', 'cotizacion'];
  if (requiredFields.some((field) => !String(data[field] || '').trim())) return 'Completa todos los campos obligatorios.';
  if (!/^\S+@\S+\.\S+$/.test(data.email)) return 'El correo electrónico no es válido.';
  if (!Number.isInteger(Number(data.huespedes)) || Number(data.huespedes) < 1) return 'El número de huéspedes no es válido.';
  if (data.experiencia === 'alojamiento' && Number(data.huespedes) > 9) return 'El alojamiento admite máximo 9 huéspedes.';
  if (data.experiencia === 'alojamiento' && (!data.salida || data.salida <= data.llegada)) return 'Selecciona una fecha de salida posterior a la llegada.';
  return null;
}

async function getDatabase() {
  if (!mongoClient) throw new Error('MONGODB_URI no está configurada');
  if (!databasePromise) {
    databasePromise = mongoClient.connect().then((client) => client.db('casa_vieja'));
  }
  return databasePromise;
}

async function getAdminCollection() {
  const database = await getDatabase();
  const collection = database.collection('administradores');
  await collection.createIndex({ username: 1 }, { unique: true });
  return collection;
}

async function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

async function verifyPassword(password, storedHash) {
  const [salt, key] = storedHash.split(':');
  const derivedKey = await scryptAsync(password, salt, 64);
  const expectedKey = Buffer.from(key, 'hex');
  return expectedKey.length === derivedKey.length && crypto.timingSafeEqual(expectedKey, derivedKey);
}

function cookies(request) {
  return Object.fromEntries((request.headers.cookie || '').split(';').filter(Boolean).map((part) => {
    const index = part.indexOf('=');
    return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())];
  }));
}

function sessionAdmin(request) {
  const token = cookies(request).admin_session;
  const session = token ? sessions.get(token) : null;
  if (!session || session.expiresAt < Date.now()) { if (token) sessions.delete(token); return null; }
  return session;
}

function sessionCookie(token) {
  return `admin_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
}

async function handleAdminStatus(response) {
  try {
    const count = await (await getAdminCollection()).countDocuments({});
    return sendJson(response, 200, { ok: true, setupRequired: count === 0 });
  } catch (error) { return sendJson(response, 503, { ok: false, error: 'MongoDB no está disponible.' }); }
}

async function handleAdminRegister(request, response) {
  try {
    const data = await readJson(request);
    const username = String(data.username || '').trim().toLowerCase();
    const password = String(data.password || '');
    if (!/^[a-z0-9._-]{3,32}$/.test(username) || password.length < 10) return sendJson(response, 400, { ok: false, error: 'Usa un usuario válido y una contraseña de mínimo 10 caracteres.' });
    const collection = await getAdminCollection();
    if (await collection.countDocuments({})) return sendJson(response, 409, { ok: false, error: 'Ya existe un administrador. Inicia sesión.' });
    await collection.insertOne({ username, passwordHash: await hashPassword(password), createdAt: new Date() });
    return sendJson(response, 201, { ok: true });
  } catch (error) { console.error('Error registrando administrador:', error.message); return sendJson(response, 503, { ok: false, error: 'No se pudo crear el administrador.' }); }
}

async function handleAdminLogin(request, response) {
  try {
    const data = await readJson(request);
    const username = String(data.username || '').trim().toLowerCase();
    const admin = await (await getAdminCollection()).findOne({ username });
    if (!admin || !(await verifyPassword(String(data.password || ''), admin.passwordHash))) return sendJson(response, 401, { ok: false, error: 'Usuario o contraseña incorrectos.' });
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, { adminId: String(admin._id), username: admin.username, expiresAt: Date.now() + 8 * 60 * 60 * 1000 });
    return sendJson(response, 200, { ok: true, username: admin.username }, { 'Set-Cookie': sessionCookie(token) });
  } catch (error) { return sendJson(response, 503, { ok: false, error: 'No se pudo iniciar sesión.' }); }
}

function requireAdmin(request, response) {
  const session = sessionAdmin(request);
  if (!session) { sendJson(response, 401, { ok: false, error: 'Sesión no válida.' }); return null; }
  return session;
}

async function handleAdminQuotes(request, response) {
  if (!requireAdmin(request, response)) return;
  try { const database = await getDatabase(); const quotes = await database.collection('cotizaciones').find({}).sort({ createdAt: -1 }).limit(200).toArray(); return sendJson(response, 200, { ok: true, quotes: quotes.map((quote) => ({ ...quote, id: String(quote._id), _id: undefined })) }); }
  catch { return sendJson(response, 503, { ok: false, error: 'No se pudieron cargar las cotizaciones.' }); }
}

async function handlePaymentLink(request, response, quoteId) {
  if (!requireAdmin(request, response)) return;
  if (!ObjectId.isValid(quoteId)) return sendJson(response, 400, { ok: false, error: 'Cotización no válida.' });
  try {
    const database = await getDatabase();
    const collection = database.collection('cotizaciones');
    const quote = await collection.findOne({ _id: new ObjectId(quoteId) });
    if (!quote) return sendJson(response, 404, { ok: false, error: 'Cotización no encontrada.' });
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    await collection.updateOne({ _id: quote._id }, { $set: { payment: { token, status: 'pending', createdAt: new Date(), expiresAt } } });
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : (request.headers['x-forwarded-proto'] || 'http');
    const link = `${protocol}://${request.headers.host}/pago.html?token=${token}`;
    return sendJson(response, 201, { ok: true, link, expiresAt });
  } catch (error) { console.error('Error generando link de pago:', error.message); return sendJson(response, 503, { ok: false, error: 'No se pudo generar el link de pago.' }); }
}

function paymentSettings() {
  return { bankName: process.env.PAYMENT_BANK_NAME || '', accountType: process.env.PAYMENT_ACCOUNT_TYPE || '', accountNumber: process.env.PAYMENT_ACCOUNT_NUMBER || '', accountHolder: process.env.PAYMENT_ACCOUNT_HOLDER || '', brebKey: process.env.PAYMENT_BREB_KEY || '', qrImageUrl: process.env.PAYMENT_QR_IMAGE_URL || '' };
}

async function handlePublicPayment(request, response, token) {
  try {
    const database = await getDatabase();
    const quote = await database.collection('cotizaciones').findOne({ 'payment.token': token });
    if (!quote || !quote.payment || quote.payment.expiresAt < new Date() || quote.payment.status === 'cancelled') return sendJson(response, 404, { ok: false, error: 'Este link de pago no está disponible.' });
    return sendJson(response, 200, { ok: true, payment: { name: quote.nombre, amount: quote.cotizacion, experience: quote.experienciaNombre, expiresAt: quote.payment.expiresAt, settings: paymentSettings() } });
  } catch { return sendJson(response, 503, { ok: false, error: 'No se pudo cargar el pago.' }); }
}

async function handlePaymentConfirmation(request, response, token) {
  try {
    const database = await getDatabase();
    const result = await database.collection('cotizaciones').updateOne({ 'payment.token': token, 'payment.status': 'pending' }, { $set: { 'payment.status': 'reported', 'payment.reportedAt': new Date() } });
    if (!result.matchedCount) return sendJson(response, 404, { ok: false, error: 'Este link de pago no está disponible.' });
    return sendJson(response, 200, { ok: true });
  } catch { return sendJson(response, 503, { ok: false, error: 'No se pudo registrar el aviso de pago.' }); }
}

async function saveQuote(data) {
  const database = await getDatabase();
  const collection = database.collection('cotizaciones');
  await collection.createIndex({ createdAt: -1 });
  await collection.insertOne({
    nombre: String(data.nombre).trim(), email: String(data.email).trim().toLowerCase(),
    telefono: String(data.telefono).trim(), llegada: String(data.llegada), salida: data.salida ? String(data.salida) : null,
    huespedes: Number(data.huespedes), experiencia: String(data.experiencia), experienciaNombre: String(data.experienciaNombre || ''),
    cotizacion: String(data.cotizacion), comentarios: String(data.comentarios || '').trim(), estado: 'pendiente', createdAt: new Date()
  });
}

async function handleQuote(request, response) {
  try {
    const data = await readJson(request);
    const validationError = validateQuote(data);
    if (validationError) return sendJson(response, 400, { ok: false, error: validationError });
    await saveQuote(data);
    return sendJson(response, 201, { ok: true });
  } catch (error) {
    console.error('Error guardando cotización:', error.message);
    return sendJson(response, 503, { ok: false, error: 'No pudimos guardar la solicitud. Intenta nuevamente.' });
  }
}

const server = http.createServer((request, response) => {
  const requestPath = decodeURIComponent(request.url.split('?')[0]);
  if (requestPath === '/api/cotizaciones' && request.method === 'POST') return void handleQuote(request, response);
  if (requestPath === '/api/admin/status' && request.method === 'GET') return void handleAdminStatus(response);
  if (requestPath === '/api/admin/register' && request.method === 'POST') return void handleAdminRegister(request, response);
  if (requestPath === '/api/admin/login' && request.method === 'POST') return void handleAdminLogin(request, response);
  if (requestPath === '/api/admin/logout' && request.method === 'POST') { sessions.delete(cookies(request).admin_session); return sendJson(response, 200, { ok: true }, { 'Set-Cookie': 'admin_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0' }); }
  if (requestPath === '/api/admin/me' && request.method === 'GET') { const session = requireAdmin(request, response); return session ? sendJson(response, 200, { ok: true, username: session.username }) : undefined; }
  if (requestPath === '/api/admin/cotizaciones' && request.method === 'GET') return void handleAdminQuotes(request, response);
  const paymentLinkMatch = requestPath.match(/^\/api\/admin\/cotizaciones\/([^/]+)\/payment-link$/);
  if (paymentLinkMatch && request.method === 'POST') return void handlePaymentLink(request, response, paymentLinkMatch[1]);
  const publicPaymentMatch = requestPath.match(/^\/api\/pagos\/([^/]+)$/);
  if (publicPaymentMatch && request.method === 'GET') return void handlePublicPayment(request, response, publicPaymentMatch[1]);
  if (publicPaymentMatch && request.method === 'POST') return void handlePaymentConfirmation(request, response, publicPaymentMatch[1]);
  if (requestPath.startsWith('/api/')) return sendJson(response, 404, { ok: false, error: 'Ruta API no encontrada' });

  const relativePath = requestPath === '/' ? 'index.html' : requestPath.slice(1);
  const filePath = path.resolve(PUBLIC_ROOT, relativePath);
  if (!filePath.startsWith(PUBLIC_ROOT + path.sep)) return send(response, 403, 'text/plain; charset=utf-8', 'Acceso denegado');
  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) return send(response, 404, 'text/plain; charset=utf-8', 'Página no encontrada');
    response.writeHead(200, { 'Content-Type': MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(response);
  });
});

server.listen(PORT, HOST, () => console.log(`Casa Vieja disponible en el puerto ${PORT}`));
