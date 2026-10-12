const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { MongoClient, GridFSBucket } = require('mongodb');

const root = path.resolve(__dirname, '..');
const publicRoot = path.join(root, 'public');
const envPath = path.join(root, '.env');

function loadEnvFile() {
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}

function contentType(filePath) {
  const types = { '.gif': 'image/gif', '.ico': 'image/x-icon', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
  return types[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

function collectImages(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(directory, entry.name);
    return entry.isDirectory() ? collectImages(filePath) : /\.(?:gif|ico|jpeg|jpg|png|svg|webp)$/i.test(entry.name) ? [filePath] : [];
  });
}

async function uploadImage(bucket, filePath) {
  const relativePath = path.relative(publicRoot, filePath).split(path.sep).join('/');
  const data = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  const existing = await bucket.find({ filename: relativePath, 'metadata.sha256': hash }).limit(1).next();
  if (existing) return 'skipped';
  const previousFiles = await bucket.find({ filename: relativePath }).toArray();
  await Promise.all(previousFiles.map((file) => bucket.delete(file._id)));
  await new Promise((resolve, reject) => {
    const upload = bucket.openUploadStream(relativePath, {
      contentType: contentType(filePath),
      metadata: { originalPath: relativePath, sha256: hash }
    });
    upload.on('error', reject).on('finish', resolve);
    fs.createReadStream(filePath).pipe(upload);
  });
  return 'uploaded';
}

async function main() {
  loadEnvFile();
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI no está configurada en .env');
  const images = [...collectImages(path.join(publicRoot, 'Casa-Lodge-Img')), ...collectImages(path.join(publicRoot, 'Productos'))];
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  try {
    const bucket = new GridFSBucket(client.db('casa_vieja'), { bucketName: 'imagenes' });
    let uploaded = 0;
    let skipped = 0;
    for (const image of images) {
      const result = await uploadImage(bucket, image);
      result === 'uploaded' ? uploaded++ : skipped++;
      console.log(`${result}: ${path.relative(publicRoot, image)}`);
    }
    console.log(`Completado: ${uploaded} subidas, ${skipped} ya existentes, ${images.length} revisadas.`);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(`No se pudieron subir las imágenes: ${error.message}`);
  process.exitCode = 1;
});
