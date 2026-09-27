const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { MongoClient } = require('mongodb');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const PUBLIC_ROOT = path.join(__dirname, 'public');
const MONGODB_URI = process.env.MONGODB_URI;
const mongoClient = MONGODB_URI ? new MongoClient(MONGODB_URI) : null;
let databasePromise;

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

function sendJson(response, statusCode, body) {
  send(response, statusCode, 'application/json; charset=utf-8', JSON.stringify(body));
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
